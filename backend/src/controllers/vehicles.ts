import { Response } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { calculateVehicleStatus } from '../services/maintenanceStatus';

const vehicleSchema = z.object({
  brand: z.string().min(1, 'A marca é obrigatória'),
  model: z.string().min(1, 'O modelo é obrigatório'),
  year: z.coerce.number().min(1900, 'Ano inválido').max(new Date().getFullYear() + 2, 'Ano inválido'),
  engine: z.string().min(1, 'A motorização é obrigatória'),
  plate: z.string().optional(),
  mileage: z.coerce.number().min(0, 'A quilometragem não pode ser negativa'),
});

/**
 * Busca as especificações de referência para os veículos em duas queries
 * (uma por engine, fallback por marca/modelo), evitando o N+1 original.
 */
async function attachSpecs<T extends { brand: string; model: string; engine: string }>(
  vehicles: T[]
): Promise<(T & { specs: unknown })[]> {
  if (vehicles.length === 0) return [];

  const brands = [...new Set(vehicles.map((v) => v.brand))];
  const models = [...new Set(vehicles.map((v) => v.model))];
  const enginePrefixes = [...new Set(vehicles.map((v) => v.engine.split(' ')[0]))];

  // `in` não suporta startsWith — montamos um OR de startsWith por prefixo de motor
  const engineCondition = enginePrefixes.flatMap((prefix) =>
    brands.map((brand) => ({ brand, engine: { startsWith: prefix } }))
  );

  const [byEngine, byBrandModel] = await Promise.all([
    db.carSpecsReference.findMany({
      where: {
        OR: engineCondition,
      },
      orderBy: { createdAt: 'asc' },
    }),
    db.carSpecsReference.findMany({
      where: { brand: { in: brands }, model: { in: models } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const engineIndex = new Map<string, typeof byEngine[0]>();
  for (const spec of byEngine) {
    const key = `${spec.brand}|${spec.model}|${spec.engine.split(' ')[0]}`;
    if (!engineIndex.has(key)) engineIndex.set(key, spec);
  }

  const brandModelIndex = new Map<string, typeof byBrandModel[0]>();
  for (const spec of byBrandModel) {
    const key = `${spec.brand}|${spec.model}`;
    if (!brandModelIndex.has(key)) brandModelIndex.set(key, spec);
  }

  return vehicles.map((vehicle) => {
    const engineKey = `${vehicle.brand}|${vehicle.model}|${vehicle.engine.split(' ')[0]}`;
    const specs =
      engineIndex.get(engineKey) ??
      brandModelIndex.get(`${vehicle.brand}|${vehicle.model}`) ??
      null;
    return { ...vehicle, specs };
  });
}

// Listar todos os veículos do usuário
export async function getVehicles(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;

  try {
    const vehicles = await db.vehicle.findMany({
      where: { userId },
      include: {
        maintenances: {
          orderBy: { dateOfMaintenance: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const vehiclesWithSpecs = await attachSpecs(vehicles);

    const now = new Date();
    const withStatus = vehiclesWithSpecs.map((vehicle) => {
      const { overall, items } = calculateVehicleStatus(vehicle.maintenances, vehicle.mileage, now);
      return { ...vehicle, status: overall, statusByType: items };
    });

    return res.status(200).json(withStatus);
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

    const [withSpecs] = await attachSpecs([vehicle]);
    const { overall, items } = calculateVehicleStatus(
      vehicle.maintenances,
      vehicle.mileage
    );

    return res.status(200).json({
      ...withSpecs,
      status: overall,
      statusByType: items,
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
    // Update parcial: valida apenas os campos presentes no payload
    const partialSchema = vehicleSchema.partial();
    const validatedData = partialSchema.parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    const existingVehicle = await db.vehicle.findFirst({
      where: { id, userId }
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você' });
    }

    const updatedVehicle = await db.vehicle.update({
      where: { id },
      data: validatedData
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
