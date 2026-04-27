import { Order, OrderStatus, VALID_TRANSITIONS } from "../types/order";

const STORAGE_KEY = "urbandelivery_orders";

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  const orders: Order[] = JSON.parse(data);
  // Migrate legacy orders that lack statusHistory
  return orders.map((o) =>
    o.statusHistory ? o : { ...o, statusHistory: [{ status: o.status, changedAt: o.createdAt }] }
  );
}

export function saveOrder(order: Omit<Order, "id" | "createdAt" | "status" | "statusHistory">): Order {
  const orders = getOrders();
  const now = new Date().toISOString();
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    createdAt: now,
    status: "pendente",
    statusHistory: [{ status: "pendente", changedAt: now }],
  };
  orders.push(newOrder);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return newOrder;
}

export function updateOrder(id: string, data: Partial<Pick<Order, "courierId">>): void {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
}

/** Used by the dispatch board: assigns/unassigns a courier. Doesn't automatically set "em distribuição". */
export function assignCourier(orderId: string, courierId: string | null): void {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return;

  const order = orders[index];
  
  // Update the courier ID, but status remains whatever it was (usually "pendente")
  // The courier will mark it as "em distribuição" when they click "Recolhida"
  orders[index] = { ...order, courierId: courierId ?? undefined };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function updateOrderStatus(id: string, newStatus: OrderStatus, note?: string): void {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return;

  const order = orders[index];
  if (!VALID_TRANSITIONS[order.status].includes(newStatus)) {
    throw new Error(`Transição inválida: ${order.status} → ${newStatus}`);
  }

  const now = new Date().toISOString();
  const entry = { status: newStatus, changedAt: now, ...(note ? { note } : {}) };

  orders[index] = {
    ...order,
    status: newStatus,
    statusHistory: [...(order.statusHistory ?? []), entry],
    ...(newStatus === "cancelada"
      ? { cancellationReason: note, cancelledAt: now, courierId: undefined }
      : {}),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function cancelOrder(id: string, reason: string): void {
  updateOrderStatus(id, "cancelada", reason);
}

export function addDelayNote(id: string, reason: string): void {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return;
  const now = new Date().toISOString();
  orders[index] = {
    ...orders[index],
    statusHistory: [
      ...(orders[index].statusHistory ?? []),
      { status: orders[index].status, changedAt: now, note: `Aviso de atraso: ${reason}` },
    ],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function rescheduleOrder(id: string, newDate: string, reason: string): void {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return;
  const now = new Date().toISOString();
  const formatted = new Date(newDate).toLocaleDateString("pt-PT");
  orders[index] = {
    ...orders[index],
    expectedDate: newDate,
    statusHistory: [
      ...(orders[index].statusHistory ?? []),
      { status: orders[index].status, changedAt: now, note: `Reagendado para ${formatted}: ${reason}` },
    ],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function confirmReception(id: string): void {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return;
  const order = orders[index];
  if (order.status !== "entregue") return;
  const now = new Date().toISOString();
  orders[index] = {
    ...order,
    confirmedAt: now,
    statusHistory: [
      ...(order.statusHistory ?? []),
      { status: "entregue", changedAt: now, note: "Receção confirmada pelo cliente" },
    ],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getOrdersByCustomer(customerId: string): Order[] {
  return getOrders()
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteOrder(id: string): void {
  const orders = getOrders().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

