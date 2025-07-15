-- Takvim olayları ve bildirimler için yeni tablolar

-- Takvim olayları tablosu
CREATE TABLE public.calendar_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'seizure', 'medication', 'nutrition', 'sleep', 'temperature', 
        'appointment', 'test', 'activity', 'reminder', 'other'
    )),
    color TEXT NOT NULL DEFAULT '#3B82F6',
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    reminder_minutes INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bildirimler tablosu
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'reminder', 'alert', 'info', 'success', 'warning'
    )),
    is_read BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kullanıcı ayarları tablosu
CREATE TABLE public.user_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    notification_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    reminder_advance_minutes INTEGER DEFAULT 15,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en')),
    timezone TEXT DEFAULT 'Europe/Istanbul',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS politikalarını aktifleştir
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Calendar events RLS politikaları
CREATE POLICY "Aile üyeleri takvim olaylarını yönetebilir" ON public.calendar_events
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = calendar_events.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

-- Notifications RLS politikaları
CREATE POLICY "Kullanıcılar kendi bildirimlerini yönetebilir" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- User settings RLS politikaları
CREATE POLICY "Kullanıcılar kendi ayarlarını yönetebilir" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Trigger fonksiyonu: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION public.update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at trigger'larını ekle
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION public.update_calendar_events_updated_at();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();