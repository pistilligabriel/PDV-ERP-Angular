import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PrimengModule } from 'src/app/libraries/primeng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { moduloVendaRouting } from './modulo-vendas.routing';
import { ModuloVendasComponent } from './modulo-vendas.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule,
    SharedModule,
    RouterModule.forChild(moduloVendaRouting)
  ],
  declarations: [
    ModuloVendasComponent
  ],
  providers:[ MessageService,
    CookieService,
    ConfirmationService]
})
export class ModuloVendasModule { }
