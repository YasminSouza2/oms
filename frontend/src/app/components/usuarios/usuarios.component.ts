import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioResponse } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Usuários</h1>
      </div>

      @if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      }

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>CPF</th>
              <th>Role</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (u of usuarios(); track u.id) {
              <tr>
                <td class="name">{{ u.nome }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.telefone || '—' }}</td>
                <td>{{ u.cpf || '—' }}</td>
                <td><span class="role-badge" [attr.data-role]="u.role">{{ u.role }}</span></td>
                <td>{{ u.dataCadastro | date:'dd/MM/yyyy' }}</td>
                <td>
                  <button class="btn btn-sm btn-danger" (click)="excluir(u.id, u.nome)">Excluir</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="empty">Nenhum usuário encontrado</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .name { font-weight: 600; color: #1e293b; }
    .role-badge {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .role-badge[data-role="ADMIN"] { background: #fef3c7; color: #92400e; }
    .role-badge[data-role="FUNCIONARIO"] { background: #dbeafe; color: #1e40af; }
    .role-badge[data-role="CLIENTE"] { background: #dcfce7; color: #166534; }
  `]
})
export class UsuariosComponent implements OnInit {
  usuarios = signal<UsuarioResponse[]>([]);
  error = signal('');

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.usuarioService.listar().subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => this.error.set(err.error?.message ?? 'Erro ao carregar usuários')
    });
  }

  excluir(id: string, nome: string) {
    if (confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
      this.usuarioService.excluir(id).subscribe({
        next: () => this.carregar(),
        error: (err) => this.error.set(err.error?.message ?? 'Erro ao excluir usuário')
      });
    }
  }
}
