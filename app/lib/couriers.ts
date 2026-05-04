import { Courier } from "../types/courier";

const STORAGE_KEY = "urbandelivery_couriers";

export function getCouriers(): Courier[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  const couriers: Courier[] = JSON.parse(data);
  return couriers.map(c => ({
    ...c,
    isAvailable: c.isAvailable !== false,
    schedule: c.schedule || {
      "seg": { active: true, start: "08:00", end: "22:00" },
      "ter": { active: true, start: "08:00", end: "22:00" },
      "qua": { active: true, start: "08:00", end: "22:00" },
      "qui": { active: true, start: "08:00", end: "22:00" },
      "sex": { active: true, start: "08:00", end: "22:00" },
      "sab": { active: true, start: "09:00", end: "22:00" },
      "dom": { active: true, start: "09:00", end: "22:00" },
    }
  }));
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

export function updateCourier(id: string, data: Partial<Courier>): void {
  const couriers = getCouriers();
  const index = couriers.findIndex((c) => c.id === id);
  if (index !== -1) {
    couriers[index] = { ...couriers[index], ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(couriers));
  }
}
