-- Migration: RPC para Transações Recorrentes
-- Issue: #35

-- Adiciona a coluna de parcelas/installments que estava faltando
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;

COMMENT ON COLUMN public.transactions.installments IS 'Número de parcelas ou ocorrências da transação';

-- Remove versões antigas da função para evitar conflitos de overload
DROP FUNCTION IF EXISTS public.handle_recurring_transactions(text, decimal, date, transaction_type, uuid, text, int);
DROP FUNCTION IF EXISTS public.handle_recurring_transactions(text, decimal, date, text, uuid, text, int);

-- Função para lidar com transações recorrentes
-- Usa 'text' para p_type e p_frequency para evitar problemas de resolução
-- de enum no PostgREST, fazendo o cast internamente.
CREATE OR REPLACE FUNCTION public.handle_recurring_transactions(
  p_description text,
  p_amount decimal,
  p_date date,
  p_type text,
  p_category_id uuid DEFAULT NULL,
  p_frequency text DEFAULT 'monthly',
  p_installments int DEFAULT 1
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_current_date date;
  v_first_id uuid;
  v_type transaction_type;
  v_freq recurrence_frequency;
  i int;
BEGIN
  v_user_id := auth.uid();
  v_current_date := p_date;
  v_type := p_type::transaction_type;
  v_freq := p_frequency::recurrence_frequency;

  -- 1. Insere a primeira transação (a "Pai")
  INSERT INTO public.transactions (
    description, amount, date, type, category_id, user_id, is_recurrent, frequency, installments
  ) VALUES (
    p_description, p_amount, v_current_date, v_type, p_category_id, v_user_id, true, v_freq, p_installments
  ) RETURNING id INTO v_first_id;

  -- 2. Loop para inserir as próximas parcelas (começando da 2ª)
  FOR i IN 2..p_installments LOOP
    -- Calcula a próxima data baseado na frequência
    IF p_frequency = 'weekly' THEN
      v_current_date := v_current_date + interval '1 week';
    ELSIF p_frequency = 'monthly' THEN
      v_current_date := v_current_date + interval '1 month';
    ELSIF p_frequency = 'yearly' THEN
      v_current_date := v_current_date + interval '1 year';
    END IF;

    -- Insere a parcela vinculada à primeira
    INSERT INTO public.transactions (
      description, amount, date, type, category_id, user_id, is_recurrent, frequency, installments, parent_id
    ) VALUES (
      p_description || ' (' || i || '/' || p_installments || ')', 
      p_amount, v_current_date, v_type, p_category_id, v_user_id, true, v_freq, p_installments, v_first_id
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_recurring_transactions(text, decimal, date, text, uuid, text, int) 
IS 'Cria uma série de transações recorrentes com datas progressivas baseado na frequência.';
