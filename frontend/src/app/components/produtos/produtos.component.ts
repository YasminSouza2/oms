import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProdutoService } from '../../services/produto.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { ProdutoResponse, ProdutoRequest } from '../../models/produto.model';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Produtos</h1>
        @if (auth.isAdminOrFunc()) {
          <button class="btn btn-primary" (click)="toggleForm()">
            {{ showForm() ? 'Cancelar' : '+ Novo Produto' }}
          </button>
        }
      </div>

      @if (showForm()) {
        <div class="card form-card">
          <h3>{{ editId() ? 'Editar Produto' : 'Novo Produto' }}</h3>
          <form (ngSubmit)="salvar()">
            <div class="form-row">
              <div class="form-group">
                <label>Nome</label>
                <input [(ngModel)]="form.nome" name="nome" required>
              </div>
              <div class="form-group">
                <label>SKU</label>
                <input [(ngModel)]="form.sku" name="sku" placeholder="Opcional">
              </div>
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <textarea [(ngModel)]="form.descricao" name="descricao" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Preço (R$)</label>
                <input type="number" [(ngModel)]="form.preco" name="preco" min="0.01" step="0.01" required>
              </div>
              <div class="form-group">
                <label>Estoque</label>
                <input type="number" [(ngModel)]="form.estoque" name="estoque" min="0" required>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Salvar</button>
              <button type="button" class="btn btn-outline" (click)="toggleForm()">Cancelar</button>
            </div>
          </form>
        </div>
      }

      @if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      }

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>SKU</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Cadastro</th>
              <th>Carrinho</th>
              @if (auth.isAdminOrFunc()) {
                <th>Ações</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (p of produtos(); track p.id) {
              <tr>
                <td>
                  <div class="product-name">{{ p.nome }}</div>
                  @if (p.descricao) {
                    <div class="product-desc">{{ p.descricao }}</div>
                  }
                </td>
                <td><code>{{ p.sku || '—' }}</code></td>
                <td>{{ p.preco | currency:'BRL' }}</td>
                <td>
                  <span class="badge" [class.low]="p.estoque < 5">{{ p.estoque }}</span>
                </td>
                <td>{{ p.dataCadastro | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div class="pedir-group">
                    <input type="number"
                           [min]="1" [max]="p.estoque"
                           [value]="getQuantidade(p.id)"
                           (input)="setQuantidade(p.id, $event)"
                           class="qty-input"
                           [disabled]="p.estoque === 0">
                    <button class="btn btn-sm btn-cart"
                            (click)="adicionarAoCarrinho(p)"
                            [disabled]="p.estoque === 0"
                            [class.added]="adicionado() === p.id">
                      {{ adicionado() === p.id ? 'Adicionado!' : 'Adicionar ao Carrinho' }}
                    </button>
                  </div>
                </td>
                @if (auth.isAdminOrFunc()) {
                  <td class="actions">
                    <button class="btn btn-sm btn-outline" (click)="editar(p)">Editar</button>
                    <button class="btn btn-sm btn-danger" (click)="excluir(p.id)">Excluir</button>
                  </td>
                }
              </tr>
            } @empty {
              <tr><td [attr.colspan]="auth.isAdminOrFunc() ? 7 : 6" class="empty">Nenhum produto cadastrado</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .product-name { font-weight: 600; color: #1e293b; }
    .product-desc { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
    .badge {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #dcfce7;
      color: #166534;
    }
    .badge.low { background: #fef2f2; color: #991b1b; }
    code {
      background: #f1f5f9;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-size: 0.8rem;
      color: #475569;
    }
    .pedir-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .qty-input {
      width: 56px;
      padding: 0.3rem 0.4rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.85rem;
      text-align: center;
    }
    .qty-input:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cart {
      background: #4f46e5;
      color: #fff;
      transition: all 0.2s ease;
    }
    .btn-cart:hover:not(:disabled) { background: #4338ca; }
    .btn-cart:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cart.added {
      background: #16a34a;
      pointer-events: none;
    }
    .form-card { margin-bottom: 1.5rem; }
    .form-card h3 { margin: 0 0 1rem; color: #1e293b; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
  `]
})
export class ProdutosComponent implements OnInit {
  produtos = signal<ProdutoResponse[]>([]);
  showForm = signal(false);
  editId = signal<string | null>(null);
  error = signal('');
  adicionado = signal<string | null>(null);
  form: ProdutoRequest = { nome: '', preco: 0, estoque: 0 };
  quantidades: Record<string, number> = {};

  constructor(
    public auth: AuthService,
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private router: Router
  ) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.produtoService.listar().subscribe({
      next: (data) => this.produtos.set(data),
      error: (err) => this.error.set(err.error?.message ?? 'Erro ao carregar produtos')
    });
  }

  toggleForm() {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  resetForm() {
    this.form = { nome: '', preco: 0, estoque: 0 };
    this.editId.set(null);
  }

  editar(p: ProdutoResponse) {
    this.form = { nome: p.nome, descricao: p.descricao, preco: p.preco, estoque: p.estoque, sku: p.sku };
    this.editId.set(p.id);
    this.showForm.set(true);
  }

  salvar() {
    const id = this.editId();
    const obs = id
      ? this.produtoService.atualizar(id, this.form)
      : this.produtoService.criar(this.form);

    obs.subscribe({
      next: () => {
        this.carregar();
        this.toggleForm();
      },
      error: (err) => this.error.set(err.error?.message ?? 'Erro ao salvar produto')
    });
  }

  getQuantidade(produtoId: string): number {
    return this.quantidades[produtoId] ?? 1;
  }

  setQuantidade(produtoId: string, event: Event) {
    const val = +(event.target as HTMLInputElement).value;
    this.quantidades[produtoId] = Math.max(1, val);
  }

  adicionarAoCarrinho(p: ProdutoResponse) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const quantidade = this.getQuantidade(p.id);
    this.carrinhoService.adicionar(p, quantidade);
    this.adicionado.set(p.id);
    setTimeout(() => this.adicionado.set(null), 1500);
  }

  excluir(id: string) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.produtoService.excluir(id).subscribe({
        next: () => this.carregar(),
        error: (err) => this.error.set(err.error?.message ?? 'Erro ao excluir produto')
      });
    }
  }
}
