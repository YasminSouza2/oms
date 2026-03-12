import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { PedidoResponse } from '../../models/pedido.model';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Pedidos</h1>
      </div>

      @if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      }

      @if (showPagamentoMsg()) {
        <div class="modal-overlay" (click)="fecharMsgPagamento()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-icon">💳</div>
            <h3>Pagamento Simulado</h3>
            <p>Nenhum método de pagamento configurado. Este projeto utiliza pagamento simulado para demonstração.</p>
            <p class="modal-status-info">O status do pedido foi atualizado para <strong>PAGAMENTO_SIMULADO</strong>.</p>
            <button class="btn btn-primary" (click)="fecharMsgPagamento()">Entendi</button>
          </div>
        </div>
      }

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              @if (auth.isAdminOrFunc()) {
                <th>Cliente</th>
              }
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th>Data</th>
              <th>Pagamento</th>
              @if (auth.isAdminOrFunc()) {
                <th>Ações</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (p of pedidos(); track p.id) {
              <tr>
                <td><code>{{ p.id.substring(0, 8) }}...</code></td>
                @if (auth.isAdminOrFunc()) {
                  <td>{{ p.usuarioNome }}</td>
                }
                <td>
                  @for (item of p.itens; track item.id) {
                    <div class="item-line">{{ item.produtoNome }} × {{ item.quantidade }}</div>
                  }
                </td>
                <td class="total">{{ p.total | currency:'BRL' }}</td>
                <td><span class="status-badge" [attr.data-status]="p.status">{{ formatStatus(p.status) }}</span></td>
                <td>{{ p.dataPedido | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  @if (p.status === 'AGUARDANDO_PAGAMENTO') {
                    <button class="btn btn-sm btn-pay" (click)="finalizarPagamento(p.id)">
                      Finalizar Pagamento
                    </button>
                  } @else if (p.status === 'PAGAMENTO_SIMULADO') {
                    <span class="pay-done">Simulado</span>
                  } @else {
                    <span class="pay-na">—</span>
                  }
                </td>
                @if (auth.isAdminOrFunc()) {
                  <td>
                    <select (change)="atualizarStatus(p.id, $event)" class="status-select">
                      <option value="">Alterar...</option>
                      @for (s of statusOptions; track s) {
                        <option [value]="s" [disabled]="s === p.status">{{ s }}</option>
                      }
                    </select>
                  </td>
                }
              </tr>
            } @empty {
              <tr><td [attr.colspan]="auth.isAdminOrFunc() ? 8 : 6" class="empty">Nenhum pedido encontrado</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .item-line { font-size: 0.85rem; color: #475569; }
    .total { font-weight: 700; color: #1e293b; }
    code { background: #f1f5f9; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.8rem; }
    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-badge[data-status="AGUARDANDO_PAGAMENTO"] { background: #fff7ed; color: #c2410c; }
    .status-badge[data-status="PAGAMENTO_SIMULADO"] { background: #f0fdf4; color: #15803d; }
    .status-badge[data-status="PENDENTE"] { background: #fef3c7; color: #92400e; }
    .status-badge[data-status="CONFIRMADO"] { background: #dbeafe; color: #1e40af; }
    .status-badge[data-status="ENVIADO"] { background: #e0e7ff; color: #4338ca; }
    .status-badge[data-status="ENTREGUE"] { background: #dcfce7; color: #166534; }
    .status-badge[data-status="CANCELADO"] { background: #fef2f2; color: #991b1b; }
    .status-select {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-pay {
      background: #f59e0b;
      color: #fff;
      font-weight: 600;
    }
    .btn-pay:hover { background: #d97706; }
    .pay-done {
      font-size: 0.8rem;
      font-weight: 600;
      color: #15803d;
    }
    .pay-na {
      color: #94a3b8;
    }
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
    .modal-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .modal-card h3 {
      margin: 0 0 0.75rem;
      color: #1e293b;
      font-size: 1.25rem;
    }
    .modal-card p {
      color: #475569;
      line-height: 1.6;
      margin: 0 0 0.75rem;
    }
    .modal-status-info {
      font-size: 0.85rem;
      color: #15803d;
      background: #f0fdf4;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem !important;
    }
    .modal-card .btn { margin-top: 0.5rem; }
  `]
})
export class PedidosComponent implements OnInit {
  pedidos = signal<PedidoResponse[]>([]);
  showPagamentoMsg = signal(false);
  error = signal('');
  statusOptions = ['AGUARDANDO_PAGAMENTO', 'PAGAMENTO_SIMULADO', 'PENDENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

  constructor(
    public auth: AuthService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    const user = this.auth.user();
    if (!user) return;

    if (this.auth.isAdminOrFunc()) {
      this.pedidoService.listar().subscribe({
        next: (data) => this.pedidos.set(data),
        error: (err) => this.error.set(err.error?.message ?? 'Erro ao carregar pedidos')
      });
    } else {
      this.pedidoService.listarPorUsuario(user.id).subscribe({
        next: (data) => this.pedidos.set(data),
        error: (err) => this.error.set(err.error?.message ?? 'Erro ao carregar pedidos')
      });
    }
  }

  atualizarStatus(id: string, event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    if (!status) return;
    this.pedidoService.atualizarStatus(id, { status: status as any }).subscribe({
      next: () => this.carregar(),
      error: (err) => this.error.set(err.error?.message ?? 'Erro ao atualizar status')
    });
  }

  finalizarPagamento(id: string) {
    this.error.set('');
    this.pedidoService.finalizarPagamento(id).subscribe({
      next: () => {
        this.showPagamentoMsg.set(true);
        this.carregar();
      },
      error: (err) => this.error.set(err.error?.message ?? 'Erro ao finalizar pagamento')
    });
  }

  fecharMsgPagamento() {
    this.showPagamentoMsg.set(false);
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }
}
