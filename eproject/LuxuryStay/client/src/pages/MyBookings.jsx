import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import api from '../services/api';
import axios from 'axios';
import { Building2, Calendar, Crown, MapPin, PhoneCall, User, LogOut, CheckCircle2, Clock, MoreVertical, Wrench, Shield, Star } from 'lucide-react';

export default function MyBookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [bookings, setBookings] = useState(() => {
    const cached = sessionStorage.getItem('luxury_my_bookings');
    return cached ? JSON.parse(cached) : [];
  });

  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('luxury_my_bookings');
  });


  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Maintenance Modal States
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceBooking, setMaintenanceBooking] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({ issueDescription: '', priority: 'Medium' });
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [myMaintenanceRequests, setMyMaintenanceRequests] = useState([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      sessionStorage.removeItem('luxury_my_bookings'); // Har baar fresh fetch karega
      const res = await API.get('/reservations/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };
  // const handleLogout = () => {
  //   localStorage.clear();
  //   sessionStorage.clear();
  //   window.location.href = '/';
  // };

  const handleOpenInvoice = (booking) => {
    setSelectedInvoice(booking);
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    if (!maintenanceBooking) return;

    try {
      const res = await API.post('/maintenance', {
        roomId: maintenanceBooking.room?._id || maintenanceBooking.room,
        reportedBy: user.name || 'Guest',
        issueDescription: maintenanceForm.issueDescription,
        priority: maintenanceForm.priority
      });
      if (res.status === 201 || res.status === 200) {
        alert('Maintenance request submitted successfully!');
        setShowMaintenanceModal(false);
        setMaintenanceForm({ issueDescription: '', priority: 'Medium' });
      }
    } catch (err) {
      console.error('Maintenance error:', err.response?.data || err.message);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        const res = await API.get('/maintenance');
        setMyMaintenanceRequests(res.data || []);
      } catch (err) {
        console.error('Error fetching maintenance:', err);
      }
    };
    fetchMaintenanceData();
  }, []);


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/reviews', {
        guestName: user.name || 'Guest',
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
        roomTitle: reviewBooking?.room?.title || 'Verified Guest Stay'
      });
      if (res.status === 201 || res.status === 200) {
        alert('Thank you! Review submitted successfully.');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: '' });
      }
    } catch (err) {
      console.error('Review error:', err);
      alert('Failed to submit review.');
    }
  };


  useEffect(() => {
    if (bookings.length > 0) {
      const checkedOutBooking = bookings.find(b => b.status === 'CHECKED_OUT');
      if (checkedOutBooking) {
        setReviewBooking(checkedOutBooking);
        // Agar aap chahte hain ke user login par khud popup aaye:
        setShowReviewModal(true);
      }
    }
  }, [bookings]);

  const [serviceForm, setServiceForm] = useState({
    guestName: '',
    roomNumber: '',
    serviceType: 'Room Service',
    details: ''
  });
  const [serviceMsg, setServiceMsg] = useState('');

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Apne token ki key check kar lein (misal ke taur par 'token' ya 'staffToken')

      const res = await axios.post('http://localhost:5000/api/services', serviceForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setServiceMsg('Service request sent successfully!');
      setServiceForm({ guestName: '', roomNumber: '', serviceType: 'Room Service', details: '' });
      setTimeout(() => setServiceMsg(''), 4000);
    } catch (err) {
      setServiceMsg(err.response?.data?.message || 'Error submitting request');
    }
  };


  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans">
      {/* Top Bar */}
      <div className="bg-stone-900 text-stone-300 px-8 py-2 text-xs flex justify-between items-center border-b border-amber-500/20">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><MapPin size={13} className="text-amber-400" /> Club Road, Karachi, Pakistan</span>
          <span className="hidden md:flex items-center gap-1.5"><PhoneCall size={13} className="text-amber-400" /> +92 (21) 111-589-999</span>
        </div>
        <div className="text-amber-400 font-medium tracking-wide">Best Rate Guarantee on Direct Bookings</div>
      </div>

      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="p-2 bg-[#181614] text-amber-400 rounded-full shadow-md group-hover:bg-amber-600 group-hover:text-white transition duration-300 ring-1 ring-amber-500/30">
            <Crown size={18} />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-serif font-bold text-stone-900 tracking-[0.22em] flex items-center leading-tight">
              LUXURY<span className="text-amber-700 font-normal">STAY</span>
            </h1>
            <p className="text-[7.5px] text-amber-800 font-black uppercase tracking-[0.32em] text-center w-full">HOTELS & RESORTS</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-stone-700">
          <Link to="/" className="hover:text-amber-700 transition">Home</Link>
          <Link to="/my-bookings" className="text-amber-800 border-b-2 border-amber-600 pb-1">My Bookings</Link>
        </div>

        <div className="flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-[#181614] text-white px-3.5 py-1.5 rounded-full shadow-sm border border-stone-800 text-xs">
                <User size={13} className="text-amber-400" />
                <span>Hi, <strong className="text-amber-400 font-bold">{user.name}</strong></span>
              </div>
              {/* 3 Dots Menu Button for Additional Services */}
              <div className="relative">
                <button
                  onClick={() => setShowServiceModal(!showServiceModal)}
                  className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition flex items-center justify-center"
                  title="Request Additional Services"
                >
                  <MoreVertical size={14} />
                </button>

                {/* Popup Modal / Dropdown */}
                {showServiceModal && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 p-5 text-left">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-100">
                      <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">Request Additional Services</h4>
                      <button
                        onClick={() => setShowServiceModal(false)}
                        className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {serviceMsg && <p className="text-[11px] font-bold text-amber-600 mb-2 bg-amber-50 p-2 rounded-lg">{serviceMsg}</p>}

                    <form onSubmit={handleServiceSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Guest Name</label>
                        <input
                          type="text"
                          value={serviceForm.guestName}
                          onChange={(e) => setServiceForm({ ...serviceForm, guestName: e.target.value })}
                          required
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Room Number</label>
                        <input
                          type="text"
                          value={serviceForm.roomNumber}
                          onChange={(e) => setServiceForm({ ...serviceForm, roomNumber: e.target.value })}
                          required
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                          placeholder="e.g. 102"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Service Type</label>
                        <select
                          value={serviceForm.serviceType}
                          onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white"
                        >
                          <option value="Room Service">Room Service</option>
                          <option value="Wake-up Call">Wake-up Call</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Laundry">Laundry</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Details</label>
                        <textarea
                          value={serviceForm.details}
                          onChange={(e) => setServiceForm({ ...serviceForm, details: e.target.value })}
                          required
                          rows="2"
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                          placeholder="Describe what you need..."
                        ></textarea>
                      </div>
                      <button type="submit" className="w-full py-2 bg-[#181614] text-amber-400 font-bold rounded-xl hover:bg-stone-800 transition">
                        Submit Request
                      </button>
                    </form>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogoutClick}
                className="bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 p-1.5 rounded-lg border border-stone-200 transition shadow-xs flex items-center justify-center"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 bg-[#181614] hover:bg-amber-600 text-amber-300 hover:text-white font-bold px-4 py-2 rounded-full text-xs uppercase tracking-widest shadow-sm transition duration-300"
            >
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8 border-b border-stone-200 pb-4">
          <h2 className="text-3xl font-serif font-bold text-stone-900">Your Reservations</h2>
          <p className="text-xs text-stone-500 mt-1">Manage and view details of your upcoming resort stays.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-500">Loading your reservations...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center shadow-sm max-w-md mx-auto">
            <Calendar className="text-amber-500 mb-3" size={36} />
            <h3 className="font-bold text-stone-800 text-base">No Bookings Found</h3>
            <p className="text-stone-500 text-xs mt-1 mb-6">You haven't reserved any luxury suites yet.</p>
            <Link to="/" className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition">
              Browse Suites Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                <div className="flex gap-4 items-center">
                  {(() => {
                    const rawImg = booking.room?.images?.[0] || booking.room?.image || '';
                    const imgUrl = rawImg.startsWith('http') ? rawImg : (rawImg ? `http://localhost:5000${rawImg}` : 'https://images.unsplash.com/photo-1582719478250-c89icae4dc85b?auto=format&fit=crop&w=400&q=80');
                    return (
                      <img
                        src={imgUrl}
                        alt={booking.room?.roomType}
                        className="w-24 h-24 object-cover rounded-xl border border-stone-200"
                      />
                    );
                  })()}
                  <div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Room #{booking.room?.roomNumber}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-stone-900 mt-1">{booking.room?.roomType}</h3>
                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-3">
                      <span>Check-In: <strong>{new Date(booking.checkInDate).toLocaleDateString()}</strong></span>
                      <span>Check-Out: <strong>{new Date(booking.checkOutDate).toLocaleDateString()}</strong></span>
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">CNIC: <strong>{booking.guestCnic}</strong> | Guests: <strong>{booking.numberOfGuests}</strong></p>
                  </div>
                </div>

                {/* Right Side Container: Price, Badge, Invoice & 3-Dots Menu */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">

                  {/* Price, Badge & Invoice Column */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <span className="text-xs text-stone-400 block font-medium">Total Price</span>
                      <span className="text-xl font-extrabold text-stone-900">
                        PKR {(() => {
                          const nights = Number(booking.totalNights) || 1;
                          const rate = Number(booking.room?.pricePerNight || booking.room?.rate || booking.room?.price || 25000);
                          const calculatedTotal = nights * rate;
                          const finalPrice = Number(booking.totalAmount) || Number(booking.totalPrice) || calculatedTotal;
                          return finalPrice.toLocaleString();
                        })()}
                      </span>
                      {/* <span className="text-xl font-extrabold text-stone-900">PKR {Number(booking.totalPrice).toLocaleString()}</span> */}
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase ${booking.status === 'CONFIRMED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : booking.status === 'CHECKED_IN'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : booking.status === 'CHECKED_OUT'
                            ? 'bg-stone-200 text-stone-700 border border-stone-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                        <CheckCircle2 size={13} /> {booking.status}
                      </span>
                    </div>

                    {/* View Invoice Button (Badge ke bilkul neeche aligned) */}
                    {(booking.status === 'CHECKED_OUT' || booking.status === 'CANCELLED') && (
                      <button
                        onClick={() => handleOpenInvoice(booking)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm mt-1"
                      >
                        View Invoice
                      </button>
                    )}
                  </div>

                  {/* 3-Dots Dropdown Menu (Right side par alag) */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === booking._id ? null : booking._id)}
                      className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full transition shadow-xs"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuId === booking._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl z-30 py-1 text-xs font-semibold">
                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              setCancelModalBooking(booking);
                            }}
                            className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition flex items-center gap-2 font-semibold"
                          >
                            Cancel Booking
                          </button>
                        )}

                        {booking.status === 'CHECKED_IN' && (
                          <>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setMaintenanceBooking(booking);
                                setShowMaintenanceModal(true);
                              }}
                              className="w-full text-left px-4 py-2.5 text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition flex items-center gap-2 font-semibold"
                            >
                              <Wrench size={14} className="text-amber-600" /> Report Maintenance
                            </button>

                            {myMaintenanceRequests.some(req =>
                              (req.room?._id === booking.room?._id || req.room === booking.room?._id) &&
                              req.reportedBy === user.name
                            ) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    const foundReq = myMaintenanceRequests.find(req =>
                                      (req.room?._id === booking.room?._id || req.room === booking.room?._id) &&
                                      req.reportedBy === user.name
                                    );
                                    window.alert(`Your maintenance issue status is: ${foundReq.status}`);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition flex items-center gap-2 border-t border-stone-100 font-semibold"
                                >
                                  <Shield size={14} className="text-amber-600" /> Check Issue Status
                                </button>
                              )}

                          </>
                        )}

                        {booking.status !== 'CONFIRMED' && booking.status !== 'CHECKED_IN' && (
                          <div className="px-4 py-2.5 text-stone-400 italic">No actions available</div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}



        {/* Invoice Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-8 space-y-6 shadow-2xl relative">
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

        {/* Maintenance Report Modal for Guests */}
        {showMaintenanceModal && maintenanceBooking && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">Report Room Issue</h3>
              <p className="text-xs text-stone-500 mb-4">
                Submit a maintenance request for Room #{maintenanceBooking.room?.roomNumber}.
              </p>

              <form onSubmit={handleMaintenanceSubmit} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-stone-700 mb-1">Issue Description</label>
                  <textarea
                    rows="3"
                    placeholder="E.g., AC is not cooling properly, or the light is broken..."
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
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                  >
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
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-stone-900 text-amber-400 hover:bg-black transition font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelModalBooking && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-center">
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">Cancel Reservation</h3>
              <p className="text-xs text-stone-500 mb-6">
                Are you sure you want to cancel the reservation for Room #{cancelModalBooking.room?.roomNumber} This action cannot be undone.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition text-xs font-bold"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await API.patch(`/reservations/${cancelModalBooking._id}/status`, { status: 'CANCELLED' });
                      setCancelModalBooking(null);
                      sessionStorage.removeItem('luxury_my_bookings');
                      fetchMyBookings();
                    } catch (err) {
                      console.error("Cancel error:", err.response?.data || err.message);
                      alert('Error: ' + (err.response?.data?.message || err.message));
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition text-xs font-bold shadow-md"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>

        )}
        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">Leave a Review</h3>
              <p className="text-xs text-stone-500 mb-4">Share your experience for Room #{reviewBooking?.room?.roomNumber}</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-stone-700 mb-1.5 font-medium">Rating & Experience</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      // Emojis mapping for each rating level
                      const emojis = ['😞', '😕', '😐', '😊', '😍'];
                      const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className={`text-xl transition transform hover:scale-110 focus:outline-none ${star <= reviewForm.rating ? 'text-amber-500 scale-105' : 'text-stone-300'
                            }`}
                          title={labels[star - 1]}
                        >
                          ★
                        </button>
                      );
                    })}
                    <span className="ml-3 text-xs font-bold text-stone-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {reviewForm.rating === 5 && '😍 Excellent'}
                      {reviewForm.rating === 4 && '😊 Very Good'}
                      {reviewForm.rating === 3 && '😐 Good'}
                      {reviewForm.rating === 2 && '😕 Fair'}
                      {reviewForm.rating === 1 && '😞 Poor'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 mb-1">Your Feedback / Comment</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Write about your stay, cleanliness, service..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-amber-600"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-stone-900 text-amber-400 hover:bg-amber-600 hover:text-white transition font-bold"
                  >
                    Submit Review
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
    </div>
  );
}