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
