CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE recurrence_frequency AS ENUM ('weekly', 'monthly', 'yearly');

-- Tabela de Categorias
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) DEFAULT '#3b82f6',
  icon VARCHAR(50) DEFAULT 'Tag',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Transações
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(12, 2) NOT NULL,
  type transaction_type NOT NULL,
  description VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_recurrent BOOLEAN DEFAULT false,
  frequency recurrence_frequency,
  parent_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Ativar RLS nas tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para 'categories'
-- Usuário só pode ler (SELECT) suas próprias categorias
CREATE POLICY "Users can view their own categories" 
ON categories FOR SELECT 
USING (auth.uid() = user_id);

-- Usuário só pode criar (INSERT) suas próprias categorias
CREATE POLICY "Users can insert their own categories" 
ON categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Usuário só pode editar (UPDATE) suas próprias categorias
CREATE POLICY "Users can update their own categories" 
ON categories FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Usuário só pode deletar (DELETE) suas próprias categorias
CREATE POLICY "Users can delete their own categories" 
ON categories FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para 'transactions'
-- Usuário só pode ler (SELECT) suas próprias transações
CREATE POLICY "Users can view their own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Usuário só pode criar (INSERT) suas próprias transações
CREATE POLICY "Users can insert their own transactions" 
ON transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Usuário só pode editar (UPDATE) suas próprias transações
CREATE POLICY "Users can update their own transactions" 
ON transactions FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Usuário só pode deletar (DELETE) suas próprias transações
CREATE POLICY "Users can delete their own transactions" 
ON transactions FOR DELETE 
USING (auth.uid() = user_id);
-- Tabela de Perfis
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS para 'profiles'
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para 'profiles'
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Trigger para criar perfil automaticamente no SignUp (Opcional, mas recomendado)
-- Vamos deixar manual por enquanto via frontend para simplificar a lógica inicial.

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

-- Migration: Funções RPC para Dashboard
-- Issue: #03

-- 1. Função para Resumo do Dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_month int, p_year int)
RETURNS json AS $$
DECLARE
  v_user_id uuid;
  v_income decimal(12,2);
  v_expense decimal(12,2);
  v_total_balance decimal(12,2);
  v_year_balance decimal(12,2);
  v_start_date date;
  v_end_date date;
  v_year_start date;
  v_year_end date;
BEGIN
  v_user_id := auth.uid();
  
  -- Define datas de início e fim do mês
  v_start_date := make_date(p_year, p_month, 1);
  v_end_date := (v_start_date + interval '1 month' - interval '1 day')::date;
  
  -- Define datas de início e fim do ano
  v_year_start := make_date(p_year, 1, 1);
  v_year_end := make_date(p_year, 12, 31);

  -- Busca Receita e Despesa do mês selecionado
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_income, v_expense
  FROM public.transactions
  WHERE user_id = v_user_id AND date >= v_start_date AND date <= v_end_date;

  -- Busca Saldo Total (Acumulado de todo o tempo)
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
  INTO v_total_balance
  FROM public.transactions
  WHERE user_id = v_user_id;

  -- Busca Saldo do Ano selecionado
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
  INTO v_year_balance
  FROM public.transactions
  WHERE user_id = v_user_id AND date >= v_year_start AND date <= v_year_end;

  RETURN json_build_object(
    'income', v_income,
    'expense', v_expense,
    'totalBalance', v_total_balance,
    'yearBalance', v_year_balance,
    'balance', v_total_balance -- Mantido para compatibilidade com frontend antigo
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para Histórico Mensal (Gráfico)
CREATE OR REPLACE FUNCTION public.get_monthly_history(p_year int)
RETURNS json AS $$
DECLARE
  v_user_id uuid;
  v_result json;
BEGIN
  v_user_id := auth.uid();

  WITH months AS (
    SELECT generate_series(1, 12) as month_num
  ),
  month_names AS (
    SELECT month_num,
           CASE month_num
             WHEN 1 THEN 'Jan' WHEN 2 THEN 'Fev' WHEN 3 THEN 'Mar'
             WHEN 4 THEN 'Abr' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Jun'
             WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago' WHEN 9 THEN 'Set'
             WHEN 10 THEN 'Out' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dez'
           END as month_name
    FROM months
  ),
  stats AS (
    SELECT 
      EXTRACT(MONTH FROM date) as month_num,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
    FROM public.transactions
    WHERE user_id = v_user_id AND EXTRACT(YEAR FROM date) = p_year
    GROUP BY month_num
  )
  SELECT json_agg(
    json_build_object(
      'month', mn.month_name,
      'income', COALESCE(s.income, 0),
      'expense', COALESCE(s.expense, 0),
      'fullMonth', mn.month_num,
      'year', p_year
    )
    ORDER BY mn.month_num
  ) INTO v_result
  FROM month_names mn
  LEFT JOIN stats s ON mn.month_num = s.month_num;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_dashboard_summary(int, int) IS 'Retorna o resumo financeiro de um mês/ano específico e o saldo acumulado.';
COMMENT ON FUNCTION public.get_monthly_history(int) IS 'Retorna o histórico de receitas e despesas de todos os meses de um ano específico.';

-- 3. RPC para Deletar Conta
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
