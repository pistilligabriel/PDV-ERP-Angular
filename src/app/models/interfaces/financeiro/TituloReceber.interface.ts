import { Clientes } from "src/app/modules/cadastro/cliente/page/cliente.component";
import { Status } from "../../enums/Status.enum";

export interface TituloReceber {
    codigo:number;
    descricao:string;
    cliente: Clientes;
    observacao:string;
    status:Status;
    valorTotal:number;
    parcelas:number;
    empresa:1;
    versao: string;
    dataCriacao: string;
    dataVencimento:string;
    dataPagamento:string;
}