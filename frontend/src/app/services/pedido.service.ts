import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PedidoRequest, PedidoResponse, PedidoStatusRequest } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly api = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<PedidoResponse[]>(this.api);
  }

  listarPorUsuario(usuarioId: string) {
    return this.http.get<PedidoResponse[]>(`${this.api}/usuario/${usuarioId}`);
  }

  buscar(id: string) {
    return this.http.get<PedidoResponse>(`${this.api}/${id}`);
  }

  criar(req: PedidoRequest) {
    return this.http.post<PedidoResponse>(this.api, req);
  }

  atualizarStatus(id: string, req: PedidoStatusRequest) {
    return this.http.patch<PedidoResponse>(`${this.api}/${id}/status`, req);
  }

  finalizarPagamento(id: string) {
    return this.http.post<PedidoResponse>(`${this.api}/${id}/finalizar-pagamento`, {});
  }
}
