import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Alert } from '../components/Alert';
import { 
  ArrowLeft, Trash2, Edit3, Plus, Gauge, 
  CheckCircle, Clock, Sparkles 
} from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  type: string;
  description: string;
  mileageAtMaintenance: number;
  dateOfMaintenance: string;
  nextMaintenanceMileage: number | null;
  nextMaintenanceDate: string | null;
  notes: string | null;
  status: 'COMPLETED' | 'PENDING';
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  plate: string | null;
  mileage: number;
  maintenances: MaintenanceRecord[];
  specs: {
    recommendedOil: string;
    oilCapacity: number;
    tirePressureFront: number;
    tirePressureRear: number;
    sparkPlugModel: string | null;
    brakeFluidType: string | null;
    coolantType: string | null;
    powerAndTorque?: string | null;
    tireSize?: string | null;
    fuelType?: string | null;
    fuelTankCapacity?: string | null;
    averageConsumption?: string | null;
    suspensionType?: string | null;
    headlightBulb?: string | null;
    trunkCapacity?: string | null;
    otherRelevantData?: string | null;
  } | null;
}

export const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form de Manutenção
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState('Óleo');
  const [description, setDescription] = useState('');
  const [mileageAtMaintenance, setMileageAtMaintenance] = useState('');
  const [dateOfMaintenance, setDateOfMaintenance] = useState(new Date().toISOString().split('T')[0]);
  const [nextMaintenanceMileage, setNextMaintenanceMileage] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'COMPLETED' | 'PENDING'>('COMPLETED');
  const [autoCreateNext, setAutoCreateNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edição de KM do veículo
  const [isEditingKm, setIsEditingKm] = useState(false);
  const [newKm, setNewKm] = useState('');
  const [updatingKm, setUpdatingKm] = useState(false);

  // Ficha técnica completa
  const [showSpecsModal, setShowSpecsModal] = useState(false);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vehicles/${id}`);
      setVehicle(response.data);
      setNewKm(response.data.mileage.toString());
      setMileageAtMaintenance(response.data.mileage.toString());
    } catch (err) {
      console.error('Erro ao obter veículo:', err);
      setError('Não foi possível carregar os detalhes do veículo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const handleDeleteVehicle = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo e todo o seu histórico?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Erro ao deletar veículo:', err);
      alert('Erro ao excluir veículo.');
    }
  };

  const handleUpdateKm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    setUpdatingKm(true);
    try {
      await api.put(`/vehicles/${id}`, {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        engine: vehicle.engine,
        plate: vehicle.plate || undefined,
        mileage: parseInt(newKm)
      });
      setIsEditingKm(false);
      await fetchVehicle();
    } catch (err) {
      console.error('Erro ao atualizar KM:', err);
      alert('Erro ao atualizar quilometragem.');
    } finally {
      setUpdatingKm(false);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/maintenances', {
        vehicleId: id,
        type,
        description,
        mileageAtMaintenance: parseInt(mileageAtMaintenance),
        dateOfMaintenance: new Date(dateOfMaintenance),
        nextMaintenanceMileage: nextMaintenanceMileage ? parseInt(nextMaintenanceMileage) : null,
        nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null,
        notes: notes || null,
        status,
        autoCreateNext,
      });

      // Reset Form
      setDescription('');
      setNextMaintenanceMileage('');
      setNextMaintenanceDate('');
      setNotes('');
      setAutoCreateNext(false);
      setShowAddForm(false);

      // Refresh Data
      await fetchVehicle();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registrar manutenção.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (!window.confirm('Excluir este registro de manutenção?')) return;
    try {
      await api.delete(`/maintenances/${maintenanceId}`);
      await fetchVehicle();
    } catch (err) {
      console.error('Erro ao excluir manutenção:', err);
      alert('Erro ao deletar registro.');
    }
  };

  // Preenche dados recomendados de KM/Mês para troca futura de óleo
  const handleAutoFillOil = () => {
    if (!vehicle) return;
    const currentKm = parseInt(mileageAtMaintenance) || vehicle.mileage;
    setNextMaintenanceMileage((currentKm + 10000).toString());
    const nextD = new Date(dateOfMaintenance);
    nextD.setFullYear(nextD.getFullYear() + 1); // 1 ano
    setNextMaintenanceDate(nextD.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-3">
        <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Carregando detalhes...</span>
      </div>
    );
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
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          
          <h1 className="text-base font-bold text-slate-200 font-sans">
            {vehicle.brand} {vehicle.model}
          </h1>

          <button
            onClick={handleDeleteVehicle}
            className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-900 rounded-xl transition-colors"
            title="Excluir Veículo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

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
                  <Gauge size={22} className="text-emerald-400" />
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
                        />
                        <Button type="submit" isLoading={updatingKm} className="py-1 px-3 text-xs w-auto">Salvar</Button>
                        <button type="button" onClick={() => setIsEditingKm(false)} className="text-xs text-slate-400 underline">Cancelar</button>
                      </form>
                    ) : (
                      <strong className="text-xl font-mono text-slate-200 tracking-tight">
                        {vehicle.mileage.toLocaleString()} km
                      </strong>
                    )}
                  </div>
                </div>

                {!isEditingKm && (
                  <button
                    onClick={() => setIsEditingKm(true)}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900/50 rounded-xl transition-colors"
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
          <Card className="border border-emerald-950/30">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 font-sans">
              Registrar Serviço ou Agendamento
            </h4>

            {error && <Alert type="error" className="mb-4">{error}</Alert>}

            <form onSubmit={handleAddMaintenance} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-400">Tipo de Manutenção</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Óleo">Troca de Óleo / Filtro</option>
                  <option value="Pneus">Alinhamento / Balanceamento / Pneus</option>
                  <option value="Pastilhas">Freios (Pastilhas / Discos / Fluido)</option>
                  <option value="Filtros">Filtros (Ar / Cabine / Combustível)</option>
                  <option value="Geral">Revisão Geral / Mecânica</option>
                </select>
              </div>

              <Input
                id="description"
                label="Descrição do Serviço"
                placeholder="Ex: Troca de óleo 5W30 sintético e filtro de óleo"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <Input
                id="mileageAtMaintenance"
                type="number"
                label="Quilometragem no Serviço"
                value={mileageAtMaintenance}
                onChange={(e) => setMileageAtMaintenance(e.target.value)}
                required
              />

              <Input
                id="dateOfMaintenance"
                type="date"
                label="Data do Serviço"
                value={dateOfMaintenance}
                onChange={(e) => setDateOfMaintenance(e.target.value)}
                required
              />

              <div className="sm:col-span-2 border-t border-slate-900 pt-4 mt-2 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lembrete de Vencimento</h5>
                  {type === 'Óleo' && (
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
                    value={nextMaintenanceMileage}
                    onChange={(e) => setNextMaintenanceMileage(e.target.value)}
                  />

                  <Input
                    id="nextMaintenanceDate"
                    type="date"
                    label="Próxima Troca (Data Limite)"
                    value={nextMaintenanceDate}
                    onChange={(e) => setNextMaintenanceDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-400">Observações (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Status */}
              <div className="sm:col-span-2 flex flex-wrap gap-6 items-center bg-slate-950 p-3 rounded-xl border border-slate-900">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase">Status do Registro:</span>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'COMPLETED'}
                      onChange={() => setStatus('COMPLETED')}
                      className="text-emerald-500 focus:ring-0"
                    />
                    Realizado
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'PENDING'}
                      onChange={() => setStatus('PENDING')}
                      className="text-emerald-500 focus:ring-0"
                    />
                    Agendado (Lembrete)
                  </label>
                </div>

                {status === 'COMPLETED' && (
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-400 ml-auto select-none">
                    <input
                      type="checkbox"
                      checked={autoCreateNext}
                      onChange={(e) => setAutoCreateNext(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-0"
                    />
                    Criar lembrete agendado automaticamente?
                  </label>
                )}
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
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
                      {isPending ? <Clock size={16} /> : <CheckCircle size={16} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-200 font-sans text-sm">
                          {record.type}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          • {new Date(record.dateOfMaintenance).toLocaleDateString('pt-BR')}
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
                            <span>Vence em: {record.nextMaintenanceMileage.toLocaleString()} km</span>
                          )}
                          {record.nextMaintenanceDate && (
                            <span>Data limite: {new Date(record.nextMaintenanceDate).toLocaleDateString('pt-BR')}</span>
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
                      {record.mileageAtMaintenance.toLocaleString()} km
                    </span>
                    <button
                      onClick={() => handleDeleteMaintenance(record.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-slate-950 rounded-lg transition-colors ml-auto sm:ml-0"
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

      {/* Modal Ficha Técnica */}
      {showSpecsModal && vehicle.specs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowSpecsModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Ficha Técnica Detalhada</h3>
                <p className="text-xs text-slate-400">{vehicle.brand} {vehicle.model} - {vehicle.engine}</p>
              </div>
              <button onClick={() => setShowSpecsModal(false)} className="text-slate-500 hover:text-slate-300 p-2">✕</button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
              <div>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1">Motorização & Desempenho</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between"><span className="text-slate-500">Motor:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.engine}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Potência / Torque:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.powerAndTorque || 'N/D'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Combustível:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.fuelType || 'N/D'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Consumo Médio:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.averageConsumption || 'N/D'}</span></div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1">Manutenção Vital</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between"><span className="text-slate-500">Óleo Motor:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.recommendedOil}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Capacidade Óleo:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.oilCapacity} L</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Velas Ignição:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.sparkPlugModel || 'N/D'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Aditivo Radiador:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.coolantType || 'N/D'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Fluido Freio:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.brakeFluidType || 'N/D'}</span></div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1">Chassi & Suspensão</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between"><span className="text-slate-500">Pneus (Medidas):</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.tireSize || 'N/D'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Pressão (Diant/Tras):</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.tirePressureFront} / {vehicle.specs.tirePressureRear} PSI</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Suspensão:</span> <span className="text-slate-200 font-medium text-right max-w-[150px] ml-4 leading-tight">{vehicle.specs.suspensionType || 'N/D'}</span></div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1">Estrutura & Elétrica</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between"><span className="text-slate-500">Tanque:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.fuelTankCapacity || 'N/D'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Porta-Malas:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.trunkCapacity || 'N/D'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Lâmpada Farol:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.headlightBulb || 'N/D'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Outros:</span> <span className="text-slate-200 font-medium text-right ml-4">{vehicle.specs.otherRelevantData || 'N/D'}</span></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <Button onClick={() => setShowSpecsModal(false)} className="w-auto px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
