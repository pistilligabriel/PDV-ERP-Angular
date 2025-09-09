// src/app/services/venda-context.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VendaContextService {
  private tipoVendaSelecionado: 'NOVO' | 'RECAPAGEM' | null = null;

  setTipoVenda(tipo: 'NOVO' | 'RECAPAGEM') {
    this.tipoVendaSelecionado = tipo;
  }

  getTipoVenda(): 'NOVO' | 'RECAPAGEM' | null {
    return this.tipoVendaSelecionado;
  }

  clearTipoVenda() {
    this.tipoVendaSelecionado = null;
  }
}