import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EnderecoService } from '../../services/endereco.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Criar Conta</h2>
        <p class="subtitle">Cadastre-se no OMS</p>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="nome">Nome</label>
            <input id="nome" type="text" [(ngModel)]="nome" name="nome"
                   placeholder="Seu nome completo" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
                   placeholder="seu@email.com" required>
          </div>
          <div class="form-group">
            <label for="senha">Senha</label>
            <input id="senha" type="password" [(ngModel)]="senha" name="senha"
                   placeholder="Mínimo 6 caracteres" required minlength="6">
          </div>
          <div class="form-group">
            <label for="telefone">Telefone (opcional)</label>
            <input id="telefone" type="text" [(ngModel)]="telefone" name="telefone"
                   placeholder="(11) 99999-9999">
          </div>
          <div class="form-group">
            <label for="cpf">CPF (opcional)</label>
            <input id="cpf" type="text" [(ngModel)]="cpf" name="cpf"
                   placeholder="000.000.000-00">
          </div>

          <div class="section-divider">
            <span>Endereço</span>
          </div>

          <div class="form-group">
            <label for="logradouro">Logradouro *</label>
            <input id="logradouro" type="text" [(ngModel)]="logradouro" name="logradouro"
                   placeholder="Rua, Avenida, etc." required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="numero">Número *</label>
              <input id="numero" type="text" [(ngModel)]="numero" name="numero"
                     placeholder="123" required>
            </div>
            <div class="form-group">
              <label for="complemento">Complemento</label>
              <input id="complemento" type="text" [(ngModel)]="complemento" name="complemento"
                     placeholder="Apto, Bloco (opcional)">
            </div>
          </div>
          <div class="form-group">
            <label for="bairro">Bairro *</label>
            <input id="bairro" type="text" [(ngModel)]="bairro" name="bairro"
                   placeholder="Bairro" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="cidade">Cidade *</label>
              <input id="cidade" type="text" [(ngModel)]="cidade" name="cidade"
                     placeholder="Cidade" required>
            </div>
            <div class="form-group">
              <label for="estado">Estado *</label>
              <input id="estado" type="text" [(ngModel)]="estado" name="estado"
                     placeholder="UF" required maxlength="2">
            </div>
          </div>
          <div class="form-group">
            <label for="cep">CEP *</label>
            <input id="cep" type="text" [(ngModel)]="cep" name="cep"
                   placeholder="00000-000" required>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            {{ loading() ? 'Cadastrando...' : 'Cadastrar' }}
          </button>
        </form>

        <p class="auth-footer">
          Já tem conta? <a routerLink="/login">Entrar</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 60px);
      background: #f8fafc;
      padding: 2rem 0;
    }
    .auth-card {
      background: #fff;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 480px;
    }
    h2 { margin: 0 0 0.25rem; color: #1e293b; }
    .subtitle { color: #94a3b8; margin: 0 0 1.5rem; font-size: 0.875rem; }
    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #64748b;
      font-size: 0.875rem;
    }
    .auth-footer a { color: #4f46e5; text-decoration: none; font-weight: 500; }
    .section-divider {
      display: flex;
      align-items: center;
      margin: 1.25rem 0 1rem;
      gap: 0.75rem;
    }
    .section-divider::before,
    .section-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }
    .section-divider span {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  `]
})
export class RegistroComponent {
  nome = '';
  email = '';
  senha = '';
  telefone = '';
  cpf = '';

  logradouro = '';
  numero = '';
  complemento = '';
  bairro = '';
  cidade = '';
  estado = '';
  cep = '';

  loading = signal(false);
  error = signal('');

  constructor(
    private auth: AuthService,
    private enderecoService: EnderecoService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.auth.registro({
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      telefone: this.telefone || undefined,
      cpf: this.cpf || undefined
    }).pipe(
      switchMap(() => {
        const userId = this.auth.user()!.id;
        return this.enderecoService.criar(userId, {
          logradouro: this.logradouro,
          numero: this.numero,
          complemento: this.complemento || undefined,
          bairro: this.bairro,
          cidade: this.cidade,
          estado: this.estado,
          cep: this.cep
        });
      })
    ).subscribe({
      next: () => this.router.navigate(['/produtos']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Erro ao cadastrar');
      }
    });
  }
}
