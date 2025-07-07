import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import * as FileSaver from 'file-saver';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableRowUnSelectEvent } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { Column } from 'src/app/models/interfaces/Column';
import { ExportColumn } from 'src/app/models/interfaces/ExportColumn';
import { UnidadeMedidaService } from 'src/app/services/cadastro/unidade-medida/unidade-medida.service';

export interface UnidadeMedida {
  codigo: bigint;
  descricao: string;
  simbolo: string;
  status: string;
  empresa: number;
  versao: string;
}

export interface AdicionarUnidade {
  descricao: string;
  simbolo: string;
}

export interface EditarUnidade {
  codigo: bigint;
  descricao: string;
  simbolo: string;
}


export interface CarregarEditarUnidadeMedida {
  codigo: bigint;
  descricao: string;
  simbolo: string;
  status: string;
  empresa: number;
  versao: string;
}


@Component({
  selector: 'app-unidade-medida',
  templateUrl: './unidade-medida.component.html',
  styleUrls: []
})
export class UnidadeMedidaComponent implements OnInit, OnDestroy {



  private destroy$: Subject<void> = new Subject<void>();

  @ViewChild('tabelaUnidadeMedida') tabelaUnidadeMedida: Table | undefined;

  /**
   * Flag para exibir ou ocultar o formulário de grupo de usuário.
   */
  public showForm = false;

  /**
   * Lista de dados de grupos de usuários.
   */
  public unidadeDatas: Array<UnidadeMedida> = [];

  public unidadeSelected!: UnidadeMedida[] | null;

  public unidade!: UnidadeMedida;

  /**
   * Valor digitado no campo de pesquisa
   */
  valorPesquisa!: string;

  /**
   * Limpa a seleção da tabela.
   *
   * @public
   * @memberof UnidadeMedida
   * @param {Table} table - Instância da tabela a ser limpa.
   * @returns {void}
   */
  clear(table: Table) {
    this.valorPesquisa = ""
    table.clear();
  }

  atualizarTabela() {
    this.valorPesquisa = "";
    this.listarUnidades();
  }

  cols!: Column[];

  colunasSelecionadas!: Column[];

  exportColumns!: ExportColumn[];


  constructor(
    private unidadeService: UnidadeMedidaService,
    private messageService: MessageService,
    private router: Router,
    private formBuilderUser: FormBuilder,
    private confirmationService: ConfirmationService,
  ) { }


  /**
   * Formulário reativo para adicionar/editar grupos de usuários.
   */
  public unidadeForm = this.formBuilderUser.group({
    codigo: [{value: null as bigint | null, disabled: true}],
    descricao: ['', [Validators.required]],
    simbolo: ['', [Validators.required]],
    status: [{ value: '', disabled: true }],
    empresa: [{ value: 1, disabled: true }],
    versao: [{ value: null as Date | string | null, disabled: true }],
  });


  /**
   * Inicialização do componente. Chama a função para listar os grupos de usuários.
   */
  ngOnInit(): void {
    this.listarUnidades();

    this.cols = [
      { field: 'status', header: 'Status' },
      { field: 'descricao', header: 'Descrição' },
      { field: 'simbolo', header: 'Símbolo' },
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
    this.tabelaUnidadeMedida!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }


  /**
   * Exporta os dados da tabela para um arquivo PDF.
   */
  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.unidadeDatas);
        doc.save('unidades_de_medida.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.unidadeDatas);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'unidades_de_medida');
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
    this.unidade = event.data;
    console.log('Unidade selecionada:', this.unidade);
  }

  /**
   * Verifica se o formulário está em modo de edição.
   *
   * @returns {boolean} - Verdadeiro se estiver em modo de edição, falso caso contrário.
   */
  isEdicao(): boolean {
    const codigo = this.unidadeForm.value.codigo as bigint;
    this.carregarInformacaoUnidade(codigo)
    return !!this.unidadeForm.value.codigo;
  }

  /**
 * Manipulador de eventos para o botão de adição de grupo.
 * Exibe o formulário de adição de grupo.
 */
  onAddButtonClick() {
    this.showForm = true;
    this.unidadeForm.setValue({
      codigo: null,
      descricao: null,
      simbolo: null,
      status: 'ATIVO',
      empresa: 1,
      versao:null,
    });
  }



  onEditButtonClick(unidade: CarregarEditarUnidadeMedida): void {
    if (unidade.status === 'DESATIVADO') {
      this.confirmationService.confirm({
        header: 'Aviso',
        message: 'Não é permitido editar uma unidade desativada.',
      });
    } else {
      this.showForm = true;
      this.unidadeForm.patchValue({
        codigo: unidade.codigo,
        descricao: unidade.descricao,
        simbolo: unidade.simbolo,
        status: unidade.status,
        empresa: unidade.empresa,
        versao: unidade.versao, // TODO: Ajustar formato da data
      });
      console.log(unidade)

      console.log(this.isEdicao());
    }
  }


  onDisableButtonClick(unidade: UnidadeMedida): void {
    this.unidadeForm.patchValue({
      codigo: unidade.codigo,
    });
    this.desativarUnidade(unidade.codigo as bigint);
  }


  disableSelectedUnidades() {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir os usuarios selecionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.unidadeDatas = this.unidadeDatas.filter((val) => !this.unidadeSelected?.includes(val));
        this.unidadeSelected = null;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuarios Excluídos', life: 3000 });
      }
    });
  }


  /**
 * Cancela o formulário de adição/editação e limpa os campos.
 */
  cancelarFormulario() {
    this.unidadeForm.reset();
    this.showForm = false;
    this.listarUnidades();
  }


  carregarInformacaoUnidade(codigo: bigint) {
    this.unidadeService.getUnidadeEspecifica(codigo).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.unidadeForm.patchValue({
            codigo: response.codigo,
            descricao: response.descricao,
            simbolo: response.simbolo,
            status: response.status,
            empresa: response.empresa,
            versao: response.versao,
          });
        }
      }, error: (error) => {
        console.log(error);
      }
    })
  }

  /**
   * Lista os grupos de usuários chamando o serviço correspondente.
   */
  listarUnidades() {
    this.unidadeService
      .getAllUnidades()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.unidadeDatas = response;
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar o usuários',
            detail: error.message,
            life: 3000,
          });
          this.router.navigate(['/home']);
        },
      });
  }



  /**
   * Adiciona ou edita um grupo de usuário com base no estado do formulário.
   */
  adicionarOuEditarUnidade(): void {
    if (this.isEdicao()) {
      this.editarUnidade();
    } else {
      this.adicionarUnidade();
    }
  }


  /**
   * Adiciona um novo usuário.
   */
  adicionarUnidade(): void {
    if (this.unidadeForm.valid) {
      const requestCreateUnidade: AdicionarUnidade = {
        descricao: this.unidadeForm.value.descricao as string,
        simbolo: this.unidadeForm.value.simbolo as string,
      };

      this.unidadeService
        .addUnidade(requestCreateUnidade)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Sucesso ao cadastrar unidade:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Usuário criado com sucesso!',
              life: 3000,
            });

            // Resetar o formulário
            this.unidadeForm.reset();

            // Voltar para a tabela
            this.showForm = false;

            // Recarregar os dados da tabela
            this.listarUnidades();
          },
          error: (error) => {
            console.error('Erro ao cadastrar unidade:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar unidade!',
              life: 3000,
            });
          },
        });
    } else {
      console.log('Formulário inválido. Preencha todos os campos.', this.unidadeForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }


  /**
   * Edita um usuário existente.
   */
  editarUnidade(): void {
    const codigo = this.unidadeForm.value.codigo as bigint;
    this.carregarInformacaoUnidade(codigo)

    if (this.unidadeForm?.valid) {
      const requestEditUnidade: EditarUnidade = {
        codigo: this.unidadeForm.value.codigo as bigint,
        descricao: this.unidadeForm.value.descricao as string,
        simbolo: this.unidadeForm.value.simbolo as string
      };
      console.log(requestEditUnidade)
      // Chamar o serviço para editar o usuário
      this.unidadeService
        .editUnidade(requestEditUnidade)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao editar unidade:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Unidade editado com sucesso!',
                life: 3000,
              });
              this.unidadeForm.reset();
              this.showForm = false;
              this.listarUnidades();
            }
          },
          error: (error) => {
            console.error('Erro ao editar unidade:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar unidade!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn('Formulário inválido. Preencha todos os campos.', this.unidadeForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }


  /**
   * Desativa uma unidade com o código fornecido.
   *
   * @param {bigint} codigo - Código do usuário a ser desativado.
   * @returns {void}
   */
  desativarUnidade(codigo: bigint): void {
    console.log('Alterar o Status!:', codigo);
    if (codigo) {
      this.unidadeService
        .desativarUnidade(codigo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao Alterar o Status!:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Status Alterado com sucesso!',
                life: 3000,
              });
              this.listarUnidades();
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
      console.warn('Nenhuma unidade selecionada.');
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione uma unidade!',
        life: 3000,
      });
    }
  }


  /**
   * Manipulador de eventos OnDestroy. Completa o subject de destruição.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

