import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BOOKED', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
    cleaningStatus: {
      type: String,
      enum: ['CLEANED', 'DIRTY'],
      default: 'CLEANED',
    },
  },
  { timestamps: true }
);
const Room = mongoose.model('Room', roomSchema);
export default Room;