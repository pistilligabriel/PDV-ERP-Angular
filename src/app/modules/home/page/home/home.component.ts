import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Usuario } from 'src/app/modules/cadastro/usuario/page/usuario.component';
import { UsuarioContextService } from 'src/app/services/cadastro/usuario/usuario-context.service';
import { UsuarioService } from 'src/app/services/cadastro/usuario/usuario.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  usuario!: Usuario;

  constructor(
    private service: UsuarioService,
    private usuarioContext: UsuarioContextService
  ) {}

  ngOnInit(): void {
    this.service.getUsuarioLogado().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        console.log(this.usuario);
        this.usuarioContext.setUsuario(this.usuario);
      },
      error: (e) => {
        console.log('Não foi possível obter o usuário logado', e);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
