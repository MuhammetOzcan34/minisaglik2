-- Aile (families) tablosu
CREATE TABLE public.families (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kullanıcı profilleri tablosu
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Çocuk profilleri tablosu
CREATE TABLE public.children (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('erkek', 'kız')),
    blood_type TEXT,
    medical_notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alerjiler tablosu
CREATE TABLE public.allergies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    allergen TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('hafif', 'orta', 'şiddetli')),
    symptoms TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tanılar tablosu
CREATE TABLE public.diagnoses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    diagnosis_date DATE,
    doctor_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Doktor bilgileri tablosu
CREATE TABLE public.doctors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    hospital TEXT,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- İlaçlar tablosu
CREATE TABLE public.medications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- İlaç dozları tablosu
CREATE TABLE public.medication_doses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    given_at TIMESTAMP WITH TIME ZONE NOT NULL,
    dosage TEXT NOT NULL,
    notes TEXT,
    given_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Epilepsi atakları tablosu
CREATE TABLE public.seizures (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    seizure_type TEXT CHECK (seizure_type IN ('Miyoklonik Absans', 'Klonik', 'Tonik', 'Atonik', 'Tonik-Klonik', 'Absans')),
    observations TEXT,
    post_seizure_state TEXT,
    emergency_action BOOLEAN DEFAULT false,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Beslenme kayıtları tablosu
CREATE TABLE public.nutrition_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    meal_time TIMESTAMP WITH TIME ZONE NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('Ana Yemek', 'Ara Öğün', 'Atıştırmalık')),
    food_name TEXT NOT NULL,
    amount TEXT NOT NULL,
    unit TEXT NOT NULL,
    allergic_reaction BOOLEAN DEFAULT false,
    reaction_notes TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Uyku kayıtları tablosu
CREATE TABLE public.sleep_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    sleep_date DATE NOT NULL,
    bedtime TIME,
    wake_time TIME,
    sleep_quality TEXT CHECK (sleep_quality IN ('çok iyi', 'iyi', 'orta', 'kötü', 'çok kötü')),
    night_wakings INTEGER DEFAULT 0,
    quality_notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ruh hali takibi tablosu
CREATE TABLE public.mood_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    mood TEXT CHECK (mood IN ('çok mutlu', 'mutlu', 'normal', 'üzgün', 'çok üzgün', 'huzursuz', 'enerjik', 'yorgun')),
    activity TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fiziksel ölçümler tablosu
CREATE TABLE public.physical_measurements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    measurement_date DATE NOT NULL,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    head_circumference_cm DECIMAL(5,2),
    temperature_celsius DECIMAL(4,2),
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Aktiviteler tablosu
CREATE TABLE public.activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_type TEXT NOT NULL,
    duration_minutes INTEGER,
    description TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hatırlatmalar tablosu
CREATE TABLE public.reminders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_type TEXT CHECK (reminder_type IN ('ilaç', 'randevu', 'ölçüm', 'diğer')),
    remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Politikalarını aktifleştir
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seizures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Güvenlik fonksiyonu: Kullanıcının aile ID'sini al
CREATE OR REPLACE FUNCTION public.get_user_family_id()
RETURNS UUID AS $$
  SELECT family_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Families RLS Politikaları
CREATE POLICY "Kullanıcılar kendi ailelerini görebilir" ON public.families
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE family_id = families.id));

CREATE POLICY "Kullanıcılar aile oluşturabilir" ON public.families
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Aile üyeleri aile bilgilerini güncelleyebilir" ON public.families
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE family_id = families.id));

-- Profiles RLS Politikaları
CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON public.profiles
  FOR ALL USING (auth.uid() = user_id OR public.get_user_family_id() = family_id);

-- Children RLS Politikaları
CREATE POLICY "Aile üyeleri çocukları görebilir" ON public.children
  FOR ALL USING (public.get_user_family_id() = family_id);

-- Diğer tabloların RLS Politikaları
CREATE POLICY "Aile üyeleri alerjileri yönetebilir" ON public.allergies
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = allergies.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri tanıları yönetebilir" ON public.diagnoses
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = diagnoses.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri doktor bilgilerini yönetebilir" ON public.doctors
  FOR ALL USING (public.get_user_family_id() = family_id);

CREATE POLICY "Aile üyeleri ilaçları yönetebilir" ON public.medications
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = medications.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri ilaç dozlarını yönetebilir" ON public.medication_doses
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.medications 
    JOIN public.children ON medications.child_id = children.id
    WHERE medications.id = medication_doses.medication_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri nöbet kayıtlarını yönetebilir" ON public.seizures
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = seizures.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri beslenme kayıtlarını yönetebilir" ON public.nutrition_records
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = nutrition_records.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri uyku kayıtlarını yönetebilir" ON public.sleep_records
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = sleep_records.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri ruh hali kayıtlarını yönetebilir" ON public.mood_records
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = mood_records.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri fiziksel ölçümleri yönetebilir" ON public.physical_measurements
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = physical_measurements.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri aktiviteleri yönetebilir" ON public.activities
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.children WHERE children.id = activities.child_id 
    AND children.family_id = public.get_user_family_id()
  ));

CREATE POLICY "Aile üyeleri hatırlatmaları yönetebilir" ON public.reminders
  FOR ALL USING (public.get_user_family_id() = family_id);

-- Trigger fonksiyonu: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at trigger'larını ekle
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Yeni kullanıcı kaydı trigger'ı
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();