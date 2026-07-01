import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth';
import { 
  getVehicles, 
  getVehicleById, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle,
  getCarSpecsReferences
} from '../controllers/vehicles';
import { 
  getMaintenancesByVehicle, 
  createMaintenance, 
  updateMaintenance, 
  deleteMaintenance,
  checkAlertsManual
} from '../controllers/maintenances';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rotas de Autenticação pública
router.post('/auth/register', register);
router.post('/auth/login', login);

// Perfil do Usuário
router.get('/auth/profile', authMiddleware, getProfile);

// Rotas de Veículos (todas protegidas por JWT)
router.get('/vehicles', authMiddleware, getVehicles);
router.get('/vehicles/specs', authMiddleware, getCarSpecsReferences);
router.get('/vehicles/:id', authMiddleware, getVehicleById);
router.post('/vehicles', authMiddleware, createVehicle);
router.put('/vehicles/:id', authMiddleware, updateVehicle);
router.delete('/vehicles/:id', authMiddleware, deleteVehicle);

// Rotas de Manutenção (todas protegidas por JWT)
router.get('/maintenances/vehicle/:vehicleId', authMiddleware, getMaintenancesByVehicle);
router.post('/maintenances', authMiddleware, createMaintenance);
router.put('/maintenances/:id', authMiddleware, updateMaintenance);
router.delete('/maintenances/:id', authMiddleware, deleteMaintenance);

// Disparar checagem manual de alertas por email
router.post('/maintenances/check-alerts', authMiddleware, checkAlertsManual);

export default router;
