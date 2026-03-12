import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/" class="logo">OMS</a>
      </div>
      <div class="navbar-links">
        <a routerLink="/produtos" routerLinkActive="active">Produtos</a>
        @if (auth.isLoggedIn()) {
          <a routerLink="/carrinho" routerLinkActive="active" class="cart-link">
            Carrinho
            @if (carrinho.totalItens() > 0) {
              <span class="cart-badge">{{ carrinho.totalItens() }}</span>
            }
          </a>
          <a routerLink="/pedidos" routerLinkActive="active">Pedidos</a>
          @if (auth.isAdmin()) {
            <a routerLink="/usuarios" routerLinkActive="active">Usuários</a>
          }
        }
      </div>
      <div class="navbar-actions">
        @if (auth.isLoggedIn()) {
          <span class="user-info">{{ auth.user()?.nome }}</span>
          <span class="badge">{{ auth.user()?.role }}</span>
          <button class="btn btn-outline" (click)="auth.logout()">Sair</button>
        } @else {
          <a routerLink="/login" class="btn btn-primary">Entrar</a>
          <a routerLink="/registro" class="btn btn-outline">Cadastrar</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 60px;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #4f46e5;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .navbar-links {
      display: flex;
      gap: 1.5rem;
    }
    .navbar-links a {
      text-decoration: none;
      color: #64748b;
      font-weight: 500;
      padding: 0.25rem 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .navbar-links a:hover, .navbar-links a.active {
      color: #4f46e5;
      border-bottom-color: #4f46e5;
    }
    .cart-link {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .cart-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9999px;
      background: #4f46e5;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      line-height: 1;
    }
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-info {
      color: #334155;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background: #e0e7ff;
      color: #4338ca;
      font-weight: 600;
      text-transform: uppercase;
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, public carrinho: CarrinhoService) {}
}
