import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gauge, CheckCircle, AlertTriangle } from 'lucide-react';
import type { VehicleWithStatus } from '../types';

interface VehicleCardProps {
  vehicle: VehicleWithStatus;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const status = vehicle.status;

  return (
    <Link
      to={`/vehicle/${vehicle.id}`}
      className="cockpit-card hover:border-emerald-500/40 flex flex-col justify-between group relative overflow-hidden p-5 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      aria-label={`Ver detalhes do veículo ${vehicle.brand} ${vehicle.model}`}
    >
      {/* Speed Stripes Backing Accent */}
      <div className="absolute inset-0 speed-stripes opacity-30 pointer-events-none" />

      {/* Status Indicator Bar */}
      <div className={`absolute top-0 right-0 left-0 h-1 ${
        status === 'overdue' ? 'bg-gradient-to-r from-rose-600 to-rose-400 animate-pulse' :
        status === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 'bg-gradient-to-r from-emerald-500 to-emerald-300'
      }`} />

      <div className="flex justify-between items-start pt-1 relative z-10">
        <div>
          <h3 className="text-lg font-extrabold text-slate-100 font-sans group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
            {vehicle.brand} {vehicle.model}
          </h3>
          <span className="text-xs bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900 text-slate-400 font-medium font-mono uppercase tracking-wider">
            {vehicle.plate || 'Sem placa'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {status === 'overdue' && (
            <span className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-950/20 px-2 py-1 rounded-lg">
              <AlertTriangle size={12} aria-hidden="true" /> Vencida
            </span>
          )}
          {status === 'warning' && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-950/20 px-2 py-1 rounded-lg">
              <AlertTriangle size={12} aria-hidden="true" /> Próxima
            </span>
          )}
          {status === 'ok' && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-950/20 px-2 py-1 rounded-lg">
              <CheckCircle size={12} aria-hidden="true" /> Em dia
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-900 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Gauge size={16} className="text-emerald-500" aria-hidden="true" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Odômetro</span>
            <strong className="text-slate-300 font-mono">{vehicle.mileage.toLocaleString('pt-BR')} km</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={16} className="text-emerald-500" aria-hidden="true" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Ano/Motor</span>
            <strong className="text-slate-300 font-mono">{vehicle.year} • {vehicle.engine}</strong>
          </div>
        </div>
      </div>

      {vehicle.specs && (
        <div className="mt-4 p-2 bg-slate-950 rounded-lg text-xs text-slate-500 flex flex-col gap-1 border border-slate-900/50">
          <span><strong>Óleo:</strong> {vehicle.specs.recommendedOil}</span>
          <span><strong>Calibragem:</strong> F:{vehicle.specs.tirePressureFront} / R:{vehicle.specs.tirePressureRear} PSI</span>
        </div>
      )}
    </Link>
  );
};
