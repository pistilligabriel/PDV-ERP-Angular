import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AddCliente, Clientes, EditCliente } from 'src/app/modules/cadastro/cliente/page/cliente.component';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private API_URL = environment.apiUrl;
  private JWT_TOKEN = this.cookie.get('token');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `${this.JWT_TOKEN}`,
    }),
  };
constructor(
    private http: HttpClient,
    private cookie: CookieService
) { }


getAllCliente():Observable<Array<Clientes>>{
  return this.http.get<Array<Clientes>>(`${this.API_URL}/clientes`, this.httpOptions);
}

getCliente(CODIGO:bigint):Observable<Clientes>{
  return this.http.get<Clientes>(`${this.API_URL}/clientes/${CODIGO}`, this.httpOptions);
}

addCliente(requestDatas: AddCliente): Observable<Array<Clientes>>{
  return this.http.post<Array<Clientes>>(`${this.API_URL}/clientes`, requestDatas, this.httpOptions);
}

editCliente(requestDatas: EditCliente): Observable<Array<Clientes>>{
  return this.http.put<Array<Clientes>>(`${this.API_URL}/clientes`, requestDatas, this.httpOptions);
}

desativarCliente(CODIGO:bigint):Observable<Array<Clientes>>{
  return this.http.post<Array<Clientes>>(`${this.API_URL}/clientes/desativar/${CODIGO}`, this.httpOptions);
}

}
