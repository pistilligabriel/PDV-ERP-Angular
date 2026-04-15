import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { EditarTituloReceber } from 'src/app/models/interfaces/financeiro/EditarTituloReceber.interface';
import { NovoTituloReceber } from 'src/app/models/interfaces/financeiro/NovoTituloReceber.interface';
import { TituloReceber } from 'src/app/models/interfaces/financeiro/TituloReceber.interface';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TituloReceberService {
  private API_URL = environment.apiUrl;
  private JWT_TOKEN = this.cookie.get('token');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.JWT_TOKEN}`,
    }),
  };
constructor(
    private http: HttpClient,
    private cookie: CookieService
) { }

getAllTitulos():Observable<Array<TituloReceber>>{
    return this.http.get<Array<TituloReceber>>(`${this.API_URL}/financeiro`,this.httpOptions);
}

getTitulo(codigo:number):Observable<TituloReceber>{
    return this.http.get<TituloReceber>(`${this.API_URL}/financeiro/${codigo}`,this.httpOptions);
}

novoTitulo(requestData:NovoTituloReceber):Observable<Array<TituloReceber>>{
    return this.http.post<Array<TituloReceber>>(`${this.API_URL}/financeiro`,requestData,this.httpOptions)
}

editarTitulo(requestData:EditarTituloReceber):Observable<Array<TituloReceber>>{
    return this.http.put<Array<TituloReceber>>(`${this.API_URL}/financeiro`,requestData,this.httpOptions);
}

cancelarTitulo(codigo:number):Observable<Array<TituloReceber>>{
    return this.http.put<Array<TituloReceber>>(`${this.API_URL}/financeiro/cancelar/${codigo}`,this.httpOptions)
}

}
