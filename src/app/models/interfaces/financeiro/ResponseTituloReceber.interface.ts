import { Clientes } from 'src/app/modules/cadastro/cliente/page/cliente.component';
import { Status } from '../../enums/Status.enum';

export interface ResponseTituloReceber {
  codigo: number;
  descricao: string;
  cliente: Clientes;
  observacao: string;
  valorTotal: number;
  parcelas: number;
  status: Status;
  empresa: 1;
  versao: string;
  dataCriacao: string;
  dataVencimento: string;
  dataPagamento: string;
}
