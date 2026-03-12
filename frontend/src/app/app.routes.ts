import { Routes } from '@angular/router';
import { authGuard, adminOrFuncGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'produtos', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'registro', loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent) },
  { path: 'produtos', loadComponent: () => import('./components/produtos/produtos.component').then(m => m.ProdutosComponent) },
  { path: 'carrinho', loadComponent: () => import('./components/carrinho/carrinho.component').then(m => m.CarrinhoComponent), canActivate: [authGuard] },
  { path: 'checkout', loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [authGuard] },
  { path: 'pedidos', loadComponent: () => import('./components/pedidos/pedidos.component').then(m => m.PedidosComponent), canActivate: [authGuard] },
  { path: 'usuarios', loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent), canActivate: [authGuard, adminOrFuncGuard] },
  { path: '**', redirectTo: 'produtos' }
];
