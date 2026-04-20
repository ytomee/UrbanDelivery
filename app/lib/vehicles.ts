import { Vehicle } from "../types/vehicle";

const STORAGE_KEY = "urbandelivery_vehicles";

export function getVehicles(): Vehicle[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveVehicle(vehicle: Omit<Vehicle, "id" | "createdAt">): Vehicle {
  const vehicles = getVehicles();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  vehicles.push(newVehicle);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  return newVehicle;
}

export function updateVehicleStatus(id: string, status: Vehicle["status"]): void {
  const vehicles = getVehicles();
  const index = vehicles.findIndex((v) => v.id === id);
  if (index !== -1) {
    vehicles[index].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  }
}

export function deleteVehicle(id: string): void {
  const vehicles = getVehicles().filter((v) => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}
