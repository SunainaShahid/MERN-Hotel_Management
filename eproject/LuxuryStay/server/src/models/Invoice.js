import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  guestPhone: { type: String, required: true },
  guestCnic: { type: String, required: true },
  roomNumber: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  roomRate: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  totalPaid: { type: Number, required: true },
  paymentStatus: { type: String, default: 'PAID' }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);