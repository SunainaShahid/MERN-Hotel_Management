import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  
  // Guest Information
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  guestPhone: { type: String, required: true },
  guestCnic: { type: String, required: true },
  
  // Booking Stay Information
  checkInDate: { type: Date, required: true },
  checkInTime: { type: String, default: '12:00 PM' },
  checkOutDate: { type: Date, required: true },
  numberOfGuests: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  
  // Additional Preferences
  airportPickup: { type: Boolean, default: false },
  specialRequests: { type: String },
  
  status: {
    type: String,
    enum: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'],
    default: 'CONFIRMED'
  }
  }, 
  { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);