import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AdicionarProduto, EditarProduto, EntradaAcertoEstoque, Produto } from 'src/app/modules/cadastro/produto/produto.component';
import { ProdutoVenda } from 'src/app/modules/venda/venda.component';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
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


 getAllProdutos():Observable<Array<Produto>>{
  return this.http.get<Array<Produto>>(`${this.API_URL}/produtos`, this.httpOptions);
 }

 getAllProdutosVenda():Observable<Array<ProdutoVenda>>{
  return this.http.get<Array<ProdutoVenda>>(`${this.API_URL}/produtos`, this.httpOptions);
 }

 getProdutoEspecifico(codigo: bigint):Observable<Produto>{
  return this.http.get<Produto>(`${this.API_URL}/produtos/${codigo}`, this.httpOptions);
 }

 getProdutoEspecificoProduto(codigo: bigint):Observable<Produto>{
  return this.http.get<Produto>(`${this.API_URL}/produtos/${codigo}`, this.httpOptions);
 }

 adicionarProduto(requestDatas: AdicionarProduto):Observable<Array<Produto>>{
  return this.http.post<Array<Produto>>(`${this.API_URL}/produtos`, requestDatas, this.httpOptions);
 }

 editarProduto(requestDatas: EditarProduto):Observable<Array<Produto>>{
  return this.http.put<Array<Produto>>(`${this.API_URL}/produtos`, requestDatas, this.httpOptions);
 }

 desativarProduto(CODIGO:bigint):Observable<Array<Produto>>{
  return this.http.post<Array<Produto>>(`${this.API_URL}/produtos/desativar/${CODIGO}`, this.httpOptions);
 }

 removerProduto(CODIGO:bigint):Observable<Array<Produto>>{
  return this.http.delete<Array<Produto>>(`${this.API_URL}/produtos/${CODIGO}`, this.httpOptions);
 }

 acertoEstoque(codigo:bigint,estoque:number):Observable<Produto>{
  return this.http.patch<Produto>(`${this.API_URL}/produtos/acerto/${codigo}`,{estoque},this.httpOptions)
 }
}
