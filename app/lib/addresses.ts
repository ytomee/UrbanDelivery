import { Address } from "../types/address";

const STORAGE_KEY = "urbandelivery_addresses";

function getAll(): Address[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAll(addresses: Address[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
}

export function getAddressesByCustomer(customerId: string): Address[] {
  return getAll().filter((a) => a.customerId === customerId);
}

export function addAddress(
  address: Omit<Address, "id">
): Address {
  const all = getAll();
  const newAddress: Address = {
    ...address,
    id: crypto.randomUUID(),
  };
  // If this is the first address or marked as default, unset others
  const customerAddresses = all.filter((a) => a.customerId === address.customerId);
  if (customerAddresses.length === 0) {
    newAddress.isDefault = true;
  }
  const updated = newAddress.isDefault
    ? all.map((a) =>
        a.customerId === address.customerId ? { ...a, isDefault: false } : a
      )
    : all;
  updated.push(newAddress);
  saveAll(updated);
  return newAddress;
}

export function updateAddress(
  id: string,
  data: Omit<Address, "id" | "customerId">
): void {
  let all = getAll();
  const target = all.find((a) => a.id === id);
  if (!target) return;

  if (data.isDefault) {
    all = all.map((a) =>
      a.customerId === target.customerId ? { ...a, isDefault: false } : a
    );
  }
  all = all.map((a) => (a.id === id ? { ...a, ...data } : a));
  saveAll(all);
}

export function deleteAddress(id: string): void {
  const all = getAll();
  const target = all.find((a) => a.id === id);
  const filtered = all.filter((a) => a.id !== id);

  // If deleted address was default, make the first remaining one default
  if (target?.isDefault) {
    const remaining = filtered.filter((a) => a.customerId === target.customerId);
    if (remaining.length > 0) {
      remaining[0].isDefault = true;
    }
  }
  saveAll(filtered);
}

export function setDefaultAddress(id: string): void {
  const all = getAll();
  const target = all.find((a) => a.id === id);
  if (!target) return;

  const updated = all.map((a) => ({
    ...a,
    isDefault: a.customerId === target.customerId ? a.id === id : a.isDefault,
  }));
  saveAll(updated);
}
