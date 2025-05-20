-- Verificar se a coluna payment_date já existe na tabela sale_operational_costs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sale_operational_costs' AND column_name = 'payment_date'
    ) THEN
        -- Adicionar a coluna payment_date
        ALTER TABLE sale_operational_costs ADD COLUMN payment_date DATE;
        
        RAISE NOTICE 'Coluna payment_date adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna payment_date já existe na tabela.';
    END IF;
END $$;
