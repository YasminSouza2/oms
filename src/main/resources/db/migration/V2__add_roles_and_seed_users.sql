-- Adicionar coluna role em usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'CLIENTE';
