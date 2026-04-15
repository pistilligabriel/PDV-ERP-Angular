import { Clientes } from 'src/app/modules/cadastro/cliente/page/cliente.component';

export interface NovoTituloReceber {
  descricao: string;
  cliente: Clientes | string;
  observacao: string;
  valorTotal: number;
  parcelas: number;
  empresa: 1;
  dataVencimento: string;
}
