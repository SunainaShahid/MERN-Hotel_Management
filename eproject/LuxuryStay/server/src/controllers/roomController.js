// import Room from '../models/Room.js';

// // Get All Rooms
// export const getAllRooms = async (req, res) => {
//   try {
//     const { status, roomType } = req.query;
//     let query = {};
//     if (status) query.status = status;
//     if (roomType) query.roomType = roomType;

//     const rooms = await Room.find(query).sort({ createdAt: -1 });
//     res.status(200).json(rooms);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get Single Room Details
// export const getRoomById = async (req, res) => {
//   try {
//     const room = await Room.findById(req.params.id);
//     if (!room) return res.status(404).json({ message: 'Room not found' });
//     res.status(200).json(room);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Create New Room
// export const createRoom = async (req, res) => {
//   try {
//     const { roomNumber, roomType, pricePerNight, amenities, description, image } = req.body;

//     const existingRoom = await Room.findOne({ roomNumber });
//     if (existingRoom) {
//       return res.status(400).json({ message: 'Room number already exists' });
//     }

//     const room = await Room.create({
//       roomNumber,
//       roomType,
//       pricePerNight,
//       amenities: amenities || [],
//       description,
//       image: image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
//     });

//     res.status(201).json({ message: 'Room created successfully', room });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update Room
// export const updateRoom = async (req, res) => {
//   try {
//     const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });
//     res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete Room
// export const deleteRoom = async (req, res) => {
//   try {
//     const room = await Room.findByIdAndDelete(req.params.id);
//     if (!room) return res.status(404).json({ message: 'Room not found' });
//     res.status(200).json({ message: 'Room deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// import Room from '../models/Room.js';

// // Get All Rooms
// export const getAllRooms = async (req, res) => {
//   try {
//     const { status, roomType } = req.query;
//     let query = {};
//     if (status) query.status = status;
//     if (roomType) query.roomType = roomType;

//     const rooms = await Room.find(query).sort({ roomNumber: 1 });
//     res.status(200).json(rooms);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get Single Room Details
// export const getRoomById = async (req, res) => {
//   try {
//     const room = await Room.findById(req.params.id);
//     if (!room) return res.status(404).json({ message: 'Room not found' });
//     res.status(200).json(room);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Create New Room
// export const createRoom = async (req, res) => {
//   try {
//     const { roomNumber, roomType, pricePerNight, amenities, description, image, images } = req.body;

//     const existingRoom = await Room.findOne({ roomNumber });
//     if (existingRoom) {
//       return res.status(400).json({ message: 'Room number already exists' });
//     }

//     const room = await Room.create({
//       roomNumber,
//       roomType,
//       pricePerNight,
//       amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map(a => a.trim()) : []),
//       description,
//       image: image || (images && images.length > 0 ? images[0] : ''),
//       images: images || (image ? [image] : []),
//       status: 'AVAILABLE',
//       cleaningStatus: 'CLEANED'
//     });

//     res.status(201).json(room);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update Room (Including Cleaning Status & Rates)
// export const updateRoom = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedRoom = await Room.findByIdAndUpdate(
//       id,
//       { $set: req.body },
//       { new: true, runValidators: false }
//     );

//     if (!updatedRoom) {
//       return res.status(404).json({ message: 'Room not found' });
//     }

//     res.status(200).json(updatedRoom);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete Room
// export const deleteRoom = async (req, res) => {
//   try {
//     const room = await Room.findByIdAndDelete(req.params.id);
//     if (!room) return res.status(404).json({ message: 'Room not found' });
//     res.status(200).json({ message: 'Room deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



import Room from '../models/Room.js';

// Get All Rooms
export const getAllRooms = async (req, res) => {
  try {
    const { status, roomType } = req.query;
    let query = {};
    if (status) query.status = status;
    if (roomType) query.roomType = roomType;

    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Room Details
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create New Room
export const createRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight, description, amenities } = req.body;

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(f => `/uploads/${f.filename}`);
    }

    const formattedAmenities = typeof amenities === 'string'
      ? amenities.split(',').map(a => a.trim()).filter(a => a.length > 0)
      : (Array.isArray(amenities) ? amenities : []);

    const newRoom = await Room.create({
      roomNumber,
      roomType,
      pricePerNight: Number(pricePerNight),
      description: description || '',
      amenities: formattedAmenities,
      images: imagePaths,
      image: imagePaths.length > 0 ? imagePaths[0] : '',
      status: 'AVAILABLE',
      cleaningStatus: 'CLEANED'
    });

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Room
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    let finalImages = [];
    if (req.body.existingImages) {
      try {
        finalImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        finalImages = [];
      }
    } else {
      const existingRoom = await Room.findById(id);
      if (existingRoom && existingRoom.images) {
        finalImages = existingRoom.images;
      }
    }

    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(f => `/uploads/${f.filename}`);
      finalImages = [...finalImages, ...newImagePaths];
    }

    if (finalImages.length > 0) {
      updateData.images = finalImages;
      updateData.image = finalImages[0];
    }

    if (updateData.amenities && typeof updateData.amenities === 'string') {
      updateData.amenities = updateData.amenities.split(',').map(a => a.trim()).filter(a => a.length > 0);
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};