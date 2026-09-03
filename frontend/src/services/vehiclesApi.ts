import api from './api';
import type {
  User,
  Vehicle,
  VehicleWithStatus,
  CarSpecReference,
  NewVehiclePayload,
  NewMaintenancePayload,
  MaintenanceRecord,
} from '../types';

// ─── Auth ───────────────────────────────────────

export async function loginRequest(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
  return response.data;
}

export async function registerRequest(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password });
  return response.data;
}

export async function getProfile(): Promise<User> {
  const response = await api.get<User>('/auth/profile');
  return response.data;
}

// ─── Veículos ───────────────────────────────────

export async function getVehicles(signal?: AbortSignal): Promise<VehicleWithStatus[]> {
  const response = await api.get<VehicleWithStatus[]>('/vehicles', { signal });
  return response.data;
}

export async function getVehicleById(id: string, signal?: AbortSignal): Promise<Vehicle> {
  const response = await api.get<Vehicle>(`/vehicles/${id}`, { signal });
  return response.data;
}

export async function createVehicle(payload: NewVehiclePayload): Promise<Vehicle> {
  const response = await api.post<Vehicle>('/vehicles', payload);
  return response.data;
}

export async function updateVehicleMileage(id: string, mileage: number): Promise<Vehicle> {
  const response = await api.put<Vehicle>(`/vehicles/${id}`, { mileage });
  return response.data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`/vehicles/${id}`);
}

export async function getCarSpecsReferences(signal?: AbortSignal): Promise<CarSpecReference[]> {
  const response = await api.get<CarSpecReference[]>('/vehicles/specs', { signal });
  return response.data;
}

// ─── Manutenções ────────────────────────────────

export async function createMaintenance(payload: NewMaintenancePayload): Promise<{ record: MaintenanceRecord }> {
  const response = await api.post<{ record: MaintenanceRecord }>('/maintenances', payload);
  return response.data;
}

export async function deleteMaintenance(id: string): Promise<void> {
  await api.delete(`/maintenances/${id}`);
}

export async function checkAlerts(): Promise<{ alertsSent: number }> {
  const response = await api.post<{ alertsSent: number }>('/maintenances/check-alerts');
  return response.data;
}
