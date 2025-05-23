import { async } from '@angular/core/testing';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import * as FileSaver from 'file-saver';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Column } from 'src/app/models/interfaces/Column';
import { ExportColumn } from 'src/app/models/interfaces/ExportColumn';
import { ProdutoService } from 'src/app/services/cadastro/produto/produto.service';
import { UnidadeMedida } from '../unidade-medida/page/unidade-medida.component';
import { UnidadeMedidaService } from 'src/app/services/cadastro/unidade-medida/unidade-medida.service';
import { DropDownOptions } from 'src/app/models/interfaces/product/DropDownOptions';
import { getLocaleDateTimeFormat } from '@angular/common';
import { Marca } from '../marca/page/marca.component';
import { MarcaService } from 'src/app/services/cadastro/marca/marca.service';

export interface Produto {
  codigo: bigint,
  descricao: string,
  observacao: string,
  fabricante: number,
  modelo:string,
  unidadeVenda?: number,
  precoCusto: number,
  estoque: number,
  precoVenda: number,
  margemLucro: number,
  status: string;
  empresa: number;
  versao: string;
  dataCadastro: string;
}

export interface AdicionarProduto {
  descricao: string,
  observacao: string,
  fabricante: number,
  modelo: string,
  unidadeVenda: number,
  precoCusto: number,
  estoque: number,
  precoVenda: number,
  margemLucro: number,
  empresa: number
}

export interface EditarProduto {
  codigo: bigint,
  descricao: string,
  observacao: string,
  fabricante: number,
  modelo: string,
  unidadeVenda: number,
  precoCusto: number,
  estoque: number,
  precoVenda: number,
  margemLucro: number,
  empresa: number,
  status: string;
}


@Component({
  selector: 'app-produto',
  templateUrl: './produto.component.html',
  styleUrls: []
})
export class ProdutoComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject<void>();


  @ViewChild('tabelaProduto') tabelaProduto: Table | undefined;

  /**
   * Flag para exibir ou ocultar o formulário de produto.
   */
  public showForm = false;

  /**
   * Lista de dados de produtos.
   */
  public produtoDatas: Array<Produto> = [];

  public produtoSelecionado!: Produto[] | null;

  public produto!: Produto;

  unidadeMedidas!: DropDownOptions[];

  unidadeMedidaSelecionada!: UnidadeMedida;

  marca!: DropDownOptions[];

  marcaSelecionada!: Marca;

  constructor(
    private produtoService: ProdutoService,
    private messageService: MessageService,
    private router: Router,
    private formBuilderProduto: FormBuilder,
    private confirmationService: ConfirmationService,
    private unidadeService: UnidadeMedidaService,
    private marcaService: MarcaService
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
    codigo: [null as bigint | null],
    descricao: ['', [Validators.required]],
    observacao: [''],
    fabricante: [null as number | null, [Validators.required]],
    modelo:[''],
    unidadeVenda: [null as number | null, [Validators.required]],
    precoCusto: [null as number | null, [Validators.required]],
    estoque: [null as number | null, [Validators.required]],
    precoVenda: [null as number | null, [Validators.required]],
    margemLucro: [{ value: 0, disabled: true }],
    status: [{ value: '', disabled: true }],
    empresa: [{ value: 1, disabled: true }],
    dataCadastro: [{ value: null as Date | string | null, disabled: true }],
    versao: [{ value: null as Date | string | null, disabled: true }],
  });


  ngOnInit() {
    this.listarProdutos();
    this.cols = [
      { field: 'status', header: 'Status' },
      { field: 'descricao', header: 'Descrição' },
      { field: 'fabricante', header: 'Marca' },
      { field: 'modelo', header: 'Modelo' },
      { field: 'estoque', header: 'Quantidade Estoque' },
      { field: 'unidadeVenda', header: 'Unidade Venda' },
    ];
    this.colunasSelecionadas = this.cols;

   this.unidadeService.getAllUnidades().subscribe({
    next: (unidades) => {
      this.unidadeMedidas = unidades.map(u => ({
        label: `${u.descricao} - (${u.simbolo})`,
        value: u.codigo // ou u.codigo, dependendo do que você salva no produto
      }));
    },
    error: (err) => {
      this.unidadeMedidas = [];
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar unidades de medida!',
        life: 3000,
      });
    }
  });

 this.marcaService.getAllMarca().subscribe({
    next: (marca) => {
      this.marca = marca.map(m => ({
        label: `${m.descricao}`,
        value: m.codigo // ou u.codigo, dependendo do que você salva no produto
      }));
    },
    error: (err) => {
      this.marca = [];
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar marcas!',
        life: 3000,
      });
    }
  });
  
  }

  /**
  * Aplica um filtro global na tabela de grupos de usuários.
  *
  * @param $event O evento que acionou a função.
  * @param stringVal O valor da string para filtrar.
  */
  applyFilterGlobal($event: any, stringVal: any) {
    this.tabelaProduto!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  /**
   * Exporta os dados da tabela para um arquivo PDF.
   */
  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.produtoDatas);
        doc.save('produtos.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.produtoDatas);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'produtos');
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
    this.produtoSelecionado = event.data;
  }

  /**
   * Verifica se o formulário está em modo de edição.
   *
   * @returns {boolean} - Verdadeiro se estiver em modo de edição, falso caso contrário.
   */
  isEdicao(): boolean {
    console.log('Editar produto:', this.produtoForm.value.codigo)
    return !!this.produtoForm.value.codigo;
  }

  /**
  * Manipulador de eventos para o botão de adição de grupo.
  * Exibe o formulário de adição de grupo.
  */
  onAddButtonClick() {
    const formattedDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
    this.showForm = true;
    this.produtoForm.setValue({
      codigo: null,
      descricao: null,
      observacao: null,
      modelo:null,
      fabricante: null,
      unidadeVenda: null,
      precoCusto: null,
      estoque: null,
      precoVenda: null,
      margemLucro: null,
      status: 'ATIVO',
      empresa: 1,
      versao: null,
      dataCadastro: formattedDate,
    });

    this.produtoForm.get('precoVenda')?.valueChanges.subscribe(() => {
      this.atualizarMargemLucro();
    });

    this.atualizarMargemLucro();

  }
  verificarCusto() {
    console.log(this.produtoForm.value.precoCusto)
  }

  atualizarMargemLucro() {
    const precoCusto = this.produtoForm.get('precoCusto')?.value as number;
    const precoVenda = this.produtoForm.get('precoVenda')?.value as number;
    if (precoCusto != null && precoVenda != null) {
      const newMargemLucro = (precoVenda - precoCusto) / precoCusto * 100;
      this.produtoForm.patchValue({
        margemLucro: newMargemLucro
      })
    } else {
      this.produtoForm.patchValue({
        margemLucro: null
      })
    }
  }




  onEditButtonClick(produto: Produto): void {
    const formattedDate = format(new Date(produto.versao), 'dd/MM/yyyy HH:mm:ss');


    if (produto.status === 'DESATIVADO') {
      this.confirmationService.confirm({
        header: 'Aviso',
        message: 'Não é permitido editar um usuário desativado.',
      });
    } else {
      this.showForm = true;
      this.produtoService.getProdutoEspecificoProduto(produto.codigo).subscribe(data => {
        this.produtoForm.patchValue({
          codigo: data.codigo,
          descricao: data.descricao,
          observacao: data.observacao,
          unidadeVenda: data.unidadeVenda,
          fabricante: data.fabricante,
          modelo: data.modelo,
          precoCusto: data.precoCusto,
          estoque: data.estoque,
          precoVenda: data.precoVenda,
          margemLucro: data.margemLucro,
          status: data.status,
          empresa: data.empresa,
          versao: formattedDate,
          dataCadastro: data.dataCadastro,
        });
        this.produtoForm.get('precoVenda')?.valueChanges.subscribe(() => {
          this.atualizarMargemLucro();
        });

        this.atualizarMargemLucro();
      })
    }
  }


  onDisableButtonClick(produto: Produto): void {
    this.produtoForm.patchValue({
      codigo: produto.codigo,
    });
    this.desativarProduto(produto.codigo as bigint);
  }


  desativarProdutosSelecionados() {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja desativar os produtos selecionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.produtoDatas = this.produtoDatas.filter((val) => !this.produtoSelecionado?.includes(val));
        this.produtoSelecionado = null;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produtos Desativados', life: 3000 });
      }
    });
  }
  /**
   * Cancela o formulário de adição/editação e limpa os campos.
   */
  cancelarFormulario() {
    this.produtoForm.reset();
    this.showForm = false;
    this.listarProdutos();
  }


  carregarProdutoEspecifico(codigo: bigint) {

    this.produtoService.getProdutoEspecificoProduto(codigo).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.produtoForm.patchValue({
            codigo: response.codigo,
            descricao: response.descricao,
            fabricante: response.fabricante,
            unidadeVenda: response.unidadeVenda,
            precoCusto: response.precoCusto,
            estoque: response.estoque,
            precoVenda: response.precoVenda,
            margemLucro: response.margemLucro,
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
   * Lista os produtos chamando o serviço correspondente.
   */
  listarProdutos() {
    this.produtoService
      .getAllProdutos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.produtoDatas = response;
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar os produtos',
            detail: error.message,
            life: 3000,
          });
          this.router.navigate(['/home']);
        },
      });
  }



  /**
   * Adiciona ou edita um produto com base no estado do formulário.
   */
  adicionarOuEditarProduto(): void {
    if (this.isEdicao()) {
      this.editarProduto()
    } else {
      this.adicionarProduto();
    }
  }


  /**
   * Adiciona um novo produto.
   */
  adicionarProduto(): void {
    if (this.produtoForm.valid) {
      const requestCreateproduto: AdicionarProduto = {
        descricao: this.produtoForm.value.descricao as string,
        observacao: this.produtoForm.value.observacao as string,
        fabricante: this.produtoForm.value.fabricante as number,
        modelo:this.produtoForm.value.modelo as string,
        unidadeVenda: this.produtoForm.value.unidadeVenda as number,
        precoCusto: this.produtoForm.value.precoCusto as number,
        estoque: this.produtoForm.value.estoque as number,
        precoVenda: this.produtoForm.value.precoVenda as number,
        margemLucro: this.produtoForm.getRawValue().margemLucro as number,
        empresa: this.produtoForm.getRawValue().empresa as number,
      };

      this.produtoService
        .adicionarProduto(requestCreateproduto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Sucesso ao cadastrar produto:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto criado com sucesso!',
              life: 3000,
            });

            // Resetar o formulário
            this.produtoForm.reset();

            // Voltar para a tabela
            this.showForm = false;

            // Recarregar os dados da tabela
            this.listarProdutos();
          },
          error: (error) => {
            console.error('Erro ao cadastrar produto:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar produto!',
              life: 3000,
            });
          },
        });
    } else {
      console.log('Formulário inválido. Preencha todos os campos.', this.produtoForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }


  /**
   * Edita um produto existente.
   */
  editarProduto(): void {
    if (this.produtoForm?.valid) {
      const requestEditProduto: EditarProduto = {
        codigo: this.produtoForm.value.codigo as bigint,
        descricao: this.produtoForm.value.descricao as string,
        observacao: this.produtoForm.value.observacao as string,
        fabricante: this.produtoForm.value.fabricante as number,
        modelo:this.produtoForm.value.modelo as string,
        unidadeVenda: this.produtoForm.value.unidadeVenda as number,
        precoCusto: this.produtoForm.value.precoCusto as number,
        estoque: this.produtoForm.value.estoque as number,
        precoVenda: this.produtoForm.value.precoVenda as number,
        margemLucro: this.produtoForm.getRawValue().margemLucro as number,
        status: this.produtoForm.value.status as string,
        empresa: this.produtoForm.getRawValue().empresa as number,
      };

      console.log(requestEditProduto)
      // Chamar o serviço para editar o produto
      this.produtoService
        .editarProduto(requestEditProduto)
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
              this.produtoForm.reset();
              this.showForm = false;
              this.listarProdutos();
            }
          },
          error: (error) => {
            console.error('Erro ao editar produto:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar produto!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn('Formulário inválido. Preencha todos os campos.', this.produtoForm);
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
  desativarProduto(codigo: bigint): void {
    console.log('Alterar o Status!:', codigo);
    if (codigo) {
      this.produtoService
        .desativarProduto(codigo)
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
              this.listarProdutos();
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
      console.warn('Nenhum produto selecionado.');
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um usuário!',
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
