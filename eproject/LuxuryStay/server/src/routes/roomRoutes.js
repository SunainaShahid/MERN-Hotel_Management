import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Room from '../models/Room.js';
import { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';

const router = express.Router();

// Ensure 'uploads' directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Engine Configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({ storage });

// Get All Rooms
router.get('/', getAllRooms);

// Get Single Room
router.get('/:id', getRoomById);

// Create Room (Supports Direct JSON & Image Uploads)
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    }

    const { roomNumber, roomType, pricePerNight, amenities, description } = req.body;

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const newRoom = await Room.create({
      roomNumber,
      roomType,
      pricePerNight: Number(pricePerNight),
      description: description || '',
      amenities: typeof amenities === 'string' ? amenities.split(',').map(a => a.trim()) : (amenities || []),
      images: images.length > 0 ? images : ['/images/bakers.jpg'],
      image: images.length > 0 ? images[0] : '/images/bakers.jpg',
      status: 'AVAILABLE',
      cleaningStatus: 'CLEANED'
    });

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Room (Multer middleware added here!)
router.put('/:id', upload.array('images', 10), updateRoom);
router.patch('/:id', upload.array('images', 10), updateRoom);

// Delete Room
router.delete('/:id', deleteRoom);

export default router;