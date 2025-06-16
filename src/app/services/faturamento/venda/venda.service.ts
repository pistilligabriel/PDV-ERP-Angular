import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Observable } from "rxjs";
import { FormaPagamento } from "src/app/models/enums/venda/FormaPagamento.enum";
import { Clientes } from "src/app/modules/cadastro/cliente/page/cliente.component";
import { Produto } from "src/app/modules/cadastro/produto/produto.component";
import { PedidoDto } from "src/app/modules/venda/venda.component";
import { environment } from "src/environment/environment";

@Injectable({
  providedIn: 'root',
})
export class VendaService {
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
) {}

    criarPedido(requestVenda: PedidoDto):Observable<Array<PedidoDto>>{
        return this.http.post<Array<PedidoDto>>(`${this.API_URL}/pedidos`, requestVenda, this.httpOptions);
    }
}