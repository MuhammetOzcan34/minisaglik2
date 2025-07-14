-- Aktiviteler tablosunu güncelle: yeni alanlar ekle ve yemek bölümünü kaldır
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS activity_time TIME,
ADD COLUMN IF NOT EXISTS completion_status TEXT DEFAULT 'completed' CHECK (completion_status IN ('completed', 'partial', 'skipped')),
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS activity_subtype TEXT,
ADD COLUMN IF NOT EXISTS bedtime TIME,
ADD COLUMN IF NOT EXISTS wake_time TIME,
ADD COLUMN IF NOT EXISTS sleep_quality TEXT CHECK (sleep_quality IN ('çok iyi', 'iyi', 'orta', 'kötü', 'çok kötü'));

-- Aktivite türlerini güncelle (yemek kaldırıldı)
ALTER TABLE public.activities 
DROP CONSTRAINT IF EXISTS activities_activity_type_check;

-- Yeni aktivite türleri kısıtlaması
ALTER TABLE public.activities 
ADD CONSTRAINT activities_activity_type_check 
CHECK (activity_type IN ('uyku', 'oyun', 'egzersiz', 'okuma', 'banyo', 'dis_fircalama', 'ders', 'sosyal', 'diger'));