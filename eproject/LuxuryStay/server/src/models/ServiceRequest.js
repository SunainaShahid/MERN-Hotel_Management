import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guestName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  serviceType: { 
    type: String, 
    enum: ['Room Service', 'Wake-up Call', 'Transportation', 'Laundry', 'Other'], 
    required: true 
  },
  details: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed'], 
    default: 'Pending' 
  },
}, { timestamps: true });

export default mongoose.model('ServiceRequest', serviceRequestSchema);