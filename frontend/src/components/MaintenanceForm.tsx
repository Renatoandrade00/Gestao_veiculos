import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import { Sparkles } from 'lucide-react';
import type { NewMaintenancePayload, MaintenanceStatus } from '../types';

const MAINTENANCE_TYPES = [
  { value: 'Óleo', label: 'Troca de Óleo / Filtro' },
  { value: 'Pneus', label: 'Alinhamento / Balanceamento / Pneus' },
  { value: 'Pastilhas', label: 'Freios (Pastilhas / Discos / Fluido)' },
  { value: 'Filtros', label: 'Filtros (Ar / Cabine / Combustível)' },
  { value: 'Geral', label: 'Revisão Geral / Mecânica' },
];

interface MaintenanceFormProps {
  vehicleId: string;
  currentMileage: number;
  onSubmit: (payload: NewMaintenancePayload) => Promise<void>;
  onCancel: () => void;
}

interface MaintenanceFormState {
  type: string;
  description: string;
  mileageAtMaintenance: string;
  dateOfMaintenance: string;
  nextMaintenanceMileage: string;
  nextMaintenanceDate: string;
  notes: string;
  status: MaintenanceStatus;
  autoCreateNext: boolean;
}

const createInitialState = (currentMileage: number): MaintenanceFormState => ({
  type: 'Óleo',
  description: '',
  mileageAtMaintenance: currentMileage.toString(),
  dateOfMaintenance: new Date().toISOString().split('T')[0],
  nextMaintenanceMileage: '',
  nextMaintenanceDate: '',
  notes: '',
  status: 'COMPLETED',
  autoCreateNext: false,
});

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  vehicleId,
  currentMileage,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<MaintenanceFormState>(() =>
    createInitialState(currentMileage)
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof MaintenanceFormState>(
    field: K,
    value: MaintenanceFormState[K]
  ) => setForm((f) => ({ ...f, [field]: value }));

  // Preenche dados recomendados de KM/Mês para troca futura de óleo
  const handleAutoFillOil = () => {
    const currentKm = parseInt(form.mileageAtMaintenance, 10) || currentMileage;
    setForm((f) => ({
      ...f,
      nextMaintenanceMileage: (currentKm + 10000).toString(),
      nextMaintenanceDate: (() => {
        const nextD = new Date(form.dateOfMaintenance);
        nextD.setFullYear(nextD.getFullYear() + 1);
        return nextD.toISOString().split('T')[0];
      })(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const mileage = parseInt(form.mileageAtMaintenance, 10);
    if (Number.isNaN(mileage)) {
      setError('Quilometragem inválida.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        vehicleId,
        type: form.type,
        description: form.description,
        mileageAtMaintenance: mileage,
        // Envia como data local sem deslocamento UTC
        dateOfMaintenance: new Date(`${form.dateOfMaintenance}T12:00:00`).toISOString(),
        nextMaintenanceMileage: form.nextMaintenanceMileage
          ? parseInt(form.nextMaintenanceMileage, 10)
          : null,
        nextMaintenanceDate: form.nextMaintenanceDate
          ? new Date(`${form.nextMaintenanceDate}T12:00:00`).toISOString()
          : null,
        notes: form.notes || null,
        status: form.status,
        autoCreateNext: form.autoCreateNext,
      });

      // Reset após sucesso
      setForm(createInitialState(currentMileage));
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Erro ao registrar manutenção.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-emerald-950/30">
      <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 font-sans">
        Registrar Serviço ou Agendamento
      </h4>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maintenance-type" className="text-sm font-medium text-slate-400">Tipo de Manutenção</label>
          <select
            id="maintenance-type"
            value={form.type}
            onChange={(e) => setField('type', e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {MAINTENANCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <Input
          id="description"
          label="Descrição do Serviço"
          placeholder="Ex: Troca de óleo 5W30 sintético e filtro de óleo"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          required
        />

        <Input
          id="mileageAtMaintenance"
          type="number"
          label="Quilometragem no Serviço"
          value={form.mileageAtMaintenance}
          onChange={(e) => setField('mileageAtMaintenance', e.target.value)}
          required
          min={0}
        />

        <Input
          id="dateOfMaintenance"
          type="date"
          label="Data do Serviço"
          value={form.dateOfMaintenance}
          onChange={(e) => setField('dateOfMaintenance', e.target.value)}
          required
        />

        <div className="sm:col-span-2 border-t border-slate-900 pt-4 mt-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lembrete de Vencimento</h5>
            {form.type === 'Óleo' && (
              <button
                type="button"
                onClick={handleAutoFillOil}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5"
              >
                <Sparkles size={12} /> Auto-sugerir (10.000km / 1 ano)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="nextMaintenanceMileage"
              type="number"
              label="Próxima Troca (Quilometragem)"
              placeholder="Ex: 55000"
              value={form.nextMaintenanceMileage}
              onChange={(e) => setField('nextMaintenanceMileage', e.target.value)}
              min={0}
            />

            <Input
              id="nextMaintenanceDate"
              type="date"
              label="Próxima Troca (Data Limite)"
              value={form.nextMaintenanceDate}
              onChange={(e) => setField('nextMaintenanceDate', e.target.value)}
            />
          </div>
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-slate-400">Observações (Opcional)</label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Status */}
        <fieldset className="sm:col-span-2 flex flex-wrap gap-6 items-center bg-slate-950 p-3 rounded-xl border border-slate-900">
          <div className="flex items-center gap-4">
            <legend className="text-xs font-bold text-slate-400 uppercase">Status do Registro:</legend>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="status"
                checked={form.status === 'COMPLETED'}
                onChange={() => setField('status', 'COMPLETED')}
                className="text-emerald-500 focus:ring-0"
              />
              Realizado
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="status"
                checked={form.status === 'PENDING'}
                onChange={() => setField('status', 'PENDING')}
                className="text-emerald-500 focus:ring-0"
              />
              Agendado (Lembrete)
            </label>
          </div>

          {form.status === 'COMPLETED' && (
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-400 ml-auto select-none">
              <input
                type="checkbox"
                checked={form.autoCreateNext}
                onChange={(e) => setField('autoCreateNext', e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0"
              />
              Criar lembrete agendado automaticamente?
            </label>
          )}
        </fieldset>

        <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={submitting}
            className="sm:w-auto"
          >
            Confirmar Registro
          </Button>
        </div>
      </form>
    </Card>
  );
};
