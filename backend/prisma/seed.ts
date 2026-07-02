import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const carSpecs = [
  // FIAT
  { brand: 'Fiat', model: 'Uno', engine: '1.0 Fire Flex', recommendedOil: '5W-30 API SN', oilCapacity: 2.7, tirePressureFront: 28, tirePressureRear: 28, sparkPlugModel: 'NGK BKR6E', brakeFluidType: 'DOT 4', coolantType: 'Paraflu Rosa' },
  { brand: 'Fiat', model: 'Argo', engine: '1.0 Firefly Flex', recommendedOil: '0W-20 API SN', oilCapacity: 2.7, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK LKR7B-9', brakeFluidType: 'DOT 4', coolantType: 'Paraflu Rosa' },
  { brand: 'Fiat', model: 'Mobi', engine: '1.0 Fire Flex', recommendedOil: '5W-30 API SN', oilCapacity: 2.7, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK BKR6E', brakeFluidType: 'DOT 4', coolantType: 'Paraflu Rosa' },
  { brand: 'Fiat', model: 'Toro', engine: '2.0 Multijet Diesel', recommendedOil: '5W-30 ACEA C2', oilCapacity: 4.2, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'N/A', brakeFluidType: 'DOT 4', coolantType: 'Paraflu Rosa' },
  { brand: 'Fiat', model: 'Strada', engine: '1.4 Fire Flex', recommendedOil: '5W-30 API SN', oilCapacity: 2.7, tirePressureFront: 29, tirePressureRear: 32, sparkPlugModel: 'NGK BKR6E', brakeFluidType: 'DOT 4', coolantType: 'Paraflu Rosa' },

  // FORD
  { brand: 'Ford', model: 'Ka', engine: '1.0 12V TiVCT Flex', recommendedOil: '5W-20 API SN', oilCapacity: 4.1, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK LTR7A-10', brakeFluidType: 'DOT 4', coolantType: 'Motorcraft Laranja' },
  { brand: 'Ford', model: 'Fiesta', engine: '1.6 16V Sigma Flex', recommendedOil: '5W-30 API SN', oilCapacity: 4.1, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK LTR7A-10', brakeFluidType: 'DOT 4', coolantType: 'Motorcraft Laranja' },
  { brand: 'Ford', model: 'Ecosport', engine: '1.5 12V Dragon Flex', recommendedOil: '5W-20 API SN', oilCapacity: 4.1, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK ILTR6G8G', brakeFluidType: 'DOT 4', coolantType: 'Motorcraft Laranja' },
  { brand: 'Ford', model: 'Ranger', engine: '3.2 Duratorq Diesel', recommendedOil: '5W-30 ACEA A5/B5', oilCapacity: 9.8, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'N/A', brakeFluidType: 'DOT 4', coolantType: 'Motorcraft Laranja' },

  // CHEVROLET
  { brand: 'Chevrolet', model: 'Onix', engine: '1.0 12V Turbo Flex', recommendedOil: '0W-20 API SN Dexos 1', oilCapacity: 3.5, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'NGK DILZKR7B11', brakeFluidType: 'DOT 4', coolantType: 'Dex-Cool Laranja' },
  { brand: 'Chevrolet', model: 'Tracker', engine: '1.2 12V Turbo Flex', recommendedOil: '0W-20 API SN Dexos 1', oilCapacity: 3.5, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'NGK DILZKR7B11', brakeFluidType: 'DOT 4', coolantType: 'Dex-Cool Laranja' },
  { brand: 'Chevrolet', model: 'Cruze', engine: '1.4 16V Turbo Flex', recommendedOil: '0W-20 API SN Dexos 1', oilCapacity: 4.0, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'NGK ILTR6M9G', brakeFluidType: 'DOT 4', coolantType: 'Dex-Cool Laranja' },
  { brand: 'Chevrolet', model: 'S10', engine: '2.8 CTDI Diesel', recommendedOil: '5W-30 Dexos 2', oilCapacity: 5.7, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'N/A', brakeFluidType: 'DOT 4', coolantType: 'Dex-Cool Laranja' },

  // VW
  { brand: 'Volkswagen', model: 'Gol', engine: '1.0 12V MPI Flex', recommendedOil: '5W-40 VW 502.00', oilCapacity: 3.3, tirePressureFront: 29, tirePressureRear: 29, sparkPlugModel: 'NGK BKUR5ET-10', brakeFluidType: 'DOT 4', coolantType: 'G12 Rosa' },
  { brand: 'Volkswagen', model: 'Polo', engine: '1.0 12V TSI Flex', recommendedOil: '5W-40 VW 502.00', oilCapacity: 4.0, tirePressureFront: 33, tirePressureRear: 33, sparkPlugModel: 'NGK PZKER7A8EGS', brakeFluidType: 'DOT 4', coolantType: 'G13 Rosa' },
  { brand: 'Volkswagen', model: 'T-Cross', engine: '1.4 16V TSI Flex', recommendedOil: '5W-40 VW 502.00', oilCapacity: 4.0, tirePressureFront: 33, tirePressureRear: 33, sparkPlugModel: 'NGK PZKER7A8EGS', brakeFluidType: 'DOT 4', coolantType: 'G13 Rosa' },
  { brand: 'Volkswagen', model: 'Amarok', engine: '2.0 TDI Diesel', recommendedOil: '5W-30 VW 507.00', oilCapacity: 7.0, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'N/A', brakeFluidType: 'DOT 4', coolantType: 'G13 Rosa' },

  // HYUNDAI
  { brand: 'Hyundai', model: 'HB20', engine: '1.0 12V Kappa Flex', recommendedOil: '5W-30 API SN', oilCapacity: 2.9, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK LKR7B-9', brakeFluidType: 'DOT 4', coolantType: 'Hyundai Verde' },
  { brand: 'Hyundai', model: 'Creta', engine: '1.6 16V Gamma Flex', recommendedOil: '5W-30 API SN', oilCapacity: 3.6, tirePressureFront: 33, tirePressureRear: 33, sparkPlugModel: 'NGK SILZKR7B11', brakeFluidType: 'DOT 4', coolantType: 'Hyundai Verde' },
  { brand: 'Hyundai', model: 'Tucson', engine: '1.6 16V T-GDI', recommendedOil: '5W-30 API SN', oilCapacity: 4.5, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'NGK SILZKR7B11', brakeFluidType: 'DOT 4', coolantType: 'Hyundai Verde' },

  // HONDA
  { brand: 'Honda', model: 'Civic', engine: '2.0 16V i-VTEC Flex', recommendedOil: '0W-20 API SN', oilCapacity: 3.7, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK SILZKR7C11S', brakeFluidType: 'DOT 4', coolantType: 'Honda Azul' },
  { brand: 'Honda', model: 'HR-V', engine: '1.8 16V i-VTEC Flex', recommendedOil: '0W-20 API SN', oilCapacity: 3.7, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK SILZKR7C11S', brakeFluidType: 'DOT 4', coolantType: 'Honda Azul' },
  { brand: 'Honda', model: 'Fit', engine: '1.5 16V i-VTEC Flex', recommendedOil: '0W-20 API SN', oilCapacity: 3.6, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK DILZKR7A11G', brakeFluidType: 'DOT 4', coolantType: 'Honda Azul' },

  // MITSUBISHI
  { brand: 'Mitsubishi', model: 'L200 Triton', engine: '2.4 16V DI-D Diesel', recommendedOil: '5W-30 ACEA A5/B5', oilCapacity: 8.4, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'N/A', brakeFluidType: 'DOT 4', coolantType: 'Mitsubishi Long Life' },
  { brand: 'Mitsubishi', model: 'ASX', engine: '2.0 16V MIVEC Flex', recommendedOil: '5W-30 API SN', oilCapacity: 4.3, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'NGK DILFR5A11', brakeFluidType: 'DOT 4', coolantType: 'Mitsubishi Long Life' },

  // SUBARU
  { brand: 'Subaru', model: 'Forester', engine: '2.0 16V Boxer', recommendedOil: '0W-20 API SN', oilCapacity: 4.8, tirePressureFront: 32, tirePressureRear: 30, sparkPlugModel: 'NGK SILZKAR7B11', brakeFluidType: 'DOT 4', coolantType: 'Subaru Super Coolant' },
  { brand: 'Subaru', model: 'XV', engine: '2.0 16V Boxer', recommendedOil: '0W-20 API SN', oilCapacity: 4.8, tirePressureFront: 33, tirePressureRear: 32, sparkPlugModel: 'NGK SILZKAR7B11', brakeFluidType: 'DOT 4', coolantType: 'Subaru Super Coolant' },

  // CHERY
  { brand: 'Chery', model: 'Tiggo 5X', engine: '1.5 16V Turbo Flex', recommendedOil: '5W-40 API SN', oilCapacity: 4.5, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'BOSCH YR7SES', brakeFluidType: 'DOT 4', coolantType: 'Chery Orgânico' },
  { brand: 'Chery', model: 'Tiggo 8', engine: '1.6 16V TGDI', recommendedOil: '5W-30 API SN', oilCapacity: 4.5, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'NGK ILKAR7B11', brakeFluidType: 'DOT 4', coolantType: 'Chery Orgânico' },

  // TOYOTA
  { brand: 'Toyota', model: 'Corolla', engine: '2.0 16V Dual VVT-iE Flex', recommendedOil: '0W-20 API SN', oilCapacity: 4.2, tirePressureFront: 33, tirePressureRear: 33, sparkPlugModel: 'NGK DILKAR7B11', brakeFluidType: 'DOT 3', coolantType: 'Toyota Super Long Life (Rosa)' },
  { brand: 'Toyota', model: 'Hilux', engine: '2.8 16V D-4D Diesel', recommendedOil: '5W-30 ACEA C2/C3', oilCapacity: 7.5, tirePressureFront: 29, tirePressureRear: 29, sparkPlugModel: 'N/A', brakeFluidType: 'DOT 3', coolantType: 'Toyota Super Long Life (Rosa)' },
  { brand: 'Toyota', model: 'Yaris', engine: '1.5 16V Flex', recommendedOil: '5W-30 API SN', oilCapacity: 3.3, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK ILKAR7B11', brakeFluidType: 'DOT 3', coolantType: 'Toyota Super Long Life (Rosa)' },

  // JEEP
  { brand: 'Jeep', model: 'Compass', engine: '1.3 16V Turbo Flex', recommendedOil: '0W-20 API SN', oilCapacity: 4.5, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'NGK SILZKR7B11', brakeFluidType: 'DOT 4', coolantType: 'Mopar Orgânico Vermelho' },
  { brand: 'Jeep', model: 'Renegade', engine: '1.8 16V E.torQ Flex', recommendedOil: '5W-30 API SN', oilCapacity: 4.3, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK BKR7E-10', brakeFluidType: 'DOT 4', coolantType: 'Mopar Orgânico Vermelho' },
  { brand: 'Jeep', model: 'Commander', engine: '2.0 16V Multijet Diesel', recommendedOil: '5W-30 ACEA C2', oilCapacity: 4.2, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'N/A', brakeFluidType: 'DOT 4', coolantType: 'Mopar Orgânico Vermelho' },

  // NISSAN
  { brand: 'Nissan', model: 'Kicks', engine: '1.6 16V Flex', recommendedOil: '5W-30 API SN', oilCapacity: 4.3, tirePressureFront: 33, tirePressureRear: 33, sparkPlugModel: 'NGK PLKAR6A-11', brakeFluidType: 'DOT 4', coolantType: 'Nissan Azul' },
  { brand: 'Nissan', model: 'Frontier', engine: '2.3 16V Bi-Turbo Diesel', recommendedOil: '5W-30 ACEA C4', oilCapacity: 6.3, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'N/A', brakeFluidType: 'DOT 4', coolantType: 'Nissan L255N Azul' },
  { brand: 'Nissan', model: 'Versa', engine: '1.6 16V Flex', recommendedOil: '5W-30 API SN', oilCapacity: 4.3, tire								pressureFront: 33, tirePressureRear: 33, sparkPlugModel: 'NGK PLKAR6A-11', brakeFluidType: 'DOT 4', coolantType: 'Nissan Azul' },

  // PEUGEOT
  { brand: 'Peugeot', model: '208', engine: '1.6 16V EC5 Flex', recommendedOil: '5W-30 API SN', oilCapacity: 3.2, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'BOSCH FR8SE0', brakeFluidType: 'DOT 4', coolantType: 'Total Glacelf' },
  { brand: 'Peugeot', model: '3008', engine: '1.6 16V THP', recommendedOil: '0W-30 ACEA C2', oilCapacity: 4.2, tirePressureFront: 35, tirePressureRear: 35, sparkPlugModel: 'NGK PLZKBR7A-G', brakeFluidType: 'DOT 4', coolantType: 'Total Glacelf' },

  // CITROEN
  { brand: 'Citroen', model: 'C4 Cactus', engine: '1.6 16V THP Flex', recommendedOil: '0W-30 ACEA C2', oilCapacity: 4.2, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK PLZKBR7A-G', brakeFluidType: 'DOT 4', coolantType: 'Total Glacelf' },
  { brand: 'Citroen', model: 'C3', engine: '1.2 12V PureTech', recommendedOil: '0W-30 ACEA C2', oilCapacity: 3.5, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK LZKR6B-10E', brakeFluidType: 'DOT 4', coolantType: 'Total Glacelf' },

  // RENAULT
  { brand: 'Renault', model: 'Kwid', engine: '1.0 12V SCe Flex', recommendedOil: '10W-40 API SN', oilCapacity: 2.9, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK LZKAR7B', brakeFluidType: 'DOT 4', coolantType: 'Renault Glaceol RX Type D' },
  { brand: 'Renault', model: 'Sandero', engine: '1.0 12V SCe Flex', recommendedOil: '10W-40 API SN', oilCapacity: 2.9, tirePressureFront: 32, tirePressureRear: 32, sparkPlugModel: 'NGK LZKAR7B', brakeFluidType: 'DOT 4', coolantType: 'Renault Glaceol RX Type D' },
  { brand: 'Renault', model: 'Duster', engine: '1.6 16V SCe Flex', recommendedOil: '10W-40 API SN', oilCapacity: 4.3, tirePressureFront: 30, tirePressureRear: 30, sparkPlugModel: 'NGK LZKAR7B', brakeFluidType: 'DOT 4', coolantType: 'Renault Glaceol RX Type D' },
];

async function main() {
  console.log('Iniciando seed do banco de dados com 43 modelos (15 marcas)...');
  await prisma.carSpecsReference.deleteMany();
  for (const spec of carSpecs) {
    await prisma.carSpecsReference.upsert({
      where: {
        brand_model_engine: { brand: spec.brand, model: spec.model, engine: spec.engine }
      },
      update: {},
      create: spec
    });
  }
  console.log(`Seed concluído com sucesso. ${carSpecs.length} registros inseridos.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
