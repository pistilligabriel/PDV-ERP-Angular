import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { Tipo } from 'src/app/models/enums/users/Tipo.enum';
import { AdicionarUsuario } from 'src/app/models/interfaces/usuario/AdicionarUsuario';
import { AuthRequest } from 'src/app/models/interfaces/usuario/auth/AuthRequest';
import { AuthResponse } from 'src/app/models/interfaces/usuario/auth/AuthResponse';
import { EditarUsuario } from 'src/app/models/interfaces/usuario/EditarUsuario';
import { Usuarios } from 'src/app/models/interfaces/usuario/response/UsuariosResponse';
import { Usuario } from 'src/app/modules/cadastro/usuario/page/usuario.component';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private cookie: CookieService) {}

  // signupUser(usuario: SignupUserRequest): Observable<string> {
  //   return this.http.post<string>(`${this.API_URL}usuarios`, usuario);
  // }

  loginUser(usuario: AuthRequest): Observable<AuthResponse> {
    console.log(usuario);
    return this.http.post<AuthResponse>(`${this.API_URL}/autenticar`, usuario);
  }

  isLoggedIn() {
    const token = this.cookie.get('token');
    return token ? true : false;
  }

  getUsuarioEspecifico(codigo: bigint): Observable<Usuarios> {
    return this.http.get<Usuarios>(
      `${this.API_URL}/usuarios/${codigo}`,
      this.getHttpOptions()
    );
  }

  getAllUsuarios(): Observable<Array<Usuarios>> {
    return this.http.get<Array<Usuarios>>(
      `${this.API_URL}/usuarios`,
      this.getHttpOptions()
    );
  }

  addUsuario(requestDatas: AdicionarUsuario): Observable<Array<Usuarios>> {
    return this.http.post<Array<Usuarios>>(
      `${this.API_URL}/usuarios`,
      requestDatas,
      this.getHttpOptions()
    );
  }

  editUsuario(requestDatas: EditarUsuario): Observable<Array<Usuarios>> {
    return this.http.put<Array<Usuarios>>(
      `${this.API_URL}/usuarios`,
      requestDatas,
      this.getHttpOptions()
    );
  }

  alterarTipo(codigo: bigint, tipo:Tipo):Observable<Usuarios>{
    return this.http.patch<Usuarios>(`${this.API_URL}/usuarios/alterar-tipo/${codigo}`,JSON.stringify(tipo),this.getHttpOptions())
  }
  

  desativarUsuario(codigo: bigint): Observable<Array<Usuarios>> {
    return this.http.put<Array<Usuarios>>(
      `${this.API_URL}/usuarios/alterar-status/${codigo}`,
      {},
      this.getHttpOptions()
    );
  }

   getUsuarioLogado(): Observable<Usuario>{
    return this.http.get<Usuario>(`${this.API_URL}/usuarios/perfil`, this.getHttpOptions())
  }

  logoutUser(codigo: bigint): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.API_URL}/usuarios/logout/${codigo}`, null, this.getHttpOptions());
  }

  /**
   * Método para obter headers HTTP atualizados com o token mais recente
   */
  private getHttpOptions() {
    const token = this.cookie.get('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }
}
