import { TipoEmpresa } from "../../enums/empresa/TipoEmpresa.enum";

export interface DropDownOptionsTipoEmpresa{
    label:string,
    value:string | TipoEmpresa
}