import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AdicionarProduto, EditarProduto, Produto } from 'src/app/modules/cadastro/produto/produto.component';
import { AdicionarUnidade, EditarUnidade, UnidadeMedida } from 'src/app/modules/cadastro/unidade-medida/page/unidade-medida.component';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UnidadeMedidaService {
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

  addUnidade(unidade: AdicionarUnidade):Observable<Array<UnidadeMedida>>{
    return this.http.post<Array<UnidadeMedida>>(`${this.API_URL}/unidade-medida`,unidade,this.httpOptions)
  }
  
  editUnidade(requestData:EditarUnidade):Observable<Array<UnidadeMedida>>{
    return this.http.put<Array<UnidadeMedida>>(`${this.API_URL}/unidade-medida`,requestData,this.httpOptions)
  }

  desativarUnidade(codigo:bigint):Observable<Array<UnidadeMedida>>{
  return this.http.post<Array<UnidadeMedida>>(`${this.API_URL}/unidade-medida/desativar/${codigo}`, this.httpOptions);
 }

 getAllUnidades():Observable<Array<UnidadeMedida>>{
  return this.http.get<Array<UnidadeMedida>>(`${this.API_URL}/unidade-medida`, this.httpOptions);
 }

  getUnidadeEspecifica(codigo: bigint):Observable<UnidadeMedida>{
  return this.http.get<UnidadeMedida>(`${this.API_URL}/unidade-medida/${codigo}`, this.httpOptions);
 }
}
