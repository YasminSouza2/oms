import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegistroRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private readonly currentUser = signal<LoginResponse | null>(this.loadUser());

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly role = computed(() => this.currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
  readonly isAdminOrFunc = computed(() => this.role() === 'ADMIN' || this.role() === 'FUNCIONARIO');

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.api}/login`, req).pipe(
      tap(res => this.saveUser(res))
    );
  }

  registro(req: RegistroRequest) {
    return this.http.post<LoginResponse>(`${this.api}/registro`, req).pipe(
      tap(res => this.saveUser(res))
    );
  }

  logout() {
    localStorage.removeItem('oms_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  private saveUser(res: LoginResponse) {
    localStorage.setItem('oms_user', JSON.stringify(res));
    this.currentUser.set(res);
  }

  private loadUser(): LoginResponse | null {
    const data = localStorage.getItem('oms_user');
    return data ? JSON.parse(data) : null;
  }
}
