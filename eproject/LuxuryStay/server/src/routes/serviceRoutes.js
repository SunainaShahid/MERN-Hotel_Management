import express from 'express';
import { createServiceRequest, getAllServiceRequests, updateServiceStatus } from '../controllers/serviceController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; // Apne auth middleware ka path check kar lein

const router = express.Router();

router.post('/', verifyToken, createServiceRequest);
router.get('/', verifyToken, getAllServiceRequests);
router.patch('/:id/status', verifyToken, updateServiceStatus);

export default router;