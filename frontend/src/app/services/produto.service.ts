import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ProdutoRequest, ProdutoResponse } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly api = `${environment.apiUrl}/produtos`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<ProdutoResponse[]>(this.api);
  }

  buscar(id: string) {
    return this.http.get<ProdutoResponse>(`${this.api}/${id}`);
  }

  criar(req: ProdutoRequest) {
    return this.http.post<ProdutoResponse>(this.api, req);
  }

  atualizar(id: string, req: Partial<ProdutoRequest>) {
    return this.http.put<ProdutoResponse>(`${this.api}/${id}`, req);
  }

  excluir(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
