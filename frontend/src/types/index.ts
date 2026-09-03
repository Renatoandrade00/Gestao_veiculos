// Tipos de domínio compartilhados — fonte única de verdade do frontend.

export type MaintenanceStatus = 'COMPLETED' | 'PENDING';
export type VehicleHealthStatus = 'ok' | 'warning' | 'overdue';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface MaintenanceRecord {
  id: string;
  type: string;
  description: string;
  mileageAtMaintenance: number;
  dateOfMaintenance: string;
  nextMaintenanceMileage: number | null;
  nextMaintenanceDate: string | null;
  notes: string | null;
  status: MaintenanceStatus;
}

export interface CarSpecs {
  id: string;
  brand: string;
  model: string;
  engine: string;
  recommendedOil: string;
  oilCapacity: number;
  sparkPlugModel: string | null;
  brakeFluidType: string | null;
  coolantType: string | null;
  tirePressureFront: number;
  tirePressureRear: number;
  tireSize: string | null;
  powerAndTorque: string | null;
  fuelType: string | null;
  averageConsumption: string | null;
  fuelTankCapacity: string | null;
  suspensionType: string | null;
  headlightBulb: string | null;
  trunkCapacity: string | null;
  otherRelevantData: string | null;
}

export interface MaintenanceItemStatus {
  type: string;
  status: VehicleHealthStatus;
  kmRemaining: number | null;
  daysRemaining: number | null;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  plate: string | null;
  mileage: number;
  maintenances: MaintenanceRecord[];
  specs: CarSpecs | null;
  status: VehicleHealthStatus;
  statusByType: MaintenanceItemStatus[];
}

export interface VehicleWithStatus extends Vehicle {
  status: VehicleHealthStatus;
  statusByType: MaintenanceItemStatus[];
}

export interface CarSpecReference {
  id: string;
  brand: string;
  model: string;
  engine: string;
}

export interface NewVehiclePayload {
  brand: string;
  model: string;
  year: number;
  engine: string;
  plate?: string;
  mileage: number;
}

export interface NewMaintenancePayload {
  vehicleId: string;
  type: string;
  description: string;
  mileageAtMaintenance: number;
  dateOfMaintenance: string;
  nextMaintenanceMileage: number | null;
  nextMaintenanceDate: string | null;
  notes: string | null;
  status: MaintenanceStatus;
  autoCreateNext: boolean;
}

export interface AlertCheckResult {
  message: string;
  url: string | null;
}
