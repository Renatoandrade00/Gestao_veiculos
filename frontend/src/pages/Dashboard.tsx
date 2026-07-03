import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Alert } from '../components/Alert';
import { LogOut, Plus, Car, Calendar, Gauge, CheckCircle, AlertTriangle, Mail } from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  type: string;
  mileageAtMaintenance: number;
  dateOfMaintenance: string;
  nextMaintenanceMileage: number | null;
  nextMaintenanceDate: string | null;
  status: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  plate: string | null;
  mileage: number;
  maintenances?: MaintenanceRecord[];
  specs: {
    recommendedOil: string;
    oilCapacity: number;
    tirePressureFront: number;
    tirePressureRear: number;
    sparkPlugModel: string;
    brakeFluidType: string;
    coolantType: string;
  } | null;
}

interface CarSpecReference {
  id: string;
  brand: string;
  model: string;
  engine: string;
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [specs, setSpecs] = useState<CarSpecReference[]>([]);
  
  // Form de criação
  const [showAddForm, setShowAddForm] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [engine, setEngine] = useState('');
  
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customEngine, setCustomEngine] = useState('');
  
  const [plate, setPlate] = useState('');
  const [mileage, setMileage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Alertas
  const [checkingAlerts, setCheckingAlerts] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ message: string; url: string | null } | null>(null);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
    }
  };

  const fetchSpecs = async () => {
    try {
      const response = await api.get('/vehicles/specs');
      setSpecs(response.data);
    } catch (err) {
      console.error('Erro ao buscar referências de veículos:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchVehicles(), fetchSpecs()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const finalBrand = brand === 'Outro' ? customBrand : brand;
      const finalModel = model === 'Outro' ? customModel : model;
      const finalEngine = engine === 'Outro' ? customEngine : engine;
      
      if (!finalBrand || !finalModel || !finalEngine) {
        setError('Preencha a marca, modelo e motorização do veículo.');
        setSubmitting(false);
        return;
      }

      await api.post('/vehicles', {
        brand: finalBrand,
        model: finalModel,
        year: parseInt(year),
        engine: finalEngine,
        plate: plate || undefined,
        mileage: parseInt(mileage),
      });
      
      // Reset form
      setBrand('');
      setModel('');
      setYear('');
      setEngine('');
      setCustomBrand('');
      setCustomModel('');
      setCustomEngine('');
      setPlate('');
      setMileage('');
      setShowAddForm(false);
      
      // Refresh list
      await fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar veículo. Verifique os campos.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckAlerts = async () => {
    setCheckingAlerts(true);
    setAlertInfo(null);
    try {
      const response = await api.post('/maintenances/check-alerts');
      const { emailUrl, alertsSent } = response.data;

      if (alertsSent > 0) {
        // Alertas encontrados — independente de o e-mail ter sido enviado
        setAlertInfo({
          message: `⚠️ ${alertsSent} manutenção(ões) próxima(s) do vencimento ou já vencida(s)!`,
          url: emailUrl || null
        });
      } else {
        setAlertInfo({
          message: 'Tudo em dia! Nenhuma manutenção próxima do vencimento encontrada para seus veículos.',
          url: null
        });
      }
    } catch (err) {
      console.error('Erro ao verificar alertas:', err);
      setAlertInfo({
        message: 'Erro ao processar verificação de alertas.',
        url: null
      });
    } finally {
      setCheckingAlerts(false);
    }
  };

  // Autopreencher com base no modelo selecionado
  const handleSelectReference = (ref: CarSpecReference) => {
    setBrand(ref.brand);
    setModel(ref.model);
    setEngine(ref.engine);
  };

  // Identifica se um carro tem alguma manutenção próxima ou vencida.
  // Usa apenas o registro mais recente por tipo (COMPLETED ou PENDING) que
  // tenha nextMaintenanceMileage ou nextMaintenanceDate definidos.
  const getVehicleStatus = (vehicle: Vehicle) => {
    if (!vehicle.maintenances || vehicle.maintenances.length === 0) return 'ok';

    // Agrupa pelo tipo e pega o registro mais recente
    const latestByType = new Map<string, MaintenanceRecord>();
    for (const m of vehicle.maintenances) {
      const existing = latestByType.get(m.type);
      if (!existing) {
        latestByType.set(m.type, m);
      } else {
        const mDate = new Date(m.dateOfMaintenance).getTime();
        const existingDate = new Date(existing.dateOfMaintenance).getTime();
        
        if (mDate > existingDate) {
          latestByType.set(m.type, m);
        } else if (mDate === existingDate) {
          // Prioriza o registro PENDING (lembrete automático) quando na mesma data
          if (m.status === 'PENDING' && existing.status !== 'PENDING') {
            latestByType.set(m.type, m);
          } else if (m.status === existing.status) {
            // Se ambos tem mesmo status, prioriza o que tem agendamento futuro
            if ((m.nextMaintenanceMileage || m.nextMaintenanceDate) && 
                (!existing.nextMaintenanceMileage && !existing.nextMaintenanceDate)) {
              latestByType.set(m.type, m);
            }
          }
        }
      }
    }

    let status = 'ok';
    const now = new Date();

    for (const maintenance of latestByType.values()) {
      if (!maintenance.nextMaintenanceMileage && !maintenance.nextMaintenanceDate) continue;

      // Por km
      if (maintenance.nextMaintenanceMileage) {
        const kmRemaining = maintenance.nextMaintenanceMileage - vehicle.mileage;
        if (kmRemaining <= 0) return 'overdue';
        if (kmRemaining <= 1000) status = 'warning';
      }

      // Por data
      if (maintenance.nextMaintenanceDate) {
        const timeRemaining = new Date(maintenance.nextMaintenanceDate).getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 0) return 'overdue';
        if (daysRemaining <= 30 && status !== 'overdue') status = 'warning';
      }
    }
    return status;
  };

  const uniqueBrands = Array.from(new Set(specs.map(s => s.brand))).sort();
  const brandOptions = [
    ...uniqueBrands.map(b => ({ value: b, label: b })),
    { value: 'Outro', label: 'Outro...' }
  ];

  const filteredSpecsByBrand = specs.filter(s => s.brand === brand);
  const uniqueModels = Array.from(new Set(filteredSpecsByBrand.map(s => s.model))).sort();
  const modelOptions = [
    ...uniqueModels.map(m => ({ value: m, label: m })),
    { value: 'Outro', label: 'Outro...' }
  ];

  const filteredSpecsByModel = filteredSpecsByBrand.filter(s => s.model === model);
  const uniqueEngines = Array.from(new Set(filteredSpecsByModel.map(s => s.engine))).sort();
  const engineOptions = [
    ...uniqueEngines.map(e => ({ value: e, label: e })),
    { value: 'Outro', label: 'Outro...' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-950/50 border border-emerald-800/40 rounded-xl text-emerald-400">
              <Car size={20} />
            </div>
            <span className="font-bold text-slate-100 font-sans tracking-tight">CarMaint</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">
              Olá, <strong className="text-slate-200">{user?.name}</strong>
            </span>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-all duration-200"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold font-sans text-slate-100">Meus Veículos</h1>
            <p className="text-sm text-slate-400">Cadastre e monitore a revisão de seus carros</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCheckAlerts}
              isLoading={checkingAlerts}
              className="sm:w-auto"
            >
              <Mail size={16} /> Verificação de Alertas
            </Button>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="sm:w-auto"
            >
              <Plus size={16} /> Adicionar Carro
            </Button>
          </div>
        </div>

        {/* Email mock alert info */}
        {alertInfo && (
          <Alert
            type={
              alertInfo.message.startsWith('⚠️') ? 'warning'
              : alertInfo.message.startsWith('Erro') ? 'error'
              : 'info'
            }
            title="Central de Alertas"
          >
            <p>{alertInfo.message}</p>
            {alertInfo.url && (
              <a
                href={alertInfo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 py-1.5 px-3 rounded-lg text-xs transition-colors"
              >
                Clique aqui para abrir o e-mail enviado 📧
              </a>
            )}
          </Alert>
        )}

        {/* Form Add Vehicle */}
        {showAddForm && (
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

            <form onSubmit={handleAddVehicle} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Select
                  id="brand"
                  label="Marca"
                  value={brand}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBrand(val);
                    if (val === 'Outro') {
                      setModel('Outro');
                      setEngine('Outro');
                    } else {
                      setModel('');
                      setEngine('');
                    }
                  }}
                  options={brandOptions}
                  required
                />
                {brand === 'Outro' && (
                  <Input
                    id="customBrand"
                    placeholder="Digite a marca"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    required
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Select
                  id="model"
                  label="Modelo"
                  value={model}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModel(val);
                    if (val === 'Outro') {
                      setEngine('Outro');
                    } else {
                      setEngine('');
                    }
                  }}
                  options={modelOptions}
                  required
                  disabled={!brand}
                />
                {(model === 'Outro' || brand === 'Outro') && (
                  <Input
                    id="customModel"
                    placeholder="Digite o modelo"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    required
                  />
                )}
              </div>

              <Input
                id="year"
                type="number"
                label="Ano"
                placeholder="Ex: 2020"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />

              <div className="flex flex-col gap-2">
                <Select
                  id="engine"
                  label="Motorização"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  options={engineOptions}
                  required
                  disabled={!model}
                />
                {(engine === 'Outro' || model === 'Outro' || brand === 'Outro') && (
                  <Input
                    id="customEngine"
                    placeholder="Digite a motorização"
                    value={customEngine}
                    onChange={(e) => setCustomEngine(e.target.value)}
                    required
                  />
                )}
              </div>
              <Input
                id="plate"
                label="Placa (Opcional)"
                placeholder="Ex: ABC1D23"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
              />
              <Input
                id="mileage"
                type="number"
                label="Quilometragem Atual"
                placeholder="Ex: 45000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                required
              />

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
                  Salvar Veículo
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Vehicles list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Carregando seus veículos...</span>
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800">
            <div className="p-4 bg-slate-950 rounded-full text-slate-600 mb-4">
              <Car size={36} />
            </div>
            <h3 className="text-lg font-bold text-slate-300 font-sans">Nenhum veículo cadastrado</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
              Adicione seu primeiro carro clicando no botão acima para começar o controle de revisões.
            </p>
            <Button onClick={() => setShowAddForm(true)} className="w-auto px-6">
              Adicionar Primeiro Carro
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => {
              const status = getVehicleStatus(vehicle);
              return (
                <div
                  key={vehicle.id}
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="cockpit-card hover:border-emerald-500/40 cursor-pointer flex flex-col justify-between group relative overflow-hidden p-5 rounded-xl shadow-lg"
                >
                  {/* Speed Stripes Backing Accent */}
                  <div className="absolute inset-0 speed-stripes opacity-30 pointer-events-none" />

                  {/* Status Indicator Indicator Bar */}
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
                          <AlertTriangle size={12} /> Vencida
                        </span>
                      )}
                      {status === 'warning' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-950/20 px-2 py-1 rounded-lg">
                          <AlertTriangle size={12} /> Próxima
                        </span>
                      )}
                      {status === 'ok' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-950/20 px-2 py-1 rounded-lg">
                          <CheckCircle size={12} /> Em dia
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-900 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Gauge size={16} className="text-emerald-500" />
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Odômetro</span>
                        <strong className="text-slate-300 font-mono">{vehicle.mileage.toLocaleString()} km</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={16} className="text-emerald-500" />
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
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
