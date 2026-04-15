import { style } from '@angular/animations';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
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
import { format } from 'date-fns';
import { TituloReceber } from 'src/app/models/interfaces/financeiro/TituloReceber.interface';
import { ResponseTituloReceber } from 'src/app/models/interfaces/financeiro/ResponseTituloReceber.interface';
import { NovoTituloReceber } from 'src/app/models/interfaces/financeiro/NovoTituloReceber.interface';
import { Clientes } from '../cadastro/cliente/page/cliente.component';
import { EditarTituloReceber } from 'src/app/models/interfaces/financeiro/EditarTituloReceber.interface';
import { Status } from 'src/app/models/enums/Status.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { TituloReceberService } from 'src/app/services/financeiro/titulo-receber.service';
import { DropDownOptionsClientes } from 'src/app/models/interfaces/financeiro/DropDownOptionsClientes.interface';
import { ClienteService } from 'src/app/services/cadastro/cliente/cliente.service';

registerLocaleData(localePt, 'pt-BR');

@Component({
  selector: 'app-modulo-financeiro',
  templateUrl: './modulo-financeiro.component.html',
  styleUrls: ['./modulo-financeiro.component.css'],
})
export class ModuloFinanceiroComponent implements OnInit, OnDestroy {
  items: MenuItem[] | undefined;

  // Informações do usuário logado
  usuario!: Usuario | null;

  private destroy$: Subject<void> = new Subject<void>();

  @ViewChild('tabelaFinanceiro') tabelaFinanceiro: Table | undefined;

  @ViewChild('cm') cm!: ContextMenu;

  /**
   * Flag para exibir ou ocultar o formulário de grupo de usuário.
   */
  public showForm = false;

  /**
   * Lista de dados de financeiro.
   */
  public financeiroDatas: ResponseTituloReceber[] = [];

  /**
   * Financeiro selecionada
   */
  public financeiroSelecionado!: ResponseTituloReceber | null;

  /**
   * Valor digitado no campo pesquisa
   */
  valorPesquisa!: string;

  financeiroAtual!: ResponseTituloReceber | null;

  clientes !: DropDownOptionsClientes[];

  clienteSelecionado!: Clientes

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
    this.listarTitulos();
  }

  cols!: Column[];

  colunasSelecionadas!: Column[];

  exportColumns!: ExportColumn[];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formBuilderTitulo: FormBuilder,
    private usuarioContext: UsuarioContextService,
    private cookie: CookieService,
    private router: Router,
    private clienteService:ClienteService,
    private tituloService:TituloReceberService
  ) {}

  public tituloForm = this.formBuilderTitulo.group({
    codigo: [{ value: null as number | null, disabled: true }],
    descricao: ['', [Validators.required]],
    cliente: [null as Clientes | string | null, [Validators.required]],
    observacao: [''],
    // Implementação futura Desconto
    // valorBruto: [null as number | null, [Validators.required]],
    // desconto: [null as number | null],
    valorTotal: [null as number | null, [Validators.required]],
    parcelas:[null as number | null,[Validators.required]],
    status: [{ value: null as Status | string | null, disabled: true }],
    empresa: [{ value: 1, disabled: true }],
    dataCriacao: [{ value: null as Date | string | null, disabled: true }],
    dataVencimento: [{ value: null as Date | string | null, disabled: true }],
    dataPagamento: [{ value: null as Date | string | null, disabled: true }],
    versao: [{ value: null as Date | string | null, disabled: true }],
  });

  ngOnInit() {
    this.listarTitulos();

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

    this.clienteService.getAllCliente().pipe().subscribe({
      next: (c) => {
        this.clientes = c
        .filter(c => c.status === Status.ATIVO)
        .map(c => ({
          label: `${c.nomeCompleto} - ${c.documento}`,
          value: c.codigo
        }))
      }
    })
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

    this.colunasSelecionadas = this.cols;

    this.items = [
      {
        label: 'Cancelar Venda',
        icon: 'pi pi-block',
        command: () => {
          if(this.financeiroAtual){
            this.cancelarTitulo(this.financeiroAtual.codigo);
          }
        },
      },
    ];
  }

  /**
   * Aplica um filtro global na tabela de vendas.
   *
   * @param $event O evento que acionou a função.
   * @param stringVal O valor da string para filtrar.
   */
  applyFilterGlobal($event: any, stringVal: any) {
    this.tabelaFinanceiro!.filterGlobal(
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
        const financeiros: any[] = [];
        this.financeiroDatas.forEach((f) => {
          f.codigo;
        });

        // Define as colunas para o PDF
        const columns = [
          { header: 'Código Título', dataKey: 'CodigoTitulo' },
          { header: 'Cliente', dataKey: 'Cliente' },
          { header: 'Data Emissão', dataKey: 'DataEmissao' },
          { header: 'Valor Bruto', dataKey: 'ValorBruto' },
          { header: 'Valor Desconto', dataKey: 'Valor Desconto' },
          { header: 'Valor Total', dataKey: 'ValorTotal' },
          { header: 'Forma Pagamento', datakey: 'FormaPagamento' },
          { header: 'Parcelas', datakey: 'Parcelas' },
        ];

        (doc as any).autoTable({
          columns: columns,
          body: financeiros,
          styles: { fontSize: 8 },
        });

        doc.save('titulos_receber.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const financeiros: any[] = [];
      this.financeiroDatas.forEach((f) => {
        f.codigo;
      });

      const worksheet = xlsx.utils.json_to_sheet(financeiros);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'financeiro');
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
      case 'CANCELADO':
        return 'danger';
      default:
        return '';
    }
  }

  getRowClass(financeiro: ResponseTituloReceber): string {
    switch (financeiro.status) {
      case 'CANCELADO':
        return 'row-cancelado';
      case 'ATIVO':
        return 'row-ativo';
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
    this.financeiroSelecionado = event.data;
  }

  cancelarFormulario() {
    this.showForm = false;
    this.listarTitulos();
  }

  /**
   * Verifica se o formulário está em modo de edição.
   *
   * @returns {boolean} - Verdadeiro se estiver em modo de edição, falso caso contrário.
   */
  isEdicao(): boolean {
    console.log('Editar titulo:', this.tituloForm.value.codigo);
    return !!this.tituloForm.value.codigo;
  }

  /**
   * Adiciona ou edita um produto com base no estado do formulário.
   */
  adicionarOuEditarTitulo(): void {
    if (this.isEdicao()) {
      this.editarTitulo();
    } else {
      this.criarTituloManual();
    }
  }

  /**
   * Manipulador de eventos para o botão de adição de grupo.
   * Exibe o formulário de adição de grupo.
   */
  onAddButtonClick() {
    const formattedDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
    this.showForm = true;
    this.tituloForm.setValue({
      codigo: null,
      descricao: null,
      cliente: null,
      observacao: null,
      valorTotal:null,
      parcelas:null,
      status: 'ATIVO',
      empresa: 1,
      versao: null,
      dataCriacao: formattedDate,
      dataVencimento: null,
      dataPagamento: null,
    });
  }

  onEditButtonClick(titulo: TituloReceber): void {
    if (titulo.status === 'CANCELADO') {
      this.confirmationService.confirm({
        header: 'Aviso',
        message: 'Não é permitido editar um título cancelado.',
      });
    } else {
      this.showForm = true;
      this.tituloService
        .getTitulo(titulo.codigo)
        .subscribe((data) => {
          this.tituloForm.patchValue({
            codigo: data.codigo,
            descricao: data.descricao,
            cliente: data.cliente?.nomeCompleto,
            observacao: data.observacao,
            status: data.status,
            empresa: data.empresa,
            versao: data.versao,
            dataCriacao: data.dataCriacao,
            dataVencimento: data.dataVencimento,
            dataPagamento: data.dataPagamento,
          });
        });
    }
  }

  /**
   * Lista registros financeiros.
   */
  listarTitulos() {
    /* error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar as vendas',
            detail: error.message,
            life: 3000,
          });
          this.router.navigate(['/home']);
        },
      });*/
  }

  /**
   * Cria novo título manual
   */
  criarTituloManual(): void {
    // if (this.tituloForm.valid) {
    //   const requestCreateTitulo: NovoTituloReceber = {
    //     descricao: this.tituloForm.value.descricao as string,
    //     cliente: this.tituloForm.value.cliente as Clientes | string,
    //     observacao: this.tituloForm.value.observacao as string,
    //     empresa: 1,
    //     dataVencimento: this.tituloForm.value.dataVencimento as string,
    //     valorTotal: this.tituloForm.value.valorTotal as number,
    //     parcelas: this.tituloForm.value.parcelas as number
    //   };

    //   console.log(requestCreateTitulo);

    //   this.tituloService
    //     .novoTitulo(requestCreateTitulo)
    //     .pipe(takeUntil(this.destroy$))
    //     .subscribe({
    //       next: (response) => {
    //         console.log('Sucesso ao cadastrar título:', response);
    //         this.messageService.add({
    //           severity: 'success',
    //           summary: 'Sucesso',
    //           detail: 'Título criado com sucesso!',
    //           life: 3000,
    //         });

    //         // Resetar o formulário
    //         this.tituloForm.reset();

    //         // Voltar para a tabela
    //         this.showForm = false;

    //         // Recarregar os dados da tabela
    //         this.listarTitulos();
    //       },
    //       error: (error) => {
    //         console.error('Erro ao cadastrar título:', error);
    //         this.messageService.add({
    //           severity: 'error',
    //           summary: 'Erro',
    //           detail: 'Erro ao criar título!',
    //           life: 3000,
    //         });
    //       },
    //     });
    // } else {
    //   console.log(
    //     'Formulário inválido. Preencha todos os campos.',
    //     this.tituloForm,
    //   );
    //   this.messageService.add({
    //     severity: 'warn',
    //     summary: 'Atenção',
    //     detail: 'Preencha todos os campos!',
    //     life: 3000,
    //   });
    // }
    console.log(this.tituloForm.value.cliente)
  }

  /**
   * Edita um título existente.
   */
  editarTitulo(): void {
    if (this.tituloForm?.valid) {
      const requestEditTitulo: EditarTituloReceber = {
        codigo: this.tituloForm.value.codigo as number,
        descricao: this.tituloForm.value.descricao as string,
        cliente: this.tituloForm.value.cliente as Clientes | string,
        observacao: this.tituloForm.value.observacao as string,
        status: this.tituloForm.value.status as Status,
        dataVencimento: this.tituloForm.value.descricao as string,
        empresa: 1,
        valorTotal: 0,
        parcelas: 0
      };

      console.log(requestEditTitulo);
      // Chamar o serviço para editar o produto
      this.tituloService
        .editarTitulo(requestEditTitulo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao editar título:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Título editado com sucesso!',
                life: 3000,
              });
              this.tituloForm.reset();
              this.showForm = false;
              this.listarTitulos();
            }
          },
          error: (error) => {
            console.error('Erro ao editar título:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar título!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn(
        'Formulário inválido. Preencha todos os campos.',
        this.tituloForm,
      );
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }

  /**
   * Cancela título com o código fornecido.
   *
   * @param {bigint} codigo - Código do título a ser cancelado.
   * @returns {void}
   */
  cancelarTitulo(codigo: number): void {
    console.log('Cancelar Titulo !:', codigo);
    if (codigo) {
      this.tituloService
        .cancelarTitulo(codigo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao cancelar o título!:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Título cancelado com sucesso!',
                life: 3000,
              });
              this.listarTitulos();
            }
          },
          error: (error) => {
            console.error('Erro ao Alterar o Status!:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao Alterar o Status!!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn('Nenhum título selecionado.');
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um usuário!',
        life: 3000,
      });
    }
  }

  visualizarTitulo(titulo: TituloReceber) {
    this.showForm = true;
    this.tituloService.getTitulo(titulo.codigo).subscribe({
      next: (t) => {
        this.tituloForm.patchValue({
          codigo: t.codigo,
          descricao: t.descricao,
          observacao: t.observacao,
          status: t.status,
          empresa: t.empresa,
          versao: t.versao,
          dataCriacao: t.dataCriacao,
          dataVencimento: t.dataVencimento,
          dataPagamento: t.dataPagamento,
        });
        console.log(t);
      },
    });
    this.tituloForm.get('descricao')?.disable();
    this.tituloForm.get('cliente')?.disable();
    this.tituloForm.get('observacao')?.disable();
    this.tituloForm.get('status')?.disable();
    this.tituloForm.get('empresa')?.disable();
    this.tituloForm.get('versao')?.disable();
    this.tituloForm.get('dataCriacao')?.disable();
    this.tituloForm.get('dataVencimento')?.disable();
    this.tituloForm.get('dataPagamento')?.disable();
  }

  onContextMenu(event: any, venda: any) {
    this.financeiroAtual = venda;
    this.cm.show(event);
  }

  onHide() {
    this.financeiroAtual = null;
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
