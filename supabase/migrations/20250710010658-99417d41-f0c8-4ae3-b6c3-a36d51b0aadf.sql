-- Mevcut families tablosu RLS politikalarını kaldır
DROP POLICY IF EXISTS "Kullanıcılar aile oluşturabilir" ON public.families;
DROP POLICY IF EXISTS "Kullanıcılar kendi ailelerini görebilir" ON public.families;
DROP POLICY IF EXISTS "Aile üyeleri aile bilgilerini güncelleyebilir" ON public.families;

-- Yeni ve düzeltilmiş RLS politikaları oluştur
CREATE POLICY "Users can create families" 
ON public.families 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own families" 
ON public.families 
FOR SELECT 
TO authenticated 
USING (auth.uid() IN (
  SELECT profiles.user_id 
  FROM profiles 
  WHERE profiles.family_id = families.id
));

CREATE POLICY "Family members can update family info" 
ON public.families 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IN (
  SELECT profiles.user_id 
  FROM profiles 
  WHERE profiles.family_id = families.id
));