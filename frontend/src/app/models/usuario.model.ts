export interface UsuarioResponse {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  role: 'ADMIN' | 'FUNCIONARIO' | 'CLIENTE';
  dataCadastro: string;
}
