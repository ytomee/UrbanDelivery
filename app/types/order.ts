export type OrderStatus = "pendente" | "em distribuição" | "entregue" | "cancelada" | "falhou";

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedAt: string;
  note?: string;
}

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  "pendente": ["em distribuição", "cancelada"],
  "em distribuição": ["entregue", "cancelada", "falhou"],
  "entregue": [],
  "cancelada": [],
  "falhou": [],
};

export interface Order {
  id: string;
  customerId: string;
  addressId: string;
  articles: string;
  expectedDate: string;
  createdAt: string;
  courierId?: string;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  cancellationReason?: string;
  cancelledAt?: string;
}
