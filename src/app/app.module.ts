import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './modules/login/login.component';
import { PrimengModule } from './libraries/primeng.module';
import { PageNotFoundComponent } from './modules/page-not-found/page-not-found.component';
import { CookieService } from 'ngx-cookie-service';
import { FooterComponent } from './modules/footer/footer.component';
import { ConfirmationService, MessageService } from 'primeng/api';


@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        PageNotFoundComponent,
        FooterComponent,
    ],
    bootstrap: [AppComponent], imports: [PrimengModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule], providers: [
        CookieService,
        MessageService,
        ConfirmationService,
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
