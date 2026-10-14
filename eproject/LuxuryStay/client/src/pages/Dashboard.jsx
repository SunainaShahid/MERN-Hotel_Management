import { useNavigate, Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import API from '../services/api';
import {
  Building2, PlusCircle, CalendarCheck, Users, Sparkles, LogOut, Crown, Wrench,
  Search, Home, RefreshCw, Upload, Edit3, Trash2, CheckCircle2, X, Clock, Star, Bell, ConciergeBell,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'RECEPTIONIST';

  const [activeTab, setActiveTab] = useState('bookings');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({ roomId: '', reportedBy: '', issueDescription: '', priority: 'Medium' });

  const [adminReviews, setAdminReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');


  // Add & Edit Room Form States
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    roomType: 'Standard Single Room',
    pricePerNight: '',
    description: '',
    amenities: 'King Size Bed, Free Wifi, Smart TV, AC'
  });
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    if (['HOUSEKEEPING', 'HOUSEKEEPER'].includes(userRole)) {
      setActiveTab('housekeeping');
    } else if (userRole === 'RECEPTIONIST') {
      setActiveTab('bookings');
    } else {
      setActiveTab('rooms');
    }

    fetchAllData();
  }, [userRole]);

  const fetchAllData = async () => {
    try {
      // 1. Rooms fetch karein
      try {
        const roomsRes = await api.get('/rooms');
        setRooms(roomsRes.data || []);
      } catch (err) {
        setRooms([]);
      }

      // 2. Bookings fetch karein
      try {
        const bookingsRes = await api.get('/reservations');
        setBookings(bookingsRes.data || []);
      } catch (err) {
        try {
          const bookingsResAlt = await api.get('/bookings');
          setBookings(bookingsResAlt.data || []);
        } catch (e) {
          setBookings([]);
        }
      }

      // 3. Users fetch karein (Safe catch ke sath)
      try {
        const usersRes = await api.get('/users');
        setUsersList(usersRes.data || []);
      } catch (err) {
        setUsersList([]);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/auth'); // Home.jsx mein window.location.reload() use kar lein
  };
  // const handleLogout = () => {
  //   localStorage.clear();
  //   navigate('/auth');
  // };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    const targetPreview = imagePreviews[indexToRemove];
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));

    // Agar yeh nayi upload ki gayi file ki preview thi, toh imageFiles se bhi hata dein
    if (targetPreview && targetPreview.startsWith('data:')) {
      const dataPreviewsBefore = imagePreviews.slice(0, indexToRemove).filter(p => p.startsWith('data:')).length;
      setImageFiles(prev => prev.filter((_, idx) => idx !== dataPreviewsBefore));
    }
  };


  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleOpenInvoice = (booking) => {
    setSelectedInvoice(booking);
  };

  useEffect(() => {
    const fetchAdminReviews = async () => {
      try {
        const res = await API.get('/reviews');
        setAdminReviews(res.data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchAdminReviews();
  }, []);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/notifications');
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Har 10 seconds baad update ho
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      const res = await API.get('/maintenance');
      setMaintenanceList(res.data);
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/maintenance', maintenanceForm);
      if (res.status === 201 || res.status === 200) {
        setMaintenanceList([res.data, ...maintenanceList]);
        setShowMaintenanceModal(false);
        setMaintenanceForm({ roomId: '', reportedBy: '', issueDescription: '', priority: 'Medium' });
      }
    } catch (err) {
      console.error('Error submitting maintenance request:', err);
    }
  };


  const handleMaintenanceStatusChange = async (id, newStatus) => {
    try {
      const res = await API.patch(`/maintenance/${id}/status`, { status: newStatus });
      setMaintenanceList(maintenanceList.map(item => item._id === id ? res.data : item));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };


  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/reservations/${bookingId}/status`, { status: newStatus });
      fetchAllData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const toggleHousekeepingStatus = async (room) => {
    const currentStatus = room.cleaningStatus || 'CLEANED';
    const newStatus = currentStatus === 'CLEANED' ? 'DIRTY' : 'CLEANED';

    try {
      const res = await api.patch(`/rooms/${room._id}`, { cleaningStatus: newStatus });
      if (res.data) {
        setRooms(prevRooms =>
          prevRooms.map(r => r._id === room._id ? { ...r, cleaningStatus: newStatus } : r)
        );
      }
    } catch (err) {
      try {
        await api.put(`/rooms/${room._id}`, { ...room, cleaningStatus: newStatus });
        setRooms(prevRooms =>
          prevRooms.map(r => r._id === room._id ? { ...r, cleaningStatus: newStatus } : r)
        );
      } catch (e) {
        alert('Error updating housekeeping status');
      }
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room permanently?')) {
      try {
        console.log("Deleting room ID:", roomId);
        const res = await api.delete(`/rooms/${roomId}`);
        console.log("Delete response:", res.data);
        setRooms(prev => prev.filter(r => r._id !== roomId));
      } catch (err) {
        console.error("Delete error details:", err.response || err.message);
        alert('Failed to delete room: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const token = localStorage.getItem('token'); // ya jo bhi admin token key ho
      const res = await API.get('/services', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setServiceRequests(res.data);
    } catch (err) {
      console.error('Error fetching service requests:', err);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);


  // const handleDeleteRoom = async (roomId) => {
  //   if (window.confirm('Are you sure you want to delete this room permanently?')) {
  //     try {
  //       await api.delete(`/rooms/${roomId}`);
  //       setRooms(prev => prev.filter(r => r._id !== roomId));
  //     } catch (err) {
  //       alert('Failed to delete room');
  //     }
  //   }
  // };


  const handleStartEdit = (room) => {
    setEditingRoomId(room._id);
    setRoomForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      description: room.description || '',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : 'King Size Bed, Free Wifi, Smart TV, AC'
    });

    // Backend URL properly attach karna taake preview mein images saaf nazar aayein
    const existingImages = room.images && room.images.length > 0
      ? room.images.map(img => img.startsWith('http') ? img : `http://localhost:5000${img}`)
      : (room.image ? [room.image.startsWith('http') ? room.image : `http://localhost:5000${room.image}`] : []);

    setImagePreviews(existingImages);
    setImageFiles([]); // Naye files ke liye fresh array
    setActiveTab('add-room');
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setFormMsg('');
    try {
      const formattedAmenities = roomForm.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const formData = new FormData();
      formData.append('roomNumber', roomForm.roomNumber);
      formData.append('roomType', roomForm.roomType);
      formData.append('pricePerNight', Number(roomForm.pricePerNight));
      formData.append('description', roomForm.description);
      formData.append('amenities', formattedAmenities.join(', '));

      // 1. Jo purani/retained images hain unke paths bhejna
      const retainedImages = imagePreviews
        .filter(preview => !preview.startsWith('data:'))
        .map(preview => preview.replace('http://localhost:5000', ''));

      formData.append('existingImages', JSON.stringify(retainedImages));

      // 2. SAARI nayi select ki gayi files ko formData mein append karna (Loop properly handle karna)
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      if (editingRoomId) {
        await api.put(`/rooms/${editingRoomId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormMsg('Room Updated Successfully!');
      } else {
        await api.post('/rooms', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormMsg('New Room Added & Published Successfully!');
      }

      setEditingRoomId(null);
      setImagePreviews([]);
      setImageFiles([]);
      setRoomForm({
        roomNumber: '',
        roomType: 'Standard Single Room',
        pricePerNight: '',
        description: '',
        amenities: 'King Size Bed, Free WiFi, Smart TV, AC'
      });
      fetchAllData();
    } catch (err) {
      console.error('Error saving room:', err);
      setFormMsg('Error saving room. Please check backend connection.');
    }
  };

  // const handleStartEdit = (room) => {
  //   setEditingRoomId(room._id);
  //   setRoomForm({
  //     roomNumber: room.roomNumber,
  //     roomType: room.roomType,
  //     pricePerNight: room.pricePerNight,
  //     description: room.description || '',
  //     amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : 'King Size Bed, Free Wifi, Smart TV, AC'
  //   });
  //   setImagePreviews(room.images && room.images.length > 0 ? room.images : (room.image ? [room.image] : []));
  //   setActiveTab('add-room');
  // };

  // const handleSaveRoom = async (e) => {
  //   e.preventDefault();
  //   setFormMsg('');
  //   try {
  //     const formattedAmenities = roomForm.amenities
  //       .split(',')
  //       .map(a => a.trim())
  //       .filter(a => a.length > 0);

  //     const payload = {
  //       roomNumber: roomForm.roomNumber,
  //       roomType: roomForm.roomType,
  //       pricePerNight: Number(roomForm.pricePerNight),
  //       description: roomForm.description,
  //       amenities: formattedAmenities,
  //       image: imagePreviews[0] || '',
  //       images: imagePreviews,
  //       cleaningStatus: 'CLEANED',
  //       status: 'AVAILABLE'
  //     };

  //     if (editingRoomId) {
  //       await api.put(`/rooms/${editingRoomId}`, payload);
  //       setFormMsg('✨ Room Updated Successfully!');
  //     } else {
  //       await api.post('/rooms', payload);
  //       setFormMsg('✨ New Room Added & Published Successfully!');
  //     }

  //     setEditingRoomId(null);
  //     setImagePreviews([]);
  //     setRoomForm({
  //       roomNumber: '',
  //       roomType: 'Standard Single Room',
  //       pricePerNight: '',
  //       description: '',
  //       amenities: 'King Size Bed, Free Wifi, Smart TV, AC'
  //     });
  //     fetchAllData();
  //   } catch (err) {
  //     console.error('Error saving room:', err);
  //     setFormMsg('Error saving room. Please check backend connection.');
  //   }
  // };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-stone-800 font-sans">
      <header className="bg-[#181614] text-white px-6 py-4 shadow-md sticky top-0 z-40 border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-amber-500 text-stone-950 rounded-full"><Crown size={20} /></div>
            <div>
              <h1 className="text-base font-serif font-bold tracking-widest text-white">LUXURYSTAY</h1>
              <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">
                STAFF PORTAL — <span className="text-white bg-amber-600 px-1.5 py-0.5 rounded text-[8px]">{userRole}</span>
              </p>
            </div>
          </div>


          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-stone-800 text-stone-300 hover:text-white rounded-xl relative transition flex items-center justify-center"
              >
                <Bell size={18} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 overflow-hidden text-left" ref={notificationRef}>
                  <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <div>
                      <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">System Notifications</h4>
                      <span className="text-[10px] text-stone-500">{notifications.filter(n => !n.isRead).length} unread</span>
                    </div>
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <button
                        onClick={async () => {
                          try {
                            // Saari unread notifications ko read mark karne ke liye loop ya API call
                            for (let notif of notifications.filter(n => !n.isRead)) {
                              await API.patch(`/notifications/${notif._id}/read`);
                            }
                            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                          } catch (err) {
                            console.error('Error marking read:', err);
                          }
                        }}
                        className="text-[10px] text-amber-600 font-bold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-38 overflow-y-auto divide-y divide-stone-100 text-xs">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-stone-400 italic">No notifications yet.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={async () => {
                            if (!notif.isRead) {
                              try {
                                await API.patch(`/notifications/${notif._id}/read`);
                                setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                              } catch (err) {
                                console.error('Error marking notification read:', err);
                              }
                            }
                          }}
                          className={`p-3.5 transition cursor-pointer ${notif.isRead ? 'bg-white opacity-60' : 'bg-amber-50/60 hover:bg-amber-50'}`}
                        >
                          <p className="font-bold text-stone-900">{notif.title}</p>
                          <p className="text-stone-600 mt-0.5 text-[11px]">{notif.message}</p>
                          <span className="text-[9px] text-stone-400 mt-1 block">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <span className="hidden sm:block text-xs font-medium text-stone-300">
              Welcome, <strong className="text-amber-400">{user.name || 'Staff Member'}</strong>
            </span>
            <Link to="/" className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-lg text-xs font-bold transition border border-stone-700">
              <Home size={14} /> Back to Site
            </Link>
            <button onClick={handleLogoutClick} className="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-stone-200 px-6 py-3 shadow-xs">
       <div className="bg-white px-6 py-3.5 shadow-xs flex items-center justify-start gap-3 overflow-x-auto whitespace-nowrap border-b border-stone-200">
          {/* Reception Bookings Button */}
          {['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(userRole) && (
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'bookings' ? 'bg-[#181614] text-amber-400 shadow-sm' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'}`}>
              <CalendarCheck size={16} /> Bookings ({bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length})
            </button>
          )}

          {/* Manage Rooms Button */}
          {['ADMIN', 'MANAGER'].includes(userRole) && (
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'rooms' ? 'bg-[#181614] text-amber-400 shadow-sm' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'}`}
            >
              <Building2 size={16} /> Rooms ({rooms.length})
            </button>
          )}

          {/* Add Room Button */}
          {['ADMIN', 'MANAGER'].includes(userRole) && (
            <button
              onClick={() => { setEditingRoomId(null); setImagePreviews([]); setActiveTab('add-room'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'add-room' ? 'bg-[#181614] text-amber-400 shadow-sm' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'}`}
            >
              <PlusCircle size={16} /> Add Room
            </button>
          )}

          {/* Staff & Users Button */}
          {['ADMIN', 'MANAGER'].includes(userRole) && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'users' ? 'bg-[#181614] text-amber-400 shadow-sm' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'}`}
            >
              <Users size={16} /> Users ({usersList.length})
            </button>
          )}

          {/* Booking History Button */}
          {['ADMIN', 'MANAGER'].includes(userRole) && (
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'history' ? 'bg-[#181614] text-amber-400 shadow-sm' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'}`}
            >
              <Clock size={16} /> History
            </button>
          )}

          {/* Maintenance Requests Button */}
          {['ADMIN', 'MANAGER'].includes(userRole) && (
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'maintenance' ? 'bg-[#181614] text-amber-400 shadow-sm' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'}`}
            >
              <Wrench size={16} /> Maintenance
            </button>
          )}

          {/* Housekeeping Desk Button */}
          {['ADMIN', 'HOUSEKEEPING', 'HOUSEKEEPER'].includes(userRole) && (
            <button
              onClick={() => setActiveTab('housekeeping')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'housekeeping' ? 'bg-[#181614] text-amber-400 shadow-sm' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'}`}
            >
              <Sparkles size={16} /> Housekeeping
            </button>
          )}

          {['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'].includes(userRole) && (
  <button
    onClick={() => setActiveTab('services')}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'services' ? 'bg-[#181614] text-amber-400 shadow-sm' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'}`}
  >
    <ConciergeBell size={16} /> Guest Services
  </button>
)}

          {/* Guest Reviews Button */}
          {['ADMIN', 'MANAGER'].includes(userRole) && (
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'reviews' ? 'bg-[#181614] text-amber-400 shadow-sm' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'}`}
            >
              <Star size={16} /> Reviews
            </button>
          )}

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-stone-500 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-amber-600" /> Loading Staff Portal Data...
          </div>
        ) : (
          <>
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-stone-900">Reception Check-In Desk</h2>
                    <p className="text-xs text-stone-500 mt-1">View, confirm, and update arrival statuses for all hotel guests.</p>
                  </div>
                  <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs w-full sm:w-64">
                    <Search size={14} className="text-stone-400 mr-2" />
                    <input type="text" placeholder="Filter by Guest Name / CNIC" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent outline-none w-full text-stone-900 font-medium" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#181614] text-amber-300 font-bold uppercase tracking-wider">
                          <th className="p-4">Guest Info</th>
                          <th className="p-4">CNIC Number</th>
                          <th className="p-4">Room & Dates</th>
                          <th className="p-4">Bill Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium">
                        {bookings.length === 0 ? (
                          <tr><td colSpan="6" className="p-8 text-center text-stone-400">No reservation records found.</td></tr>
                        ) : (
                          bookings.filter(b => (b.guestName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (b.guestCnic || '').includes(searchQuery))
                            .filter(b => b.status !== 'CANCELLED' && b.status !== 'CHECKED_OUT')
                            .map((b) => (
                              <tr key={b._id} className="hover:bg-amber-50/40 transition">
                                <td className="p-4">
                                  <p className="font-bold text-stone-900 text-sm">{b.guestName}</p>
                                  <p className="text-stone-500 text-[10px]">{b.guestEmail} • {b.guestPhone}</p>
                                </td>
                                <td className="p-4 font-mono font-bold text-stone-700">{b.guestCnic || 'N/A'}</td>
                                <td className="p-4">
                                  Room #{b.room?.roomNumber || b.roomId?.roomNumber || 'N/A'}
                                  <p className="text-stone-500 text-[10px]">{b.checkInDate} to {b.checkOutDate}</p>
                                </td>
                                <td className="p-4 font-extrabold text-amber-800">PKR {Number(b.totalAmount || 0).toLocaleString()}</td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                                    b.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                                      b.status === 'CHECKED_OUT' ? 'bg-stone-200 text-stone-700' :
                                        b.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                                          'bg-amber-100 text-amber-800'
                                    }`}>
                                    {b.status || 'PENDING'}
                                  </span>
                                </td>
                                <td className="p-4 text-center space-x-1">
                                  <button
                                    onClick={() => handleStatusChange(b._id, 'CHECKED_IN')}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase shadow-sm"
                                  >
                                    Check In
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(b._id, 'CHECKED_OUT')}
                                    className="px-2.5 py-1 bg-stone-700 hover:bg-stone-800 text-white rounded text-[10px] font-bold uppercase shadow-sm"
                                  >
                                    Check Out
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(b._id, 'CANCELLED')}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold uppercase shadow-sm ml-1"
                                  >
                                    Cancel
                                  </button>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'rooms' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-stone-900">Suite Inventory ({rooms.length})</h2>
                    <p className="text-xs text-stone-500 mt-1">Manage rates, edit room details, and delete rooms.</p>
                  </div>
                  <button onClick={() => { setEditingRoomId(null); setImagePreviews([]); setActiveTab('add-room'); }} className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm">+ Add Room</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => {
                    const rawImg = (room.images && room.images.length > 0 ? room.images[0] : room.image) || '';
                    const displayingImg = rawImg.startsWith('http') ? rawImg : (rawImg ? `http://localhost:5000${rawImg}` : '');
                    return (
                      <div key={room._id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm p-5 flex flex-col justify-between relative">
                        <div className="absolute top-7 right-7 z-20 flex items-center gap-1.5 bg-stone-900/90 p-1.5 rounded-xl shadow-lg border border-stone-700">
                          <button onClick={() => handleStartEdit(room)} className="p-1.5 text-stone-300 hover:text-amber-400 transition" title="Edit Room Details"><Edit3 size={16} /></button>
                          <button onClick={() => handleDeleteRoom(room._id)} className="p-1.5 text-rose-400 hover:text-rose-300 transition" title="Delete Room"><Trash2 size={16} /></button>
                        </div>
                        <div className="h-44 rounded-xl overflow-hidden mb-4 bg-stone-100 relative">
                          {displayingImg ? (
                            <img src={displayingImg} alt={room.roomType} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-stone-400 text-xs font-medium">No Image Uploaded</div>
                          )}
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">Room #{room.roomNumber}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-700">AVAILABLE</span>
                          </div>
                          <h3 className="font-serif font-bold text-base text-stone-900 mt-2">{room.roomType}</h3>
                          <p className="text-stone-500 text-xs mt-1 line-clamp-2">{room.description}</p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex justify-between items-center">
                          <span className="text-lg font-extrabold text-stone-900">PKR {Number(room.pricePerNight).toLocaleString()} <span className="text-xs font-normal text-stone-400">/ night</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Heading alag card mein */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
                  <h2 className="text-xl font-serif font-bold text-stone-900">Booking History & Cancelled Desk</h2>
                  <p className="text-xs text-stone-500">View completed stays and cancelled reservations.</p>
                </div>

                {/* Table alag card mein */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#181614] text-amber-300 font-bold uppercase">
                        <th className="p-4">Guest Info</th>
                        <th className="p-4">CNIC Number</th>
                        <th className="p-4">Room & Dates</th>
                        <th className="p-4">Bill Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {bookings.filter(b => b.status === 'CANCELLED' || b.status === 'CHECKED_OUT').length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-stone-400">No booking history records found.</td>
                        </tr>
                      ) : (
                        bookings.filter(b => b.status === 'CANCELLED' || b.status === 'CHECKED_OUT').map((b) => (
                          <tr key={b._id} className="hover:bg-stone-50">
                            <td className="p-4">
                              <p className="font-bold text-stone-900">{b.guestName}</p>
                              <p className="text-stone-500 text-[10px]">{b.guestEmail} • {b.guestPhone}</p>
                            </td>
                            <td className="p-4 font-mono font-bold text-stone-700">{b.guestCnic || 'N/A'}</td>
                            <td className="p-4">
                              <p className="font-bold text-stone-800">Room #{b.room?.roomNumber || 'N/A'}</p>
                              <p className="text-stone-500 text-[10px]">{new Date(b.checkInDate).toLocaleDateString()} to {new Date(b.checkOutDate).toLocaleDateString()}</p>
                            </td>
                            <td className="p-4 font-extrabold text-amber-800">PKR {Number(b.totalAmount || 0).toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${b.status === 'CHECKED_OUT' ? 'bg-stone-200 text-stone-700' : 'bg-rose-100 text-rose-800'
                                }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleOpenInvoice(b)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-[10px] uppercase shadow-xs transition"
                              >
                                View Invoice
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'add-room' && (
              <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-stone-200 shadow-md">
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">{editingRoomId ? 'Update Room Information' : 'Add New Room to System'}</h2>
                <p className="text-xs text-stone-500 mb-6">Select category, set PKR price, and upload room photos directly from folder.</p>
                {formMsg && (
                  <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-700" /> {formMsg}
                  </div>
                )}
                <form onSubmit={handleSaveRoom} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Room Number *</label>
                      <input type="text" required placeholder="e.g. 101" value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-amber-600" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Rate (PKR Per Night) *</label>
                      <input type="number" required placeholder="45000" value={roomForm.pricePerNight} onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-amber-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Suite & Room Category *</label>
                    <select value={roomForm.roomType} onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-amber-600 font-medium">
                      <option value="Standard Single Room">Standard Single Room</option>
                      <option value="Standard Double Room">Standard Double Room</option>
                      <option value="Superior Deluxe Room">Superior Deluxe Room</option>
                      <option value="Deluxe City View Room">Deluxe City View Room</option>
                      <option value="Deluxe Ocean View Room">Deluxe Ocean View Room</option>
                      <option value="Premium Executive Room">Premium Executive Room</option>
                      <option value="Junior Luxury Suite">Junior Luxury Suite</option>
                      <option value="Presidential Ocean Suite">Presidential Ocean Suite</option>
                      <option value="Royal Penthouse Suite">Royal Penthouse Suite</option>
                      <option value="Luxury Family Suite">Luxury Family Suite</option>
                      <option value="Imperial Suite">Imperial Suite</option>
                      <option value="Classic Queen Room">Classic Queen Room</option>
                      <option value="Deluxe Garden View Room">Deluxe Garden View Room</option>
                      <option value="Deluxe Pool View Room">Deluxe Pool View Room</option>
                      <option value="Executive Corner Suite">Executive Corner Suite</option>
                      <option value="Grand Luxury Suite">Grand Luxury Suite</option>
                      <option value="Studio Apartment Suite">Studio Apartment Suite</option>
                      <option value="Executive Business Room">Executive Business Room</option>
                      <option value="Penthouse Suite">Penthouse Suite</option>
                      <option value="Signature Luxury Suite">Signature Luxury Suite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Room Amenities (Comma separated) *</label>
                    <input type="text" required placeholder="King Size Bed, Free Wifi, Smart TV, AC" value={roomForm.amenities} onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-amber-600" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Select Room Photos from Folder *</label>
                    <div className="relative border-2 border-dashed border-stone-300 hover:border-amber-500 bg-stone-50/80 rounded-2xl p-6 text-center cursor-pointer transition">
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <Upload size={32} className="mx-auto text-amber-600 mb-2" />
                      <p className="text-xs font-bold text-stone-800">Click or Drag to Add Photos from Folder</p>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="flex gap-3 mt-4 overflow-x-auto py-2">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative h-20 w-24 flex-shrink-0 rounded-xl overflow-hidden border border-stone-300 group shadow-xs">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"><X size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Description</label>
                    <textarea rows="3" placeholder="Write room description..." value={roomForm.description} onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-amber-600"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-md transition">
                    {editingRoomId ? 'Save Changes' : 'Upload Files & Publish Room'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'users' && (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900">Hotel Staff & Accounts Management</h2>
        <p className="text-xs text-stone-500 mt-1">View registered staff members and guest accounts.</p>
      </div>
      <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs w-full sm:w-64">
        <Search size={14} className="text-stone-400 mr-2" />
        <input 
          type="text" 
          placeholder="Filter by Name / Email" 
          value={userSearch} 
          onChange={(e) => setUserSearch(e.target.value)} 
          className="bg-transparent outline-none w-full text-stone-900 font-medium" 
        />
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#181614] text-amber-300 font-bold uppercase tracking-wider">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">System Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium">
            {usersList.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-stone-400">No user accounts found.</td></tr>
            ) : (
              usersList
                .filter(u => (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase()))
                .map((u) => (
                  <tr key={u._id} className="hover:bg-amber-50/40 transition">
                    <td className="p-4 font-bold text-stone-900 text-sm">{u.name}</td>
                    <td className="p-4 text-stone-600">{u.email}</td>
                    <td className="p-4 text-stone-600">{u.phone || 'N/A'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                        {u.role || 'GUEST'}
                      </span>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}




            
            {/* {activeTab === 'users' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900">Hotel Staff & Accounts Management</h2>
                  <p className="text-xs text-stone-500">View registered staff members and guest accounts.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#181614] text-amber-300 font-bold uppercase">
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Phone</th>
                        <th className="p-3.5">System Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {usersList.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-stone-400">No user accounts found.</td></tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u._id} className="hover:bg-stone-50">
                            <td className="p-3.5 font-bold text-stone-900">{u.name}</td>
                            <td className="p-3.5 text-stone-600">{u.email}</td>
                            <td className="p-3.5 text-stone-600">{u.phone || 'N/A'}</td>
                            <td className="p-3.5"><span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase">{u.role || 'GUEST'}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )} */}

            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                {/* Heading Box (Alag Container) */}
                <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-stone-900">Maintenance Requests Desk</h2>
                    <p className="text-xs text-stone-500 mt-1">Track and manage reported room maintenance issues.</p>
                  </div>
                  <button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="px-4 py-2 bg-[#181614] text-amber-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition shadow-xs"
                  >
                    + Report Issue
                  </button>
                </div>

                {/* Table Box (Alag Container) */}
                <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs rounded-xl overflow-hidden shadow-xs">
                      <thead className="bg-[#181614] text-amber-300 font-bold uppercase">
                        <tr>
                          <th className="p-4">Room #</th>
                          <th className="p-4">Reported By</th>
                          <th className="p-4">Issue Description</th>
                          <th className="p-4">Priority</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium">
                        {maintenanceList && maintenanceList.length > 0 ? (
                          maintenanceList.map((item) => (
                            <tr key={item._id} className="hover:bg-amber-50/40 transition">
                              <td className="p-4 font-bold">Room #{item.room?.roomNumber || 'N/A'}</td>
                              <td className="p-4 text-stone-700">{item.reportedBy}</td>
                              <td className="p-4 text-stone-800">{item.issueDescription}</td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                                  {item.priority}
                                </span>
                              </td>
                              <td className="p-4">
                                <select
                                  value={item.status}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    try {
                                      const res = await API.patch(`/maintenance/${item._id}/status`, { status: newStatus });
                                      setMaintenanceList(maintenanceList.map(req => req._id === item._id ? res.data : req));
                                    } catch (err) {
                                      console.error('Error updating status:', err);
                                      alert('Failed to update status');
                                    }
                                  }}
                                  className="px-2 py-1 bg-stone-100 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 focus:outline-none"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Resolved">Resolved</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-stone-400">No maintenance requests found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'housekeeping' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-stone-900">Housekeeping & Cleaning Status</h2>
                    <p className="text-xs text-stone-500 mt-1">Live database monitoring and room readiness management.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Ready: {rooms.filter(r => (r.cleaningStatus || 'CLEANED') === 'CLEANED').length}</span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Dirty: {rooms.filter(r => r.cleaningStatus === 'DIRTY').length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => {
                    const status = room.cleaningStatus || 'CLEANED';
                    const isHousekeeper = ['HOUSEKEEPING', 'HOUSEKEEPER'].includes(userRole);
                    return (
                      <div key={room._id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex justify-between items-center">
                        <div>
                          <h3 className="font-serif font-bold text-lg text-stone-900">Room #{room.roomNumber}</h3>
                          <p className="text-xs text-stone-500">{room.roomType}</p>
                          <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${status === 'CLEANED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                            {status === 'CLEANED' ? 'CLEANED & READY' : 'NEEDS CLEANING'}
                          </span>
                        </div>
                        {isHousekeeper ? (
                          <button onClick={() => toggleHousekeepingStatus(room)} className={`px-3 py-2 text-xs font-bold rounded-lg transition uppercase shadow-xs ${status === 'CLEANED' ? 'bg-stone-900 hover:bg-amber-600 text-amber-300 hover:text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                            {status === 'CLEANED' ? 'Mark Dirty' : 'Mark Cleaned'}
                          </button>
                        ) : (
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 font-bold uppercase block">Status</span>
                            <span className={`text-xs font-extrabold ${status === 'CLEANED' ? 'text-emerald-700' : 'text-amber-700'}`}>{status}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>


      {selectedInvoice && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-8 space-y-6 shadow-2xl relative">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">LuxuryStay Hotels</h2>
                <p className="text-xs text-stone-500">Official Guest Invoice & Stay Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-amber-700 uppercase">{selectedInvoice.status}</p>
                <p className="text-[10px] text-stone-400">ID: {selectedInvoice._id.slice(-6)}</p>
              </div>
            </div>

            {/* Guest & Room Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl">
              <div>
                <p className="text-stone-400 font-semibold uppercase text-[10px]">Guest Details</p>
                <p className="font-bold text-stone-900 text-sm mt-0.5">{selectedInvoice.guestName}</p>
                <p className="text-stone-500">{selectedInvoice.guestEmail}</p>
                <p className="text-stone-500">{selectedInvoice.guestPhone}</p>
                <p className="text-stone-600 font-mono mt-1">CNIC: {selectedInvoice.guestCnic || 'N/A'}</p>
              </div>
              <div>
                <p className="text-stone-400 font-semibold uppercase text-[10px]">Reservation Info</p>
                <p className="font-bold text-stone-900 text-sm mt-0.5">Room #{selectedInvoice.room?.roomNumber || 'N/A'}</p>
                <p className="text-stone-500 mt-1">Check-in: {new Date(selectedInvoice.checkInDate).toLocaleDateString()}</p>
                <p className="text-stone-500">Check-out: {new Date(selectedInvoice.checkOutDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2 border-b border-stone-100 pb-4 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Room Accommodation Charges</span>
                <span className="font-mono font-bold text-stone-900">PKR {Number(selectedInvoice.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Taxes & Service Fees</span>
                <span className="font-mono font-bold text-stone-900">Included</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-dashed border-stone-200">
                <span>Total Amount Paid</span>
                <span className="font-mono text-amber-800">PKR {Number(selectedInvoice.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold shadow-md transition"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 pb-8">

          {/* Heading Box */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200 mb-4">
            <h2 className="text-xl font-serif font-bold text-stone-900">All Guest Reviews</h2>
            <p className="text-xs text-stone-500 mt-1">Monitor and check feedback submitted by hotel guests.</p>
          </div>

          {/* Table Box */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200">
            <div className="overflow-hidden">
              <table className="w-full text-left border-collapse text-xs rounded-xl overflow-hidden">
                <thead className="bg-[#181614] text-amber-300 font-bold uppercase">
                  <tr>
                    <th className="p-4">Guest Name</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Feedback Comment</th>
                    <th className="p-4">Status / Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {adminReviews.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-stone-400 italic">No reviews found in database.</td>
                    </tr>
                  ) : (
                    adminReviews.map((rev) => (
                      <tr key={rev._id} className="hover:bg-stone-50 transition">
                        <td className="py-3.5 px-4 font-bold text-stone-900">{rev.guestName}</td>
                        <td className="py-3.5 px-4 text-amber-500 font-bold text-sm">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </td>
                        <td className="py-3.5 px-4 italic text-stone-600">"{rev.comment}"</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200 text-[10px] whitespace-nowrap inline-block">
                            {rev.roomTitle || 'Verified Guest Stay'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}


      {activeTab === 'services' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 pb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200 mb-4">
            <h2 className="text-xl font-serif font-bold text-stone-900">Guest Service Requests</h2>
            <p className="text-xs text-stone-500 mt-1">Manage and update status for additional guest requests.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200">
            <div className="overflow-hidden">
              <table className="w-full text-left border-collapse text-xs rounded-xl overflow-hidden">
                <thead className="bg-[#181614] text-amber-300 font-bold uppercase">
                  <tr>
                    <th className="p-4">Guest Info</th>
                    <th className="p-4">Room #</th>
                    <th className="p-4">Service Type</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {serviceRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-stone-400 italic">No service requests found.</td>
                    </tr>
                  ) : (
                    serviceRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-stone-50 transition">
                        <td className="py-3.5 px-4 font-bold text-stone-900">{req.guestName}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-600">Room #{req.roomNumber}</td>
                        <td className="py-3.5 px-4 font-semibold">{req.serviceType}</td>
                        <td className="py-3.5 px-4 italic text-stone-600">"{req.details}"</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${req.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {req.status !== 'Completed' && (
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  await API.patch(`/services/${req._id}/status`, { status: 'Completed' }, {
                                    headers: {
                                      Authorization: `Bearer ${token}`
                                    }
                                  });
                                  fetchServiceRequests(); // Table ko refresh karne ke liye
                                } catch (err) {
                                  console.error('Error updating status:', err);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-[10px] shadow-xs"
                            >
                              Mark Completed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">Report Maintenance Issue</h3>
            <p className="text-xs text-stone-500 mb-4">Fill out the details below to log a room issue.</p>

            <form onSubmit={handleMaintenanceSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-stone-700 mb-1">Select Room</label>
                <select
                  value={maintenanceForm.roomId}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, roomId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500">
                  <option value="">Select a Room</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>Room #{room.roomNumber} ({room.roomType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1">Reported By</label>
                <input
                  type="text"
                  placeholder="Staff or Guest Name"
                  value={maintenanceForm.reportedBy}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, reportedBy: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">Issue Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe the issue (e.g., AC leaking, broken light)..."
                  value={maintenanceForm.issueDescription}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issueDescription: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-stone-700 mb-1">Priority Level</label>
                <select
                  value={maintenanceForm.priority}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#181614] text-amber-400 hover:bg-black transition font-bold">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>

      )}


      {/* CUSTOM PROFESSIONAL LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-stone-100 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto ring-4 ring-amber-50/50 font-bold text-lg">
              !
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Sign Out Confirmation</h3>
              <p className="text-xs text-stone-500 mt-1">Are you sure you want to end your current session?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs uppercase tracking-wider transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}