import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from 'src/app/modules/cadastro/usuario/page/usuario.component';


@Injectable({ providedIn: 'root' })
export class UsuarioContextService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);

  setUsuario(usuario: Usuario) {
    this.usuarioSubject.next(usuario);
  }
   getUsuario(): Observable<Usuario | null> {
    return this.usuarioSubject.asObservable();
  }

  getUsuarioAtual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  limparUsuario() {
    this.usuarioSubject.next(null);
  }
}