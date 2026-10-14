import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  roomTitle: { type: String },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);