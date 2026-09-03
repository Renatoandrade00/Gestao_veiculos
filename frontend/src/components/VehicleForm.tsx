import React, { useMemo, useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Alert } from './Alert';
import type { CarSpecReference, NewVehiclePayload } from '../types';

const OTHER = 'Outro';

interface VehicleFormProps {
  specs: CarSpecReference[];
  onSubmit: (payload: NewVehiclePayload) => Promise<void>;
  onCancel: () => void;
}

interface VehicleFormState {
  brand: string;
  model: string;
  year: string;
  engine: string;
  customBrand: string;
  customModel: string;
  customEngine: string;
  plate: string;
  mileage: string;
}

const INITIAL_FORM: VehicleFormState = {
  brand: '',
  model: '',
  year: '',
  engine: '',
  customBrand: '',
  customModel: '',
  customEngine: '',
  plate: '',
  mileage: '',
};

export const VehicleForm: React.FC<VehicleFormProps> = ({ specs, onSubmit, onCancel }) => {
  const [form, setForm] = useState<VehicleFormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof VehicleFormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Opções derivadas — memoizadas para não recalcular a cada tecla digitada
  const { brandOptions, modelOptions, engineOptions } = useMemo(() => {
    const withOther = (values: string[]) => [
      ...values.map((v) => ({ value: v, label: v })),
      { value: OTHER, label: 'Outro...' },
    ];

    const uniqueBrands = Array.from(new Set(specs.map((s) => s.brand))).sort();
    const modelsOfBrand = specs.filter((s) => s.brand === form.brand);
    const uniqueModels = Array.from(new Set(modelsOfBrand.map((s) => s.model))).sort();
    const enginesOfModel = modelsOfBrand.filter((s) => s.model === form.model);
    const uniqueEngines = Array.from(new Set(enginesOfModel.map((s) => s.engine))).sort();

    return {
      brandOptions: withOther(uniqueBrands),
      modelOptions: withOther(uniqueModels),
      engineOptions: withOther(uniqueEngines),
    };
  }, [specs, form.brand, form.model]);

  const handleSelectReference = (ref: CarSpecReference) => {
    setForm((f) => ({
      ...f,
      brand: ref.brand,
      model: ref.model,
      engine: ref.engine,
    }));
  };

  const handleBrandChange = (value: string) => {
    setForm((f) => ({
      ...f,
      brand: value,
      // Reset em cascata ao trocar a marca
      model: value === OTHER ? OTHER : '',
      engine: value === OTHER ? OTHER : '',
    }));
  };

  const handleModelChange = (value: string) => {
    setForm((f) => ({
      ...f,
      model: value,
      engine: value === OTHER ? OTHER : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalBrand = form.brand === OTHER ? form.customBrand : form.brand;
    const finalModel = form.model === OTHER ? form.customModel : form.model;
    const finalEngine = form.engine === OTHER ? form.customEngine : form.engine;

    if (!finalBrand || !finalModel || !finalEngine) {
      setError('Preencha a marca, modelo e motorização do veículo.');
      return;
    }

    const year = parseInt(form.year, 10);
    const mileage = parseInt(form.mileage, 10);
    if (Number.isNaN(year) || Number.isNaN(mileage)) {
      setError('Ano e quilometragem devem ser números válidos.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        brand: finalBrand,
        model: finalModel,
        year,
        engine: finalEngine,
        plate: form.plate || undefined,
        mileage,
      });
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Erro ao cadastrar veículo. Verifique os campos.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-emerald-900/30">
      <h2 className="text-lg font-semibold mb-4 font-sans text-slate-100">Novo Veículo</h2>

      {/* Quick reference autocomplete */}
      {specs.length > 0 && (
        <div className="mb-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Sugestões de Veículos Comuns (Seed):
          </span>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1.5 bg-slate-950 rounded-xl border border-slate-900">
            {specs.map((spec) => (
              <button
                key={spec.id}
                type="button"
                onClick={() => handleSelectReference(spec)}
                className="text-xs py-1 px-2.5 bg-slate-900 hover:bg-emerald-950/30 hover:border-emerald-800/40 border border-slate-800 rounded-lg text-slate-300 transition-colors"
              >
                {spec.brand} {spec.model} ({spec.engine})
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Select
            id="brand"
            label="Marca"
            value={form.brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            options={brandOptions}
            required
          />
          {form.brand === OTHER && (
            <Input
              id="customBrand"
              placeholder="Digite a marca"
              value={form.customBrand}
              onChange={(e) => setField('customBrand', e.target.value)}
              required
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Select
            id="model"
            label="Modelo"
            value={form.model}
            onChange={(e) => handleModelChange(e.target.value)}
            options={modelOptions}
            required
            disabled={!form.brand}
          />
          {(form.model === OTHER || form.brand === OTHER) && (
            <Input
              id="customModel"
              placeholder="Digite o modelo"
              value={form.customModel}
              onChange={(e) => setField('customModel', e.target.value)}
              required
            />
          )}
        </div>

        <Input
          id="year"
          type="number"
          label="Ano"
          placeholder="Ex: 2020"
          value={form.year}
          onChange={(e) => setField('year', e.target.value)}
          required
          min={1900}
          max={new Date().getFullYear() + 2}
        />

        <div className="flex flex-col gap-2">
          <Select
            id="engine"
            label="Motorização"
            value={form.engine}
            onChange={(e) => setField('engine', e.target.value)}
            options={engineOptions}
            required
            disabled={!form.model}
          />
          {(form.engine === OTHER || form.model === OTHER || form.brand === OTHER) && (
            <Input
              id="customEngine"
              placeholder="Digite a motorização"
              value={form.customEngine}
              onChange={(e) => setField('customEngine', e.target.value)}
              required
            />
          )}
        </div>
        <Input
          id="plate"
          label="Placa (Opcional)"
          placeholder="Ex: ABC1D23"
          value={form.plate}
          onChange={(e) => setField('plate', e.target.value)}
        />
        <Input
          id="mileage"
          type="number"
          label="Quilometragem Atual"
          placeholder="Ex: 45000"
          value={form.mileage}
          onChange={(e) => setField('mileage', e.target.value)}
          required
          min={0}
        />

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
            Salvar Veículo
          </Button>
        </div>
      </form>
    </Card>
  );
};
