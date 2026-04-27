import { Notification, NotificationChannel } from "../types/notification";
import { OrderStatus } from "../types/order";
import { Customer } from "../types/customer";

const STORAGE_KEY = "urbandelivery_notifications";

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  "pendente": "A sua encomenda foi registada e está pendente de atribuição.",
  "em distribuição": "A sua encomenda está em distribuição e será entregue em breve.",
  "entregue": "A sua encomenda foi entregue com sucesso. Obrigado pela confiança!",
  "cancelada": "A sua encomenda foi cancelada. Contacte-nos para mais informações.",
};

export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  const all: Notification[] = JSON.parse(data);
  // Migrate legacy notifications that lack `type`
  return all.map((n) => (n.type ? n : { ...n, type: "status_change" as const }));
}

export function getNotificationsByCustomer(customerId: string): Notification[] {
  return getNotifications()
    .filter((n) => n.customerId === customerId)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

function addNotification(data: Omit<Notification, "id" | "sentAt">): Notification {
  const all = getNotifications();
  const n: Notification = { ...data, id: crypto.randomUUID(), sentAt: new Date().toISOString() };
  all.push(n);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return n;
}

function sendToChannels(base: Omit<Notification, "id" | "sentAt" | "channel" | "recipient">, customer: Customer) {
  const channels: Array<{ channel: NotificationChannel; recipient: string }> = [
    { channel: "email", recipient: customer.email },
    { channel: "sms", recipient: customer.phone },
  ];
  channels.forEach(({ channel, recipient }) => addNotification({ ...base, channel, recipient }));
}

export function createStatusNotifications(orderId: string, customer: Customer, newStatus: OrderStatus): void {
  sendToChannels({
    type: "status_change",
    customerId: customer.id,
    orderId,
    orderStatus: newStatus,
    message: STATUS_MESSAGES[newStatus],
  }, customer);
}

export function createDelayNotification(orderId: string, customer: Customer, reason: string): void {
  sendToChannels({
    type: "delay",
    customerId: customer.id,
    orderId,
    message: `A sua encomenda sofreu um atraso. Motivo: ${reason}`,
  }, customer);
}

export function createRescheduleNotification(
  orderId: string,
  customer: Customer,
  newExpectedDate: string,
  reason: string
): void {
  const formatted = new Date(newExpectedDate).toLocaleDateString("pt-PT");
  sendToChannels({
    type: "reschedule",
    customerId: customer.id,
    orderId,
    newExpectedDate,
    message: `A sua encomenda foi reagendada para ${formatted}. Motivo: ${reason}`,
  }, customer);
}

export function deleteNotificationsByOrder(orderId: string): void {
  const all = getNotifications().filter((n) => n.orderId !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
