-- Aktiviteler tablosunu güncelle: yeni alanlar ekle ve yemek bölümünü kaldır
-- Bu komutları Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Yeni alanları ekle
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS activity_time TIME,
ADD COLUMN IF NOT EXISTS completion_status TEXT DEFAULT 'completed' CHECK (completion_status IN ('completed', 'partial', 'skipped')),
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS activity_subtype TEXT,
ADD COLUMN IF NOT EXISTS bedtime TIME,
ADD COLUMN IF NOT EXISTS wake_time TIME,
ADD COLUMN IF NOT EXISTS sleep_quality TEXT CHECK (sleep_quality IN ('çok iyi', 'iyi', 'orta', 'kötü', 'çok kötü'));

-- 2. Mevcut kısıtlamayı kaldır
ALTER TABLE public.activities 
DROP CONSTRAINT IF EXISTS activities_activity_type_check;

-- 3. Yeni aktivite türleri kısıtlaması (yemek kaldırıldı)
ALTER TABLE public.activities 
ADD CONSTRAINT activities_activity_type_check 
CHECK (activity_type IN ('uyku', 'oyun', 'egzersiz', 'okuma', 'banyo', 'dis_fircalama', 'ders', 'sosyal', 'diger'));

-- 4. Mevcut 'yemek' kayıtlarını 'diger' olarak güncelle
UPDATE public.activities 
SET activity_type = 'diger' 
WHERE activity_type = 'yemek';

-- 5. Değişiklikleri kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'activities' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Kısıtlamaları kontrol et
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%activity_type%';

-- 7. Mevcut aktivite türlerini kontrol et
SELECT DISTINCT activity_type FROM public.activities;