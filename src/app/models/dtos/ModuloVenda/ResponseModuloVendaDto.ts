import { PedidoDto } from "src/app/modules/venda/venda.component";

export interface ResponseModuloVendaDto {
   codigo:bigint;
   pedidoDto: PedidoDto;
}