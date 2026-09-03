import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getVehicleById,
  updateVehicleMileage,
  deleteVehicle,
  createMaintenance,
  deleteMaintenance,
} from '../services/vehiclesApi';
import { getApiErrorMessage } from '../services/api';
import { Header } from '../components/Header';
import { MaintenanceForm } from '../components/MaintenanceForm';
import { SpecsModal } from '../components/SpecsModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { FullScreenSpinner } from '../components/Spinner';
import { useToast } from '../components/Toast';
import {
  Trash2, Edit3, Plus, Gauge,
  CheckCircle, Clock, Sparkles,
} from 'lucide-react';
import type { Vehicle, NewMaintenancePayload } from '../types';

// Evita o deslocamento de 1 dia no parse de YYYY-MM-DD (que usa UTC)
function formatDate(dateStr: string): string {
  const [datePart] = dateStr.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}

export const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form de Manutenção
  const [showAddForm, setShowAddForm] = useState(false);

  // Edição de KM do veículo
  const [isEditingKm, setIsEditingKm] = useState(false);
  const [newKm, setNewKm] = useState('');
  const [updatingKm, setUpdatingKm] = useState(false);

  // Ficha técnica completa
  const [showSpecsModal, setShowSpecsModal] = useState(false);

  // Confirmações de exclusão
  const [confirmDeleteVehicle, setConfirmDeleteVehicle] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<string | null>(null);

  const fetchVehicle = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;
    try {
      const data = await getVehicleById(id, signal);
      setVehicle(data);
      setNewKm(data.mileage.toString());
      setError(null);
    } catch (err) {
      if ((err as { name?: string }).name === 'CanceledError') return;
      setError(getApiErrorMessage(err, 'Não foi possível carregar os detalhes do veículo.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    fetchVehicle(controller.signal);
    return () => controller.abort();
  }, [fetchVehicle]);

  const handleDeleteVehicle = async () => {
    if (!id) return;
    try {
      await deleteVehicle(id);
      showToast('success', 'Veículo excluído com sucesso.');
      navigate('/');
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Erro ao excluir veículo.'));
    } finally {
      setConfirmDeleteVehicle(false);
    }
  };

  const handleUpdateKm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !id) return;
    const km = parseInt(newKm, 10);
    if (Number.isNaN(km) || km < 0) {
      showToast('error', 'Quilometragem inválida.');
      return;
    }
    setUpdatingKm(true);
    try {
      // Update parcial: envia apenas a quilometragem
      await updateVehicleMileage(id, km);
      setIsEditingKm(false);
      showToast('success', 'Quilometragem atualizada!');
      await fetchVehicle();
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Erro ao atualizar quilometragem.'));
    } finally {
      setUpdatingKm(false);
    }
  };

  const handleAddMaintenance = async (payload: NewMaintenancePayload) => {
    try {
      await createMaintenance(payload);
      setShowAddForm(false);
      showToast('success', 'Manutenção registrada com sucesso!');
      await fetchVehicle();
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Erro ao registrar manutenção.'), { cause: err });
    }
  };

  const handleDeleteMaintenance = async () => {
    if (!maintenanceToDelete) return;
    try {
      await deleteMaintenance(maintenanceToDelete);
      showToast('success', 'Registro excluído.');
      await fetchVehicle();
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Erro ao deletar registro.'));
    } finally {
      setMaintenanceToDelete(null);
    }
  };

  if (loading) {
    return <FullScreenSpinner label="Carregando detalhes..." />;
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Alert type="error" title="Erro" className="max-w-md">
          {error || 'Veículo não encontrado.'}
        </Alert>
        <Button onClick={() => navigate('/')} className="mt-4 w-auto">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header
        title={`${vehicle.brand} ${vehicle.model}`}
        onBack={() => navigate('/')}
        action={
          <button
            onClick={() => setConfirmDeleteVehicle(true)}
            className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-900 rounded-xl transition-colors"
            aria-label="Excluir veículo"
          >
            <Trash2 size={16} />
          </button>
        }
      />

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Car Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 cockpit-card flex flex-col justify-between relative overflow-hidden p-6 rounded-xl shadow-lg">
            {/* Speed Stripes Overlay */}
            <div className="absolute inset-0 speed-stripes opacity-20 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Veículo</span>
                  <h2 className="text-2xl font-extrabold text-slate-100 font-sans mt-0.5 uppercase tracking-tight">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                  <span className="text-xs bg-slate-950/80 px-2.5 py-1 rounded text-slate-400 font-mono uppercase border border-slate-900 inline-block mt-2">
                    {vehicle.plate || 'Sem Placa'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Ano / Motor</span>
                  <span className="text-sm font-semibold text-slate-300 block mt-1 font-mono">
                    {vehicle.year} • {vehicle.engine}
                  </span>
                </div>
              </div>

              {/* Odometer section */}
              <div className="mt-8 pt-4 border-t border-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gauge size={22} className="text-emerald-400" aria-hidden="true" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Odômetro</span>
                    {isEditingKm ? (
                      <form onSubmit={handleUpdateKm} className="flex gap-2 items-center mt-1">
                        <input
                          type="number"
                          value={newKm}
                          onChange={(e) => setNewKm(e.target.value)}
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                          required
                          min={0}
                          aria-label="Nova quilometragem"
                        />
                        <Button type="submit" isLoading={updatingKm} className="py-1 px-3 text-xs w-auto">Salvar</Button>
                        <button type="button" onClick={() => setIsEditingKm(false)} className="text-xs text-slate-400 underline">Cancelar</button>
                      </form>
                    ) : (
                      <strong className="text-xl font-mono text-slate-200 tracking-tight">
                        {vehicle.mileage.toLocaleString('pt-BR')} km
                      </strong>
                    )}
                  </div>
                </div>

                {!isEditingKm && (
                  <button
                    onClick={() => setIsEditingKm(true)}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900/50 rounded-xl transition-colors"
                    aria-label="Editar quilometragem"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specs Card */}
          <div className="cockpit-card border-l-emerald-600 bg-slate-900/40 p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 speed-stripes opacity-10 pointer-events-none" />
            <div className="flex justify-between items-center mb-4 border-b border-slate-900/60 pb-2 relative z-10">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Painel Técnico</h3>
              {vehicle.specs && (
                <button
                  onClick={() => setShowSpecsModal(true)}
                  className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1.5 rounded hover:bg-emerald-500/20 transition-colors uppercase font-bold tracking-wider flex items-center gap-1.5"
                >
                  <Sparkles size={12} /> Ficha Completa
                </button>
              )}
            </div>
            {vehicle.specs ? (
              <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Óleo Recomendado</span>
                  <span className="font-semibold text-right">{vehicle.specs.recommendedOil}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Capacidade do Cárter</span>
                  <span className="font-semibold">{vehicle.specs.oilCapacity} L</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Pressão Pneus (D/T)</span>
                  <span className="font-semibold">{vehicle.specs.tirePressureFront} / {vehicle.specs.tirePressureRear} PSI</span>
                </div>
                {vehicle.specs.sparkPlugModel && (
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Velas de Ignição</span>
                    <span className="font-semibold">{vehicle.specs.sparkPlugModel}</span>
                  </div>
                )}
                {vehicle.specs.brakeFluidType && (
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Fluido de Freio</span>
                    <span className="font-semibold">{vehicle.specs.brakeFluidType}</span>
                  </div>
                )}
                {vehicle.specs.coolantType && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aditivo Radiador</span>
                    <span className="font-semibold text-right max-w-[150px] truncate" title={vehicle.specs.coolantType}>
                      {vehicle.specs.coolantType}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-6 text-center">
                Especificações de referência não encontradas para este modelo.
              </div>
            )}
          </div>
        </div>

        {/* Section Title */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-2 mt-4">
          <div>
            <h3 className="text-lg font-bold font-sans text-slate-100">Histórico de Manutenção</h3>
            <p className="text-xs text-slate-400">Serviços realizados ou agendados</p>
          </div>

          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-auto px-4 py-2 text-xs"
          >
            <Plus size={14} /> Registrar Manutenção
          </Button>
        </div>

        {/* Form Add Maintenance */}
        {showAddForm && (
          <MaintenanceForm
            vehicleId={vehicle.id}
            currentMileage={vehicle.mileage}
            onSubmit={handleAddMaintenance}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* History list */}
        {vehicle.maintenances.length === 0 ? (
          <div className="text-center py-12 text-slate-500 italic bg-slate-900/20 border border-slate-900 rounded-2xl">
            Nenhuma manutenção registrada para este veículo.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {vehicle.maintenances.map((record) => {
              const isPending = record.status === 'PENDING';
              return (
                <Card
                  key={record.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border transition-all hover:border-slate-800 ${
                    isPending ? 'border-amber-900/30 bg-amber-950/5' : 'border-slate-900/80 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-1 ${
                      isPending ? 'bg-amber-950/50 text-amber-500' : 'bg-emerald-950/50 text-emerald-500'
                    }`}>
                      {isPending ? <Clock size={16} aria-hidden="true" /> : <CheckCircle size={16} aria-hidden="true" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-200 font-sans text-sm">
                          {record.type}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          • {formatDate(record.dateOfMaintenance)}
                        </span>
                        {isPending && (
                          <span className="text-[9px] font-bold bg-amber-900/30 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/40">
                            AGENDADO
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{record.description}</p>

                      {/* Vencimento stats */}
                      {(record.nextMaintenanceMileage || record.nextMaintenanceDate) && (
                        <div className="flex gap-4 mt-2 text-[10px] font-medium text-slate-500 font-mono">
                          {record.nextMaintenanceMileage && (
                            <span>Vence em: {record.nextMaintenanceMileage.toLocaleString('pt-BR')} km</span>
                          )}
                          {record.nextMaintenanceDate && (
                            <span>Data limite: {formatDate(record.nextMaintenanceDate)}</span>
                          )}
                        </div>
                      )}

                      {record.notes && (
                        <span className="text-[10px] text-slate-500 italic block mt-1.5 border-l border-slate-800 pl-2">
                          Obs: {record.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-end items-center sm:items-end gap-2 border-t sm:border-t-0 border-slate-950 pt-2 sm:pt-0">
                    <span className="text-xs font-mono text-slate-400">
                      {record.mileageAtMaintenance.toLocaleString('pt-BR')} km
                    </span>
                    <button
                      onClick={() => setMaintenanceToDelete(record.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-slate-950 rounded-lg transition-colors ml-auto sm:ml-0"
                      aria-label={`Excluir registro de ${record.type}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Modais */}
      <SpecsModal
        open={showSpecsModal}
        onClose={() => setShowSpecsModal(false)}
        vehicle={vehicle}
      />

      <ConfirmModal
        open={confirmDeleteVehicle}
        title="Excluir Veículo"
        message={`Tem certeza que deseja excluir o ${vehicle.brand} ${vehicle.model} e todo o seu histórico de manutenções? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteVehicle}
        onCancel={() => setConfirmDeleteVehicle(false)}
      />

      <ConfirmModal
        open={maintenanceToDelete !== null}
        title="Excluir Registro"
        message="Excluir este registro de manutenção? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDeleteMaintenance}
        onCancel={() => setMaintenanceToDelete(null)}
      />
    </div>
  );
};
