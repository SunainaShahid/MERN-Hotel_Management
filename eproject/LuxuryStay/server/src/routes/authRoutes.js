import express from 'express';
import { 
  register, 
  login, 
  getAllUsers, 
  updateUserRole, 
  deleteUser 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Staff & Users Management Endpoints
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.patch('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;