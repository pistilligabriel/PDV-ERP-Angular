export interface ItemDto {
  descricao: string;
  observacao: string | null;
  unidadeVenda: number | null;
  fabricante: number | null;
  modelo: string | null;
  precoVenda: number | null;
  estoque: number | null;
  quantidade: number;
}