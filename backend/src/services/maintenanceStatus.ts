// Regra de negócio central: cálculo do status de manutenção (ok/warning/overdue).
// Fonte única de verdade usada tanto pelos endpoints de veículos quanto pelos alertas.

export type MaintenanceStatus = 'COMPLETED' | 'PENDING';
export type VehicleHealthStatus = 'ok' | 'warning' | 'overdue';

export const WARNING_KM_THRESHOLD = 1000;
export const WARNING_DAYS_THRESHOLD = 30;

export interface MaintenanceLike {
  type: string;
  status: string;
  dateOfMaintenance: Date;
  nextMaintenanceMileage: number | null;
  nextMaintenanceDate: Date | null;
}

export interface ItemStatus {
  type: string;
  status: VehicleHealthStatus;
  kmRemaining: number | null;
  daysRemaining: number | null;
}

/**
 * Agrupa manutenções por tipo e retorna o registro mais relevante de cada tipo.
 * Desempate: data mais recente vence; em caso de empate, prioriza PENDING e
 * registros com agendamento futuro definido.
 */
export function pickLatestByType<T extends MaintenanceLike>(maintenances: T[]): Map<string, T> {
  const latestByType = new Map<string, T>();

  for (const maintenance of maintenances) {
    const existing = latestByType.get(maintenance.type);
    if (!existing) {
      latestByType.set(maintenance.type, maintenance);
      continue;
    }

    const mDate = new Date(maintenance.dateOfMaintenance).getTime();
    const existingDate = new Date(existing.dateOfMaintenance).getTime();

    if (mDate > existingDate) {
      latestByType.set(maintenance.type, maintenance);
    } else if (mDate === existingDate) {
      if (maintenance.status === 'PENDING' && existing.status !== 'PENDING') {
        latestByType.set(maintenance.type, maintenance);
      } else if (maintenance.status === existing.status) {
        const hasSchedule = (m: MaintenanceLike) =>
          Boolean(m.nextMaintenanceMileage || m.nextMaintenanceDate);
        if (hasSchedule(maintenance) && !hasSchedule(existing)) {
          latestByType.set(maintenance.type, maintenance);
        }
      }
    }
  }

  return latestByType;
}

/**
 * Calcula o status de um item de manutenção com base na quilometragem atual
 * do veículo e na data de referência (agora).
 */
export function calculateItemStatus(
  maintenance: MaintenanceLike,
  currentMileage: number,
  now: Date = new Date()
): ItemStatus | null {
  const { nextMaintenanceMileage, nextMaintenanceDate } = maintenance;

  if (!nextMaintenanceMileage && !nextMaintenanceDate) return null;

  let status: VehicleHealthStatus = 'ok';
  let kmRemaining: number | null = null;
  let daysRemaining: number | null = null;

  if (nextMaintenanceMileage) {
    kmRemaining = nextMaintenanceMileage - currentMileage;
    if (kmRemaining <= 0) status = 'overdue';
    else if (kmRemaining <= WARNING_KM_THRESHOLD) status = 'warning';
  }

  if (nextMaintenanceDate) {
    const timeRemaining = new Date(nextMaintenanceDate).getTime() - now.getTime();
    daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 0) status = 'overdue';
    else if (daysRemaining <= WARNING_DAYS_THRESHOLD && status !== 'overdue') status = 'warning';
  }

  return { type: maintenance.type, status, kmRemaining, daysRemaining };
}

/**
 * Calcula o status geral do veículo e o status por tipo de manutenção.
 */
export function calculateVehicleStatus(
  maintenances: MaintenanceLike[],
  currentMileage: number,
  now: Date = new Date()
): { overall: VehicleHealthStatus; items: ItemStatus[] } {
  const latestByType = pickLatestByType(maintenances);
  const items: ItemStatus[] = [];
  let overall: VehicleHealthStatus = 'ok';

  for (const maintenance of latestByType.values()) {
    const itemStatus = calculateItemStatus(maintenance, currentMileage, now);
    if (!itemStatus) continue;

    items.push(itemStatus);

    if (itemStatus.status === 'overdue') {
      overall = 'overdue';
    } else if (itemStatus.status === 'warning' && overall !== 'overdue') {
      overall = 'warning';
    }
  }

  return { overall, items };
}

export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
