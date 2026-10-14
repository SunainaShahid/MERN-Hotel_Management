import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  reportedBy: { type: String, required: true }, // e.g., Guest name or Staff name
  issueDescription: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Maintenance', maintenanceSchema);