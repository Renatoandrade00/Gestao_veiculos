import { Response } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { checkUserAlerts } from '../services/alertService';

const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'ID do veículo é obrigatório'),
  type: z.string().min(1, 'O tipo de manutenção é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  mileageAtMaintenance: z.coerce.number().min(0, 'A quilometragem não pode ser negativa'),
  dateOfMaintenance: z.coerce.date(),
  nextMaintenanceMileage: z.coerce.number().optional().nullable(),
  nextMaintenanceDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['COMPLETED', 'PENDING']).default('COMPLETED'),
  autoCreateNext: z.boolean().optional().default(false),
});

// Listar todas as manutenções de um veículo específico do usuário
export async function getMaintenancesByVehicle(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;
  const { vehicleId } = req.params;

  try {
    // Validar se o veículo pertence ao usuário
    const vehicle = await db.vehicle.findFirst({
      where: { id: vehicleId, userId }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você' });
    }

    const maintenances = await db.maintenanceRecord.findMany({
      where: { vehicleId },
      orderBy: { dateOfMaintenance: 'desc' }
    });

    return res.status(200).json(maintenances);
  } catch (error) {
    console.error('Erro ao buscar manutenções:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar manutenções' });
  }
}

// Cadastrar registro de manutenção
export async function createMaintenance(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;

  try {
    const validatedData = maintenanceSchema.parse(req.body);

    // Validar se o veículo pertence ao usuário e pegar sua quilometragem
    const vehicle = await db.vehicle.findFirst({
      where: { id: validatedData.vehicleId, userId }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você' });
    }

    // Se a manutenção está concluída e a quilometragem informada for maior que a do carro, atualiza o odômetro do veículo!
    if (validatedData.status === 'COMPLETED' && validatedData.mileageAtMaintenance > vehicle.mileage) {
      await db.vehicle.update({
        where: { id: vehicle.id },
        data: { mileage: validatedData.mileageAtMaintenance }
      });
    }

    // Criar o registro
    const record = await db.maintenanceRecord.create({
      data: {
        vehicleId: validatedData.vehicleId,
        type: validatedData.type,
        description: validatedData.description,
        mileageAtMaintenance: validatedData.mileageAtMaintenance,
        dateOfMaintenance: validatedData.dateOfMaintenance,
        nextMaintenanceMileage: validatedData.nextMaintenanceMileage || null,
        nextMaintenanceDate: validatedData.nextMaintenanceDate || null,
        notes: validatedData.notes || null,
        status: validatedData.status,
      }
    });

    // Se autoCreateNext for true e status for COMPLETED, criar um registro de lembrete PENDING automático
    if (validatedData.status === 'COMPLETED' && validatedData.autoCreateNext) {
      let nextKm = validatedData.nextMaintenanceMileage;
      let nextDate = validatedData.nextMaintenanceDate;

      // Se o usuário não preencheu, tenta inferir com base no tipo
      if (!nextKm || !nextDate) {
        const intervalKm = validatedData.type.toLowerCase().includes('óleo') ? 10000 : 20000;
        const intervalMonths = validatedData.type.toLowerCase().includes('óleo') ? 12 : 24;

        nextKm = nextKm || (validatedData.mileageAtMaintenance + intervalKm);
        
        if (!nextDate) {
          const d = new Date(validatedData.dateOfMaintenance);
          d.setMonth(d.getMonth() + intervalMonths);
          nextDate = d;
        }
      }

      await db.maintenanceRecord.create({
        data: {
          vehicleId: validatedData.vehicleId,
          type: validatedData.type,
          description: `Próxima revisão/troca recomendada de: ${validatedData.type}`,
          mileageAtMaintenance: validatedData.mileageAtMaintenance,
          dateOfMaintenance: validatedData.dateOfMaintenance,
          nextMaintenanceMileage: nextKm,
          nextMaintenanceDate: nextDate,
          status: 'PENDING',
          notes: 'Lembrete automático criado pelo aplicativo.',
        }
      });
    }

    // Após qualquer modificação, checa se há novos alertas para o usuário
    const alertResult = await checkUserAlerts(userId);

    return res.status(201).json({
      record,
      alerts: alertResult
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao registrar manutenção:', error);
    return res.status(500).json({ error: 'Erro interno ao registrar manutenção' });
  }
}

// Editar manutenção
export async function updateMaintenance(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const validatedData = maintenanceSchema.parse(req.body);

    // Validar se a manutenção pertence a um veículo do usuário
    const record = await db.maintenanceRecord.findFirst({
      where: {
        id,
        vehicle: { userId }
      },
      include: { vehicle: true }
    });

    if (!record) {
      return res.status(404).json({ error: 'Registro de manutenção não encontrado' });
    }

    // Atualizar odômetro do veículo se necessário
    if (validatedData.status === 'COMPLETED' && validatedData.mileageAtMaintenance > record.vehicle.mileage) {
      await db.vehicle.update({
        where: { id: record.vehicle.id },
        data: { mileage: validatedData.mileageAtMaintenance }
      });
    }

    const updatedRecord = await db.maintenanceRecord.update({
      where: { id },
      data: {
        type: validatedData.type,
        description: validatedData.description,
        mileageAtMaintenance: validatedData.mileageAtMaintenance,
        dateOfMaintenance: validatedData.dateOfMaintenance,
        nextMaintenanceMileage: validatedData.nextMaintenanceMileage || null,
        nextMaintenanceDate: validatedData.nextMaintenanceDate || null,
        notes: validatedData.notes || null,
        status: validatedData.status,
      }
    });

    const alertResult = await checkUserAlerts(userId);

    return res.status(200).json({
      record: updatedRecord,
      alerts: alertResult
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao atualizar manutenção:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar manutenção' });
  }
}

// Excluir registro de manutenção
export async function deleteMaintenance(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const record = await db.maintenanceRecord.findFirst({
      where: {
        id,
        vehicle: { userId }
      }
    });

    if (!record) {
      return res.status(404).json({ error: 'Registro de manutenção não encontrado' });
    }

    await db.maintenanceRecord.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir manutenção:', error);
    return res.status(500).json({ error: 'Erro interno ao excluir manutenção' });
  }
}

// Disparar checagem manual de alertas por e-mail para o usuário logado
export async function checkAlertsManual(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;

  try {
    const result = await checkUserAlerts(userId);
    return res.status(200).json({
      message: 'Checagem de alertas concluída',
      alertsSent: result.alertsSentCount,
      emailUrl: result.emailUrl || null
    });
  } catch (error) {
    console.error('Erro ao forçar checagem de alertas:', error);
    return res.status(500).json({ error: 'Erro ao processar alertas' });
  }
}
