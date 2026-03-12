import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UsuarioResponse } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly api = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<UsuarioResponse[]>(this.api);
  }

  buscar(id: string) {
    return this.http.get<UsuarioResponse>(`${this.api}/${id}`);
  }

  excluir(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
