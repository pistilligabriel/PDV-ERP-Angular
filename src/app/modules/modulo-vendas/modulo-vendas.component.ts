import { style } from '@angular/animations';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { MenuItem, MessageService } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { ResponseModuloVendaDto } from 'src/app/models/dtos/ModuloVenda/ResponseModuloVendaDto';
import { ItemDto } from 'src/app/models/dtos/Produto/ItemDto';
import { Column } from 'src/app/models/interfaces/Column';
import { ExportColumn } from 'src/app/models/interfaces/ExportColumn';
import { VendaContextService } from 'src/app/services/faturamento/venda/venda-context.service';
import { VendaService } from 'src/app/services/faturamento/venda/venda.service';
import { Usuario } from '../cadastro/usuario/page/usuario.component';
import { UsuarioService } from 'src/app/services/cadastro/usuario/usuario.service';
import { Tipo } from 'src/app/models/enums/users/Tipo.enum';
import { CookieService } from 'ngx-cookie-service';
import { UsuarioContextService } from 'src/app/services/cadastro/usuario/usuario-context.service';
import { VendaDialogService } from 'src/app/services/faturamento/venda/VendaDialogService.service';
import { Config } from '../configuracoes/configuracoes.component';
import { TipoEmpresa } from 'src/app/models/enums/empresa/TipoEmpresa.enum';
import { ConfigService } from 'src/app/services/configuracoes/configuracoes.service';

registerLocaleData(localePt, 'pt-BR');

@Component({
  selector: 'app-modulo-vendas',
  templateUrl: './modulo-vendas.component.html',
  styleUrls: ['./modulo-vendas.component.css'],
})
export class ModuloVendasComponent implements OnInit, OnDestroy {
  items: MenuItem[] | undefined;

  // Informações do usuário logado
  usuario!: Usuario | null;

  empresa!: Config;

  TipoEmpresa = TipoEmpresa;

  private destroy$: Subject<void> = new Subject<void>();

  @ViewChild('tabelaVenda') tabelaVenda: Table | undefined;

  @ViewChild('cm') cm!: ContextMenu;

  /**
   * Flag para exibir ou ocultar o formulário de grupo de usuário.
   */
  public showForm = false;

  /**
   * Lista de dados de vendas.
   */
  public vendasDatas: ResponseModuloVendaDto[] = [];

  /**
   * Venda selecionada
   */
  public vendaSelecionada!: ResponseModuloVendaDto | null;

  /**
   * Valor digitado no campo pesquisa
   */
  valorPesquisa!: string;

  mostrarDialogProdutos: boolean = false;

  produtosSelecionados: ItemDto[] = [];

  vendaAtual: ResponseModuloVendaDto | null = null;

  mostrarDialogTipoVenda: boolean = false;

  tipo = Tipo;

  /**
   * Limpa a seleção da tabela.
   *
   * @public
   * @memberof GroupUserComponent
   * @param {Table} table - Instância da tabela a ser limpa.
   * @returns {void}
   */
  clear(table: Table) {
    this.valorPesquisa = '';
    table.clear();
  }

  atualizarTabela() {
    this.valorPesquisa = '';
    this.listarVendas();
  }

  cols!: Column[];

  colunasSelecionadas!: Column[];

  exportColumns!: ExportColumn[];

  constructor(
    private vendaService: VendaService,
    private messageService: MessageService,
    private usuarioContext: UsuarioContextService,
    private cookie: CookieService,
    private router: Router,
    private vendaContext: VendaContextService,
    private vendaDialogService: VendaDialogService,
    private configService: ConfigService,
  ) {}

  ngOnInit() {
    this.vendaDialogService.abrirDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.abrirDialogTipoVenda();
      });

    this.listarVendas();

    this.usuarioContext.getUsuario().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        console.log(this.usuario);
        this.inicializarColunas();
      },
      error: (e) => {
        console.log('Não foi possível obter o usuário logado', e);
        this.inicializarColunas();
      },
    });

    if (!this.cookie.check('token')) {
      console.log('verificação token');
      return;
    }
    
    this.configService.getConfig().pipe(takeUntil(this.destroy$)).subscribe({
      next: (config) => {
        this.empresa = config;
      },
      error: (e) => {
        console.log('Não foi possível obter a configuração da empresa', e);
      },
    });
  }

  private inicializarColunas() {
    this.cols = [
      { field: 'status', header: 'Status' },
      { field: 'dataEmissao', header: 'Data Emissão' },
      { field: 'cliente', header: 'Cliente' },
      { field: 'valorBruto', header: 'Total Bruto' },
      { field: 'desconto', header: 'Desconto' },
      { field: 'valorTotal', header: 'Valor Total' },
      { field: 'formaPagamento', header: 'Forma Pagamento' },
      { field: 'parcelas', header: 'Parcelas' },
    ];

    if (this.usuario?.tipo === this.tipo.ADMIN) {
      this.cols.push({ field: 'lucro', header: 'Lucro Por Parcela' });
      this.cols.push({ field: 'lucroTotal', header: 'Lucro Total' });
    }

    this.colunasSelecionadas = this.cols;

    this.items = [
      {
        label: 'Cancelar Venda',
        icon: 'pi pi-block',
        command: () => {
          this.cancelarVenda();
        },
      },
    ];

    this.items = [
      {
        label: 'Cancelar Venda',
        icon: 'pi pi-ban',
        command: () => {
          this.cancelarVenda();
        },
      },
    ];
  }

  cancelarVenda() {
    if (this.vendaAtual && this.vendaAtual.codigo !== undefined) {
      this.vendaService
        .cancelarVenda(this.vendaAtual.codigo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao Alterar o Status!:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Venda cancelada com sucesso!',
                life: 5000,
              });
              this.listarVendas();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Não foi possível cancelar venda!',
              life: 5000,
            });
          },
        });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nenhuma venda selecionada',
        detail: 'Selecione uma venda para cancelar.',
        life: 3000,
      });
    }
  }

  /**
   * Aplica um filtro global na tabela de vendas.
   *
   * @param $event O evento que acionou a função.
   * @param stringVal O valor da string para filtrar.
   */
  applyFilterGlobal($event: any, stringVal: any) {
    this.tabelaVenda!.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal,
    );
  }

  /**
   * Exporta os dados da tabela para um arquivo PDF.
   */
  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF.default('p', 'px', 'a4');

        // Monta os dados dos produtos de cada pedido
        const pedidos: any[] = [];
        this.vendasDatas.forEach((venda) => {
          if (venda.pedidoDto && venda.pedidoDto.produtos) {
            venda.pedidoDto.produtos.forEach((produto) => {
              pedidos.push({
                CodigoVenda: venda.codigo,
                Cliente: venda.pedidoDto.integrante.nomeCompleto,
                DataEmissao: venda.pedidoDto.dataEmissao,
                Produto: produto.descricao,
                Quantidade: produto.quantidade,
                ValorUnitario: (produto?.precoVenda ?? 0).toLocaleString(
                  'pt-BR',
                  { style: 'currency', currency: 'BRL' },
                ),
                ValorTotal: (
                  (produto?.precoVenda ?? 0) * produto.quantidade
                ).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }),
              });
            });
          }
        });

        // Define as colunas para o PDF
        const columns = [
          { header: 'Código Venda', dataKey: 'CodigoVenda' },
          { header: 'Cliente', dataKey: 'Cliente' },
          { header: 'Data Emissão', dataKey: 'DataEmissao' },
          { header: 'Produto', dataKey: 'Produto' },
          { header: 'Quantidade', dataKey: 'Quantidade' },
          { header: 'Valor Unitário', dataKey: 'ValorUnitario' },
          { header: 'Valor Total', dataKey: 'ValorTotal' },
          { header: 'Forma Pagamento', datakey: 'FormaPagamento' },
          { header: 'Parcelas', datakey: 'Parcelas' },
        ];

        (doc as any).autoTable({
          columns: columns,
          body: pedidos,
          styles: { fontSize: 8 },
        });

        doc.save('vendas_pedidos.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const pedidos: any[] = [];
      this.vendasDatas.forEach((venda) => {
        if (venda.pedidoDto && venda.pedidoDto.produtos) {
          venda.pedidoDto.produtos.forEach((produto) => {
            pedidos.push({
              'Código Venda': venda.codigo,
              Cliente: venda.pedidoDto.integrante.nomeCompleto,
              'Data Emissão': venda.pedidoDto.dataEmissao,
              Produto: produto.descricao,
              Quantidade: produto.quantidade,
              'Valor Unitário': (produto?.precoVenda ?? 0).toLocaleString(
                'pt-BR',
                { style: 'currency', currency: 'BRL' },
              ),
              'Valor Total': (
                (produto?.precoVenda ?? 0) * produto.quantidade
              ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            });
          });
        }
      });

      const worksheet = xlsx.utils.json_to_sheet(pedidos);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'vendas');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION,
    );
  }

  /**
   * Retorna a severidade com base no status fornecido.
   *
   * @param {string} status - Status a ser avaliado.
   * @returns {string} - Severidade correspondente.
   */
  getSeverity(status: string) {
    switch (status) {
      case 'ATIVO':
        return 'success';
      case 'DESATIVADO':
        return 'danger';
      default:
        return ''; // Add a default case that returns a default value
    }
  }

  getRowClass(venda: ResponseModuloVendaDto): string {
    switch (venda.pedidoDto.status) {
      case 'CANCELADO':
        return 'row-cancelado';
      case 'FINALIZADO':
        return 'row-finalizado';
      default:
        return '';
    }
  }

  /**
   * Manipulador de eventos para a seleção de uma linha na tabela.
   *
   * @param {*} event - Evento de seleção de linha.
   * @returns {void}
   */
  onRowSelect(event: any) {
    console.log('Row selected:', event.data);
    this.vendaSelecionada = event.data;
  }

  abrirDialogTipoVenda() {
    console.log('abrir dialog');
    this.mostrarDialogTipoVenda = true;
  }

  selecionarTipo(tipo: 'NOVO' | 'RECAPAGEM' | 'VENDA' | 'CONDICIONAL') {
    console.log('Adicionar venda');
    this.vendaContext.setTipoVenda(tipo);
    console.log(tipo);
    this.mostrarDialogTipoVenda = false;
    this.router.navigate(['faturamento/venda']);
  }

  cancelarFormulario() {
    this.showForm = false;
    this.listarVendas();
  }

  /**
   * Lista os grupos de usuários chamando o serviço correspondente.
   */
  listarVendas() {
    this.vendaService
      .getAllVendas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.vendasDatas = response;
            console.log('Vendas carregadas:', this.vendasDatas);
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar as vendas',
            detail: error.message,
            life: 3000,
          });
          this.router.navigate(['/home']);
        },
      });
  }

  verProdutos(venda: bigint) {
    this.vendaAtual = this.vendasDatas.find((v) => v.codigo === venda) || null;
    this.produtosSelecionados = this.vendaAtual?.pedidoDto?.produtos || [];
    this.mostrarDialogProdutos = true;
  }

  onContextMenu(event: any, venda: any) {
    this.vendaAtual = venda;
    this.cm.show(event);
  }

  onHide() {
    this.vendaAtual = null;
  }

  /**
   * Manipulador de eventos OnDestroy. Completa o subject de destruição.
   */
  ngOnDestroy(): void {
    this.usuario = null;
    this.destroy$.next();
    this.destroy$.complete();
  }
}
