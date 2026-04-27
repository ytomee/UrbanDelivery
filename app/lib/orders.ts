import { Order } from "../types/order";

const STORAGE_KEY = "urbandelivery_orders";

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveOrder(order: Omit<Order, "id" | "createdAt" | "status">): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pendente",
  };
  orders.push(newOrder);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return newOrder;
}

export function updateOrder(id: string, data: Partial<Pick<Order, "courierId" | "status">>): void {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
}

export function cancelOrder(id: string, reason: string): void {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      status: "cancelada",
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      courierId: undefined,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
}

export function deleteOrder(id: string): void {
  const orders = getOrders().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

