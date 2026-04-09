import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { TipoEmpresa } from 'src/app/models/enums/empresa/TipoEmpresa.enum';
import { Usuario } from 'src/app/modules/cadastro/usuario/page/usuario.component';
import { Config } from 'src/app/modules/configuracoes/configuracoes.component';
import { UsuarioContextService } from 'src/app/services/cadastro/usuario/usuario-context.service';
import { UsuarioService } from 'src/app/services/cadastro/usuario/usuario.service';
import { ConfigService } from 'src/app/services/configuracoes/configuracoes.service';
import { VendaDialogService } from 'src/app/services/faturamento/venda/VendaDialogService.service';

@Component({
  selector: 'app-toolbar-navigation',
  templateUrl: './toolbar-navigation.component.html',
  styleUrls: ['./toolbar-navigation.component.css'],
})
export class ToolbarNavigationComponent implements OnInit, OnDestroy {
  
  goHome() {
    this.router.navigate(['/home'])
  }

  private destroy$: Subject<void> = new Subject<void>();

  logo!: File | string;

  nomeEmpresa!: string;

  infoConfig!: Config;

  TipoEmpresa = TipoEmpresa;

  items: MenuItem[] | undefined;

  usuarioLogado!: Usuario | null;

  constructor(
    private cookie: CookieService,
    private router: Router,
    private usuarioService: UsuarioService,
    private usuarioContext: UsuarioContextService,
    private configService: ConfigService,
    private vendaDialogService: VendaDialogService
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        routerLink: ['/home'],
      },
      {
        label: 'Cadastro',
        icon: 'pi pi-fw pi-file-edit',
        items: [
          {
            label: 'Usuário',
            routerLink: ['/usuario'],
          },
          {
            label: 'Cliente',
            routerLink: ['/cliente'],
          },
          {
            label: 'Produto',
            routerLink: ['/produto'],
          },
          {
            label: 'Unidade Medida',
            routerLink: ['/unidade-medida'],
          },
          {
            label: 'Marca',
            routerLink: ['/marca'],
          },
        ],
      },
      {
        label: 'Faturamento',
        icon: 'pi pi-fw pi-money-bill',
        items: [
          {
            label: 'Venda',
            icon: 'pi pi-fw pi-cart-plus',
            routerLink: ['/faturamento/modulo-vendas'],
          },
          // {
          //   label: 'Estoque',
          //   icon: 'pi pi-fw pi-box',
          //   routerLink: ['/billing/stock'],
          // },
        ],
      },
      // {
      //   label: 'Financeiro',
      //   icon: 'pi pi-fw pi-calculator',
      //   items: [
      //     {
      //       label: 'Titulo',
      //       items: [
      //         {
      //           label: 'Receber',
      //           routerLink: ['/financial/account/receive'],
      //         },
      //         {
      //           label: 'Pagar',
      //           routerLink: ['/financial/account/pay'],
      //         },
      //       ],
      //     },
      //     {
      //       label: 'Movimentação',
      //       items: [
      //         {
      //           label: 'Entrada',
      //           routerLink: ['/financial/movement/entry'],
      //         },
      //         {
      //           label: 'Saída',
      //           routerLink: ['/financial/movement/exit'],
      //         },
      //       ],
      //     }
      //   ],
      // },
      {
        label: 'Configuração',
        icon: 'pi pi-fw pi-database',
        routerLink: ['/configuracoes'],
      },
    ];

    this.configService.empresa$.subscribe((config) => {
      if (config) {
        this.nomeEmpresa = config.nomeEmpresa;
        this.logo = config.logo || 'assets/default-logo.png';
      } else {
        this.getNomeEmpresa();
        this.obterInformacoes();
      }
    });

    this.usuarioContext.getUsuario().subscribe((usuario) => {
      this.usuarioLogado = usuario;
    });
  }

  venda() {
    if (this.cookie.check('token')) {
      this.router.navigate(['/faturamento/modulo-vendas']).then(() => {
        setTimeout(() => {
          this.vendaDialogService.abrirDialog();
        });
      });
    } else {
      void this.router.navigate(['/login']);
    }
  }

  handleLogout(): void {
    console.log(this.usuarioLogado?.codigo);
    if (this.usuarioLogado && this.usuarioLogado.codigo !== undefined) {
      this.usuarioService
        .logoutUser(this.usuarioLogado.codigo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Token deletado com sucesso', response);
          },
          error: (e) => {
            console.error('Não foi possível deletar token', e);
          },
        });
    }
    // Limpar todos os dados de autenticação
    this.cookie.delete('token');

    // Limpar localStorage se houver dados salvos
    localStorage.clear();

    // Limpar sessionStorage se houver dados salvos
    sessionStorage.clear();

    // Forçar reload da página para limpar qualquer estado em memória
    window.location.href = '/login';
  }

  getNomeEmpresa() {
    this.configService.getConfig().subscribe((config) => {
      this.nomeEmpresa = config.nomeEmpresa;
    });
  }

  obterInformacoes(): void {
    this.configService.getLogo().subscribe(
      (blob) => {
        console.log('Blob recebido:', blob);
        const reader = new FileReader();
        reader.onload = () => {
          this.logo = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      (error) => {
        console.error('Erro ao carregar logo', error);
        this.logo = 'assets/default-logo.png';
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
