import API from './api';

// Fetch all rooms from DB
export const getRooms = async () => {
  const response = await API.get('/rooms');
  return response.data;
};

// Create a new room (Admin/Manager)
export const createRoom = async (roomData) => {
  const token = localStorage.getItem('token');
  const response = await API.post('/rooms', roomData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};