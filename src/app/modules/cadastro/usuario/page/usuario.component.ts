import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { Status } from 'src/app/models/enums/Status.enum';
import { Tipo } from 'src/app/models/enums/users/Tipo.enum';
import { Column } from 'src/app/models/interfaces/Column';
import { ExportColumn } from 'src/app/models/interfaces/ExportColumn';
import { AdicionarUsuario } from 'src/app/models/interfaces/usuario/AdicionarUsuario';
import { DropDownEnumOptions } from 'src/app/models/interfaces/usuario/DropDownEnumOptions';
import { EditarUsuario } from 'src/app/models/interfaces/usuario/EditarUsuario';
import { GrupoUsuarios } from 'src/app/models/interfaces/usuario/grupo/response/GrupoUsuariosResponse';
import { Usuarios } from 'src/app/models/interfaces/usuario/response/UsuariosResponse';
import { UsuarioService } from 'src/app/services/cadastro/usuario/usuario.service';

export interface Usuario {
  codigo: bigint;
  dataCadastro: string;
  nomeCompleto: string;
  tipo: Tipo;
  telefone: string;
  email: string;
  documento: string;
  login: string;
  password: string;
  status: string;
  empresa: number;
  versao: string;
}

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: []
})
export class UsuarioComponent implements OnInit, OnDestroy {


  private destroy$: Subject<void> = new Subject<void>();

  @ViewChild('tabelaUsuario') tabelaUsuario: Table | undefined;

  @ViewChild('cm') cm !: ContextMenu;

   onContextMenu(event:any, usuario:any) {
        this.usuarioAtual = usuario;
        this.cm.show(event);
    }

     onHide() {
        // this.usuarioAtual = null;
    }

  items: MenuItem[] | undefined;

  /**
   * Flag para exibir ou ocultar o formulário de grupo de usuário.
   */
  public showForm = false;

  /**
   * Lista de dados de grupos de usuários.
   */
  public userDatas: Array<Usuarios> = [];

  public userGroupDatas: Array<GrupoUsuarios> = [];

  /**
 * Grupo de usuário selecionado.
 */
  public userSelected!: Usuarios | null;

  public userGroupSelected!: GrupoUsuarios[];

  selectedGrupo?: GrupoUsuarios;

  selectedIntegrante?: GrupoUsuarios;

  /**
   * Valor digitado no campo de pesquisa
   */
  valorPesquisa!: string;

  novoTipo!: Tipo;

  public usuario!: Usuario;

  usuarioAtual!:Usuario | null;

  tiposUsuario!: DropDownEnumOptions[];

  tipoSelecionado!: Tipo;

  mostrarTelaAcaoAlterarTipo: boolean = false;

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

  atualizarTabela() {
    this.valorPesquisa = "";
    this.listarUsuarios();
  }

  cols!: Column[];

  colunasSelecionadas!: Column[];

  exportColumns!: ExportColumn[];


  constructor(
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private router: Router,
    private formBuilderUser: FormBuilder,
    private confirmationService: ConfirmationService,
  ) { }


  /**
   * Formulário reativo para adicionar/editar grupos de usuários.
   */
  public userForm = this.formBuilderUser.group({
    codigo: [{ value: null as bigint | null, disabled: true }],
    nomeCompleto: ['', [Validators.required]],
    tipo: [{ value: '', disabled: true }],
    telefone: ['', [Validators.required]],
    email: ['', [Validators.required]],
    documento: ['', [Validators.required]],
    login: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    status: [{ value: '', disabled: true }],
    empresa: [{ value: 1, disabled: true }],
    dataCadastro: [{ value: null as Date | string | null, disabled: true }],
    versao: [{ value: null as Date | string | null, disabled: true }],
  });


  /**
   * Inicialização do componente. Chama a função para listar os grupos de usuários.
   */
  ngOnInit(): void {
    this.listarUsuarios();

    this.cols = [
      { field: 'status', header: 'Status' },
      { field: 'nomeCompleto', header: 'Nome Completo' },
      { field: 'tipo', header: 'Tipo' },
      { field: 'login', header: 'Login' },
    ];

    this.colunasSelecionadas = this.cols;

    this.tiposUsuario = [
      {label: 'Administrador', value: Tipo.ADMIN},
      {label: 'Usuário', value: Tipo.USUARIO}
    ]

    this.items = [
      {
        label:'Alterar Tipo Usuário',
        icon: 'pi pi-pencil',
        command: () => {this.acaoAlterarTipo()}
      }
    ]

  }

  /**
   * Aplica um filtro global na tabela de grupos de usuários.
   *
   * @param $event O evento que acionou a função.
   * @param stringVal O valor da string para filtrar.
   */
  applyFilterGlobal($event: any, stringVal: any) {
    this.tabelaUsuario!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }


  /**
   * Exporta os dados da tabela para um arquivo PDF.
   */
  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.userDatas);
        doc.save('usuarios.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.userDatas);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'usuarios');
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
    this.usuarioAtual = event.data;
  }

  /**
   * Verifica se o formulário está em modo de edição.
   *
   * @returns {boolean} - Verdadeiro se estiver em modo de edição, falso caso contrário.
   */
  isEdicao(): boolean {
    return !!this.userForm.getRawValue().codigo;
  }

  /**
 * Manipulador de eventos para o botão de adição de grupo.
 * Exibe o formulário de adição de grupo.
 */
  onAddButtonClick() {
    this.showForm = true;
    this.userForm.setValue({
      codigo: null,
      nomeCompleto: null,
      tipo: null,
      telefone: null,
      email: null,
      documento: null,
      login: null,
      password: null,
      status: null,
      empresa: 1,
      versao: null,
      dataCadastro: null
    });
  }





  onEditButtonClick(usuario: Usuario): void {
    console.log(this.isEdicao())
    if (usuario.status === 'DESATIVADO') {
      this.confirmationService.confirm({
        header: 'Aviso',
        message: 'Não é permitido editar um usuário desativado.',
      });
    } else {
      this.showForm = true;
      this.usuarioService.getUsuarioEspecifico(usuario?.codigo).subscribe(user => {
        this.userForm.patchValue({
          codigo: user.codigo,
          nomeCompleto: user.nomeCompleto,
          tipo: user.tipo,
          telefone: user.telefone,
          email: user.email,
          documento: user.documento,
          login: user.login,
          password: user.password,
          status: user.status,
          empresa: 1,
          versao: user.versao,
          dataCadastro: user.dataCadastro,
        });
        console.log(usuario.codigo)
      })

      this.userForm.get('password')?.setValidators(Validators.minLength(4));
      this.userForm.get('password')?.updateValueAndValidity();
      console.log(this.isEdicao());
    }
  }


  onDisableButtonClick(usuario: Usuarios): void {
    this.userForm.patchValue({
      codigo: usuario.codigo,
    });
    this.desativarUsuario(usuario.codigo as bigint);
  }


  


  /**
 * Cancela o formulário de adição/editação e limpa os campos.
 */
  cancelarFormulario() {
    this.userForm.reset();
    this.showForm = false;
    this.listarUsuarios();
  }

  /**
   * Lista os grupos de usuários chamando o serviço correspondente.
   */
  listarUsuarios() {
    this.usuarioService
      .getAllUsuarios()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.userDatas = response;
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
        },
      });
  }



  /**
   * Adiciona ou edita um grupo de usuário com base no estado do formulário.
   */
  adicionarOuEditarUsuario(): void {
    if (this.isEdicao()) {
      this.editarUsuario();
    } else {
      this.adicionarUsuario();
    }
  }


  /**
   * Adiciona um novo usuário.
   */
  adicionarUsuario(): void {
    if (this.userForm.valid) {
      const requestCreateUser: AdicionarUsuario = {
        nomeCompleto: this.userForm.value.nomeCompleto as string,
        telefone: this.userForm.value.telefone as string,
        email: this.userForm.value.email as string,
        documento: this.userForm.value.documento as string,
        login: this.userForm.value.login as string,
        password: this.userForm.value.password as string,
        empresa: 1,
      };

      this.usuarioService
        .addUsuario(requestCreateUser)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Sucesso ao cadastrar usuário:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Usuário criado com sucesso!',
              life: 3000,
            });

            // Resetar o formulário
            this.userForm.reset();

            // Voltar para a tabela
            this.showForm = false;

            // Recarregar os dados da tabela
            this.listarUsuarios();
          },
          error: (error) => {
            console.error('Erro ao cadastrar usuário:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criarusuário!',
              life: 3000,
            });
          },
        });
    } else {
      console.log('Formulário inválido. Preencha todos os campos.', this.userForm);
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
  editarUsuario(): void {

    if (this.userForm?.valid) {
      const requestEditUser: EditarUsuario = {
        codigo: this.userForm.value.codigo as bigint,
        nomeCompleto: this.userForm.value.nomeCompleto as string,
        tipo: this.userForm.value.tipo as Tipo,
        telefone: this.userForm.value.telefone as string,
        email: this.userForm.value.email as string,
        documento: this.userForm.value.documento as string,
        login: this.userForm.value.login as string,
        password: this.userForm.value.password as string,
        status: this.userForm.value.status as string,
        empresa: this.userForm.getRawValue().empresa as number,
      };
      console.log(requestEditUser)
      // Chamar o serviço para editar o usuário
      this.usuarioService
        .editUsuario(requestEditUser)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao editar usuário:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Usuário editado com sucesso!',
                life: 3000,
              });
              this.userForm.reset();
              this.showForm = false;
              this.listarUsuarios();
            }
          },
          error: (error) => {
            console.error('Erro ao editar usuário:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar usuário!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn('Formulário inválido. Preencha todos os campos.', this.userForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }


  /**
   * Desativa um usuário com o código fornecido.
   *
   * @param {bigint} codigo - Código do usuário a ser desativado.
   * @returns {void}
   */
  desativarUsuario(codigo: bigint): void {
    console.log('Status alterado, usuário: ', codigo);
    if (codigo) {
      this.usuarioService
        .desativarUsuario(codigo)
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
            }
            this.listarUsuarios();
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
      console.warn('Nenhum usuário selecionado.');
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um usuário!',
        life: 3000,
      });
    }
  }

  acaoAlterarTipo(){
    if(this.usuarioAtual){
      this.tipoSelecionado = this.usuarioAtual.tipo
      console.log(this.usuarioAtual)
      this.mostrarTelaAcaoAlterarTipo = true
    }else {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Selecione um usuário primeiro.',
      life: 3000
    });
  }
  }

  alterarTipo() {
    const tipo = this.tipoSelecionado;
    if(this.usuarioAtual?.status === Status.DESATIVADO){
      this.messageService.add({
        severity:'error',
        summary:'Erro',
        detail:'Usuário desativado não é possível alterar o tipo',
        life:4000
      })
      return
    }
    console.log(this.usuarioAtual?.codigo, tipo)
    if (this.usuarioAtual?.codigo !== undefined) {
      this.usuarioService.alterarTipo(this.usuarioAtual.codigo, tipo).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if(response){
            this.messageService.add({
              severity:'success',
              summary:'Sucesso',
              detail:'Tipo de usuário alterado com sucesso',
              life:4000
            })
            this.mostrarTelaAcaoAlterarTipo = false;
            this.atualizarTabela()
          }
        },error: (e) => {
          this.messageService.add({
             severity:'error',
              summary:'Erro',
              detail:'Não foi possível alterar o tipo do usuário',
              life:4000
          })
          console.error(e)
        }
      })
    } else {
      this.messageService.add({
        severity:'error',
        summary:'Erro',
        detail:'Código do usuário não encontrado',
        life:4000
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

