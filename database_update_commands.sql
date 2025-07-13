-- Epilepsi tablosunu güncelle: duration_minutes -> duration_seconds ve nöbet türlerini düzenle
-- Bu komutları Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Sütun adını değiştir (eğer henüz değiştirilmediyse)
ALTER TABLE public.seizures 
RENAME COLUMN duration_minutes TO duration_seconds;

-- 2. Mevcut kısıtlamayı kaldır
ALTER TABLE public.seizures 
DROP CONSTRAINT IF EXISTS seizures_seizure_type_check;

-- 3. Yeni kısıtlama ekle (Miyoklonik Absans varsayılan)
ALTER TABLE public.seizures 
ADD CONSTRAINT seizures_seizure_type_check 
CHECK (seizure_type IN ('Miyoklonik Absans', 'Klonik', 'Tonik', 'Atonik', 'Tonik-Klonik', 'Absans'));

-- 4. Mevcut 'Miyoklonik Absans Nöbeti' kayıtlarını 'Miyoklonik Absans' olarak güncelle
UPDATE public.seizures 
SET seizure_type = 'Miyoklonik Absans' 
WHERE seizure_type = 'Miyoklonik Absans Nöbeti';

-- 5. Değişiklikleri kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'seizures' AND table_schema = 'public';

-- 6. Kısıtlamaları kontrol et
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%seizure_type%';

-- 7. Mevcut nöbet türlerini kontrol et
SELECT DISTINCT seizure_type FROM public.seizures;