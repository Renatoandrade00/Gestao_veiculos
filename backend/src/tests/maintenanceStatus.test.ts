import { describe, it, expect } from 'vitest';
import {
  pickLatestByType,
  calculateItemStatus,
  calculateVehicleStatus,
  daysUntil,
  WARNING_KM_THRESHOLD,
  WARNING_DAYS_THRESHOLD,
  MaintenanceLike,
} from '../services/maintenanceStatus';

function makeMaintenance(overrides: Partial<MaintenanceLike> = {}): MaintenanceLike {
  return {
    type: 'Óleo',
    status: 'COMPLETED',
    dateOfMaintenance: new Date('2026-01-15'),
    nextMaintenanceMileage: null,
    nextMaintenanceDate: null,
    ...overrides,
  };
}

const NOW = new Date('2026-09-01T12:00:00Z');

describe('pickLatestByType', () => {
  it('retorna o registro mais recente por tipo', () => {
    const older = makeMaintenance({ dateOfMaintenance: new Date('2026-01-01') });
    const newer = makeMaintenance({ dateOfMaintenance: new Date('2026-06-01') });
    const result = pickLatestByType([older, newer]);
    expect(result.get('Óleo')).toBe(newer);
  });

  it('prioriza PENDING quando as datas coincidem', () => {
    const completed = makeMaintenance({ status: 'COMPLETED', dateOfMaintenance: new Date('2026-01-01') });
    const pending = makeMaintenance({ status: 'PENDING', dateOfMaintenance: new Date('2026-01-01') });
    const result = pickLatestByType([completed, pending]);
    expect(result.get('Óleo')?.status).toBe('PENDING');
  });

  it('prioriza registro com agendamento futuro em empate de status', () => {
    const withoutSchedule = makeMaintenance({ dateOfMaintenance: new Date('2026-01-01') });
    const withSchedule = makeMaintenance({
      dateOfMaintenance: new Date('2026-01-01'),
      nextMaintenanceMileage: 50000,
    });
    const result = pickLatestByType([withoutSchedule, withSchedule]);
    expect(result.get('Óleo')?.nextMaintenanceMileage).toBe(50000);
  });

  it('mantém tipos distintos separados', () => {
    const oil = makeMaintenance({ type: 'Óleo' });
    const tires = makeMaintenance({ type: 'Pneus' });
    const result = pickLatestByType([oil, tires]);
    expect(result.size).toBe(2);
  });
});

describe('calculateItemStatus', () => {
  it('retorna null quando não há agendamento definido', () => {
    const m = makeMaintenance();
    expect(calculateItemStatus(m, 10000, NOW)).toBeNull();
  });

  it('retorna overdue quando a quilometragem foi ultrapassada', () => {
    const m = makeMaintenance({ nextMaintenanceMileage: 50000 });
    const status = calculateItemStatus(m, 51000, NOW);
    expect(status?.status).toBe('overdue');
    expect(status?.kmRemaining).toBe(-1000);
  });

  it('retorna warning dentro do threshold de km', () => {
    const m = makeMaintenance({ nextMaintenanceMileage: 50000 });
    const status = calculateItemStatus(m, 49500, NOW);
    expect(status?.status).toBe('warning');
    expect(status?.kmRemaining).toBe(500);
  });

  it(`retorna warning a exatamente ${WARNING_KM_THRESHOLD} km do vencimento`, () => {
    const m = makeMaintenance({ nextMaintenanceMileage: 50000 });
    const status = calculateItemStatus(m, 49000, NOW);
    expect(status?.status).toBe('warning');
  });

  it('retorna ok acima do threshold de km', () => {
    const m = makeMaintenance({ nextMaintenanceMileage: 50000 });
    const status = calculateItemStatus(m, 40000, NOW);
    expect(status?.status).toBe('ok');
  });

  it('retorna overdue quando a data limite passou', () => {
    const m = makeMaintenance({ nextMaintenanceDate: new Date('2026-08-01') });
    const status = calculateItemStatus(m, 10000, NOW);
    expect(status?.status).toBe('overdue');
    expect(status?.daysRemaining).toBeLessThanOrEqual(0);
  });

  it(`retorna warning a ${WARNING_DAYS_THRESHOLD} dias do vencimento`, () => {
    const future = new Date(NOW);
    future.setDate(future.getDate() + WARNING_DAYS_THRESHOLD);
    const m = makeMaintenance({ nextMaintenanceDate: future });
    const status = calculateItemStatus(m, 10000, NOW);
    expect(status?.status).toBe('warning');
  });

  it('km overdue vence mesmo com data futura ok', () => {
    const m = makeMaintenance({
      nextMaintenanceMileage: 50000,
      nextMaintenanceDate: new Date('2027-01-01'),
    });
    const status = calculateItemStatus(m, 55000, NOW);
    expect(status?.status).toBe('overdue');
  });
});

describe('calculateVehicleStatus', () => {
  it('sem manutenções retorna ok', () => {
    const { overall, items } = calculateVehicleStatus([], 0, NOW);
    expect(overall).toBe('ok');
    expect(items).toHaveLength(0);
  });

  it('um único item overdue torna o veículo overdue', () => {
    const maintenances = [
      makeMaintenance({ type: 'Óleo', nextMaintenanceMileage: 40000 }),
      makeMaintenance({ type: 'Pneus', nextMaintenanceMileage: 60000 }),
    ];
    const { overall, items } = calculateVehicleStatus(maintenances, 50000, NOW);
    expect(overall).toBe('overdue');
    expect(items).toHaveLength(2);
  });

  it('item warning sem overdue retorna warning geral', () => {
    const maintenances = [
      makeMaintenance({ type: 'Óleo', nextMaintenanceMileage: 50000 }),
      makeMaintenance({ type: 'Pneus', nextMaintenanceMileage: 60000 }),
    ];
    const { overall } = calculateVehicleStatus(maintenances, 49500, NOW);
    expect(overall).toBe('warning');
  });

  it('ignora histórico antigo: usa apenas o registro mais recente do tipo', () => {
    const old = makeMaintenance({
      dateOfMaintenance: new Date('2024-01-01'),
      nextMaintenanceMileage: 30000,
    });
    const recent = makeMaintenance({
      dateOfMaintenance: new Date('2026-08-01'),
      nextMaintenanceMileage: 80000,
    });
    const { overall, items } = calculateVehicleStatus([old, recent], 50000, NOW);
    expect(items).toHaveLength(1);
    expect(overall).toBe('ok');
  });

  it('ignora manutenções sem próxima referência', () => {
    const maintenances = [makeMaintenance({ type: 'Óleo' })];
    const { overall, items } = calculateVehicleStatus(maintenances, 0, NOW);
    expect(overall).toBe('ok');
    expect(items).toHaveLength(0);
  });
});

describe('daysUntil', () => {
  it('calcula dias restantes corretamente', () => {
    const future = new Date('2026-09-11T12:00:00Z');
    expect(daysUntil(future, NOW)).toBe(10);
  });

  it('retorna negativo para datas passadas', () => {
    const past = new Date('2026-08-31T12:00:00Z');
    expect(daysUntil(past, NOW)).toBeLessThanOrEqual(-1);
  });
});
