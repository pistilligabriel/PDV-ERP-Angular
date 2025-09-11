import { registerLocaleData } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import localePt from '@angular/common/locales/pt'
import { ProdutoService } from 'src/app/services/cadastro/produto/produto.service';
import { Produto } from '../cadastro/produto/produto.component';
import { Clientes } from '../cadastro/cliente/page/cliente.component';
import { ClienteService } from 'src/app/services/cadastro/cliente/cliente.service';
import { FormaPagamento } from 'src/app/models/enums/venda/FormaPagamento.enum';
import { VendaService } from 'src/app/services/faturamento/venda/venda.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ItemDto } from 'src/app/models/dtos/Produto/ItemDto';
import { Status } from 'src/app/models/enums/Status.enum';
import { UsuarioService } from 'src/app/services/cadastro/usuario/usuario.service';
import { Usuario } from '../cadastro/usuario/page/usuario.component';
import { UsuarioPerfil } from 'src/app/models/interfaces/usuario/UsuarioPerfil';
import { VendaContextService } from 'src/app/services/faturamento/venda/venda-context.service';
import { Table } from 'primeng/table';
import { TipoProduto } from 'src/app/models/enums/products/TipoProduto.enum';
import { Tipo } from 'src/app/models/enums/users/Tipo.enum';


registerLocaleData(localePt, 'pt-BR');

export interface PedidoDto {
  integrante: Clientes;
  tipoVenda: 'NOVO' | 'RECAPAGEM',
  desconto: number;
  dataEmissao?: string;
  status: Status;
  formaPagamento: FormaPagamento;
  parcelas: number;
  porcentagemDesconto?: number;
  total: number;
  lucro?: number;
  custo?: number;
  totalSemDesconto?: number;
  produtos: ItemDto[];
}

export interface ProdutoVenda {
  codigo: bigint;
  descricao: string;
  tipoProduto: TipoProduto;
  observacao: string | null;
  unidadeVenda: number | null; // alterado aqui
  fabricante: number | null; // alterado aqui
  modelo: string;
  precoVenda: number;
  precoCusto: number;
  estoque: number | null;
  quantidade: number;
}


@Component({
  selector: 'app-venda',
  templateUrl: './venda.component.html',
  styleUrls: ['./venda.component.scss']
})
export class VendaComponent implements OnInit {


  @ViewChild('tabelaProdutoDialog') tabelaProdutoDialog: Table | undefined

  tipoVenda: 'NOVO' | 'RECAPAGEM' | null = null;

  produtos: ProdutoVenda[] = [];

  codigoProduto!: bigint | null;

  lucro!: number;

  quantidade: number = 1;

  clientes!: Clientes[];

  cliente: Clientes | null = null;

  total: number = 0;

  totalSemDesconto: number = 0;

  porcentagemDesconto: number = 0;

  mostrarDialogProdutos: boolean = false;

  mostrarDesconto: boolean = false;

  descontoAplicado: number = 0;

  mostrarDialogClientes: boolean = false;

  tipoFinalizacaoVenda!: FormaPagamento | null;

  mostrarDialogCartaoPrazo: boolean = false;

  parcelas!: number | null;

  mostrarDialogQuantidade: boolean = false;

  usuario!: UsuarioPerfil;

  Tipo = Tipo;

  constructor(
    private produtoService: ProdutoService,
    private usuarioService: UsuarioService,
    private clienteService: ClienteService,
    private pedidoService: VendaService,
    private messageService: MessageService,
    private router: Router,
    private vendaContext: VendaContextService
  ) { }


  ngOnInit(): void {

    this.tipoVenda = this.vendaContext.getTipoVenda();

    if (!this.tipoVenda) {
      // Redirecione ou exiba alerta, se desejar
      console.warn('Tipo da venda não selecionado.');
    }

    this.clienteService.getAllCliente().subscribe(c => {
      this.clientes = c;
    })

    this.produtoService.getAllProdutosVenda().subscribe(produtos => {
      this.catalogo = produtos;
    })

    this.total = this.produtos.reduce((sum, p) => sum + (p.precoVenda * p.quantidade), 0);

    console.log(this.catalogo)


    //   this.usuarioService.getUsuarioLogado().subscribe({
    //     next: (usuario) => {
    //       this.usuario = usuario
    //     },
    //     error: (err) => {
    //       console.log('Não foi possível obter usuario logado', err)
    //     }
    //   }
    // )
  }

  valorPesquisa!: string;

  applyFilterGlobal($event: any, stringVal: any) {
    this.tabelaProdutoDialog!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  get catalogoFiltrado(): ProdutoVenda[] {
    if (!this.tipoVenda || !this.catalogo) {
      return this.catalogo || [];
    }

    return this.catalogo.filter(produto => {
      // Ajuste a lógica de filtro conforme suas regras de negócio
      switch (this.tipoVenda) {
        case 'NOVO':
          return produto.tipoProduto === TipoProduto.NOVO;
        case 'RECAPAGEM':
          return produto.tipoProduto === TipoProduto.RECAPAGEM;
        default:
          return true;
      }
    });
  }

  // Simulação de banco de produtos
  catalogo: ProdutoVenda[] = [];

  valorDesconto!: number | null;

  adicionarProduto() {
    if (!this.codigoProduto) return;

    const produtoCatalogo = this.catalogo?.find(p => p.codigo === this.codigoProduto);

    if (produtoCatalogo) {
      const existente = this.produtos.find(p => p.descricao === produtoCatalogo.descricao);
      if (existente) {
        const novaQuantidade = existente.quantidade + this.quantidade;
        if (produtoCatalogo.estoque !== null && novaQuantidade > produtoCatalogo.estoque) {
          alert('Quantidade solicitada maior que o estoque disponível!');
          return;
        }
        existente.quantidade = novaQuantidade;
      } else {
        const produtoConvertido = this.converterProdutoParaDto(produtoCatalogo);
        if (produtoConvertido.estoque !== null && produtoConvertido.estoque < this.quantidade) {
          alert('Quantidade solicitada maior que o estoque disponível!');
          return;
        } else {
          this.produtos.push(produtoConvertido);
        }
      }
      this.codigoProduto = null;
      this.quantidade = 1;
      this.atualizarTotal();
    } else {
      alert('Produto não encontrado!');
    }
  }

  removerProduto(codigo: bigint) {
    this.produtos = this.produtos.filter(p => p.codigo !== codigo);
    this.atualizarTotal();
  }

  atualizarTotal() {
    const totalBruto = this.produtos.reduce((sum, p) => sum + (p.precoVenda * p.quantidade), 0);
    this.total = totalBruto - this.descontoAplicado;
    this.totalSemDesconto = totalBruto; //Atualiza o total sem desconto
  }

  dinheiro() {
    this.tipoFinalizacaoVenda = FormaPagamento.DINHEIRO;
    this.finalizarVenda();
  }

  pix() {
    this.tipoFinalizacaoVenda = FormaPagamento.PIX;
    this.finalizarVenda();
  }

  cartaoCreditoAVista() {
    this.tipoFinalizacaoVenda = FormaPagamento.CARTAO_CREDITO_A_VISTA,
      this.finalizarVenda();
  }


  cartaoAPrazo() {
    this.tipoFinalizacaoVenda = FormaPagamento.CARTAO_PARCELADO,
      this.mostrarDialogCartaoPrazo = false;
    setTimeout(() => {
      this.finalizarVenda();
    }, 500);
  }

  finalizarVenda() {
    if (this.produtos.length === 0) {
      alert('Nenhum produto na venda!');
      return;
    }
    if (!this.cliente) {
      alert('Selecione um cliente para finalizar a venda!');
      return;
    }

    const produtosCorrigidos: ProdutoVenda[] = this.produtos.map(produto => ({
      codigo: produto.codigo,
      descricao: produto.descricao,
      tipoProduto:produto.tipoProduto,
      observacao: produto.observacao ?? null,
      unidadeVenda: produto.unidadeVenda ?? null,
      fabricante: produto.fabricante ?? null,
      modelo: produto.modelo ?? '',
      precoVenda: produto.precoVenda ?? null,
      precoCusto: produto.precoCusto ?? null,
      estoque: produto.estoque ?? null,
      quantidade: produto.quantidade ?? 1,
    }));

    console.log('Venda finalizada:', produtosCorrigidos, this.cliente, this.tipoFinalizacaoVenda, this.parcelas);

    const pedido: PedidoDto = {
      integrante: this.cliente as Clientes,
      produtos: produtosCorrigidos,
      status: Status.FINALIZADO,
      tipoVenda: this.tipoVenda as 'NOVO' | 'RECAPAGEM',
      formaPagamento: this.tipoFinalizacaoVenda as FormaPagamento,
      porcentagemDesconto: this.porcentagemDesconto,
      parcelas: this.parcelas as number,
      desconto: this.descontoAplicado as number,
      
      total: this.total,
      totalSemDesconto: this.totalSemDesconto // Inclui o total sem desconto
    };
    this.pedidoService.criarPedido(pedido).subscribe(response => {
      console.log('Pedido criado com sucesso:', response);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Pedido criado com sucesso!'
      });
      this.router.navigate(['/faturamento/modulo-vendas']);
      this.reset();
    }, error => {
      console.error('Erro ao criar pedido:', error, pedido);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao criar pedido!'
      });
      this.reset();
    });

    alert('Venda finalizada com sucesso!');
  }

  buscarProduto() {
    this.mostrarDialogProdutos = true; // ABRE O DIALOG
  }

  selecionarProduto(produto: Produto) {
    this.codigoProduto = produto.codigo;
    this.mostrarDialogProdutos = false;
    this.mostrarDialogQuantidade = true;
  }

  quantidadeItem() {
    this.adicionarProduto();
    this.mostrarDialogQuantidade = false;
    this.quantidade = 1;
  }

  mostrarTelaDesconto() {
    this.mostrarDesconto = true;
  }


  mostrarTelaCartaoPrazo() {
    this.mostrarDialogCartaoPrazo = true;
  }


  aplicarDesconto() {
    // Aplica o desconto ao confirmar
    const totalBruto = this.produtos.reduce((sum, p) => sum + (p.precoVenda * p.quantidade), 0);
    this.descontoAplicado = this.valorDesconto ? totalBruto * (this.valorDesconto / 100) : 0;
    this.porcentagemDesconto = this.descontoAplicado / totalBruto * 100;
    this.mostrarDesconto = false;
    this.atualizarTotal();
  }

  mostrarTelaCliente() {
    this.mostrarDialogClientes = true;
  }

  selecionarCliente(cliente: Clientes) {
    this.cliente = cliente;
    console.log(cliente);
    this.mostrarDialogClientes = false;
  }

  cartaoDebito() {
    this.tipoFinalizacaoVenda = FormaPagamento.CARTAO_DEBITO,
      this.finalizarVenda();
  }

  reset() {
    this.produtos = [];
    this.total = 0;
    this.totalSemDesconto = 0; // Resetando o total sem desconto
    this.descontoAplicado = 0;
    this.cliente = null;
    this.tipoFinalizacaoVenda = null;
    this.parcelas = null;
  }

  converterProdutoParaDto(produto: any): ProdutoVenda {
    return {
      descricao: produto.descricao ?? null,
      tipoProduto:produto.tipoProduto ?? null,
      precoVenda: produto.precoVenda ?? null,
      precoCusto: produto.precoCusto ?? null,
      unidadeVenda: produto.unidadeVenda?.codigo ?? null,
      fabricante: produto.fabricante?.codigo ?? null,
      quantidade: this.quantidade,
      modelo: produto.modelo ?? null,
      codigo: produto.codigo,
      estoque: produto.estoque,
      observacao: produto.observacao
    };
  }

  cancelarVenda() {
    this.produtos = [];
    this.tipoVenda = null;
    this.total = 0;
    this.totalSemDesconto = 0; // Resetando o total sem desconto
    this.descontoAplicado = 0;
    this.cliente = null;
    this.tipoFinalizacaoVenda = null;
    this.parcelas = null;
    this.router.navigate(['/home']);
  }

  clearPesquisa() {
    this.valorPesquisa = '';
    this.tabelaProdutoDialog?.reset();
  }
}

