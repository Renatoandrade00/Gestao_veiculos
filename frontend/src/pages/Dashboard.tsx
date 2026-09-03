import React, { useCallback, useEffect, useState } from 'react';
import { getVehicles, getCarSpecsReferences, createVehicle, checkAlerts } from '../services/vehiclesApi';
import { getApiErrorMessage } from '../services/api';
import { Header } from '../components/Header';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleForm } from '../components/VehicleForm';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/Toast';
import { Car, Mail, Plus } from 'lucide-react';
import type { VehicleWithStatus, CarSpecReference, NewVehiclePayload } from '../types';

export const Dashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [specs, setSpecs] = useState<CarSpecReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);

  const [checkingAlerts, setCheckingAlerts] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ message: string; url: string | null } | null>(null);

  const { showToast } = useToast();

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      const [vehiclesData, specsData] = await Promise.all([
        getVehicles(signal),
        getCarSpecsReferences(signal),
      ]);
      setVehicles(vehiclesData);
      setSpecs(specsData);
      setLoadError(null);
    } catch (err) {
      if ((err as { name?: string }).name === 'CanceledError') return;
      setLoadError(getApiErrorMessage(err, 'Não foi possível carregar seus veículos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const handleAddVehicle = async (payload: NewVehiclePayload) => {
    try {
      await createVehicle(payload);
      setShowAddForm(false);
      showToast('success', 'Veículo cadastrado com sucesso!');
      await fetchData();
    } catch (err) {
      // Deixa o erro propagar para o form exibir
      throw new Error(getApiErrorMessage(err, 'Erro ao cadastrar veículo. Verifique os campos.'), { cause: err });
    }
  };

  const handleCheckAlerts = async () => {
    setCheckingAlerts(true);
    setAlertInfo(null);
    try {
      const { alertsSent } = await checkAlerts();
      if (alertsSent > 0) {
        setAlertInfo({
          message: `⚠️ ${alertsSent} manutenção(ões) próxima(s) do vencimento ou já vencida(s)!`,
          url: null,
        });
      } else {
        setAlertInfo({
          message: 'Tudo em dia! Nenhuma manutenção próxima do vencimento encontrada para seus veículos.',
          url: null,
        });
      }
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Erro ao verificar alertas.'));
    } finally {
      setCheckingAlerts(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

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
          </Alert>
        )}

        {/* Erro de carregamento (distinto de lista vazia) */}
        {loadError && (
          <Alert type="error" title="Erro de Conexão">
            <p>{loadError}</p>
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="mt-2 text-xs font-bold underline text-rose-300"
            >
              Tentar novamente
            </button>
          </Alert>
        )}

        {/* Form Add Vehicle */}
        {showAddForm && (
          <VehicleForm
            specs={specs}
            onSubmit={handleAddVehicle}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Vehicles list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Spinner />
            <span>Carregando seus veículos...</span>
          </div>
        ) : !loadError && vehicles.length === 0 ? (
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
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
