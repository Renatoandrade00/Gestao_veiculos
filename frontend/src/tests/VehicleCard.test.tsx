import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VehicleCard } from '../components/VehicleCard';
import type { VehicleWithStatus } from '../types';

function makeVehicle(overrides: Partial<VehicleWithStatus> = {}): VehicleWithStatus {
  return {
    id: '123',
    brand: 'Fiat',
    model: 'Argo',
    year: 2022,
    engine: '1.0 Firefly',
    plate: 'ABC1D23',
    mileage: 30000,
    maintenances: [],
    specs: null,
    status: 'ok',
    statusByType: [],
    ...overrides,
  };
}

function renderCard(vehicle: VehicleWithStatus) {
  return render(
    <MemoryRouter>
      <VehicleCard vehicle={vehicle} />
    </MemoryRouter>
  );
}

describe('VehicleCard', () => {
  it('renderiza marca, modelo e placa', () => {
    renderCard(makeVehicle());
    expect(screen.getByText('Fiat Argo')).toBeInTheDocument();
    expect(screen.getByText('ABC1D23')).toBeInTheDocument();
  });

  it('mostra badge "Em dia" quando status ok', () => {
    renderCard(makeVehicle({ status: 'ok' }));
    expect(screen.getByText('Em dia')).toBeInTheDocument();
  });

  it('mostra badge "Próxima" quando status warning', () => {
    renderCard(makeVehicle({ status: 'warning' }));
    expect(screen.getByText('Próxima')).toBeInTheDocument();
  });

  it('mostra badge "Vencida" quando status overdue', () => {
    renderCard(makeVehicle({ status: 'overdue' }));
    expect(screen.getByText('Vencida')).toBeInTheDocument();
  });

  it('é um link acessível para a página de detalhes', () => {
    renderCard(makeVehicle({ id: 'xyz' }));
    const link = screen.getByRole('link', { name: /ver detalhes do veículo fiat argo/i });
    expect(link).toHaveAttribute('href', '/vehicle/xyz');
  });

  it('exibe "Sem placa" quando não há placa', () => {
    renderCard(makeVehicle({ plate: null }));
    expect(screen.getByText('Sem placa')).toBeInTheDocument();
  });
});
