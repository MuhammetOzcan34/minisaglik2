-- Profil trigger'ını aktif et
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Günlük Rutin Modal için aktiviteler tablosuna yeni sütunlar ekle
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS activity_time time,
ADD COLUMN IF NOT EXISTS completion_status text DEFAULT 'completed';