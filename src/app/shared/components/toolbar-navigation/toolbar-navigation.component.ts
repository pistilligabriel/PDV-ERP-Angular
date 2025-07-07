import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Config } from 'src/app/modules/configuracoes/configuracoes.component';
import { ConfigService } from 'src/app/services/configuracoes/configuracoes.service';

@Component({
  selector: 'app-toolbar-navigation',
  templateUrl: './toolbar-navigation.component.html',
  styleUrls: ['./toolbar-navigation.component.css']
})
export class ToolbarNavigationComponent implements OnInit {

  logo!: string

  nomeEmpresa!: string

  infoConfig!: Config

  items: MenuItem[] | undefined;

  constructor(
    private cookie: CookieService,
    private router: Router,
    private configService: ConfigService
  ) { }

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
          {
            label: 'Estoque',
            icon: 'pi pi-fw pi-box',
            routerLink: ['/billing/stock']
          }
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
        routerLink: ['/configuracoes']
      }
    ];

    this.getNomeEmpresa();
    this.obterInformacoes();
  }

  venda() {
    if (this.cookie.check('token')) {
      void this.router.navigate(['/faturamento/venda']);
    } else {
      void this.router.navigate(['/login']);
    }
  }

  handleLogout(): void {
    this.cookie.delete('token');
    void this.router.navigate(['/login']);
  }

  getNomeEmpresa() {
    this.configService.getConfig().subscribe(config => {
      this.nomeEmpresa = config.nomeEmpresa;
    });
  }

  obterInformacoes(): void {
    this.configService.getLogo().subscribe(blob => {
      console.log('Blob recebido:', blob);
      const reader = new FileReader();
      reader.onload = () => {
        this.logo = reader.result as string;
      };
      reader.readAsDataURL(blob);
    }, error => {
      console.error('Erro ao carregar logo', error);
      this.logo = 'assets/default-logo.png';
    });
  }

}
