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
  return data ? JSON.parse(data) : [];
}

export function getNotificationsByCustomer(customerId: string): Notification[] {
  return getNotifications()
    .filter((n) => n.customerId === customerId)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

function addNotification(
  data: Omit<Notification, "id" | "sentAt">
): Notification {
  const all = getNotifications();
  const n: Notification = { ...data, id: crypto.randomUUID(), sentAt: new Date().toISOString() };
  all.push(n);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return n;
}

export function createStatusNotifications(
  orderId: string,
  customer: Customer,
  newStatus: OrderStatus
): void {
  const message = STATUS_MESSAGES[newStatus];
  const base = { customerId: customer.id, orderId, orderStatus: newStatus, message };

  const channels: Array<{ channel: NotificationChannel; recipient: string }> = [
    { channel: "email", recipient: customer.email },
    { channel: "sms", recipient: customer.phone },
  ];

  channels.forEach(({ channel, recipient }) => {
    addNotification({ ...base, channel, recipient });
  });
}

export function deleteNotificationsByOrder(orderId: string): void {
  const all = getNotifications().filter((n) => n.orderId !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
