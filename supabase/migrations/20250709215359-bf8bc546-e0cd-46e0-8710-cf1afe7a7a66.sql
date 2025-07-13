-- Mevcut kullanıcı için profil oluştur
INSERT INTO public.profiles (user_id, full_name, email)
VALUES (
  'ff6a337e-01a3-45b7-8a26-343729177c28',
  'Muhammet Özcan',
  'muhammet.ozcan83@gmail.com'
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;