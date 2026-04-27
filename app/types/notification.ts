import { OrderStatus } from "./order";

export type NotificationChannel = "email" | "sms";

export interface Notification {
  id: string;
  customerId: string;
  orderId: string;
  channel: NotificationChannel;
  recipient: string;
  orderStatus: OrderStatus;
  message: string;
  sentAt: string;
}
