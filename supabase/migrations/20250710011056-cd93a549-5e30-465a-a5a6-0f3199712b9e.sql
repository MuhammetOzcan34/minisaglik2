-- RLS politikasını geçici olarak kaldır ve test et
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;

-- Test amaçlı basit bir insert dene
INSERT INTO public.families (name, created_by) 
VALUES ('Test Ailesi', 'ff6a337e-01a3-45b7-8a26-343729177c28');

-- Veriyi kontrol et
SELECT * FROM public.families WHERE name = 'Test Ailesi';

-- Test verisini sil
DELETE FROM public.families WHERE name = 'Test Ailesi';

-- RLS'yi tekrar aktif et
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Auth.uid() fonksiyonunu test et
SELECT auth.uid() as current_user_id;