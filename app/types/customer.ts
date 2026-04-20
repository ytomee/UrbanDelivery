export type CustomerType = "particular" | "empresa";

export interface Customer {
  id: string;
  name: string;
  nif: string;
  type: CustomerType;
  email: string;
  phone: string;
  createdAt: string;
}
