import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Carrinho</h1>
      </div>

      @if (carrinho.cartItems().length === 0) {
        <div class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h3>Seu carrinho está vazio</h3>
          <p>Adicione produtos para começar a comprar.</p>
          <button class="btn btn-primary" (click)="irParaProdutos()">Ver Produtos</button>
        </div>
      } @else {
        <div class="cart-content">
          <div class="cart-items">
            @for (item of carrinho.cartItems(); track item.produto.id) {
              <div class="cart-item card">
                <div class="item-info">
                  <div class="item-name">{{ item.produto.nome }}</div>
                  @if (item.produto.descricao) {
                    <div class="item-desc">{{ item.produto.descricao }}</div>
                  }
                  <div class="item-price">{{ item.produto.preco | currency:'BRL' }} cada</div>
                </div>
                <div class="item-controls">
                  <div class="qty-control">
                    <button class="btn-qty" (click)="diminuir(item.produto.id, item.quantidade)" [disabled]="item.quantidade <= 1">−</button>
                    <span class="qty-value">{{ item.quantidade }}</span>
                    <button class="btn-qty" (click)="aumentar(item.produto.id, item.quantidade)" [disabled]="item.quantidade >= item.produto.estoque">+</button>
                  </div>
                  <div class="item-subtotal">{{ item.produto.preco * item.quantidade | currency:'BRL' }}</div>
                  <button class="btn btn-sm btn-danger" (click)="remover(item.produto.id)">Remover</button>
                </div>
              </div>
            }
          </div>

          <div class="cart-summary card">
            <h3>Resumo</h3>
            <div class="summary-row">
              <span>Itens</span>
              <span>{{ carrinho.totalItens() }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ carrinho.totalPreco() | currency:'BRL' }}</span>
            </div>
            <button class="btn btn-primary btn-block" (click)="finalizarPedido()">
              Finalizar Pedido
            </button>
            <button class="btn btn-outline btn-block" (click)="limpar()">
              Limpar Carrinho
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
    .empty-cart h3 { color: #1e293b; margin-bottom: 0.5rem; }
    .empty-cart p { color: #94a3b8; margin-bottom: 1.5rem; }
    .cart-content {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .cart-items { display: flex; flex-direction: column; gap: 0.75rem; }
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .item-name { font-weight: 600; color: #1e293b; }
    .item-desc { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
    .item-price { font-size: 0.85rem; color: #64748b; margin-top: 4px; }
    .item-controls {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-shrink: 0;
    }
    .qty-control {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .btn-qty {
      width: 32px;
      height: 32px;
      border: none;
      background: #f8fafc;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      color: #475569;
      transition: background 0.15s;
    }
    .btn-qty:hover:not(:disabled) { background: #e2e8f0; }
    .btn-qty:disabled { opacity: 0.4; cursor: not-allowed; }
    .qty-value {
      width: 36px;
      text-align: center;
      font-weight: 600;
      font-size: 0.9rem;
      color: #1e293b;
    }
    .item-subtotal {
      font-weight: 700;
      color: #1e293b;
      min-width: 90px;
      text-align: right;
    }
    .cart-summary {
      position: sticky;
      top: 80px;
    }
    .cart-summary h3 {
      margin: 0 0 1rem;
      color: #1e293b;
      font-size: 1.1rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.9rem;
      color: #475569;
    }
    .summary-row.total {
      border-top: 1px solid #e2e8f0;
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
    }
    .cart-summary .btn { margin-top: 0.75rem; }
    .cart-summary .btn-outline { margin-top: 0.5rem; }
    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }
      .cart-item {
        flex-direction: column;
        align-items: flex-start;
      }
      .item-controls { width: 100%; justify-content: space-between; }
    }
  `]
})
export class CarrinhoComponent {
  constructor(public carrinho: CarrinhoService, private router: Router) {}

  aumentar(produtoId: string, qtdAtual: number) {
    this.carrinho.atualizarQuantidade(produtoId, qtdAtual + 1);
  }

  diminuir(produtoId: string, qtdAtual: number) {
    this.carrinho.atualizarQuantidade(produtoId, qtdAtual - 1);
  }

  remover(produtoId: string) {
    this.carrinho.remover(produtoId);
  }

  limpar() {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
      this.carrinho.limpar();
    }
  }

  finalizarPedido() {
    this.router.navigate(['/checkout']);
  }

  irParaProdutos() {
    this.router.navigate(['/produtos']);
  }
}
