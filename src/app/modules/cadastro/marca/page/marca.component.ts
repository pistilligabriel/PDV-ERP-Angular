import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import * as FileSaver from 'file-saver';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { Status } from 'src/app/models/enums/Status.enum';
import { Column } from 'src/app/models/interfaces/Column';
import { ExportColumn } from 'src/app/models/interfaces/ExportColumn';
import { MarcaService } from 'src/app/services/cadastro/marca/marca.service';

export interface Marca {
  codigo: bigint;
  descricao:string;
  status: string;
  empresa: number;
  versao: Date;
}

export interface AdicionarMarca {
  descricao:string;
}

export interface EditarMarca {
  codigo: bigint;
  descricao:string;
}


export interface CarregarEditarMarca {
  codigo: bigint;
  descricao:string;
  status: string;
  empresa: number;
  versao: Date;
}


@Component({
  selector: 'app-marca',
  templateUrl: './marca.component.html',
  styleUrls: []
})
export class MarcaComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();

  @ViewChild('tabelaMarca') tabelaMarca: Table | undefined;

  /**
   * Flag para exibir ou ocultar o formulário de grupo de usuário.
   */
  public showForm = false;

  /**
   * Lista de dados de grupos de usuários.
   */
  public marcaDatas: Array<Marca> = [];

  public marcaSelected!: Marca[] | null;

  /**
   * Valor digitado no campo de pesquisa
   */
  valorPesquisa!: string;

  /**
   * Limpa a seleção da tabela.
   *
   * @public
   * @memberof Marca
   * @param {Table} table - Instância da tabela a ser limpa.
   * @returns {void}
   */
  clear(table: Table) {
    this.valorPesquisa = ""
    table.clear();
  }

  atualizarTabela() {
    this.valorPesquisa = "";
    this.listarMarcas();
}

  cols!: Column[];

  colunasSelecionadas!: Column[];

  exportColumns!: ExportColumn[];


  constructor(
    private marcaService: MarcaService,
    private messageService: MessageService,
    private router: Router,
    private formBuilderUser: FormBuilder,
    private confirmationService: ConfirmationService,
  ) {}


  /**
   * Formulário reativo para adicionar/editar grupos de usuários.
   */
  public marcaForm = this.formBuilderUser.group({
    codigo: [{value:null as bigint | null, disabled: true}],
    descricao: ['', [Validators.required]],
    status: [{ value: '', disabled: true }],
    empresa: [{ value: 1, disabled: true }],
    versao: [{ value: null as Date | string | null, disabled: true }],
  });


  /**
   * Inicialização do componente. Chama a função para listar os grupos de usuários.
   */
  ngOnInit(): void {
    this.listarMarcas();

    this.cols = [
      { field: 'status', header: 'Status' },
      {field:'descricao', header: 'Descrição'},
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
    this.tabelaMarca!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }


  /**
   * Exporta os dados da tabela para um arquivo PDF.
   */
  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.marcaDatas);
        doc.save('marcas.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.marcaDatas);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'marcas');
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
    this.marcaSelected = event.data;
  }

  /**
   * Verifica se o formulário está em modo de edição.
   *
   * @returns {boolean} - Verdadeiro se estiver em modo de edição, falso caso contrário.
   */
  isEdicao(): boolean {
    const codigo = this.marcaForm.value.codigo as bigint;
    this.carregarInformacaoMarca(codigo)
    return !!this.marcaForm.value.codigo;
  }

  visualizarMarca(marca:Marca){
    this.showForm = true;
    this.marcaService.getMarcaEspecifica(marca.codigo).subscribe({
      next: (m) => {
        this.marcaForm.patchValue({
          codigo:m.codigo,
          descricao:m.descricao,
          empresa:1,
          status:m.status,
          versao:m.versao
        })
      }
    })
    this.marcaForm.get('descricao')?.disable()
  }

    /**
   * Manipulador de eventos para o botão de adição de grupo.
   * Exibe o formulário de adição de grupo.
   */
  onAddButtonClick() {
    this.showForm = true;
    this.marcaForm.setValue({
      codigo: null,
      descricao: null,
      status: 'ATIVO',
      empresa: 1,
      versao: null,
    });
  }



  onEditButtonClick(marca: CarregarEditarMarca): void {
    //TODO: receber versao backend e formatar para exibição
    if (marca.status === 'DESATIVADO') {
      this.confirmationService.confirm({
        header: 'Aviso',
        message: 'Não é permitido editar uma marca desativada.',
      });
    } else {
      this.showForm = true;
      this.marcaForm.patchValue({
        codigo: marca.codigo,
        descricao: marca.descricao,
        status: marca.status,
        empresa: marca.empresa,
        versao: marca.versao,
      }); 

      console.log(this.isEdicao());
    }
  }


  onDisableButtonClick(marca: Marca): void {
    this.marcaForm.patchValue({
      codigo: marca.codigo,
    });
    this.desativarMarca(marca.codigo as bigint);
  }


  // disableSelectedMarcas() {
  //   this.confirmationService.confirm({
  //     message: 'Tem certeza de que deseja excluir os usuarios selecionados?',
  //     header: 'Confirmar',
  //     icon: 'pi pi-exclamation-triangle',
  //     accept: () => {
  //       this.marcaDatas = this.marcaDatas.filter((val) => !this.marcaSelected?.includes(val));
  //       this.marcaSelected = null;
  //       this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Marcas Excluídas', life: 3000 });
  //     }
  //   });
  // }


    /**
   * Cancela o formulário de adição/editação e limpa os campos.
   */
  cancelarFormulario() {
    this.marcaForm.reset();
    this.showForm = false;
    this.listarMarcas();
  }


  carregarInformacaoMarca(codigo: bigint){
    this.marcaService.getMarcaEspecifica(codigo).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.marcaForm.patchValue({
            codigo: response.codigo,
            descricao:response.descricao,
            status: response.status,
            empresa: response.empresa,
            versao: response.versao,
          });
        }}, error: (error) => {
          console.log(error);
      }})
  }

  /**
   * Lista os grupos de usuários chamando o serviço correspondente.
   */
  listarMarcas() {
    this.marcaService
      .getAllMarca()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.marcaDatas = response;
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar marcas',
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
  adicionarOuEditarMarca(): void {
    if (this.isEdicao()) {
      this.editarMarca();
    } else {
      this.adicionarMarca();
    }
  }


  /**
   * Adiciona um novo usuário.
   */
  adicionarMarca(): void {
    if (this.marcaForm.valid) {
      const requestCreateMarca: AdicionarMarca = {
        descricao: this.marcaForm.value.descricao as string,
      };

      this.marcaService
        .addMarca(requestCreateMarca)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Sucesso ao cadastrar marca:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Marca criada com sucesso!',
              life: 3000,
            });

            // Resetar o formulário
            this.marcaForm.reset();

            // Voltar para a tabela
            this.showForm = false;

            // Recarregar os dados da tabela
            this.listarMarcas();
          },
          error: (error) => {
            console.error('Erro ao cadastrar marca:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar marca!',
              life: 3000,
            });
          },
        });
    } else {
      console.log('Formulário inválido. Preencha todos os campos.', this.marcaForm);
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
  editarMarca(): void {
    const codigo = this.marcaForm.value.codigo as bigint;
    this.carregarInformacaoMarca(codigo)
    console.log('metodo editar')
    if (this.marcaForm?.valid) {
      const requestEditMarca: EditarMarca = {
        codigo: this.marcaForm.value.codigo as bigint,
        descricao: this.marcaForm.value.descricao as string,
      };
      console.log(requestEditMarca)
      // Chamar o serviço para editar o usuário
      this.marcaService
        .editMarca(requestEditMarca)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao editar marca:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Marca editada com sucesso!',
                life: 3000,
              });
              this.marcaForm.reset();
              this.showForm = false;
              this.listarMarcas();
            }
          },
          error: (error) => {
            console.error('Erro ao editar marca:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar marca!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn('Formulário inválido. Preencha todos os campos.', this.marcaForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }


  /**
   * Desativa uma marca com o código fornecido.
   *
   * @param {bigint} codigo - Código da marca a ser desativado.
   * @returns {void}
   */
  desativarMarca(codigo: bigint): void {
    console.log('Alterar o Status!:', codigo);
    if (codigo) {
      this.marcaService
        .desativarMarca(codigo)
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
              this.listarMarcas();
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
      console.warn('Nenhuma marca selecionada.');
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione uma marca!',
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

