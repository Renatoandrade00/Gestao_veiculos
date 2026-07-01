import { Response } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const vehicleSchema = z.object({
  brand: z.string().min(1, 'A marca é obrigatória'),
  model: z.string().min(1, 'O modelo é obrigatório'),
  year: z.coerce.number().min(1900, 'Ano inválido').max(new Date().getFullYear() + 2, 'Ano inválido'),
  engine: z.string().min(1, 'A motorização é obrigatória'),
  plate: z.string().optional(),
  mileage: z.coerce.number().min(0, 'A quilometragem não pode ser negativa'),
});

// Listar todos os veículos do usuário
export async function getVehicles(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;

  try {
    const vehicles = await db.vehicle.findMany({
      where: { userId },
      include: {
        maintenances: {
          orderBy: { dateOfMaintenance: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Associar as especificações técnicas de referência se houver correspondência
    const vehiclesWithSpecs = await Promise.all(
      vehicles.map(async (vehicle) => {
        const specs = await db.carSpecsReference.findFirst({
          where: {
            brand: vehicle.brand,
            model: vehicle.model,
            engine: { startsWith: vehicle.engine.split(' ')[0] } // Match aproximado (ex: "1.0")
          }
        });

        // Caso não dê match perfeito, busca por marca/modelo exato
        const backupSpecs = specs || await db.carSpecsReference.findFirst({
          where: {
            brand: vehicle.brand,
            model: vehicle.model
          }
        });

        return {
          ...vehicle,
          specs: backupSpecs || null
        };
      })
    );

    return res.status(200).json(vehiclesWithSpecs);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar veículos' });
  }
}

// Obter detalhes de um veículo específico do usuário
export async function getVehicleById(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const vehicle = await db.vehicle.findFirst({
      where: { id, userId },
      include: {
        maintenances: {
          orderBy: { dateOfMaintenance: 'desc' }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Buscar especificações de referência
    const specs = await db.carSpecsReference.findFirst({
      where: {
        brand: vehicle.brand,
        model: vehicle.model
      }
    });

    return res.status(200).json({
      ...vehicle,
      specs: specs || null
    });
  } catch (error) {
    console.error('Erro ao obter veículo:', error);
    return res.status(500).json({ error: 'Erro interno ao obter detalhes do veículo' });
  }
}

// Cadastrar novo veículo
export async function createVehicle(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;

  try {
    const validatedData = vehicleSchema.parse(req.body);

    const vehicle = await db.vehicle.create({
      data: {
        userId,
        brand: validatedData.brand,
        model: validatedData.model,
        year: validatedData.year,
        engine: validatedData.engine,
        plate: validatedData.plate || null,
        mileage: validatedData.mileage,
      }
    });

    return res.status(201).json(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao criar veículo:', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar veículo' });
  }
}

// Editar veículo
export async function updateVehicle(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const validatedData = vehicleSchema.parse(req.body);

    // Verificar se o veículo pertence ao usuário
    const existingVehicle = await db.vehicle.findFirst({
      where: { id, userId }
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você' });
    }

    const updatedVehicle = await db.vehicle.update({
      where: { id },
      data: {
        brand: validatedData.brand,
        model: validatedData.model,
        year: validatedData.year,
        engine: validatedData.engine,
        plate: validatedData.plate || null,
        mileage: validatedData.mileage,
      }
    });

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao atualizar veículo:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar veículo' });
  }
}

// Excluir veículo
export async function deleteVehicle(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const existingVehicle = await db.vehicle.findFirst({
      where: { id, userId }
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você' });
    }

    await db.vehicle.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Veículo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    return res.status(500).json({ error: 'Erro interno ao excluir veículo' });
  }
}

// Listar especificações técnicas de referência cadastradas
export async function getCarSpecsReferences(req: AuthenticatedRequest, res: Response) {
  try {
    const specs = await db.carSpecsReference.findMany({
      orderBy: [
        { brand: 'asc' },
        { model: 'asc' }
      ]
    });
    return res.status(200).json(specs);
  } catch (error) {
    console.error('Erro ao obter referências:', error);
    return res.status(500).json({ error: 'Erro interno ao obter dados técnicos de referência' });
  }
}
