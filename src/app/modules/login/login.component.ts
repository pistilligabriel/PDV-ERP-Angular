import { MessageService } from 'primeng/api';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthRequest } from 'src/app/models/interfaces/usuario/auth/AuthRequest';
import { UsuarioService } from 'src/app/services/cadastro/usuario/usuario.service';
import { Subject, takeUntil } from 'rxjs';
import { UsuarioContextService } from 'src/app/services/cadastro/usuario/usuario-context.service';
import { Usuario } from '../cadastro/usuario/page/usuario.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loginCard = true;

  usuarioLogin: AuthRequest = new AuthRequest();

  usuarioLogado!:Usuario;

  roles: string[] = ['ADMIN', 'USER'];

  public loginForm: FormGroup;
  public signupForm: FormGroup;
  public selectRole: FormGroup;

  @Output() public closeModalEventEmitter: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private cookieService: CookieService,
    private router: Router
  ) {
    this.selectRole = this.formBuilder.group({
      name: new FormControl(''),
    });

    this.loginForm = this.formBuilder.group({
      login: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.signupForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      role: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {}

  userLogin() {
    this.usuarioService
      .loginUser(this.usuarioLogin)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.cookieService.set('token', response?.token);
            this.loginForm.reset();
            this.router.navigate(['/home']);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Bem vindo!`,
              life: 2000,
            });
            console.log(response);
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: `Erro ao fazer login: ${err.message}`,
            life: 2000,
          });
          console.log(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
