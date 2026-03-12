import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { PedidoService } from '../../services/pedido.service';
import { EnderecoService } from '../../services/endereco.service';
import { EnderecoResponse } from '../../models/endereco.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Finalizar Pedido</h1>
      </div>

      @if (carrinho.cartItems().length === 0) {
        <div class="empty-state card">
          <p>Seu carrinho está vazio. Adicione produtos antes de finalizar.</p>
          <button class="btn btn-primary" (click)="router.navigate(['/produtos'])">Ver Produtos</button>
        </div>
      } @else {
        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        @if (sucesso()) {
          <div class="modal-overlay" (click)="irParaPedidos()">
            <div class="modal-card" (click)="$event.stopPropagation()">
              <div class="modal-icon">✅</div>
              <h3>Pedido Criado com Sucesso!</h3>
              <p>Seu pedido foi registrado e está aguardando pagamento.</p>
              <button class="btn btn-primary" (click)="irParaPedidos()">Ver Meus Pedidos</button>
            </div>
          </div>
        }

        <div class="checkout-grid">
          <div class="checkout-form">
            <div class="card">
              <h3>Endereços</h3>

              @if (enderecos().length === 0) {
                <div class="alert alert-error">
                  Você precisa cadastrar um endereço primeiro. Acesse o Swagger em
                  <code>POST /api/usuarios/&#123;id&#125;/enderecos</code> para adicionar.
                </div>
              }

              <div class="form-group">
                <label>Endereço de Cobrança</label>
                <select [(ngModel)]="enderecoCobrancaId" name="endCobranca">
                  <option value="">Selecione...</option>
                  @for (e of enderecos(); track e.id) {
                    <option [value]="e.id">{{ e.logradouro }}, {{ e.numero }} - {{ e.bairro }} - {{ e.cidade }}/{{ e.estado }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label>Endereço de Entrega</label>
                <div class="same-address">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="mesmoEndereco" name="mesmoEnd" (change)="onMesmoEnderecoChange()">
                    Mesmo endereço de cobrança
                  </label>
                </div>
                <select [(ngModel)]="enderecoEntregaId" name="endEntrega" [disabled]="mesmoEndereco">
                  <option value="">Selecione...</option>
                  @for (e of enderecos(); track e.id) {
                    <option [value]="e.id">{{ e.logradouro }}, {{ e.numero }} - {{ e.bairro }} - {{ e.cidade }}/{{ e.estado }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="card" style="margin-top: 1rem;">
              <h3>Itens do Pedido</h3>
              @for (item of carrinho.cartItems(); track item.produto.id) {
                <div class="checkout-item">
                  <div class="checkout-item-info">
                    <span class="checkout-item-name">{{ item.produto.nome }}</span>
                    <span class="checkout-item-qty">× {{ item.quantidade }}</span>
                  </div>
                  <span class="checkout-item-price">{{ item.produto.preco * item.quantidade | currency:'BRL' }}</span>
                </div>
              }
            </div>
          </div>

          <div class="checkout-summary card">
            <h3>Resumo do Pedido</h3>
            <div class="summary-row">
              <span>Itens ({{ carrinho.totalItens() }})</span>
              <span>{{ carrinho.totalPreco() | currency:'BRL' }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ carrinho.totalPreco() | currency:'BRL' }}</span>
            </div>
            <button class="btn btn-primary btn-block"
                    (click)="confirmarPedido()"
                    [disabled]="!enderecoCobrancaId || (!mesmoEndereco && !enderecoEntregaId) || enviando()">
              {{ enviando() ? 'Processando...' : 'Confirmar Pedido' }}
            </button>
            <button class="btn btn-outline btn-block" (click)="router.navigate(['/carrinho'])" style="margin-top:0.5rem">
              Voltar ao Carrinho
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .checkout-form .card h3,
    .checkout-summary h3 {
      margin: 0 0 1rem;
      color: #1e293b;
      font-size: 1.1rem;
    }
    .same-address { margin-bottom: 0.5rem; }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #475569;
      cursor: pointer;
    }
    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #4f46e5;
    }
    .checkout-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .checkout-item:last-child { border-bottom: none; }
    .checkout-item-info { display: flex; align-items: center; gap: 0.5rem; }
    .checkout-item-name { font-weight: 500; color: #1e293b; }
    .checkout-item-qty { font-size: 0.85rem; color: #64748b; }
    .checkout-item-price { font-weight: 600; color: #1e293b; }
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
    .checkout-summary .btn { margin-top: 1rem; }
    code {
      background: #f1f5f9;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
    }
    .empty-state p { color: #64748b; margin-bottom: 1rem; }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-card {
      background: #fff;
      border-radius: 16px;
      padding: 2rem;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }
    .modal-icon { font-size: 3rem; margin-bottom: 0.5rem; }
    .modal-card h3 { margin: 0 0 0.75rem; color: #1e293b; font-size: 1.25rem; }
    .modal-card p { color: #475569; line-height: 1.6; margin: 0 0 1rem; }
    @media (max-width: 768px) {
      .checkout-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  enderecos = signal<EnderecoResponse[]>([]);
  error = signal('');
  sucesso = signal(false);
  enviando = signal(false);

  enderecoCobrancaId = '';
  enderecoEntregaId = '';
  mesmoEndereco = false;

  constructor(
    public carrinho: CarrinhoService,
    private auth: AuthService,
    private pedidoService: PedidoService,
    private enderecoService: EnderecoService,
    public router: Router
  ) {}

  ngOnInit() {
    const userId = this.auth.user()?.id;
    if (userId) {
      this.enderecoService.listar(userId).subscribe({
        next: (data) => this.enderecos.set(data),
        error: () => this.error.set('Erro ao carregar endereços')
      });
    }
  }

  onMesmoEnderecoChange() {
    if (this.mesmoEndereco) {
      this.enderecoEntregaId = this.enderecoCobrancaId;
    } else {
      this.enderecoEntregaId = '';
    }
  }

  confirmarPedido() {
    this.error.set('');
    this.enviando.set(true);

    const entregaId = this.mesmoEndereco ? this.enderecoCobrancaId : this.enderecoEntregaId;

    const itens = this.carrinho.cartItems().map(item => ({
      produtoId: item.produto.id,
      quantidade: item.quantidade
    }));

    this.pedidoService.criar({
      enderecoCobrancaId: this.enderecoCobrancaId,
      enderecoEntregaId: entregaId,
      itens
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.sucesso.set(true);
        this.carrinho.limpar();
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(err.error?.message ?? 'Erro ao criar pedido');
      }
    });
  }

  irParaPedidos() {
    this.router.navigate(['/pedidos']);
  }
}
