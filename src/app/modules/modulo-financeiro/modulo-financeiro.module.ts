import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PrimengModule } from 'src/app/libraries/primeng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModuloFinanceiroComponent } from './modulo-financeiro.component';
import { moduloFinanceiroRouting } from './modulo-financeiro.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule,
    SharedModule,
    RouterModule.forChild(moduloFinanceiroRouting)
  ],
  declarations: [
    ModuloFinanceiroComponent
  ],
  providers:[ MessageService,
    CookieService,
    ConfirmationService]
})
export class ModuloFinanceiroModule { }
