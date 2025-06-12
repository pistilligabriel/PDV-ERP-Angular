import { registerLocaleData } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import localePt from '@angular/common/locales/pt'
import { ProdutoService } from 'src/app/services/cadastro/produto/produto.service';
import { Produto } from '../cadastro/produto/produto.component';
import { Clientes } from '../cadastro/cliente/page/cliente.component';
import { ClienteService } from 'src/app/services/cadastro/cliente/cliente.service';

registerLocaleData(localePt, 'pt-BR');


@Component({
  selector: 'app-venda',
  templateUrl: './venda.component.html',
  styleUrls: ['./venda.component.scss']
})
export class VendaComponent implements OnInit{
  produtos: Produto[] = [];
  codigoProduto!: bigint | null;
  quantidade: number = 1;
  clientes!: Clientes[];
  cliente: Clientes | null = null;
  total: number = 0;
  mostrarDialogProdutos: boolean = false;
  mostrarDesconto: boolean = false;
  descontoAplicado: number = 0; // NOVA VARIÁVEL
  mostrarDialogClientes: boolean = false;

  constructor(
    private produtoService: ProdutoService,
    private clienteService: ClienteService,
  ){}


  ngOnInit(): void {
    this.clienteService.getAllCliente().subscribe(c => {
      this.clientes = c;
    })

    this.produtoService.getAllProdutos().subscribe(produtos => {
      this.catalogo = produtos;
    })

    this.total = this.produtos.reduce((sum, p) => sum + (p.precoVenda * p.quantidade), 0);
  }

  // Simulação de banco de produtos
  catalogo: Produto[] = [];

  valorDesconto!: number | null;

  adicionarProduto() {
    if (!this.codigoProduto) return;

    const produtoCatalogo = this.catalogo?.find(p => p.codigo === this.codigoProduto);

    if (produtoCatalogo) {
      const existente = this.produtos.find(p => p.codigo === produtoCatalogo.codigo);
      if (existente) {
        existente.quantidade += this.quantidade;
      } else {
        const novoProduto = { ...produtoCatalogo, quantidade: this.quantidade };
        this.produtos.push(novoProduto);
      }
      this.codigoProduto = null;
      this.quantidade = 1;
      this.atualizarTotal();
    } else {
      alert('Produto não encontrado!');
    }
  }

  aplicarDescontoItem(codigo: bigint, percentual: number) {
    const produto = this.produtos.find(p => p.codigo === codigo);
    if (produto) {
      const desconto = produto.precoVenda * (percentual / 100);
      produto.precoVenda = produto.precoVenda - desconto;
      produto.desconto = percentual;
      this.atualizarTotal();
    }
  }

  removerProduto(codigo: bigint) {
    this.produtos = this.produtos.filter(p => p.codigo !== codigo);
    this.atualizarTotal();
  }

  atualizarTotal() {
  const totalBruto = this.produtos.reduce((sum, p) => sum + (p.precoVenda * p.quantidade), 0);
  this.total = totalBruto - this.descontoAplicado;
}

  finalizarVenda() {
    if (this.produtos.length === 0) {
      alert('Nenhum produto na venda!');
      return;
    }

    // Aqui você pode integrar com o backend para registrar a venda
    console.log('Venda finalizada:', this.produtos, this.cliente);
    alert('Venda finalizada com sucesso!');
    this.produtos = [];
    this.total = 0;
  }

  buscarProduto(){
    this.mostrarDialogProdutos = true; // ABRE O DIALOG
  }

  selecionarProduto(produto: Produto) {
    this.codigoProduto = produto.codigo;
    this.mostrarDialogProdutos = false;
  }

  mostrarTelaDesconto(){
  this.mostrarDesconto = true;
}

  aplicarDesconto(){
  // Aplica o desconto ao confirmar
  const totalBruto = this.produtos.reduce((sum, p) => sum + (p.precoVenda * p.quantidade), 0);
  this.descontoAplicado = this.valorDesconto ? totalBruto * (this.valorDesconto / 100) : 0;
  this.mostrarDesconto = false;
  this.atualizarTotal();
}

mostrarTelaCliente(){
  this.mostrarDialogClientes = true;
}

 selecionarCliente(cliente: Clientes) {
  this.cliente = cliente;
}
}
