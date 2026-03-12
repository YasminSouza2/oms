import { Injectable, signal, computed } from '@angular/core';
import { ProdutoResponse } from '../models/produto.model';

export interface CartItem {
  produto: ProdutoResponse;
  quantidade: number;
}

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly STORAGE_KEY = 'oms_carrinho';
  private readonly items = signal<CartItem[]>(this.load());

  readonly cartItems = this.items.asReadonly();
  readonly totalItens = computed(() => this.items().reduce((sum, i) => sum + i.quantidade, 0));
  readonly totalPreco = computed(() => this.items().reduce((sum, i) => sum + i.produto.preco * i.quantidade, 0));

  adicionar(produto: ProdutoResponse, quantidade: number) {
    const current = this.items();
    const existing = current.find(i => i.produto.id === produto.id);

    if (existing) {
      this.items.set(current.map(i =>
        i.produto.id === produto.id
          ? { ...i, quantidade: i.quantidade + quantidade }
          : i
      ));
    } else {
      this.items.set([...current, { produto, quantidade }]);
    }
    this.save();
  }

  remover(produtoId: string) {
    this.items.set(this.items().filter(i => i.produto.id !== produtoId));
    this.save();
  }

  atualizarQuantidade(produtoId: string, quantidade: number) {
    if (quantidade < 1) return;
    this.items.set(this.items().map(i =>
      i.produto.id === produtoId ? { ...i, quantidade } : i
    ));
    this.save();
  }

  limpar() {
    this.items.set([]);
    this.save();
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
  }

  private load(): CartItem[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}
