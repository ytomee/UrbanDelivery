export type OrderStatus = "pendente" | "em distribuição" | "entregue" | "cancelada";

export interface Order {
  id: string;
  customerId: string;
  addressId: string;
  articles: string;
  expectedDate: string;
  createdAt: string;
  courierId?: string;
  status: OrderStatus;
}
