import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import * as FileSaver from 'file-saver';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject } from 'rxjs';
import { Column } from 'src/app/models/interfaces/Column';
import { ExportColumn } from 'src/app/models/interfaces/ExportColumn';

export interface Venda {
  CODIGO: bigint,
  status: string,
  versao: Date
}

@Component({
  selector: 'app-venda',
  templateUrl: './venda.component.html',
  styleUrls: []
})

export class VendaComponent implements OnInit {

  private readonly destroy$: Subject<void> = new Subject<void>();


  @ViewChild('tabelaVenda') tabelaVenda: Table | undefined;

  /**
   * Flag para exibir ou ocultar o formulário de produto.
   */
  public showForm = false;

  /**
   * Lista de dados de produtos.
   */
  public vendaDatas: Array<Venda> = [];

  public vendaSelecionada!: Venda [] | null;

 



  unidadeMedidaSelecionada = null

  constructor(
    private messageService: MessageService,
    private router: Router,
    private formBuilderProduto: FormBuilder,
    private confirmationService: ConfirmationService
  ) { }

  valorPesquisa!: string;

  /**
   * Limpa a seleção da tabela.
   *
   * @public
   * @memberof ProdutoComponent
   * @param {Table} table - Instância da tabela a ser limpa.
   * @returns {void}
   */
  clear(table: Table) {
    this.valorPesquisa = ""
    table.clear();
  }

  cols!: Column[];

  colunasSelecionadas!: Column[];

  exportColumns!: ExportColumn[];

  /**
   * Formulário reativo para adicionar/editar grupos de usuários.
   */
  public produtoForm = this.formBuilderProduto.group({
    CODIGO: [null as bigint | null],
    descricao: ['', [Validators.required]],
    observacao: [''],
    fabricante: [''],
    codigoOriginal:[''],
    codigoBarras:[''],
    unidadeVenda: [ null as string |  null , [Validators.required]],
    precoCusto:[null as number | null, [Validators.required]],
    estoque: [null as number | null, [Validators.required]],
    precoVenda: [null as number | null, [Validators.required]],
    margemLucro:[{ value: 0, disabled: true }],
    status: [{ value: '', disabled: true }],
    empresa: [{ value: 1, disabled: true }],
    dataCadastro:[{ value: null as Date | string | null, disabled: true }],
    versao: [{ value: null as Date | string | null, disabled: true }],
  });

  consolelog(){
    console.log(this.produtoForm.value)

  }


  ngOnInit() {
    
    this.cols = [
      { field: 'status', header: 'Status' },
      { field: 'descricao', header: 'Descrição'},
      { field: 'fabricante', header: 'Marca' },
      { field: 'unidadeVenda', header: 'Unidade Venda' },
      { field: 'estoque', header: 'Quantidade Estoque' },
  ];
  this.colunasSelecionadas = this.cols;
  }

   /**
   * Aplica um filtro global na tabela de grupos de usuários.
   *
   * @param $event O evento que acionou a função.
   * @param stringVal O valor da string para filtrar.
   */
   applyFilterGlobal($event: any, stringVal: any) {
    this.tabelaVenda!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  /**
   * Exporta os dados da tabela para um arquivo PDF.
   */
  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.vendaDatas);
        doc.save('vendas.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.vendaDatas);
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
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
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

  /**
   * Verifica se o formulário está em modo de edição.
   *
   * @returns {boolean} - Verdadeiro se estiver em modo de edição, falso caso contrário.
   */
  isEdicao(): boolean {
    console.log('Editar venda:', this.produtoForm.value.CODIGO)
    return !!this.produtoForm.value.CODIGO;
  }

   /**
   * Manipulador de eventos para o botão de adição de grupo.
   * Exibe o formulário de adição de grupo.
   */
   onAddButtonClick() {
    this.showForm = true;
    this.produtoForm.setValue({
      CODIGO: null,
      descricao: null,
      observacao: null,
      codigoOriginal: null,
      codigoBarras: null,
      fabricante: null,
      unidadeVenda: null,
      precoCusto: null,
      estoque: null,
      precoVenda: null,
      margemLucro:null,
      status: null,
      empresa: 1,
      versao: null,
      dataCadastro: null,
    });

  }

  verificarCusto(){
    console.log(this.produtoForm.value.precoCusto)
  }

  




  onEditButtonClick(venda: Venda): void {
    const formattedDate = format(new Date(venda.versao), 'dd/MM/yyyy HH:mm:ss');


    if (venda.status === 'DESATIVADO') {
      this.confirmationService.confirm({
        header: 'Aviso',
        message: 'Não é permitido editar um usuário desativado.',
      });
    } else {
      this.showForm = true;
    }
  }


  onDisableButtonClick(venda: Venda): void {
    this.produtoForm.patchValue({
      CODIGO: venda.CODIGO,
    });
    //this.desativarProduto(produto.CODIGO as bigint);
  }


  




}
