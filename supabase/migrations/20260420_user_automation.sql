-- Migration: Automação de Novo Usuário (Perfis e Categorias)
-- Issue: #02

-- 1. Função para lidar com o novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserir Perfil automático
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Inserir Categorias Padrão automáticas
  INSERT INTO public.categories (name, icon, color, user_id)
  VALUES
    ('Salário', 'banknote', '#10B981', new.id),
    ('Investimentos', 'trending-up', '#059669', new.id),
    ('Moradia', 'home', '#3B82F6', new.id),
    ('Conta de Luz', 'zap', '#F59E0B', new.id),
    ('Conta de Água', 'droplets', '#06B6D4', new.id),
    ('Internet', 'wifi', '#6366F1', new.id),
    ('Supermercado', 'shopping-cart', '#8B5CF6', new.id),
    ('Alimentação', 'utensils', '#EF4444', new.id),
    ('Transporte', 'car', '#6B7280', new.id),
    ('Lazer', 'clapperboard', '#F472B6', new.id),
    ('Saúde', 'heart', '#10B981', new.id),
    ('Educação', 'graduation-cap', '#4F46E5', new.id),
    ('Assinaturas', 'tv', '#EC4899', new.id),
    ('Vestuário', 'shirt', '#D946EF', new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger para disparar após a criação do usuário no Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria perfil e categorias padrão automaticamente para novos usuários do Auth';
