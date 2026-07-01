import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const carSpecs = [
  // ─── CHEVROLET ────────────────────────────────────────────────────────────
  {
    // 1ª Geração Onix (2012–2019) — 1.0 8V / 1.4 8V Flex
    brand: 'Chevrolet',
    model: 'Onix',
    engine: '1.0 8V Flex',
    recommendedOil: 'SAE 5W-30 API SN / Dexos 1',
    oilCapacity: 3.3,
    tirePressureFront: 35,
    tirePressureRear: 35,
    sparkPlugModel: 'NGK BR8ES',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Dex-Cool Chevrolet (Laranja)'
  },
  {
    // 2ª Geração Onix (2020+) — 1.0 Turbo Flex
    brand: 'Chevrolet',
    model: 'Onix',
    engine: '1.0 Turbo Flex',
    recommendedOil: 'SAE 0W-20 API SN / Dexos 1 Gen 2',
    oilCapacity: 3.5,
    tirePressureFront: 35,
    tirePressureRear: 35,
    sparkPlugModel: 'NGK DILZKR7B11GS',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Dex-Cool Chevrolet (Laranja)'
  },
  {
    // Prisma 1.4 (2013–2020) — 5W-30, NÃO 0W-20
    brand: 'Chevrolet',
    model: 'Prisma',
    engine: '1.4 8V Flex',
    recommendedOil: 'SAE 5W-30 API SN / Dexos 1',
    oilCapacity: 3.5,
    tirePressureFront: 33,
    tirePressureRear: 33,
    sparkPlugModel: 'NGK BR8ES',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Dex-Cool Chevrolet (Laranja)'
  },

  // ─── HYUNDAI ──────────────────────────────────────────────────────────────
  {
    // HB20 1ª Geração (2012–2019) — 1.0 12V Aspirado
    brand: 'Hyundai',
    model: 'HB20',
    engine: '1.0 12V Flex',
    recommendedOil: 'SAE 5W-30 API SN Hyundai Genuine',
    oilCapacity: 2.9,
    tirePressureFront: 32,
    tirePressureRear: 32,
    sparkPlugModel: 'NGK LKR7B-9',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Hyundai (Verde)'
  },
  {
    // HB20 2ª Geração (2020+) — 1.0 Turbo 12V Flex
    brand: 'Hyundai',
    model: 'HB20',
    engine: '1.0 Turbo 12V Flex',
    recommendedOil: 'SAE 5W-30 API SN Hyundai Genuine',
    oilCapacity: 3.3,
    tirePressureFront: 32,
    tirePressureRear: 32,
    sparkPlugModel: 'NGK SILZKR7B11',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Hyundai (Verde)'
  },
  {
    // Creta 1ª Geração (2016–2021) — 1.6 16V Flex
    brand: 'Hyundai',
    model: 'Creta',
    engine: '1.6 16V Flex',
    recommendedOil: 'SAE 5W-30 API SN Hyundai Genuine',
    oilCapacity: 3.6,
    tirePressureFront: 33,
    tirePressureRear: 33,
    sparkPlugModel: 'NGK SILZKR7B11',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Hyundai (Verde)'
  },
  {
    // Creta 2ª Geração (2022+) — 1.0 Turbo 12V Flex
    brand: 'Hyundai',
    model: 'Creta',
    engine: '1.0 Turbo 12V Flex',
    recommendedOil: 'SAE 0W-20 API SN Hyundai Genuine',
    oilCapacity: 4.2,
    tirePressureFront: 33,
    tirePressureRear: 33,
    sparkPlugModel: 'NGK SILZKBR7G11S',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Hyundai (Rosa/Vermelho)'
  },

  // ─── FIAT ─────────────────────────────────────────────────────────────────
  {
    // Uno 1.0 Fire Flex (2010–2015)
    brand: 'Fiat',
    model: 'Uno',
    engine: '1.0 Fire Flex',
    recommendedOil: 'SAE 5W-30 API SN Selenia',
    oilCapacity: 3.0,
    tirePressureFront: 28,
    tirePressureRear: 28,
    sparkPlugModel: 'NGK BKR6E-D',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Paraflu (Rosa)'
  },
  {
    // Palio 1.0 Fire Flex (2008–2017) — 15W-40 estava ERRADO, correto é 5W-30 API SN
    brand: 'Fiat',
    model: 'Palio',
    engine: '1.0 Fire Flex',
    recommendedOil: 'SAE 5W-30 API SN Selenia',
    oilCapacity: 2.7,
    tirePressureFront: 29,
    tirePressureRear: 29,
    sparkPlugModel: 'NGK BKR6E',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Paraflu (Rosa)'
  },
  {
    // Argo 1.0 Firefly Flex (2017+)
    brand: 'Fiat',
    model: 'Argo',
    engine: '1.0 Firefly Flex',
    recommendedOil: 'SAE 5W-30 API SN Selenia',
    oilCapacity: 2.7,
    tirePressureFront: 32,
    tirePressureRear: 32,
    sparkPlugModel: 'NGK LKR7B-9',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Paraflu (Rosa)'
  },
  {
    // Argo 1.3 Firefly Flex (2017+)
    brand: 'Fiat',
    model: 'Argo',
    engine: '1.3 Firefly Flex',
    recommendedOil: 'SAE 5W-30 API SN Selenia',
    oilCapacity: 3.3,
    tirePressureFront: 32,
    tirePressureRear: 32,
    sparkPlugModel: 'NGK LKR7B-9',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Paraflu (Rosa)'
  },

  // ─── VOLKSWAGEN ───────────────────────────────────────────────────────────
  {
    // Gol 1.0 8V Flex (até 2022)
    brand: 'Volkswagen',
    model: 'Gol',
    engine: '1.0 8V Flex',
    recommendedOil: 'SAE 5W-40 API SN VW 502 00 / 505 00',
    oilCapacity: 3.3,
    tirePressureFront: 29,
    tirePressureRear: 29,
    sparkPlugModel: 'NGK BKUR5ET-10',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico G12 (Rosa)'
  },
  {
    // Polo 1.0 TSI Flex (2018+) — VW 508.88 estava ERRADO (é spec diesel europeia)
    // Correto para Brasil: VW 502.00 (5W-40) sem DPF
    brand: 'Volkswagen',
    model: 'Polo',
    engine: '1.0 TSI Flex',
    recommendedOil: 'SAE 5W-40 API SN VW 502 00',
    oilCapacity: 4.0,
    tirePressureFront: 30,
    tirePressureRear: 30,
    sparkPlugModel: 'NGK BKUR6ET-10',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico G13 (Rosa/Lilás)'
  },

  // ─── FORD ─────────────────────────────────────────────────────────────────
  {
    // Ka Dragon 1.0 12V 3C Flex (2014–2020) — motor Dragon
    brand: 'Ford',
    model: 'Ka',
    engine: '1.0 12V 3C Flex',
    recommendedOil: 'SAE 5W-20 API SN Motorcraft',
    oilCapacity: 4.1,
    tirePressureFront: 32,
    tirePressureRear: 32,
    sparkPlugModel: 'NGK LTR7A-10',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Ford (Verde/Laranja)'
  },

  // ─── TOYOTA ───────────────────────────────────────────────────────────────
  {
    // Corolla 2.0 16V Flex (2019+) — E210 — 0W-20 correto para este motor
    brand: 'Toyota',
    model: 'Corolla',
    engine: '2.0 16V Flex',
    recommendedOil: 'SAE 0W-20 API SN Toyota Genuine',
    oilCapacity: 4.2,
    tirePressureFront: 30,
    tirePressureRear: 30,
    sparkPlugModel: 'NGK DILKAR7B11',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Toyota (Rosa)'
  },
  {
    // Corolla 1.8 16V Flex (2014–2018) — E180 — 0W-16 ou 0W-20
    brand: 'Toyota',
    model: 'Corolla',
    engine: '1.8 16V Flex',
    recommendedOil: 'SAE 0W-16 API SN Toyota Genuine',
    oilCapacity: 3.7,
    tirePressureFront: 30,
    tirePressureRear: 30,
    sparkPlugModel: 'NGK ILFR5E11',
    brakeFluidType: 'DOT 3',
    coolantType: 'Orgânico Toyota (Rosa)'
  },

  // ─── JEEP ─────────────────────────────────────────────────────────────────
  {
    // Compass 2.0 Tigershark Flex (2017–2021)
    brand: 'Jeep',
    model: 'Compass',
    engine: '2.0 Tigershark Flex',
    recommendedOil: 'SAE 5W-30 API SN Mopar',
    oilCapacity: 4.8,
    tirePressureFront: 32,
    tirePressureRear: 32,
    sparkPlugModel: 'NGK LZKAR7A',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Mopar (Vermelho)'
  },
  {
    // Compass 1.3 Turbo Flex (2021+) — nova geração restyle
    brand: 'Jeep',
    model: 'Compass',
    engine: '1.3 Turbo Flex',
    recommendedOil: 'SAE 0W-20 API SN Mopar',
    oilCapacity: 4.5,
    tirePressureFront: 32,
    tirePressureRear: 32,
    sparkPlugModel: 'NGK SILZKR7B11',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Mopar (Vermelho)'
  },

  // ─── HONDA ────────────────────────────────────────────────────────────────
  {
    // Civic 10ª Geração (2016) — 2.0 i-VTEC Flex
    brand: 'Honda',
    model: 'Civic',
    engine: '2.0 i-VTEC Flex',
    recommendedOil: 'SAE 0W-20 API SN Honda Genuine',
    oilCapacity: 3.7,
    tirePressureFront: 32,
    tirePressureRear: 32,
    sparkPlugModel: 'NGK SILZKR7C11S',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Honda (Azul)'
  },
  {
    // Civic 10ª Geração Turbo (2017+) — 1.5 VTEC Turbo Flex
    brand: 'Honda',
    model: 'Civic',
    engine: '1.5 VTEC Turbo Flex',
    recommendedOil: 'SAE 0W-20 API SN Honda Genuine',
    oilCapacity: 3.7,
    tirePressureFront: 33,
    tirePressureRear: 33,
    sparkPlugModel: 'NGK ILZKR7B11',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Honda (Azul)'
  },

  // ─── RENAULT ──────────────────────────────────────────────────────────────
  {
    // Sandero 1ª Geração 1.0 16V Hi-Flex (2015–2020)
    brand: 'Renault',
    model: 'Sandero',
    engine: '1.0 16V Hi-Flex',
    recommendedOil: 'SAE 5W-40 API SN Elf Evolution',
    oilCapacity: 3.0,
    tirePressureFront: 30,
    tirePressureRear: 30,
    sparkPlugModel: 'NGK LZKAR7B',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Renault (Amarelo)'
  },
  {
    // Sandero 2ª Geração (2022+) — 1.0 Turbo Flex
    brand: 'Renault',
    model: 'Sandero',
    engine: '1.0 Turbo Flex',
    recommendedOil: 'SAE 5W-40 API SN Elf Evolution',
    oilCapacity: 3.5,
    tirePressureFront: 30,
    tirePressureRear: 30,
    sparkPlugModel: 'NGK ILZKR7B11',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Renault (Amarelo)'
  },

  // ─── NISSAN ───────────────────────────────────────────────────────────────
  {
    // Kicks 1ª Geração (2016–2022) — 1.6 16V Flex
    brand: 'Nissan',
    model: 'Kicks',
    engine: '1.6 16V Flex',
    recommendedOil: 'SAE 5W-30 API SN Genuine Nissan',
    oilCapacity: 4.3,
    tirePressureFront: 33,
    tirePressureRear: 33,
    sparkPlugModel: 'NGK PLKAR6A-11',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Nissan (Azul)'
  },
  {
    // Kicks 2ª Geração (2023+) — 1.0 Turbo Flex
    brand: 'Nissan',
    model: 'Kicks',
    engine: '1.0 Turbo Flex',
    recommendedOil: 'SAE 0W-20 API SP Genuine Nissan',
    oilCapacity: 4.5,
    tirePressureFront: 33,
    tirePressureRear: 33,
    sparkPlugModel: 'NGK DILFR6D13G',
    brakeFluidType: 'DOT 4',
    coolantType: 'Orgânico Nissan (Azul)'
  },
];

async function main() {
  console.log('Iniciando seed do banco de dados...');
  
  // Limpar referências anteriores
  await prisma.carSpecsReference.deleteMany();
  
  for (const spec of carSpecs) {
    await prisma.carSpecsReference.upsert({
      where: {
        brand_model_engine: {
          brand: spec.brand,
          model: spec.model,
          engine: spec.engine
        }
      },
      update: {},
      create: spec
    });
  }

  console.log(`Seed concluído com sucesso. ${carSpecs.length} registros inseridos.`);
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
