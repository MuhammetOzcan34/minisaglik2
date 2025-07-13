-- Günlük Rutin Modal için aktiviteler tablosuna yeni sütunlar ekle
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS activity_time time,
ADD COLUMN IF NOT EXISTS completion_status text DEFAULT 'completed';