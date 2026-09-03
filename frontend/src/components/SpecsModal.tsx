import React from 'react';
import { Modal } from './Modal';
import type { Vehicle } from '../types';

interface SpecsModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

function SpecRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-200 font-medium text-right ml-4">{value || 'N/D'}</span>
    </div>
  );
}

export const SpecsModal: React.FC<SpecsModalProps> = ({ open, onClose, vehicle }) => {
  const specs = vehicle.specs;
  if (!specs) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ficha Técnica Detalhada"
      subtitle={`${vehicle.brand} ${vehicle.model} - ${vehicle.engine}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
        <div>
          <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1">Motorização & Desempenho</h4>
          <div className="space-y-2.5">
            <SpecRow label="Motor" value={vehicle.engine} />
            <SpecRow label="Potência / Torque" value={specs.powerAndTorque} />
            <SpecRow label="Combustível" value={specs.fuelType} />
            <SpecRow label="Consumo Médio" value={specs.averageConsumption} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1">Manutenção Vital</h4>
          <div className="space-y-2.5">
            <SpecRow label="Óleo Motor" value={specs.recommendedOil} />
            <SpecRow label="Capacidade Óleo" value={`${specs.oilCapacity} L`} />
            <SpecRow label="Velas Ignição" value={specs.sparkPlugModel} />
            <SpecRow label="Aditivo Radiador" value={specs.coolantType} />
            <SpecRow label="Fluido Freio" value={specs.brakeFluidType} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1">Chassi & Suspensão</h4>
          <div className="space-y-2.5">
            <SpecRow label="Pneus (Medidas)" value={specs.tireSize} />
            <SpecRow label="Pressão (D/T)" value={`${specs.tirePressureFront} / ${specs.tirePressureRear} PSI`} />
            <SpecRow label="Suspensão" value={specs.suspensionType} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1">Estrutura & Elétrica</h4>
          <div className="space-y-2.5">
            <SpecRow label="Tanque" value={specs.fuelTankCapacity} />
            <SpecRow label="Porta-Malas" value={specs.trunkCapacity} />
            <SpecRow label="Lâmpada Farol" value={specs.headlightBulb} />
            <SpecRow label="Outros" value={specs.otherRelevantData} />
          </div>
        </div>
      </div>
    </Modal>
  );
};
