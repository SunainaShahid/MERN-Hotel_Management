import Reservation from '../models/Reservation.js';
import Invoice from '../models/Invoice.js';
import Room from '../models/Room.js';
import Notification from '../models/Notification.js';
import { sendBookingConfirmationEmail } from '../utils/sendEmail.js';



export const createReservation = async (req, res) => {
  try {
    const {
      roomId, guestName, guestEmail, guestPhone, guestCnic,
      checkInDate, checkInTime, checkOutDate, numberOfGuests,
      totalNights, totalAmount, airportPickup, specialRequests
    } = req.body;

    if (!roomId || !checkInDate || !checkOutDate || !guestCnic) {
      return res.status(400).json({ message: 'CNIC, Room, and Check-In/Check-Out dates are required.' });
    }

    // 1. Past Date Validation Check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInObj = new Date(checkInDate);
    const checkOutObj = new Date(checkOutDate);

    if (checkInObj < today) {
      return res.status(400).json({ message: 'ou cannot book for past months or previous dates.' });
    }

    if (checkOutObj <= checkInObj) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }

    // 2. Overlapping / Clash Check (Confirmed ya Checked-In bookings ke liye)
    const existingBooking = await Reservation.findOne({
      room: roomId,
      status: { $in: ['CONFIRMED', 'CHECKED_IN'] },$or: [
        {
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'This room is already booked for these dates. Please choose different dates.'
      });
    }

    // Reservation create karte waqt dates ko cleanly pass karein
    const booking = await Reservation.create({
      user: req.user.id,
      room: roomId,
      guestName,
      guestEmail,
      guestPhone,
      guestCnic,
      checkInDate, // Original string format (jaise pehle save hota tha)
      checkInTime: checkInTime || '12:00 PM',
      checkOutDate, // Original string format
      numberOfGuests: numberOfGuests || 1,
      totalNights,
      totalAmount,
      airportPickup: airportPickup === 'Yes' || airportPickup === true,
      specialRequests
    });

    // Naya reservation create hone par notification generate karein
    await Notification.create({
      title: 'New Booking Received',
      message: `A new booking has been placed by ${guestName || 'Guest'}.`,
      type: 'booking'
    });

    // Populate room details
    const populatedBooking = await Reservation.findById(booking._id).populate('room');
    
    // Send confirmation email to guest
    await sendBookingConfirmationEmail({
      guestName: populatedBooking.guestName,
      guestEmail: populatedBooking.guestEmail,
      roomTitle: populatedBooking.room?.roomType || populatedBooking.room?.title || 'Luxury Suite',
      roomNumber: populatedBooking.room?.roomNumber || '101',
      checkInDate: populatedBooking.checkInDate,
      checkOutDate: populatedBooking.checkOutDate,
      guestCnic: populatedBooking.guestCnic,
      totalPrice: populatedBooking.totalAmount
    });

    res.status(201).json({ message: 'Reservation confirmed successfully!', booking: populatedBooking });
  } catch (error) {
    console.error('Booking Creation Error:', error);
    res.status(500).json({ message: error.message || 'Server error during reservation' });
  }
};


export const getMyBookings = async (req, res) => {
  try {
    // Jo code pehly aapke paas chal raha tha, wahi bilkul exact yahan laga diya hai
    const bookings = await Reservation.find({ user: req.user.id })
      .populate('room')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('room')
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id).populate('room');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = status;

    // Agar status CHECKED_OUT ho toh alag 'invoices' collection mein record save ho jayega
    if (status === 'CHECKED_OUT') {
      const existingInvoice = await Invoice.findOne({ reservation: reservation._id });

      if (!existingInvoice) {
        await Invoice.create({
          reservation: reservation._id,
          user: reservation.user,
          invoiceNumber: 'INV-' + Date.now().toString().slice(-6),
          guestName: reservation.guestName,
          guestEmail: reservation.guestEmail,
          guestPhone: reservation.guestPhone,
          guestCnic: reservation.guestCnic || 'N/A',
          roomNumber: reservation.room?.roomNumber || 'N/A',
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          roomRate: reservation.totalAmount,
          tax: 0,
          totalPaid: reservation.totalAmount,
          paymentStatus: 'PAID'
        });
      }
    }

    const updated = await reservation.save();
    const populatedReservation = await Reservation.findById(updated._id).populate('room');

    res.status(200).json(populatedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




