import { Tipo } from "../../enums/users/Tipo.enum";

export interface UsuarioPerfil {
  codigo: bigint;
  nomeCompleto: string;
  login: string;
  tipo: Tipo;
}