export interface Courier {
  id: string;
  name: string;
  identification: string;
  contact: string;
  vehicle: string;
  preferredZone: string;
  createdAt: string;
  isAvailable?: boolean;
  schedule?: Record<string, { active: boolean, start: string, end: string }>;
}
