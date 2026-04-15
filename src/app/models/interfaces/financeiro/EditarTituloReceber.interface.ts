import { Clientes } from 'src/app/modules/cadastro/cliente/page/cliente.component';
import { Status } from '../../enums/Status.enum';

export interface EditarTituloReceber {
  codigo: number;
  descricao: string;
  cliente: Clientes | string;
  observacao: string;
  valorTotal: number;
  parcelas: number;
  empresa: 1;
  dataVencimento: string;
  status: Status;
}
