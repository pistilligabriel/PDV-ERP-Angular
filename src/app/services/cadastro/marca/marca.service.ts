import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AdicionarMarca, EditarMarca, Marca } from 'src/app/modules/cadastro/marca/page/marca.component';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
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

  addMarca(marca: AdicionarMarca):Observable<Array<Marca>>{
    return this.http.post<Array<Marca>>(`${this.API_URL}/fabricantes`,marca,this.httpOptions)
  }
  
  editMarca(requestData:EditarMarca):Observable<Marca>{
    return this.http.put<Marca>(`${this.API_URL}/fabricantes`,requestData,this.httpOptions)
  }

  desativarMarca(codigo:bigint):Observable<Marca>{
  return this.http.post<Marca>(`${this.API_URL}/fabricantes/alterar-status/${codigo}`, this.httpOptions);
 }

 getAllMarca():Observable<Array<Marca>>{
  return this.http.get<Array<Marca>>(`${this.API_URL}/fabricantes`, this.httpOptions);
 }

  getMarcaEspecifica(codigo: bigint):Observable<Marca>{
  return this.http.get<Marca>(`${this.API_URL}/fabricantes/${codigo}`, this.httpOptions);
 }
}
