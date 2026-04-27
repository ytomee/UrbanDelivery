import { OrderStatus } from "./order";

export type NotificationChannel = "email" | "sms";
export type NotificationType = "status_change" | "delay" | "reschedule";

export interface Notification {
  id: string;
  customerId: string;
  orderId: string;
  channel: NotificationChannel;
  recipient: string;
  type: NotificationType;
  orderStatus?: OrderStatus;
  newExpectedDate?: string;
  message: string;
  sentAt: string;
}
