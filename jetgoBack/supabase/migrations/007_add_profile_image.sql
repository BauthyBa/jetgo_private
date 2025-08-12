-- Agregar campo para URL de imagen de perfil
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Crear bucket para imágenes de perfil en Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para que los usuarios puedan subir sus propias imágenes
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para que los usuarios puedan ver todas las imágenes de perfil (públicas)
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Política para que los usuarios puedan actualizar sus propias imágenes
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para que los usuarios puedan eliminar sus propias imágenes
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]); 