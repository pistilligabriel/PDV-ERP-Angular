// src/app/services/venda-context.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VendaContextService {
  private tipoVendaSelecionado: 'NOVO' | 'RECAPAGEM' | 'VENDA' | 'CONDICIONAL' | null = null;

  setTipoVenda(tipo: 'NOVO' | 'RECAPAGEM' | 'VENDA' | 'CONDICIONAL') {
    this.tipoVendaSelecionado = tipo;
  }

  getTipoVenda(): 'NOVO' | 'RECAPAGEM' | 'VENDA' | 'CONDICIONAL' | null {
    return this.tipoVendaSelecionado;
  }

  clearTipoVenda() {
    this.tipoVendaSelecionado = null;
  }
}