import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VendaDialogService {
  private abrirDialogSubject = new Subject<void>();
  abrirDialog$ = this.abrirDialogSubject.asObservable();

  abrirDialog() {
    this.abrirDialogSubject.next();
  }
}