import express from 'express';
import { createReservation, getMyBookings, getAllReservations, updateReservationStatus } from '../controllers/reservationController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes definition with proper security & flow
router.get('/', getAllReservations);
router.post('/', verifyToken, createReservation);
router.get('/my-bookings', verifyToken, getMyBookings);
router.patch('/:id/status', updateReservationStatus);

export default router;