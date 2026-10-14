import express from 'express';
import { 
  getMaintenanceRequests, 
  createMaintenanceRequest, 
  updateMaintenanceStatus 
} from '../controllers/maintenanceController.js';

const router = express.Router();

router.get('/', getMaintenanceRequests);
router.post('/', createMaintenanceRequest);
router.patch('/:id/status', updateMaintenanceStatus);

export default router;