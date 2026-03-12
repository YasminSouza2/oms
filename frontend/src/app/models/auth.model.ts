export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegistroRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cpf?: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'FUNCIONARIO' | 'CLIENTE';
}
