import { Tipo } from "../../enums/users/Tipo.enum";

export interface EditarUsuario {
  codigo: bigint;
  nomeCompleto: string;
  tipo:Tipo,
  telefone:string;
  email: string;
  documento: string;
  login: string;
  password: string;
  status: string;
  empresa: number;
}
