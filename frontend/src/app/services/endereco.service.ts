import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EnderecoRequest, EnderecoResponse } from '../models/endereco.model';

@Injectable({ providedIn: 'root' })
export class EnderecoService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(usuarioId: string) {
    return this.http.get<EnderecoResponse[]>(`${this.api}/usuarios/${usuarioId}/enderecos`);
  }

  criar(usuarioId: string, req: EnderecoRequest) {
    return this.http.post<EnderecoResponse>(`${this.api}/usuarios/${usuarioId}/enderecos`, req);
  }
}
