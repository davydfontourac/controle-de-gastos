DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'transfer_in' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')) THEN
    ALTER TYPE transaction_type ADD VALUE 'transfer_in';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'transfer_out' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')) THEN
    ALTER TYPE transaction_type ADD VALUE 'transfer_out';
  END IF;
END $$;

-- Atualizar a função de resumo do dashboard para lidar com transferências
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_month int, p_year int)
RETURNS json AS $$
DECLARE
  v_income decimal;
  v_expense decimal;
  v_total_balance decimal;
  v_caixinha_balance decimal;
  v_year_balance decimal;
  v_user_id uuid;
  v_start_date timestamp;
  v_end_date timestamp;
BEGIN
  v_user_id := auth.uid();
  v_start_date := make_date(p_year, p_month, 1);
  v_end_date := (v_start_date + interval '1 month' - interval '1 second');

  -- Receitas (apenas tipo income)
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM transactions
  WHERE user_id = v_user_id AND type = 'income' AND date BETWEEN v_start_date AND v_end_date;

  -- Despesas (apenas tipo expense)
  SELECT COALESCE(SUM(amount), 0) INTO v_expense
  FROM transactions
  WHERE user_id = v_user_id AND type = 'expense' AND date BETWEEN v_start_date AND v_end_date;

  -- Saldo Total (considerando tudo: entradas, saídas e transferências)
  SELECT COALESCE(SUM(
    CASE 
      WHEN type IN ('income', 'transfer_in') THEN amount 
      WHEN type IN ('expense', 'transfer_out') THEN -amount
      ELSE 0 
    END
  ), 0) INTO v_total_balance
  FROM transactions
  WHERE user_id = v_user_id AND date <= v_end_date;

  -- Saldo Caixinhas (Acumulado de transferências para a categoria 'caixinha')
  -- transfer_out aumenta a caixinha, transfer_in diminui
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'transfer_out' THEN amount 
      WHEN type = 'transfer_in' THEN -amount
      ELSE 0 
    END
  ), 0) INTO v_caixinha_balance
  FROM transactions t
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE t.user_id = v_user_id 
    AND (c.name ILIKE '%caixinha%' OR c.name ILIKE '%investimento%')
    AND t.date <= v_end_date;

  -- Saldo do Ano
  SELECT COALESCE(SUM(
    CASE 
      WHEN type IN ('income', 'transfer_in') THEN amount 
      WHEN type IN ('expense', 'transfer_out') THEN -amount
      ELSE 0 
    END
  ), 0) INTO v_year_balance
  FROM transactions
  WHERE user_id = v_user_id AND extract(year from date) = p_year AND date <= v_end_date;

  RETURN json_build_object(
    'income', v_income,
    'expense', v_expense,
    'availableBalance', v_total_balance,
    'caixinhaBalance', v_caixinha_balance,
    'yearBalance', v_year_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
