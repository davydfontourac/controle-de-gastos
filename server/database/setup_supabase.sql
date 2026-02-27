-- 1. Criar a tabela de Perfis (caso não exista)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Habilitar RLS para 'profiles'
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para 'profiles'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 4. Abrir permissão para o bucket 'avatars' no Storage
-- Nota: Isso assume que você já criou o bucket via UI ou quer tentar via SQL (se tiver permissão)
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- 5. Políticas de Storage para o bucket 'avatars'
DO $$ 
BEGIN
    -- Permitir acesso público para leitura
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Avatar images are publicly accessible.') THEN
        CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
    END IF;

    -- Permitir upload para usuários autenticados em sua própria pasta
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can upload their own avatar.') THEN
        CREATE POLICY "Users can upload their own avatar." ON storage.objects FOR INSERT WITH CHECK ( 
            bucket_id = 'avatars' 
            AND auth.role() = 'authenticated' 
            AND (storage.foldername(name))[1] = auth.uid()::text 
        );
    END IF;

    -- Permitir que o usuário atualize seu próprio avatar
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can update their own avatar.') THEN
        CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE USING ( 
            bucket_id = 'avatars' 
            AND auth.uid()::text = (storage.foldername(name))[1] 
        );
    END IF;

    -- Permitir que o usuário delete seu próprio avatar
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can delete their own avatar.') THEN
        CREATE POLICY "Users can delete their own avatar." ON storage.objects FOR DELETE USING ( 
            bucket_id = 'avatars' 
            AND auth.uid()::text = (storage.foldername(name))[1] 
        );
    END IF;
END $$;
