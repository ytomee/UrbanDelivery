export type VehicleType = "motorizada" | "carrinha" | "bicicleta";

export type VehicleStatus = "ativo" | "em manutenção";

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  capacity: number;
  status: VehicleStatus;
  createdAt: string;
}
