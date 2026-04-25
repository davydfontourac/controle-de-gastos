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

  -- Inserir Categorias Padrão automáticas com limite padrão de 500
  INSERT INTO public.categories (name, icon, color, monthly_limit, user_id)
  VALUES
    ('Salário', '💰', '#10B981', 0, new.id), -- Salário geralmente não tem limite de gastos
    ('Investimentos', '📈', '#059669', 500, new.id),
    ('Moradia', '🏠', '#3B82F6', 500, new.id),
    ('Conta de Luz', '⚡', '#F59E0B', 500, new.id),
    ('Pix', '💸', '#06B6D4', 500, new.id),
    ('Cartão de Crédito', '💳', '#6366F1', 500, new.id),
    ('Supermercado', '🛒', '#8B5CF6', 500, new.id),
    ('Alimentação', '🍔', '#EF4444', 500, new.id),
    ('Transporte', '🚗', '#6B7280', 500, new.id),
    ('Lazer', '🎡', '#F472B6', 500, new.id),
    ('Saúde', '💊', '#10B981', 500, new.id),
    ('Educação', '📚', '#4F46E5', 500, new.id),
    ('Assinaturas', '📺', '#EC4899', 500, new.id),
    ('Vestuário', '👕', '#D946EF', 500, new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger para disparar após a criação do usuário no Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria perfil e categorias padrão automaticamente para novos usuários do Auth';
