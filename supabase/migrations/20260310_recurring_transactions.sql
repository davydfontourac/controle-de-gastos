-- Migration: Transações Recorrentes
-- Issue: #35

-- 1. Criar o enum para frequências de recorrência
DO $$ BEGIN
    CREATE TYPE recurrence_frequency AS ENUM ('weekly', 'monthly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar colunas necessárias na tabela transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_recurrent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS frequency recurrence_frequency,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES transactions(id) ON DELETE CASCADE;

-- 3. Índice para performance em buscas por parent_id
CREATE INDEX IF NOT EXISTS idx_transactions_parent_id ON transactions(parent_id);

COMMENT ON COLUMN transactions.is_recurrent IS 'Indica se a transação faz parte de uma série recorrente';
COMMENT ON COLUMN transactions.frequency IS 'Frequência da recorrência (weekly, monthly, yearly)';
COMMENT ON COLUMN transactions.parent_id IS 'ID da transação original que gerou esta ocorrência';
