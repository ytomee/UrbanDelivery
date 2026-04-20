import { Courier } from "../types/courier";

const STORAGE_KEY = "urbandelivery_couriers";

export function getCouriers(): Courier[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCourier(courier: Omit<Courier, "id" | "createdAt">): Courier {
  const couriers = getCouriers();
  const newCourier: Courier = {
    ...courier,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  couriers.push(newCourier);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(couriers));
  return newCourier;
}

export function deleteCourier(id: string): void {
  const couriers = getCouriers().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(couriers));
}
