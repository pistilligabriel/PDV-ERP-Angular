import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { Column } from 'src/app/models/interfaces/Column';
import { ExportColumn } from 'src/app/models/interfaces/ExportColumn';
import { VendaService } from 'src/app/services/faturamento/venda/venda.service';
import { PedidoDto } from '../venda/venda.component';
import { ResponseModuloVendaDto } from 'src/app/models/dtos/ModuloVenda/ResponseModuloVendaDto';



@Component({
  selector: 'app-modulo-vendas',
  templateUrl: './modulo-vendas.component.html',
  styleUrls: []
})
export class ModuloVendasComponent implements OnInit {

 
  private destroy$: Subject<void> = new Subject<void>();

  @ViewChild('tabelaVenda') tabelaVenda: Table | undefined;
  
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
  public vendaSelecionada!: any | null;

  /**
   * Valor digitado no campo pesquisa
   */
  valorPesquisa!: string;

  /**
   * Limpa a seleção da tabela.
   *
   * @public
   * @memberof GroupUserComponent
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

  constructor(
    private vendaService: VendaService,
    private messageService: MessageService,
    private router: Router
  ) { }



  ngOnInit() {
    this.listarVendas();

    this.cols = [
      { field: 'status', header: 'Status' },
      { field: 'dataEmissao', header: 'Data Emissão' },
      { field: 'cliente', header: 'Cliente' },
      { field: 'valorTotal', header: 'Valor Total' },
      // { field: 'lucroVenda', header: 'Lucro Venda' },
    ];

    this.colunasSelecionadas = this.cols;


  }

  /**
   * Aplica um filtro global na tabela de vendas.
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
        (doc as any).autoTable(this.exportColumns, this.vendasDatas);
        doc.save('vendas.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.vendasDatas);
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
* Manipulador de eventos para o botão de adição de grupo.
* Exibe o formulário de adição de grupo.
*/
  onAddButtonClick() {
    console.log('Adicionar venda')
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

  /**
   * Manipulador de eventos OnDestroy. Completa o subject de destruição.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
