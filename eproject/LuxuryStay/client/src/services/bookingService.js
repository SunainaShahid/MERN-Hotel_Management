import API from './api';

export const createBooking = async (bookingData) => {
  const token = localStorage.getItem('token');
  const response = await API.post('/reservations', bookingData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};