import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-toolbar-navigation',
  templateUrl: './toolbar-navigation.component.html',
  styleUrls: []
})
export class ToolbarNavigationComponent implements OnInit {
  items: MenuItem[] | undefined;

  constructor(
    private cookie: CookieService,
    private router: Router
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
            label: 'Pedido de Compra',
            icon: 'pi pi-fw pi-cart-plus',
            routerLink: ['/billing/purchaseOrder'],
          },
          {
            label: 'Venda',
            icon: 'pi pi-fw pi-cart-plus',
            routerLink: ['/faturamento/venda'],
          },
          {
            label: 'Nota Fiscal',
            icon: 'pi pi-fw pi-calculator',
            items: [
              {
                label: 'Entrada',
                icon: 'pi pi-fw pi-calculator',
                routerLink: ['/billing/entry'],
              },
              {
                label: 'Saída',
                icon: 'pi pi-fw pi-calculator',
                routerLink: ['/billing/exit'],
              },
            ],
          },
          {
            label: 'Estoque',
            icon: 'pi pi-fw pi-box',
            routerLink: ['/billing/stock']
          }
        ],
      },
      {
        label: 'Financeiro',
        icon: 'pi pi-fw pi-calculator',
        items: [
          {
            label: 'Titulo',
            items: [
              {
                label: 'Receber',
                routerLink: ['/financial/account/receive'],
              },
              {
                label: 'Pagar',
                routerLink: ['/financial/account/pay'],
              },
            ],
          },
          {
            label: 'Movimentação',
            items: [
              {
                label: 'Entrada',
                routerLink: ['/financial/movement/entry'],
              },
              {
                label: 'Saída',
                routerLink: ['/financial/movement/exit'],
              },
            ],
          }
        ],
      },
      {
        label: 'Configuração',
        icon: 'pi pi-fw pi-database',
        routerLink: ['/settings']
      }
    ];
  }


  handleLogout(): void {
    this.cookie.delete('token');
    void this.router.navigate(['/login']);
  }

}
