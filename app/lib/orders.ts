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

/** Used by the dispatch board: assigns/unassigns a courier and adjusts status accordingly. */
export function assignCourier(orderId: string, courierId: string | null): void {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return;

  const order = orders[index];
  const now = new Date().toISOString();
  const newStatus: OrderStatus = courierId ? "em distribuição" : "pendente";

  if (newStatus === order.status) {
    // Only update courierId, no status change needed
    orders[index] = { ...order, courierId: courierId ?? undefined };
  } else {
    const entry = { status: newStatus, changedAt: now };
    orders[index] = {
      ...order,
      courierId: courierId ?? undefined,
      status: newStatus,
      statusHistory: [...(order.statusHistory ?? []), entry],
    };
  }
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

export function deleteOrder(id: string): void {
  const orders = getOrders().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

