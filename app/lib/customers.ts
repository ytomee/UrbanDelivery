import { Customer } from "../types/customer";

const STORAGE_KEY = "urbandelivery_customers";

export function getCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCustomer(customer: Omit<Customer, "id" | "createdAt">): Customer {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    communicationPreferences: { email: true, sms: true }, // Default preferences
  };
  customers.push(newCustomer);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  return newCustomer;
}

export function deleteCustomer(id: string): void {
  const customers = getCustomers().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function updateCustomerPreferences(id: string, preferences: { email: boolean; sms: boolean }): void {
  const customers = getCustomers();
  const index = customers.findIndex((c) => c.id === id);
  if (index !== -1) {
    customers[index].communicationPreferences = preferences;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }
}
