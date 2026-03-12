# OMS - Order Management System

Sistema de gerenciamento de pedidos full-stack com backend em **Spring Boot** e frontend em **Angular**, incluindo autenticação JWT, controle de acesso por roles, fluxo de pagamento simulado e gerenciamento de estoque.

---

## Índice

- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [API REST - Endpoints](#api-rest---endpoints)
- [Modelos de Domínio](#modelos-de-domínio)
- [Regras de Negócio](#regras-de-negócio)
- [Frontend](#frontend)
- [Tratamento de Erros](#tratamento-de-erros)
- [Dados Iniciais](#dados-iniciais)

---

## Tecnologias

### Backend

| Tecnologia        | Versão  |
| ----------------- | ------- |
| Java              | 17      |
| Spring Boot       | 3.2.5   |
| Spring Security   | 6.x     |
| Spring Data JPA   | 3.x     |
| Flyway            | —       |
| PostgreSQL        | 16      |
| JWT (jjwt)        | 0.12.6  |
| SpringDoc OpenAPI | 2.3.0   |
| Lombok            | —       |
| Docker Compose    | —       |

### Frontend

| Tecnologia | Versão |
| ---------- | ------ |
| Angular    | 21.2.0 |
| TypeScript | 5.9.2  |
| RxJS       | 7.8.0  |

---

## Arquitetura

O projeto segue uma arquitetura em camadas no backend e utiliza standalone components no frontend.

```
oms/
├── docker-compose.yml
├── pom.xml
├── src/main/
│   ├── java/com/yasmin/oms/
│   │   ├── api/
│   │   │   ├── controller/        # Controllers REST
│   │   │   ├── dto/
│   │   │   │   ├── request/       # DTOs de entrada
│   │   │   │   └── response/      # DTOs de saída
│   │   │   └── exception/         # Exceções e handler global
│   │   ├── application/
│   │   │   └── service/           # Serviços de aplicação
│   │   ├── config/
│   │   │   ├── security/          # JWT, filtros e autenticação
│   │   │   ├── SecurityConfig     # Configuração de segurança
│   │   │   ├── OpenApiConfig      # Configuração do Swagger
│   │   │   └── DataLoader         # Dados iniciais
│   │   └── domain/
│   │       ├── model/             # Entidades JPA
│   │       └── repository/        # Repositórios Spring Data
│   └── resources/
│       ├── application.yaml
│       └── db/migration/          # Migrações Flyway
└── frontend/
    └── src/app/
        ├── components/            # Componentes Angular
        ├── services/              # Serviços HTTP
        ├── models/                # Interfaces TypeScript
        ├── guards/                # Guards de rota
        └── interceptors/          # Interceptor JWT
```

---

## Pré-requisitos

- **Java 17+**
- **Maven 3.8+**
- **Node.js 20+** e **npm 10+**
- **Docker** e **Docker Compose**

---

## Instalação e Execução

### 1. Subir o banco de dados

```bash
docker-compose up -d
```

Isso inicia o **PostgreSQL 16** na porta `5432` e o **pgAdmin** na porta `5050`.

### 2. Executar o backend

```bash
./mvnw spring-boot:run
```

O backend estará disponível em `http://localhost:8080`.

A documentação Swagger pode ser acessada em `http://localhost:8080/swagger-ui.html`.

### 3. Executar o frontend

```bash
cd frontend
npm install
npm start
```

O frontend estará disponível em `http://localhost:4200`.

---

## Variáveis de Ambiente

O backend é configurado via `application.yaml`:

| Propriedade            | Padrão                                      | Descrição                  |
| ---------------------- | ------------------------------------------- | -------------------------- |
| `spring.datasource.url`      | `jdbc:postgresql://localhost:5432/oms_db` | URL do banco de dados      |
| `spring.datasource.username` | `oms_user`                                | Usuário do banco           |
| `spring.datasource.password` | `oms_pass`                                | Senha do banco             |
| `app.jwt.secret`             | (configurado no yaml)                     | Chave secreta para JWT     |
| `app.jwt.expiration`         | `86400000` (24h)                          | Tempo de expiração do token |

---

## Banco de Dados

### Docker Compose

| Serviço    | Imagem           | Porta | Credenciais                      |
| ---------- | ---------------- | ----- | -------------------------------- |
| `postgres` | `postgres:16`    | 5432  | `oms_user` / `oms_pass`         |
| `pgadmin`  | `dpage/pgadmin4` | 5050  | `admin@admin.com` / `admin`     |

### Migrações Flyway

As migrações são executadas automaticamente ao iniciar a aplicação:

- **V1** — Criação das tabelas: `usuarios`, `enderecos`, `produtos`, `pedidos`, `itens_pedido`
- **V2** — Adição da coluna `role` na tabela `usuarios` (padrão: `CLIENTE`)

### Diagrama de Relacionamentos

```
Usuario  1 ── N  Endereco
Usuario  1 ── N  Pedido
Pedido   1 ── N  ItemPedido
Produto  1 ── N  ItemPedido
Pedido   N ── 1  Endereco (cobrança)
Pedido   N ── 1  Endereco (entrega)
```

---

## Autenticação e Autorização

### JWT

- **Algoritmo**: HMAC-SHA256
- **Expiração**: 24 horas
- **Header**: `Authorization: Bearer <token>`
- **Claims**: `sub` (email), `id` (UUID), `role`
- **Sessão**: Stateless (sem estado no servidor)
- **Senhas**: Criptografadas com BCrypt

### Roles

| Role          | Permissões                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `ADMIN`       | Acesso total: CRUD de usuários, produtos, pedidos; alteração de status                              |
| `FUNCIONARIO` | Listar/ver usuários; CRUD de produtos; visualizar e alterar status de pedidos                       |
| `CLIENTE`     | Ver/editar próprio perfil; gerenciar próprios endereços; criar pedidos; ver próprios pedidos         |

### Rotas Públicas (sem autenticação)

- `POST /api/auth/login`
- `POST /api/auth/registro`
- `GET /api/produtos` e `GET /api/produtos/{id}`
- `/swagger-ui/**` e `/v3/api-docs/**`

### CORS

Origins permitidas: `localhost:3000`, `localhost:4200`, `localhost:5173` (e variantes `127.0.0.1`).

---

## API REST — Endpoints

### Autenticação — `/api/auth`

| Método | Endpoint             | Descrição                | Body                                                          | Resposta                                              |
| ------ | -------------------- | ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------- |
| POST   | `/api/auth/login`    | Login                    | `{ email, senha }`                                            | `{ token, tipo, id, nome, email, role }`              |
| POST   | `/api/auth/registro` | Registro de novo cliente | `{ nome, email, senha, telefone?, cpf? }`                     | `{ token, tipo, id, nome, email, role }` (201)        |

### Usuários — `/api/usuarios`

| Método | Endpoint              | Descrição             | Permissão                   |
| ------ | --------------------- | --------------------- | --------------------------- |
| GET    | `/api/usuarios`       | Listar todos          | ADMIN, FUNCIONARIO          |
| GET    | `/api/usuarios/{id}`  | Buscar por ID         | ADMIN, FUNCIONARIO ou dono  |
| POST   | `/api/usuarios`       | Criar usuário         | ADMIN                       |
| PUT    | `/api/usuarios/{id}`  | Atualizar usuário     | ADMIN ou dono               |
| DELETE | `/api/usuarios/{id}`  | Excluir usuário       | ADMIN                       |

### Endereços — `/api/usuarios/{usuarioId}/enderecos`

| Método | Endpoint                                              | Descrição          | Permissão                   |
| ------ | ----------------------------------------------------- | ------------------ | --------------------------- |
| GET    | `/api/usuarios/{usuarioId}/enderecos`                 | Listar endereços   | ADMIN, FUNCIONARIO ou dono  |
| GET    | `/api/usuarios/{usuarioId}/enderecos/{enderecoId}`    | Buscar por ID      | ADMIN, FUNCIONARIO ou dono  |
| POST   | `/api/usuarios/{usuarioId}/enderecos`                 | Criar endereço     | ADMIN, FUNCIONARIO ou dono  |
| PUT    | `/api/usuarios/{usuarioId}/enderecos/{enderecoId}`    | Atualizar endereço | ADMIN, FUNCIONARIO ou dono  |
| DELETE | `/api/usuarios/{usuarioId}/enderecos/{enderecoId}`    | Excluir endereço   | ADMIN, FUNCIONARIO ou dono  |

**Body (POST/PUT):**
```json
{
  "logradouro": "Rua Exemplo",
  "numero": "123",
  "complemento": "Apto 4",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01001-000"
}
```

### Produtos — `/api/produtos`

| Método | Endpoint              | Descrição          | Permissão          |
| ------ | --------------------- | ------------------ | ------------------ |
| GET    | `/api/produtos`       | Listar todos       | Público            |
| GET    | `/api/produtos/{id}`  | Buscar por ID      | Público            |
| POST   | `/api/produtos`       | Criar produto      | ADMIN, FUNCIONARIO |
| PUT    | `/api/produtos/{id}`  | Atualizar produto  | ADMIN, FUNCIONARIO |
| DELETE | `/api/produtos/{id}`  | Excluir produto    | ADMIN, FUNCIONARIO |

**Body (POST):**
```json
{
  "nome": "Produto Exemplo",
  "descricao": "Descrição do produto",
  "preco": 99.90,
  "estoque": 50,
  "sku": "PROD-001"
}
```

### Pedidos — `/api/pedidos`

| Método | Endpoint                                  | Descrição                   | Permissão              |
| ------ | ----------------------------------------- | --------------------------- | ---------------------- |
| GET    | `/api/pedidos`                            | Listar todos os pedidos     | ADMIN, FUNCIONARIO     |
| GET    | `/api/pedidos/usuario/{usuarioId}`        | Listar pedidos do usuário   | ADMIN, FUNCIONARIO ou dono |
| GET    | `/api/pedidos/{id}`                       | Buscar pedido por ID        | Autenticado (CLIENTE só vê os seus) |
| POST   | `/api/pedidos`                            | Criar pedido                | Autenticado            |
| PATCH  | `/api/pedidos/{id}/status`                | Atualizar status            | ADMIN, FUNCIONARIO     |
| POST   | `/api/pedidos/{id}/finalizar-pagamento`   | Simular pagamento           | Autenticado            |

**Body — Criar pedido (POST):**
```json
{
  "enderecoCobrancaId": "uuid",
  "enderecoEntregaId": "uuid",
  "itens": [
    { "produtoId": "uuid", "quantidade": 2 },
    { "produtoId": "uuid", "quantidade": 1 }
  ]
}
```

> O campo `usuarioId` é preenchido automaticamente a partir do token JWT.

**Body — Atualizar status (PATCH):**
```json
{
  "status": "CONFIRMADO"
}
```

---

## Modelos de Domínio

### Usuario

| Campo         | Tipo            | Restrições                    |
| ------------- | --------------- | ----------------------------- |
| id            | UUID            | PK, auto-gerado              |
| nome          | String          | Obrigatório                   |
| email         | String          | Obrigatório, único            |
| senha         | String          | Obrigatório (BCrypt)          |
| telefone      | String(20)      | Opcional                      |
| cpf           | String(14)      | Opcional                      |
| role          | Role (enum)     | ADMIN, FUNCIONARIO ou CLIENTE |
| dataCadastro  | LocalDateTime   | Imutável                      |

### Endereco

| Campo        | Tipo        | Restrições       |
| ------------ | ----------- | ---------------- |
| id           | UUID        | PK               |
| logradouro   | String      | Obrigatório      |
| numero       | String(20)  | Obrigatório      |
| complemento  | String(100) | Opcional          |
| bairro       | String(100) | Obrigatório      |
| cidade       | String(100) | Obrigatório      |
| estado       | String(2)   | Obrigatório (UF) |
| cep          | String(10)  | Obrigatório      |

### Produto

| Campo         | Tipo              | Restrições          |
| ------------- | ----------------- | ------------------- |
| id            | UUID              | PK                  |
| nome          | String            | Obrigatório         |
| descricao     | String (TEXT)     | Opcional             |
| preco         | BigDecimal(19,2)  | Obrigatório         |
| estoque       | Integer           | Obrigatório, >= 0   |
| sku           | String(50)        | Opcional, único      |
| dataCadastro  | LocalDateTime     | Imutável             |

### Pedido

| Campo              | Tipo              | Restrições                          |
| ------------------ | ----------------- | ----------------------------------- |
| id                 | UUID              | PK                                  |
| usuario            | Usuario           | Obrigatório                         |
| enderecoCobranca   | Endereco          | Obrigatório                         |
| enderecoEntrega    | Endereco          | Obrigatório                         |
| status             | String(50)        | Padrão: `AGUARDANDO_PAGAMENTO`      |
| total              | BigDecimal(19,2)  | Calculado automaticamente           |
| dataPedido         | LocalDateTime     | Imutável                            |
| itens              | List\<ItemPedido> | Cascade ALL                         |

### ItemPedido

| Campo          | Tipo              | Restrições                          |
| -------------- | ----------------- | ----------------------------------- |
| id             | UUID              | PK                                  |
| produto        | Produto           | Obrigatório                         |
| quantidade     | Integer           | Obrigatório, > 0                    |
| precoUnitario  | BigDecimal(19,2)  | Snapshot do preço no momento        |
| subtotal       | BigDecimal(19,2)  | precoUnitario × quantidade          |

---

## Regras de Negócio

### Fluxo de Status do Pedido

```
AGUARDANDO_PAGAMENTO ──► PAGAMENTO_SIMULADO ──► PENDENTE ──► CONFIRMADO ──► ENVIADO ──► ENTREGUE
        │
        └──► CANCELADO (exceto se já ENVIADO ou ENTREGUE)
```

### Fluxo de Pagamento Simulado

1. O pedido é criado com status `AGUARDANDO_PAGAMENTO`.
2. O cliente aciona `POST /api/pedidos/{id}/finalizar-pagamento`, que altera o status para `PAGAMENTO_SIMULADO`.
3. A partir daí, ADMIN ou FUNCIONARIO avançam o status manualmente via `PATCH /api/pedidos/{id}/status`.

### Controle de Estoque

- **Ao criar pedido**: valida se há estoque suficiente para cada item e **decrementa** o estoque do produto.
- **Ao cancelar pedido**: **devolve** o estoque de cada item ao produto.

### Criação de Pedido

- O `usuarioId` é preenchido automaticamente a partir do token JWT quando não informado.
- Os endereços de cobrança e entrega devem pertencer ao usuário.
- O preço unitário é capturado do produto no momento da criação (snapshot).
- O total do pedido é calculado automaticamente com base nos itens.

---

## Frontend

### Visão Geral

O frontend é uma SPA Angular 21 com standalone components, Angular Signals para gerenciamento de estado e lazy loading em todas as rotas.

### Páginas

| Rota         | Componente         | Descrição                                                                   | Acesso             |
| ------------ | ------------------ | --------------------------------------------------------------------------- | ------------------- |
| `/login`     | LoginComponent     | Formulário de login com email e senha                                       | Público             |
| `/registro`  | RegistroComponent  | Cadastro com dados pessoais e endereço                                      | Público             |
| `/produtos`  | ProdutosComponent  | Catálogo de produtos com CRUD (ADMIN/FUNC) e carrinho                       | Público (CRUD restrito) |
| `/carrinho`  | CarrinhoComponent  | Carrinho com controle de quantidade e resumo de valores                     | Autenticado         |
| `/checkout`  | CheckoutComponent  | Seleção de endereços e confirmação do pedido                                | Autenticado         |
| `/pedidos`   | PedidosComponent   | Listagem de pedidos com ações de pagamento e gestão de status               | Autenticado         |
| `/usuarios`  | UsuariosComponent  | Gestão de usuários com listagem e exclusão                                  | ADMIN, FUNCIONARIO  |

### Estilização

- CSS puro customizado (sem frameworks externos).
- Fonte: **Inter** (Google Fonts).
- Paleta de cores baseada em Slate/Indigo.
- Layout responsivo com breakpoints para mobile.

### Autenticação no Frontend

1. Login/registro retorna o token JWT, salvo no `localStorage`.
2. Um **interceptor HTTP** adiciona automaticamente o header `Authorization: Bearer <token>` em todas as requisições.
3. **Guards de rota** protegem páginas que exigem autenticação ou roles específicas.
4. A UI se adapta conforme o role do usuário (botões, colunas e ações condicionais).

### Carrinho

O carrinho é gerenciado 100% no client-side via `localStorage` e Angular Signals, sem persistência no backend.

---

## Tratamento de Erros

| Exceção                          | HTTP Status             | Descrição                          |
| -------------------------------- | ----------------------- | ---------------------------------- |
| `ResourceNotFoundException`      | 404 Not Found           | Recurso não encontrado             |
| `BusinessException`              | 422 Unprocessable Entity| Violação de regra de negócio       |
| `AccessDeniedException`          | 403 Forbidden           | Sem permissão                      |
| `AuthenticationException`        | 401 Unauthorized        | Credenciais inválidas              |
| `MethodArgumentNotValidException`| 400 Bad Request         | Erro de validação                  |
| `Exception` (genérica)           | 500 Internal Server Error| Erro interno                      |

**Formato da resposta de erro:**
```json
{
  "timestamp": "2026-03-12T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validação",
  "path": "/api/pedidos",
  "fieldErrors": [
    { "field": "nome", "message": "Nome é obrigatório" }
  ]
}
```

---

## Dados Iniciais

O `DataLoader` cria automaticamente 3 usuários ao iniciar a aplicação:

| Email                  | Senha      | Role         |
| ---------------------- | ---------- | ------------ |
| `admin@oms.com`        | `senha123` | ADMIN        |
| `funcionario@oms.com`  | `senha123` | FUNCIONARIO  |
| `cliente@oms.com`      | `senha123` | CLIENTE      |
