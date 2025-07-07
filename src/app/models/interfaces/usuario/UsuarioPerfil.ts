import { Tipo } from "../../enums/users/Tipo.enum";

export interface UsuarioPerfil {
  codigo: number;
  nome: string;
  login: string;
  password: string;
  tipo: Tipo;
  dataCriacao: string;
}