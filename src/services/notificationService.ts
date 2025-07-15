import { supabase } from "@/integrations/supabase/client";

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  async initialize() {
    try {
      // Service Worker'ı kaydet
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker kaydedildi:', this.registration);
      }

      // Bildirim iznini kontrol et
      this.permission = await this.requestPermission();

      // Bildirim ayarlarını yükle
      await this.loadNotificationSettings();

      // Takvim olaylarını kontrol et
      this.startEventCheck();
    } catch (error) {
      console.error('Bildirim servisi başlatılamadı:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Bu tarayıcı bildirim desteği sunmuyor');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async loadNotificationSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settings && !settings.notification_enabled) {
        console.log('Bildirimler kullanıcı tarafından devre dışı bırakıldı');
      }
    } catch (error) {
      console.error('Bildirim ayarları yüklenemedi:', error);
    }
  }

  async sendNotification(title: string, options: NotificationOptions = {}) {
    if (this.permission !== 'granted') {
      console.log('Bildirim izni verilmedi');
      return;
    }

    try {
      // Kullanıcı ayarlarını kontrol et
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('notification_enabled, push_notifications')
        .eq('user_id', user.id)
        .single();

      if (!settings?.notification_enabled || !settings?.push_notifications) {
        console.log('Bildirimler devre dışı');
        return;
      }

      // Service Worker üzerinden bildirim gönder
      if (this.registration) {
        await this.registration.showNotification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [100, 50, 100],
          requireInteraction: true,
          ...options
        });
      } else {
        // Fallback: Tarayıcı bildirimi
        new Notification(title, {
          icon: '/icon-192.png',
          ...options
        });
      }

      // Bildirimi veritabanına kaydet
      await this.saveNotificationToDatabase(title, options.body || '');
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
    }
  }

  async saveNotificationToDatabase(title: string, message: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          title,
          message,
          notification_type: 'reminder',
          sent_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Bildirim veritabanına kaydedilemedi:', error);
    }
  }

  async checkUpcomingEvents() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Kullanıcının çocuklarını al
      const { data: children } = await supabase
        .from('children')
        .select('id, name')
        .eq('family_id', (await supabase.from('profiles').select('family_id').eq('user_id', user.id).single()).data?.family_id);

      if (!children) return;

      const now = new Date();
      const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

      for (const child of children) {
        // 15 dakika içinde olan olaylar
        const { data: events15min } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('child_id', child.id)
          .eq('reminder_minutes', 15)
          .gte('event_date', now.toISOString().split('T')[0])
          .lte('event_date', in15Minutes.toISOString().split('T')[0])
          .eq('is_completed', false);

        // 1 saat içinde olan olaylar
        const { data: events1hour } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('child_id', child.id)
          .eq('reminder_minutes', 60)
          .gte('event_date', now.toISOString().split('T')[0])
          .lte('event_date', in1Hour.toISOString().split('T')[0])
          .eq('is_completed', false);

        // Bildirimleri gönder
        if (events15min && events15min.length > 0) {
          for (const event of events15min) {
            await this.sendNotification(
              `15 dakika sonra: ${event.title}`,
              {
                body: `${child.name} için ${event.title} olayı 15 dakika sonra başlayacak.`,
                tag: `event-${event.id}`,
                data: { eventId: event.id, childId: child.id }
              }
            );
          }
        }

        if (events1hour && events1hour.length > 0) {
          for (const event of events1hour) {
            await this.sendNotification(
              `1 saat sonra: ${event.title}`,
              {
                body: `${child.name} için ${event.title} olayı 1 saat sonra başlayacak.`,
                tag: `event-${event.id}`,
                data: { eventId: event.id, childId: child.id }
              }
            );
          }
        }
      }
    } catch (error) {
      console.error('Yaklaşan olaylar kontrol edilemedi:', error);
    }
  }

  startEventCheck() {
    // Her 5 dakikada bir yaklaşan olayları kontrol et
    setInterval(() => {
      this.checkUpcomingEvents();
    }, 5 * 60 * 1000);

    // İlk kontrolü hemen yap
    this.checkUpcomingEvents();
  }

  async sendSeizureReminder() {
    await this.sendNotification(
      'Nöbet Kaydı Hatırlatması',
      {
        body: 'Bugün nöbet kaydı yapmayı unutmayın. Düzenli takip önemlidir.',
        tag: 'seizure-reminder'
      }
    );
  }

  async sendMedicationReminder(medicationName: string, childName: string) {
    await this.sendNotification(
      'İlaç Hatırlatması',
      {
        body: `${childName} için ${medicationName} ilacının vakti geldi.`,
        tag: 'medication-reminder',
        requireInteraction: true
      }
    );
  }

  async sendAppointmentReminder(appointmentTitle: string, childName: string, appointmentTime: string) {
    await this.sendNotification(
      'Randevu Hatırlatması',
      {
        body: `${childName} için ${appointmentTitle} randevusu ${appointmentTime} saatinde.`,
        tag: 'appointment-reminder'
      }
    );
  }

  async sendTestReminder(testName: string, childName: string) {
    await this.sendNotification(
      'Tahlil Hatırlatması',
      {
        body: `${childName} için ${testName} tahlili yapılması gerekiyor.`,
        tag: 'test-reminder'
      }
    );
  }

  // Bildirimleri temizle
  async clearNotifications() {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(notification => notification.close());
    }
  }

  // Bildirim iznini kontrol et
  isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }

  // Service Worker durumunu kontrol et
  isServiceWorkerReady(): boolean {
    return this.registration !== null;
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;