import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimengModule } from 'src/app/libraries/primeng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { vendaRoute } from './venda.routing';
import { VendaComponent } from './venda.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule,
    SharedModule,
    RouterModule.forChild(vendaRoute)
  ],
  declarations: [
    VendaComponent,
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
})
export class VendaModule { }
