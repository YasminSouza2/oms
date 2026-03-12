import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Entrar</h2>
        <p class="subtitle">Faça login ou crie uma conta</p>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
                   placeholder="seu@email.com" required>
          </div>
          <div class="form-group">
            <label for="senha">Senha</label>
            <input id="senha" type="password" [(ngModel)]="senha" name="senha"
                   placeholder="••••••" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="auth-footer">
          Não tem conta? <a routerLink="/registro">Cadastre-se</a>
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
    }
    .auth-card {
      background: #fff;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
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
  `]
})
export class LoginComponent {
  email = '';
  senha = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, senha: this.senha }).subscribe({
      next: () => {
        this.router.navigate(['/produtos']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Erro ao fazer login');
      }
    });
  }
}
