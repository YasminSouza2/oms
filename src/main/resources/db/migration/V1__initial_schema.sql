-- V1__initial_schema.sql
-- Schema inicial do Order Management System (ecommerce)

-- Usuário
CREATE TABLE usuarios (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome         VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    senha        VARCHAR(255) NOT NULL,
    telefone     VARCHAR(20),
    cpf          VARCHAR(14),
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Endereço
CREATE TABLE enderecos (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    logradouro   VARCHAR(255) NOT NULL,
    numero       VARCHAR(20) NOT NULL,
    complemento  VARCHAR(100),
    bairro       VARCHAR(100) NOT NULL,
    cidade       VARCHAR(100) NOT NULL,
    estado       VARCHAR(2) NOT NULL,
    cep          VARCHAR(10) NOT NULL
);

-- Produto
CREATE TABLE produtos (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome         VARCHAR(255) NOT NULL,
    descricao    TEXT,
    preco        DECIMAL(19, 2) NOT NULL,
    estoque      INTEGER NOT NULL DEFAULT 0,
    sku          VARCHAR(50) UNIQUE,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pedido
CREATE TABLE pedidos (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   UUID NOT NULL REFERENCES usuarios(id),
    endereco_cobranca_id  UUID NOT NULL REFERENCES enderecos(id),
    endereco_entrega_id  UUID NOT NULL REFERENCES enderecos(id),
    status       VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    total        DECIMAL(19, 2) NOT NULL DEFAULT 0,
    data_pedido  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Item do Pedido
CREATE TABLE itens_pedido (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id      UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id     UUID NOT NULL REFERENCES produtos(id),
    quantidade     INTEGER NOT NULL,
    preco_unitario DECIMAL(19, 2) NOT NULL,
    subtotal       DECIMAL(19, 2) NOT NULL,
    CONSTRAINT chk_quantidade_positiva CHECK (quantidade > 0)
);
