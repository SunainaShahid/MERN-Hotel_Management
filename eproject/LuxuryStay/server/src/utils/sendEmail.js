import nodemailer from 'nodemailer';

export const sendBookingConfirmationEmail = async (bookingData) => {
  try {
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'muhammadnomansiddiqui794@gmail.com', // <-- Yahan email likh dein
        pass: 'ytrombrrzzmgqozu' // <-- Yahan app password likh dein
      }
    });

    const mailOptions = {
      from: '"LuxuryStay Hotels & Resorts" <muhammadnomansiddiqui794@gmail.com>',
      to: bookingData.guestEmail, // Guest ki email jo booking ke waqt di gayi ho
      subject: 'Your LuxuryStay Reservation is Confirmed!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #292524; max-width: 600px; margin: auto; background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #b45309; font-family: serif; letter-spacing: 2px; margin-bottom: 5px;">LUXURYSTAY</h1>
            <p style="font-size: 10px; font-weight: bold; color: #78716c; letter-spacing: 3px; text-transform: uppercase; margin: 0;">Hotels & Resorts</p>
          </div>
          
          <p style="font-size: 14px;">Dear <b>${bookingData.guestName}</b>,</p>
          <p style="font-size: 14px; color: #44403c;">Thank you for choosing LuxuryStay! Your reservation has been successfully confirmed. We are excited to host you.</p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e7e5e4; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1c1917; font-size: 15px; border-bottom: 1px solid #f5f5f4; padding-bottom: 8px;">Reservation Summary</h3>
            <ul style="list-style: none; padding: 0; font-size: 13px; color: #44403c; line-height: 1.8;">
              <li><b>Room Type:</b> ${bookingData.roomTitle}</li>
              <li><b>Room Number:</b> #${bookingData.roomNumber}</li>
              <li><b>Check-In Date:</b> ${bookingData.checkInDate}</li>
              <li><b>Check-Out Date:</b> ${bookingData.checkOutDate}</li>
              <li><b>CNIC:</b> ${bookingData.guestCnic}</li>
              <li><b>Total Amount:</b> <span style="color: #b45309; font-weight: bold;">PKR ${bookingData.totalPrice}</span></li>
            </ul>
          </div>

          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 30px;">If you have any questions or require special assistance, feel free to contact our front desk.<br/><b>We look forward to providing you with an unforgettable experience.</b></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Reservation confirmation email sent successfully!');
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};