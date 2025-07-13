-- Epilepsi tablosunu güncelle: duration_minutes -> duration_seconds ve yeni nöbet türü ekle
ALTER TABLE public.seizures 
RENAME COLUMN duration_minutes TO duration_seconds;

-- Nöbet türü kısıtlamasını güncelle
ALTER TABLE public.seizures 
DROP CONSTRAINT IF EXISTS seizures_seizure_type_check;

ALTER TABLE public.seizures 
ADD CONSTRAINT seizures_seizure_type_check 
CHECK (seizure_type IN ('Miyoklonik Absans Nöbeti', 'Miyoklonik Absans', 'Klonik', 'Tonik', 'Atonik', 'Tonik-Klonik', 'Absans'));