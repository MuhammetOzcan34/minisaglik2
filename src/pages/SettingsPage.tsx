import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, User, Bell, Baby, Plus, Edit, Trash2, 
  Palette, Globe, Clock, Shield, LogOut, Save 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ChildForm from "@/components/ChildForm";

interface ContextType {
  selectedChild: any;
  children: any[];
  onChildAdded: () => void;
}

const SettingsPage = () => {
  const { selectedChild, children, onChildAdded } = useOutletContext<ContextType>();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [childToDelete, setChildToDelete] = useState<any>(null);
  const { toast } = useToast();

  // Profil ayarları
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    emergency_contact: ''
  });

  // Bildirim ayarları
  const [notificationSettings, setNotificationSettings] = useState({
    notification_enabled: true,
    email_notifications: true,
    push_notifications: true,
    reminder_advance_minutes: 15
  });

  // Genel ayarlar
  const [generalSettings, setGeneralSettings] = useState({
    theme: 'light',
    language: 'tr',
    timezone: 'Europe/Istanbul'
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      // Profil bilgilerini yükle
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setProfileData({
            full_name: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            emergency_contact: profile.emergency_contact || ''
          });
        }
      }

      // Kullanıcı ayarlarını yükle
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (settings) {
        setNotificationSettings({
          notification_enabled: settings.notification_enabled,
          email_notifications: settings.email_notifications,
          push_notifications: settings.push_notifications,
          reminder_advance_minutes: settings.reminder_advance_minutes
        });

        setGeneralSettings({
          theme: settings.theme,
          language: settings.language,
          timezone: settings.timezone
        });
      }
    } catch (error: any) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone,
          emergency_contact: profileData.emergency_contact
        });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Profil bilgileri güncellendi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Profil güncellenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          notification_enabled: notificationSettings.notification_enabled,
          email_notifications: notificationSettings.email_notifications,
          push_notifications: notificationSettings.push_notifications,
          reminder_advance_minutes: notificationSettings.reminder_advance_minutes
        });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Bildirim ayarları güncellendi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Bildirim ayarları güncellenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: generalSettings.theme,
          language: generalSettings.language,
          timezone: generalSettings.timezone
        });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Genel ayarlar güncellendi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Genel ayarlar güncellenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChild = (child: any) => {
    setEditingChild(child);
    setShowChildModal(true);
  };

  const handleDeleteChild = (child: any) => {
    setChildToDelete(child);
    setShowDeleteDialog(true);
  };

  const confirmDeleteChild = async () => {
    if (!childToDelete) return;

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childToDelete.id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Çocuk kaydı silindi.",
      });

      onChildAdded(); // Çocuk listesini yenile
      setShowDeleteDialog(false);
      setChildToDelete(null);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Çocuk silinirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">Uygulama ve hesap ayarlarınızı yönetin</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="children" className="flex items-center gap-2">
            <Baby className="h-4 w-4" />
            Çocuklar
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Genel
          </TabsTrigger>
        </TabsList>

        {/* Profil Ayarları */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Bilgileri
              </CardTitle>
              <CardDescription>
                Kişisel bilgilerinizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Ad Soyad</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    placeholder="E-posta adresiniz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="Telefon numaranız"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Acil Durum İletişim</Label>
                  <Input
                    id="emergency_contact"
                    value={profileData.emergency_contact}
                    onChange={(e) => setProfileData({...profileData, emergency_contact: e.target.value})}
                    placeholder="Acil durumda aranacak kişi"
                  />
                </div>
              </div>
              <Button onClick={saveProfile} disabled={loading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bildirim Ayarları */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Ayarları
              </CardTitle>
              <CardDescription>
                Bildirim tercihlerinizi yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bildirimleri Etkinleştir</Label>
                    <p className="text-sm text-muted-foreground">
                      Tüm bildirimleri aç/kapat
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.notification_enabled}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings, 
                      notification_enabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-posta Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      E-posta ile bildirim al
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings, 
                      email_notifications: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Tarayıcı push bildirimleri
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.push_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings, 
                      push_notifications: checked
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder_advance">Hatırlatma Süresi (dakika)</Label>
                  <Select
                    value={notificationSettings.reminder_advance_minutes.toString()}
                    onValueChange={(value) => setNotificationSettings({
                      ...notificationSettings, 
                      reminder_advance_minutes: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 dakika</SelectItem>
                      <SelectItem value="15">15 dakika</SelectItem>
                      <SelectItem value="30">30 dakika</SelectItem>
                      <SelectItem value="60">1 saat</SelectItem>
                      <SelectItem value="120">2 saat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={saveNotificationSettings} disabled={loading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Çocuklar Yönetimi */}
        <TabsContent value="children" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    Çocuklar
                  </CardTitle>
                  <CardDescription>
                    Çocuk kayıtlarınızı yönetin
                  </CardDescription>
                </div>
                <Button onClick={() => setShowChildModal(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni Çocuk
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.length === 0 ? (
                  <div className="text-center py-8">
                    <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz çocuk kaydı yok</p>
                    <Button 
                      onClick={() => setShowChildModal(true)} 
                      variant="outline" 
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      İlk Çocuğu Ekle
                    </Button>
                  </div>
                ) : (
                  children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {child.birth_date && new Date(child.birth_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChild(child)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteChild(child)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Genel Ayarlar */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Genel Ayarlar
              </CardTitle>
              <CardDescription>
                Uygulama genel ayarlarını yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={generalSettings.theme}
                    onValueChange={(value) => setGeneralSettings({
                      ...generalSettings, 
                      theme: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Açık</SelectItem>
                      <SelectItem value="dark">Koyu</SelectItem>
                      <SelectItem value="auto">Otomatik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Dil</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) => setGeneralSettings({
                      ...generalSettings, 
                      language: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Saat Dilimi</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings({
                      ...generalSettings, 
                      timezone: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                      <SelectItem value="Europe/London">Londra (UTC+0)</SelectItem>
                      <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={saveGeneralSettings} disabled={loading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </CardContent>
          </Card>

          {/* Güvenlik ve Çıkış */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Güvenlik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Çocuk Ekleme/Düzenleme Modal */}
      {showChildModal && (
        <ChildForm
          isOpen={showChildModal}
          onClose={() => {
            setShowChildModal(false);
            setEditingChild(null);
            onChildAdded();
          }}
          child={editingChild}
        />
      )}

      {/* Silme Onay Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Çocuk Kaydını Sil</DialogTitle>
            <DialogDescription>
              "{childToDelete?.name}" adlı çocuğun kaydını silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz ve tüm veriler silinecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button 
              onClick={confirmDeleteChild}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;