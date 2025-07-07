import { Tipo } from "src/app/models/enums/users/Tipo.enum";

export interface Usuarios {
  codigo: bigint;
  dataCadastro:string;
  nomeCompleto: string;
  tipo:Tipo,
  telefone:string;
  email: string;
  documento:string;
  login: string;
  password: string;
  status: string;
  empresa: number;
  versao: string;
}

