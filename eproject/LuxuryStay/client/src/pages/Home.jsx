import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRooms } from '../services/roomService';
import { createBooking } from '../services/bookingService';
import API from '../services/api';

import {
  Building2, BedDouble, Calendar, ShieldCheck, LogIn, User,
  Wifi, Coffee, Sparkles, X, CheckCircle2, ChevronLeft, ChevronRight, PhoneCall, MapPin, LogOut, Crown, Bell,
  Bath, Shield, Utensils, Droplets, Wind, Refrigerator, Phone, Tv, Snowflake, Baby, Glasses,
  Menu, Search, Info, HeartHandshake, PhoneForwarded, CalendarCheck, Tag, Globe, MessageSquare, Send
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribedMsg, setSubscribedMsg] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // CHATBOT STATES
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Welcome to LuxuryStay Concierge! How may I assist you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chipsScrollRef = useRef(null);

  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const reviewsPerPage = 3;

  // Reservation Form States
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    guestName: user.name || '',
    guestEmail: user.email || '',
    guestPhone: user.phone || '',
    guestCnic: '',
    checkInDate: '',
    checkInTime: '12:00 PM',
    checkOutDate: '',
    numberOfGuests: 1,
    airportPickup: 'No',
    specialRequests: ''
  });

  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // OVERVIEW HIGHLIGHTS
  const pcOverviewHighlights = [
    { icon: <Wifi size={28} strokeWidth={1.2} />, title: "FREE WIFI" },
    { icon: <Tv size={28} strokeWidth={1.2} />, title: "CABLE SATELLITE CHANNELS" },
    { icon: <Snowflake size={28} strokeWidth={1.2} />, title: "AIR-CONDITIONING" },
    { icon: <Baby size={28} strokeWidth={1.2} />, title: "KIDS' PLAY AREA" },
    { icon: <Bath size={28} strokeWidth={1.2} />, title: "BATHROOM" },
    { icon: <Wind size={28} strokeWidth={1.2} />, title: "HAIR DRYER" },
    { icon: <Shield size={28} strokeWidth={1.2} />, title: "SAFE IN ROOM" },
    { icon: <Utensils size={28} strokeWidth={1.2} />, title: "ROOM SERVICE" },
    { icon: <Droplets size={28} strokeWidth={1.2} />, title: "COMPLIMENTARY BOTTLED WATER" },
    { icon: <Refrigerator size={28} strokeWidth={1.2} />, title: "MINI-REFRIGERATOR" },
    { icon: <Phone size={28} strokeWidth={1.2} />, title: "PHONE" },
    { icon: <Glasses size={28} strokeWidth={1.2} />, title: "EXECUTIVE LOUNGE" },
  ];

  useEffect(() => {
    // Pehle session storage se check karein taake instant load ho jaye
    const cachedRooms = sessionStorage.getItem('luxury_rooms_cache');
    if (cachedRooms) {
      try {
        setRooms(JSON.parse(cachedRooms));
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }
    fetchLiveRooms();
  }, []);

  const fetchLiveRooms = async () => {
    try {
      const data = await getRooms();
      const sortedData = (data || []).sort((a, b) => {
        return String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, { numeric: true });
      });
      setRooms(sortedData);
      // Cache mein save kar lein taake bar bar loading na ho
      sessionStorage.setItem('luxury_rooms_cache', JSON.stringify(sortedData));
    } catch (err) {
      console.error('Error fetching rooms:', err);
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


  const isStaff = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'].includes(user.role);

  const openRoomModal = (room) => {
    setSelectedRoom(room);
    setActiveImageIndex(0);
    setIsBookingOpen(false);
    setBookingSuccess('');
    setBookingError('');
    setBookingData({
      guestName: user.name || '',
      guestEmail: user.email || '',
      guestPhone: user.phone || '',
      guestCnic: '',
      checkInDate: '',
      checkInTime: '12:00 PM',
      checkOutDate: '',
      numberOfGuests: 1,
      airportPickup: 'No',
      specialRequests: ''
    });
  };

  const handleFormChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const calculateNights = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 1;
    const start = new Date(bookingData.checkInDate);
    const end = new Date(bookingData.checkOutDate);
    const diff = (end - start) / (1000 * 3600 * 24);
    return diff > 0 ? diff : 1;
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!token) {
      navigate('/auth');
      return;
    }

    if (!bookingData.guestCnic || bookingData.guestCnic.length < 13) {
      setBookingError('Please Enter Your 13-digit CNIC Number.');
      window.alert('Please Enter Your 13-digit CNIC Number.');
      return;
    }

    const nights = calculateNights();
    const totalAmount = nights * Number(selectedRoom?.pricePerNight || selectedRoom?.price || 25000);
    const roomNum = selectedRoom?.roomNumber || selectedRoom?.roomNo || selectedRoom?.number || 'Suite';

    try {
      const response = await createBooking({
        roomId: selectedRoom._id,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        guestCnic: bookingData.guestCnic,
        checkInDate: bookingData.checkInDate,
        checkInTime: bookingData.checkInTime,
        checkOutDate: bookingData.checkOutDate,
        numberOfGuests: Number(bookingData.numberOfGuests),
        totalNights: nights,
        totalAmount,
        airportPickup: bookingData.airportPickup,
        specialRequests: bookingData.specialRequests
      });

      const confirmedRoomNum = response?.booking?.room?.roomNumber || roomNum;

      window.alert(`Booking Confirmed Successfully for Room #${confirmedRoomNum}!`);

      setIsBookingOpen(false);
      setSelectedRoom(null);
      navigate('/my-bookings');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'This room is already booked for these dates.';
      setBookingError(errorMessage);
      window.alert(errorMessage);
      return; // Yeh ensure karega ke booking confirm na ho
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribedMsg(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribedMsg(false), 4000);
    }
  };

  const scrollChips = (direction) => {
    if (chipsScrollRef.current) {
      chipsScrollRef.current.scrollBy({
        left: direction === 'left' ? -150 : 150,
        behavior: 'smooth'
      });
    }
  };

  const handleSendChatMessage = (textToSend) => {
    const query = (textToSend || chatInput).trim();
    if (!query) return;

    const newMessages = [...chatMessages, { sender: 'user', text: query }];
    setChatMessages(newMessages);
    if (!textToSend) setChatInput('');

    setTimeout(() => {
      let botReply = "Our concierge team is available 24/7. Please call us at +92 (21) 111-589-999 for direct assistance.";
      const lower = query.toLowerCase();

      if (lower.includes('check-in') || lower.includes('checkin') || lower.includes('time') || lower.includes('check out') || lower.includes('checkout')) {
        botReply = "Standard Check-in time is 12:00 PM and Check-out time is 12:00 PM.";
      } else if (lower.includes('rate') || lower.includes('price') || lower.includes('room') || lower.includes('suite')) {
        botReply = "Our rooms range from PKR 20,000/night to luxury suites. You can view all rates on our homepage.";
      } else if (lower.includes('location') || lower.includes('address') || lower.includes('where')) {
        botReply = "LuxuryStay Hotel & Resort is located at Club Road, Karachi, Pakistan.";
      } else if (lower.includes('pickup') || lower.includes('airport')) {
        botReply = "Yes! Complimentary airport pickup and drop-off can be selected while making your online booking.";
      } else if (lower.includes('breakfast') || lower.includes('food') || lower.includes('dining')) {
        botReply = "We have 4 fine dining restaurants including Bakers Boutique, Sakura, Chandni, and Tai-Pan.";
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    }, 500);
  };

  const filteredRooms = rooms.filter(room =>
    (room.roomType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(room.roomNumber).includes(searchQuery)
  );


  const [reviewsList, setReviewsList] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get('/reviews');
        setReviewsList(res.data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, []);


  const restaurantList = [
    {
      id: 1,
      name: "Bakers Boutique",
      cuisine: "Bakery & Desserts",
      location: "Karachi",
      image: "image_url_here",
      description: "Indulge in professionally crafted desserts..."
    },
    // doosre restaurants...
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-800 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-[#151311] text-amber-100/90 px-4 sm:px-8 py-2 text-xs flex justify-between items-center border-b border-amber-500/20">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><MapPin size={13} className="text-amber-400" /> Club Road, Karachi, Pakistan</span>
          <span className="hidden md:flex items-center gap-1.5"><PhoneCall size={13} className="text-amber-400" /> +92 (21) 111-589-999</span>
        </div>
        <div className="text-amber-400 font-semibold tracking-wide">Best Rate Guarantee on Direct Bookings</div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-white sticky top-0 z-40 border-b border-stone-200 shadow-md transition-all duration-300">
        <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between relative">
          <div className="flex items-center gap-3 sm:gap-4 z-10">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-stone-50 hover:bg-amber-50 text-stone-800 hover:text-amber-800 rounded-lg border border-stone-200 transition flex items-center gap-2 shadow-sm"
              title="Open Menu"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 w-48 lg:w-60 text-xs focus-within:border-amber-600 focus-within:bg-white transition shadow-inner">
              <Search size={14} className="text-stone-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search Suite / Room #"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const targetSection = document.getElementById('rooms');
                    if (targetSection) {
                      targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="bg-transparent border-none outline-none text-stone-900 placeholder-stone-400 w-full font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-stone-800"><X size={12} /></button>
              )}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="p-2 bg-[#181614] text-amber-400 rounded-full shadow-md group-hover:bg-amber-600 group-hover:text-white transition duration-300 ring-1 ring-amber-500/30"><Crown size={18} strokeWidth={2} /></div>
              <div className="flex flex-col items-center">
                <h1 className="text-lg sm:text-xl font-serif font-extrabold text-[#181614] tracking-[0.22em] flex items-center leading-tight">LUXURY<span className="text-amber-700 font-normal">STAY</span></h1>
                <p className="text-[7.5px] sm:text-[8px] text-amber-800 font-black uppercase tracking-[0.32em] text-center w-full">HOTELS & RESORTS</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 z-10">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-700 rounded-full border border-stone-200 transition relative shadow-sm" title="Notifications">
                <Bell size={16} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-stone-800 border border-stone-200 rounded-xl shadow-xl p-3 z-50">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-600"><X size={14} /></button>
                  </div>
                  <div className="py-3 text-[11px] text-stone-600 space-y-2">
                    <p className="bg-amber-50 border border-amber-200/60 p-2 rounded-lg text-amber-900 font-medium">✨ Welcome to LuxuryStay! Book directly for exclusive resort perks.</p>
                  </div>
                </div>
              )}
            </div>

            {token ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 bg-[#181614] text-white px-3.5 py-1.5 rounded-full shadow-sm border border-stone-800">
                  <User size={13} className="text-amber-400" />
                  <span className="text-xs font-medium">Hi, <strong className="text-amber-400 font-bold">{user.name}</strong></span>
                </div>
                {isStaff && (
                  <button onClick={() => navigate('/dashboard')} className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm uppercase tracking-wider">Staff Portal</button>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/auth')} className="flex items-center gap-2 bg-[#181614] hover:bg-amber-600 text-amber-300 hover:text-white font-bold px-4 py-2 rounded-full text-xs uppercase tracking-widest shadow-sm transition duration-300">
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#F6F4EE] border-t border-stone-200 px-4 sm:px-8 py-2 hidden md:flex items-center justify-center gap-10 text-[11px] font-extrabold uppercase tracking-widest text-stone-700">
          <a href="#overview" className="hover:text-amber-700 transition">Overview</a>
          <a href="#facilities" className="hover:text-amber-700 transition">Facilities</a>
          <a href="#dining" className="hover:text-amber-700 transition text-amber-800 font-extrabold">Restaurants & Dining</a>
          <a href="#rooms" className="hover:text-amber-700 transition">Suites & Rates</a>
          <a href="#amenities" className="hover:text-amber-700 transition">Amenities</a>
          {token && (
            <Link to="/my-bookings" className="text-amber-800 font-extrabold hover:underline">My Bookings</Link>
          )}
        </div>
      </nav>

      {/* SIDEBAR DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
          <div className="relative w-80 max-w-[85vw] bg-white text-stone-900 h-full shadow-2xl flex flex-col justify-between z-50 border-r border-stone-200">
            <div>
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[#181614] text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 text-stone-950 rounded-full"><Crown size={18} /></div>
                  <div>
                    <h2 className="text-sm font-serif font-bold tracking-widest">LUXURYSTAY</h2>
                    <p className="text-[8px] text-amber-400 uppercase tracking-widest">Hotels & Resorts</p>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white transition"><X size={20} /></button>
              </div>

              <div className="p-5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 pb-3 border-b border-stone-100 mb-3">Navigation Menu</p>
                {token && (
                  <Link to="/my-bookings" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg bg-amber-50 text-amber-900 font-bold text-xs hover:bg-amber-100/80 transition border border-amber-200/80 mb-2">
                    <span className="flex items-center gap-3"><CalendarCheck size={16} className="text-amber-700" /> My Bookings & Reservations</span>
                  </Link>
                )}
                <a href="#dining" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg bg-amber-50/60 text-amber-900 font-bold text-xs tracking-wide transition border-b border-stone-100/60"><span className="flex items-center gap-3"><Coffee size={16} className="text-amber-700" /> Restaurants & Dining</span></a>
                <a href="#rooms" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition border-b border-stone-100/60"><span className="flex items-center gap-3"><Building2 size={16} className="text-stone-400" /> Hotels & Suites</span></a>
                <a href="#facilities" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition border-b border-stone-100/60"><span className="flex items-center gap-3"><Utensils size={16} className="text-stone-400" /> Popular Facilities</span></a>
                <a href="#amenities" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition border-b border-stone-100/60"><span className="flex items-center gap-3"><Sparkles size={16} className="text-stone-400" /> Hotel Amenities</span></a>
                <Link to="/about" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition border-b border-stone-100/60"><span className="flex items-center gap-3"><Info size={16} className="text-stone-400" /> About Us</span></Link>
                <Link to="/contact" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition"><span className="flex items-center gap-3"><PhoneForwarded size={16} className="text-stone-400" /> Contact Us</span></Link>
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50">
              {token ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#181614] text-amber-400 rounded-full"><User size={16} /></div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">{user.name}</p>
                      <p className="text-[10px] text-stone-500">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={handleLogoutClick} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Logout Account"><LogOut size={16} /></button>
                </div>
              ) : (
                <button onClick={() => { setIsSidebarOpen(false); navigate('/auth'); }} className="w-full py-2.5 bg-[#181614] hover:bg-amber-600 text-amber-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition">Sign In / Register</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative h-[75vh] md:h-[85vh] w-full flex items-center justify-center overflow-hidden bg-stone-900">
        <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover z-0 filter brightness-75 scale-105">
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-resort-swimming-pool-41484-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-stone-900/60 z-10"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md">
            <Sparkles size={14} /> Premium 5-Star Experience
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-wide text-center">
            Experience Elegance & <span className="text-amber-500 italic">Hospitality</span>
          </h1>
          <p className="text-stone-200 text-sm sm:text-base md:text-xl mt-4 max-w-2xl mx-auto font-light leading-relaxed">
            Welcome to Pakistan's finest luxury resort. Enjoy world-class suites, gourmet dining, and personal concierge services.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="#rooms" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-8 py-4 rounded-lg shadow-xl transition uppercase text-xs tracking-wider">Explore Suites</a>
            <a href="#dining" className="bg-stone-900/80 hover:bg-stone-900 text-amber-400 border border-amber-500/40 font-bold px-8 py-4 rounded-lg shadow-xl transition uppercase text-xs tracking-wider backdrop-blur-md">Fine Dining</a>
          </div>
        </div>
      </div>

      {/* OVERVIEW SECTION */}
      <section id="overview" className="py-16 sm:py-20 bg-[#F7F4EE] border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="w-10 h-[1px] bg-amber-600/40"></span>
            <span className="text-xs font-bold tracking-[0.25em] text-amber-600 uppercase">OVERVIEW</span>
            <span className="w-10 h-[1px] bg-amber-600/40"></span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-snug tracking-tight max-w-2xl mx-auto">
            Experience Five-Star Luxury at One of the Finest Hotels in Karachi
          </h2>

          <p className="text-stone-700 text-sm sm:text-base md:text-lg mt-5 leading-relaxed font-light max-w-3xl mx-auto">
            If you are looking for hotels in Karachi that combine the warmth of a home with the elegance of a luxury retreat, LuxuryStay offers an exceptional experience. Ideally located on Club Road for over four decades, this iconic five star destination blends timeless hospitality with contemporary comfort.
          </p>
        </div>

        <div className="mt-12 max-w-5xl mx-auto px-4">
          <div className="relative w-full overflow-hidden rounded-2xl group">
            <div className="flex gap-4 sm:gap-5 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap w-max py-3">
              {[...pcOverviewHighlights, ...pcOverviewHighlights].map((item, index) => (
                <div key={index} className="w-32 h-32 sm:w-36 sm:h-36 bg-white border border-stone-200/90 rounded-2xl p-3 text-center flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-300 flex-shrink-0 cursor-pointer">
                  <div className="text-stone-600 mb-2 p-2 bg-stone-50 rounded-full border border-stone-100/80">{item.icon}</div>
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-stone-700 tracking-wider uppercase whitespace-normal leading-tight px-1 text-center">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MOST POPULAR FACILITIES */}
      <section id="facilities" className="py-20 bg-[#FAF8F5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="w-8 h-[1px] bg-amber-600/40"></span>
              <span className="text-xs font-bold tracking-[0.25em] text-amber-700 uppercase">FACILITIES</span>
              <span className="w-8 h-[1px] bg-amber-600/40"></span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight">Most Popular Facilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-stone-200/80">
              <div className="h-64 overflow-hidden">
                <img src="/images/breakfast2.jpg" alt="Continental Breakfast" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Continental Breakfast</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">Full buffet breakfast featuring Pakistani and Continental options daily at Marco Polo Dining Hall.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-stone-200/80">
              <div className="h-64 overflow-hidden">
                <img src="/images/room-service.jpg" alt="Room Service" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">24-Hour Room Service</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">24-hour room service keeps guests comfortable at any hour with prompt butler assistance.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-stone-200/80">
              <div className="h-64 overflow-hidden">
                <img src="/images/parking.jpeg" alt="Free Parking & Valet" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Free Parking & Valet</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">Valet and free private parking are available for all guests with 24-hour security.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESTAURANTS & DINING */}
      <section id="dining" className="py-20 bg-[#F4F1EA] border-b border-stone-300/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.25em] text-amber-700 uppercase block mb-2">CONNOISSEUR COLLECTION</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900">Indulge in Culinary Excellence</h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-3 max-w-2xl mx-auto font-light">
              Discover extraordinary dining experiences across Pakistan's finest destinations — where every meal is a celebration of flavour, craft, and warm hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

            <div className="lg:col-span-1 bg-[#181614] text-white rounded-2xl overflow-hidden flex flex-col justify-between relative shadow-lg min-h-[580px]">
              <div className="p-8 pb-4 z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">RESTAURANTS AND DINING</span>
                <h3 className="text-3xl font-serif font-bold mt-2 leading-tight">Discover in Karachi</h3>
                <p className="text-amber-200/80 font-serif italic text-lg mt-1">An Experience Beyond Dining</p>
                <a href="#dining" className="mt-4 inline-block w-full text-center bg-[#C69C6D] hover:bg-[#b08759] text-stone-950 font-bold py-2.5 px-4 rounded text-[11px] uppercase tracking-widest transition">
                  VIEW ALL RESTAURANTS
                </a>
              </div>

              <div className="relative flex-1 w-full overflow-hidden mt-2">
                <img
                  src="/images/chef.jpeg"
                  alt="Executive Chef"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                <div className="h-48 overflow-hidden">
                  <img src="/images/bakers.jpg" alt="Bakers Boutique" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-2 py-0.5 rounded">LuxuryStay Hotel</span>
                      <span className="bg-stone-100 text-stone-700 text-[9px] font-bold px-2 py-0.5 rounded">Karachi</span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-stone-900">Bakers Boutique</h4>
                    <p className="text-stone-500 text-xs mt-1.5 leading-relaxed line-clamp-3">
                      Indulge in professionally crafted desserts and treats to satisfy all your cravings. From freshly baked cookies to custom cakes.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRestaurant({
                      name: "Bakers Boutique",
                      cuisine: "Bakery & Desserts",
                      location: "Karachi",
                      image: "https://plus.unsplash.com/premium_photo-1665669263531-cdcbe18e7fe4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
                      description: "Indulge in professionally crafted desserts and treats to satisfy all your cravings. From freshly baked cookies to custom cakes.",
                      menu: [
                        { name: "Signature Chocolate Truffle Cake", price: "PKR 3,500" },
                        { name: "Artisan Macaron Box (6 pcs)", price: "PKR 1,800" },
                        { name: "Fresh Berry Tart", price: "PKR 950" },
                        { name: "Belgian Waffle with Honey", price: "PKR 1,200" }
                      ]
                    })}
                    className="text-amber-700 hover:text-amber-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition mx-auto mt-2"
                  >
                    View Details & Menu ➔
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                <div className="h-48 overflow-hidden">
                  <img src="/images/sakura.jpeg" alt="Sakura Japanese" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-2 py-0.5 rounded">Japanese Cuisine</span>
                      <span className="bg-stone-100 text-stone-700 text-[9px] font-bold px-2 py-0.5 rounded">Karachi</span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-stone-900">Sakura</h4>
                    <p className="text-stone-500 text-xs mt-1.5 leading-relaxed line-clamp-3">
                      Known for serving authentic Japanese cuisine in Pakistan and the best sushi in Karachi with live Teppanyaki counters.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRestaurant({
                      name: "Sakura",
                      cuisine: "Japanese Cuisine",
                      location: "Karachi",
                      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
                      description: "Known for serving authentic Japanese cuisine in Pakistan with the best sushi in Karachi with live Teppanyaki counters.",
                      menu: [
                        { name: "Dragon Sushi Roll (8 pcs)", price: "PKR 2,400" },
                        { name: "Chicken Teriyaki Bento", price: "PKR 2,100" },
                        { name: "Salmon Sashimi Platter", price: "PKR 3,200" },
                        { name: "Shrimp Tempura", price: "PKR 1,650" }
                      ]
                    })}
                    className="text-amber-700 hover:text-amber-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition mx-auto mt-2"
                  >
                    View Details & Menu ➔
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                <div className="h-48 overflow-hidden">
                  <img src="/images/chandni.jpeg" alt="Chandni Restaurant" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-2 py-0.5 rounded">Pakistani BBQ</span>
                      <span className="bg-stone-100 text-stone-700 text-[9px] font-bold px-2 py-0.5 rounded">Rooftop</span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-stone-900">Chandni</h4>
                    <p className="text-stone-500 text-xs mt-1.5 leading-relaxed line-clamp-3">
                      If you are in the mood for top-tier desi Pakistani cuisine coupled with live barbeque, live folk music, and breathtaking city views.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRestaurant({
                      name: "Chandni",
                      cuisine: "Pakistani BBQ • Rooftop",
                      location: "Karachi",
                      image: "https://images.unsplash.com/photo-1644364935906-792b2245a2c0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
                      description: "If you are in the mood for top-tier desi Pakistani cuisine coupled with live barbeque, live folk music, and breathtaking city views.",
                      menu: [
                        { name: "Special Mutton Malai Boti", price: "PKR 2,200" },
                        { name: "Royal Chicken Reshmi Kabab", price: "PKR 1,500" },
                        { name: "Traditional Peshawari Karahi (1kg)", price: "PKR 4,500" },
                        { name: "Garlic Butter Naan (Basket)", price: "PKR 600" }
                      ]
                    })}
                    className="text-amber-700 hover:text-amber-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition mx-auto mt-2"
                  >
                    View Details & Menu ➔
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                <div className="h-48 overflow-hidden">
                  <img src="/images/taipan.jpg" alt="Tai-Pan Chinese" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-2 py-0.5 rounded">Chinese Pan-Asian</span>
                      <span className="bg-stone-100 text-stone-700 text-[9px] font-bold px-2 py-0.5 rounded">Karachi</span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-stone-900">Tai-Pan</h4>
                    <p className="text-stone-500 text-xs mt-1.5 leading-relaxed line-clamp-3">
                      Serving traditional Chinese cuisine with flavors of Canton and Shanghai provinces. Tai-Pan is one of the best Chinese restaurants.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRestaurant({
                      name: "Tai-Pan",
                      cuisine: "Chinese Pan-Asian",
                      location: "Karachi",
                      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
                      description: "Serving traditional Chinese cuisine with flavors of Canton and Shanghai provinces. Tai-Pan is one of the best Chinese restaurants.",
                      menu: [
                        { name: "Hot & Sour Szechuan Soup", price: "PKR 850" },
                        { name: "Kung Pao Chicken with Cashews", price: "PKR 1,950" },
                        { name: "Beef Chili Dry", price: "PKR 2,300" },
                        { name: "Special Egg Fried Rice", price: "PKR 1,100" }
                      ]
                    })}
                    className="text-amber-700 hover:text-amber-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition mx-auto mt-2"
                  >
                    View Details & Menu ➔
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ROOMS LIST - EQUAL CARD SIZES & OBJECT-CONTAIN */}
      <section id="rooms" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 block">Accommodations</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">Featured Suites & Rooms</h2>
          <p className="text-stone-500 text-sm mt-2 max-w-lg mx-auto">Handcrafted suites designed for comfort, luxury, and tranquility.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-500">Loading suites from database...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredRooms.length === 0 ? (
              <div className="col-span-full text-center py-12 text-stone-500">No rooms match your search query.</div>
            ) : (
              filteredRooms.map((room) => {
                const rawRoomImg = (room.images && room.images.length > 0 ? room.images[0] : room.image) || '';
                const roomImg = rawRoomImg.startsWith('http') ? rawRoomImg : (rawRoomImg ? `http://localhost:5000${rawRoomImg}` : 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80');

                return (
                  <div key={room._id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400 transition duration-300 flex flex-col h-full justify-between">
                    <div className="relative bg-stone-950 flex items-center justify-center h-64 overflow-hidden cursor-pointer" onClick={() => openRoomModal(room)}>
                      <img src={roomImg} alt={room.roomType} className="w-full h-full object-contain transition duration-500" />
                      <div className="absolute top-4 left-4 bg-stone-900/80 text-amber-400 px-3 py-1 rounded-md text-xs font-bold backdrop-blur-sm border border-stone-700">
                        Room #{room.roomNumber}
                      </div>
                      <span className="absolute top-3 right-3 z-10 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                        AVAILABLE
                      </span>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 cursor-pointer hover:text-amber-600" onClick={() => openRoomModal(room)}>
                          {room.roomType}
                        </h3>
                        <p className="text-stone-500 text-xs line-clamp-2 mb-4 leading-relaxed">{room.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                        <div>
                          <span className="text-xs text-stone-400 block font-medium">Starting from</span>
                          <span className="text-lg sm:text-xl font-extrabold text-stone-900">PKR {Number(room.pricePerNight).toLocaleString()}</span>
                          <span className="text-stone-500 text-xs"> / night</span>
                        </div>
                        <button onClick={() => openRoomModal(room)} className="font-bold px-4 py-2.5 rounded-lg text-xs transition uppercase tracking-wider bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-400">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* AMENITIES SECTION */}
      <section id="amenities" className="py-20 bg-[#F4F0E8] border-y border-stone-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-[0.25em] mb-2 block">5-STAR SERVICES</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">Hotel Amenities & Facilities</h2>
            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-stone-200/90 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:border-amber-400/80 transition duration-300">
              <div className="p-4 bg-amber-500/10 text-amber-700 rounded-full mb-4 border border-amber-500/20">
                <Wifi size={28} strokeWidth={1.5} />
              </div>
              <h4 className="font-serif font-bold text-stone-900 text-base mb-1">High-Speed Wifi</h4>
              <p className="text-stone-500 text-xs leading-relaxed">Free 5G connection across all resort wings & guest suites</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200/90 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:border-amber-400/80 transition duration-300">
              <div className="p-4 bg-amber-500/10 text-amber-700 rounded-full mb-4 border border-amber-500/20">
                <Coffee size={28} strokeWidth={1.5} />
              </div>
              <h4 className="font-serif font-bold text-stone-900 text-base mb-1">Executive Dining</h4>
              <p className="text-stone-500 text-xs leading-relaxed">Complimentary buffet breakfast & 24/7 gourmet restaurant</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200/90 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:border-amber-400/80 transition duration-300">
              <div className="p-4 bg-amber-500/10 text-amber-700 rounded-full mb-4 border border-amber-500/20">
                <BedDouble size={28} strokeWidth={1.5} />
              </div>
              <h4 className="font-serif font-bold text-stone-900 text-base mb-1">24/7 Housekeeping</h4>
              <p className="text-stone-500 text-xs leading-relaxed">Dedicated butler assistance and prompt daily room service</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200/90 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:border-amber-400/80 transition duration-300">
              <div className="p-4 bg-amber-500/10 text-amber-700 rounded-full mb-4 border border-amber-500/20">
                <ShieldCheck size={28} strokeWidth={1.5} />
              </div>
              <h4 className="font-serif font-bold text-stone-900 text-base mb-1">Secure Parking</h4>
              <p className="text-stone-500 text-xs leading-relaxed">Valet parking service & 24-hour CCTV security monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL - DYNAMIC IMAGES ONLY & OBJECT-CONTAIN */}
      {selectedRoom && (() => {
        const gallery = (selectedRoom.images && selectedRoom.images.length > 0)
          ? selectedRoom.images
          : (selectedRoom.image ? [selectedRoom.image] : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80']);

        const prevImage = () => setActiveImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
        const nextImage = () => setActiveImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));

        const roomAmenities = (selectedRoom.amenities && selectedRoom.amenities.length > 0)
          ? selectedRoom.amenities
          : ['King Size Bed', 'High-Speed Wifi', 'Air Conditioning', 'Flat Screen TV'];

        return (
          <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-hidden">
            <div className="bg-white border border-stone-200 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
              <button onClick={() => setSelectedRoom(null)} className="absolute top-3 right-3 z-40 bg-stone-900/80 p-2.5 rounded-full text-white hover:bg-stone-900 transition shadow-xl">
                <X size={18} />
              </button>

              <div className="overflow-y-auto flex-1 scroll-smooth">
                <div className="bg-stone-950 shadow-md">
                  <div className={`relative w-full overflow-hidden flex items-center justify-center bg-stone-950 transition-all duration-300 ${isBookingOpen ? 'h-48 md:h-56' : 'h-72 md:h-96'
                    }`}>
                    <img
                      src={gallery[activeImageIndex]?.startsWith('http') ? gallery[activeImageIndex] : `http://localhost:5000${gallery[activeImageIndex]}`}
                      alt={selectedRoom.roomType}
                      className="w-full h-full object-contain object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-transparent to-black/20 pointer-events-none"></div>

                    {gallery.length > 1 && (
                      <>
                        <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-stone-900/80 hover:bg-amber-500 text-white hover:text-stone-950 p-2 rounded-full transition shadow-lg z-20">
                          <ChevronLeft size={18} />
                        </button>
                        <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-stone-900/80 hover:bg-amber-500 text-white hover:text-stone-950 p-2 rounded-full transition shadow-lg z-20">
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}

                    <div className="absolute bottom-3 left-6 text-white z-10">
                      <span className="bg-amber-500 text-stone-950 px-2.5 py-0.5 text-[10px] font-extrabold rounded uppercase tracking-wider">
                        Room #{selectedRoom.roomNumber}
                      </span>
                      <h3 className={`font-serif font-bold mt-0.5 text-white drop-shadow-md ${isBookingOpen ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'
                        }`}>
                        {selectedRoom.roomType}
                      </h3>
                    </div>
                  </div>

                  {gallery.length > 1 && (
                    <div className="flex gap-2 p-2 bg-stone-900 overflow-x-auto border-b border-stone-800">
                      {gallery.map((imgUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`relative h-10 w-16 flex-shrink-0 rounded overflow-hidden border-2 transition ${activeImageIndex === index ? 'border-amber-500 scale-105' : 'border-stone-700 opacity-60 hover:opacity-100'
                            }`}
                        >
                          <img src={imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`} alt="Thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6 bg-white">
                  {!isBookingOpen ? (
                    <>
                      <div>
                        <h4 className="text-xs font-bold uppercase text-stone-400 mb-1">Description & Experience</h4>
                        <p className="text-stone-700 text-sm leading-relaxed">{selectedRoom.description}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase text-stone-400 mb-3">Included Facilities & Amenities</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          {roomAmenities.map((amenity, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                              <CheckCircle2 size={16} className="text-amber-600 flex-shrink-0" />
                              <span className="text-xs font-semibold">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                        <div>
                          <p className="text-xs text-stone-400">Rate</p>
                          <p className="text-2xl font-extrabold text-stone-900">
                            PKR {Number(selectedRoom.pricePerNight).toLocaleString()}
                            <span className="text-xs font-normal text-stone-500"> / night</span>
                          </p>
                        </div>

                        <button
                          onClick={() => setIsBookingOpen(true)}
                          className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-8 py-3.5 rounded-lg shadow-md transition uppercase text-xs tracking-wider"
                        >
                          Book This Suite
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleConfirmBooking} className="space-y-4 pt-1">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                        <div>
                          <h4 className="text-xl font-serif font-bold text-stone-900">Hotel Reservation Form</h4>
                          <p className="text-xs text-stone-500">Enter your details below to confirm your stay.</p>
                        </div>
                        <span className="text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                          PKR {Number(selectedRoom.pricePerNight).toLocaleString()} / Night
                        </span>
                      </div>

                      {bookingSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">{bookingSuccess}</div>}
                      {bookingError && <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold">{bookingError}</div>}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-stone-600 uppercase">Guest Name *</label>
                          <input type="text" name="guestName" required value={bookingData.guestName} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900" placeholder="First & Last Name" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-stone-600 uppercase">Email Address *</label>
                          <input type="email" name="guestEmail" required value={bookingData.guestEmail} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900" placeholder="ex: myname@example.com" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-stone-600 uppercase">Phone Number *</label>
                          <input type="text" name="guestPhone" required value={bookingData.guestPhone} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900" placeholder="03001234567" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-stone-600 uppercase">CNIC Number * (Required)</label>
                          <input type="text" name="guestCnic" required value={bookingData.guestCnic} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900" placeholder="42101-1234567-1" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-bold text-stone-600 uppercase">Arrival Date *</label>
                          <input type="date" name="checkInDate" required value={bookingData.checkInDate} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-stone-600 uppercase">Check-in Time</label>
                          <select name="checkInTime" value={bookingData.checkInTime} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900">
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                            <option value="06:00 PM">06:00 PM</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-stone-600 uppercase">Departure Date *</label>
                          <input type="date" name="checkOutDate" required value={bookingData.checkOutDate} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-stone-600 uppercase">Number of Guests *</label>
                          <input type="number" name="numberOfGuests" min="1" max="6" required value={bookingData.numberOfGuests} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-stone-600 uppercase">Airport Pickup Needed?</label>
                          <select name="airportPickup" value={bookingData.airportPickup} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900">
                            <option value="No">No Thanks - I'll make my own way</option>
                            <option value="Yes">Yes Please! Pick me up on arrival</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-600 uppercase">Special Requests / Notes</label>
                        <textarea name="specialRequests" rows="2" value={bookingData.specialRequests} onChange={handleFormChange} className="w-full mt-1 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900" placeholder="e.g. Early check-in, extra bed..."></textarea>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-stone-500">Duration: <strong className="text-stone-900">{calculateNights()} Night(s)</strong></p>
                          <p className="text-base font-extrabold text-amber-700 mt-0.5">
                            Total Bill: PKR {Number(calculateNights() * selectedRoom.pricePerNight).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsBookingOpen(false)} className="w-1/2 py-3 bg-stone-100 text-stone-700 font-bold rounded-lg text-xs uppercase">Back</button>
                        <button type="submit" className="w-1/2 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs uppercase shadow-md">Confirm Booking</button>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      <div className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold text-amber-800 tracking-[0.3em] uppercase block mb-2">GUEST EXPERIENCES</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-wide">Hotel Testimonials & Reviews</h2>
          <div className="w-12 h-0.5 bg-amber-600 mx-auto mt-3"></div>
        </div>

        {reviewsList.length === 0 ? (
          <p className="text-center text-stone-400 text-xs italic">No reviews yet. Be the first to leave one after your stay!</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviewsList
                .slice(currentReviewIndex, currentReviewIndex + 3)
                .map((rev) => (
                  <div key={rev._id} className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">

                    {/* Top: Profile Pic & Name (Amenities style heading layout) */}
                    <div className="flex items-center gap-3.5 mb-6 border-b border-stone-100 pb-4">
                      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-sm shadow-inner flex-shrink-0">
                        {rev.guestName ? rev.guestName.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-stone-900 text-base leading-tight">{rev.guestName}</h4>
                        <span className="text-[11px] text-amber-700 font-medium">{rev.roomTitle || 'Verified Guest Stay'}</span>
                      </div>
                    </div>

                    {/* Bottom: Feedback & Ratings */}
                    <div className="space-y-4">
                      <p className="text-stone-800 text-xs sm:text-sm leading-relaxed italic font-medium">"{rev.comment}"</p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex text-amber-500 text-base sm:text-lg tracking-wider">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </div>
                        <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full">
                          {rev.rating}.0 / 5.0
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {reviewsList.length > 3 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setCurrentReviewIndex((prev) => Math.max(prev - 3, 0))}
                  disabled={currentReviewIndex === 0}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${currentReviewIndex === 0
                    ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                    : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50 shadow-sm'
                    }`}
                >
                  ← Previous
                </button>

                <span className="text-xs text-stone-500 font-medium">
                  {currentReviewIndex + 1} - {Math.min(currentReviewIndex + 3, reviewsList.length)} of {reviewsList.length}
                </span>

                <button
                  onClick={() => setCurrentReviewIndex((prev) => Math.min(prev + 3, reviewsList.length - 3))}
                  disabled={currentReviewIndex + 3 >= reviewsList.length}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${currentReviewIndex + 3 >= reviewsList.length
                    ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                    : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50 shadow-sm'
                    }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>



      <footer className="bg-[#1A1816] text-stone-300 relative border-t border-amber-500/20 pt-16 pb-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center border-b border-stone-800 pb-12">
          <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-amber-100/90 leading-tight">
            LuxuryStay Hospitality, over 25 years of history,
          </p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-amber-400 font-light italic mt-1">
            A life dedicated to hospitality.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-16 h-[1px] bg-amber-500/40"></div>
            <span className="text-amber-400 font-serif text-2xl tracking-widest font-bold">2001</span>
            <div className="w-16 h-[1px] bg-amber-500/40"></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-4">About LuxuryStay</h4>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Premier 5-star destination in Karachi blending traditional warmth with contemporary luxury accommodation.
            </p>
            <p className="text-amber-200/80 text-[11px]">Club Road, Karachi, Pakistan</p>
            <p className="text-amber-200/80 text-[11px]">UAN: +92 (21) 111-589-999</p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-4">Policies & Help</h4>
            <p><a href="#overview" className="text-stone-400 hover:text-amber-400 transition">Privacy Policy</a></p>
            <p><a href="#overview" className="text-stone-400 hover:text-amber-400 transition">Refund & Cancellation Policy</a></p>
            <p><a href="#overview" className="text-stone-400 hover:text-amber-400 transition">Terms & Conditions</a></p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-4">Direct Links</h4>
            <p><a href="#dining" className="text-stone-400 hover:text-amber-400 transition">Restaurants & Dining</a></p>
            <p><a href="#facilities" className="text-stone-400 hover:text-amber-400 transition">Popular Facilities</a></p>
            <p><a href="#rooms" className="text-stone-400 hover:text-amber-400 transition">Executive Suites</a></p>
          </div>

          <div>
            <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-4">For Latest Updates</h4>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center bg-stone-900 border border-stone-700 rounded-md overflow-hidden">
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-transparent px-3 py-2 text-xs text-white placeholder-stone-500 outline-none w-full"
                  required
                />
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 font-bold uppercase tracking-wider text-[10px] transition">
                  Subscribe
                </button>
              </div>
              {subscribedMsg && <p className="text-[10px] text-emerald-400 font-bold">✨ Thank you for subscribing!</p>}
            </form>

            <div className="flex items-center gap-2.5 mt-6 text-stone-400">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 rounded-full transition" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 rounded-full transition" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 rounded-full transition" title="Twitter / X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://luxurystay.com" target="_blank" rel="noreferrer" className="p-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 rounded-full transition" title="Official Website">
                <Globe size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-500">
          <p>© 2026 LUXURYSTAY HOTELS & RESORTS PAKISTAN. ALL RIGHTS RESERVED.</p>
          <p className="mt-2 sm:mt-0 text-amber-500/80 font-medium">Designed for Luxury HMS Project</p>
        </div>

        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-3.5 bg-[#181614] text-amber-400 border border-amber-500/50 rounded-full shadow-2xl hover:scale-110 transition duration-300 flex items-center justify-center relative group ring-4 ring-amber-500/10"
            title="Luxury AI Concierge Assistant"
          >
            <Crown size={22} className="group-hover:rotate-12 transition duration-300" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#181614] animate-pulse"></span>
          </button>
        </div>

      </footer>

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#181614] text-white p-4 flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-stone-950 rounded-full">
                <Crown size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wider uppercase text-amber-300">Luxury Concierge</h3>
                <p className="text-[9px] text-stone-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Online & Ready to Help
                </p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-stone-400 hover:text-white transition p-1">
              <X size={18} />
            </button>
          </div>

          <div className="bg-stone-50 p-2 border-b border-stone-200/80 flex items-center gap-1 relative">
            <button
              onClick={() => scrollChips('left')}
              className="p-1 text-stone-500 hover:text-amber-700 bg-white border border-stone-200 rounded-full shadow-sm z-10 flex-shrink-0"
              title="Previous Questions"
            >
              <ChevronLeft size={14} />
            </button>

            <div ref={chipsScrollRef} className="flex gap-1.5 overflow-x-auto text-[10px] scrollbar-none scroll-smooth flex-1 py-1 px-0.5">
              <button onClick={() => handleSendChatMessage("Check-in Time?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition">
                🕒 Check-in Time
              </button>
              <button onClick={() => handleSendChatMessage("Room Rates?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition">
                🏨 Suite Rates
              </button>
              <button onClick={() => handleSendChatMessage("Airport Pickup?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition">
                ✈ Airport Pickup
              </button>
              <button onClick={() => handleSendChatMessage("Breakfast & Dining?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition">
                🍳 Dining & Buffet
              </button>
              <button onClick={() => handleSendChatMessage("Swimming Pool & Gym?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition">
                🏊 Pool & Gym
              </button>
              <button onClick={() => handleSendChatMessage("Cancellation Policy?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition">
                📜 Refund Policy
              </button>
            </div>

            <button
              onClick={() => scrollChips('right')}
              className="p-1 text-stone-500 hover:text-amber-700 bg-white border border-stone-200 rounded-full shadow-sm z-10 flex-shrink-0"
              title="Next Questions"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBF9F5]/50">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.sender === 'user'
                  ? 'bg-[#181614] text-amber-300 rounded-br-none'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about check-in, dining, pool, events..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-stone-100 text-xs px-3 py-2 rounded-xl text-stone-800 outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button type="submit" className="p-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl transition shadow-sm">
              <Send size={15} />
            </button>
          </form>
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

      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 space-y-6 relative">

            {/* Close Button */}
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-700 w-8 h-8 rounded-full flex items-center justify-center font-bold transition z-10"
            >
              ✕
            </button>

            {/* Header Info */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                {selectedRestaurant.cuisine}
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mt-2">{selectedRestaurant.name}</h2>
              <p className="text-xs text-stone-500 mt-1">{selectedRestaurant.location} • Luxury Dining Experience</p>
            </div>

            {/* Main Image */}
            <div className="w-full h-56 rounded-2xl overflow-hidden shadow-md">
              <img src={selectedRestaurant.image} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-1 text-amber-800">About the Experience</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{selectedRestaurant.description}</p>
            </div>

            {/* Menu / Specialties Section */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-3 text-amber-800">Featured Menu & Prices</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRestaurant.menu?.map((dish, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-100 hover:border-amber-200 transition">
                    <span className="text-xs font-medium text-stone-800">{dish.name}</span>
                    <span className="text-xs font-bold text-amber-700">{dish.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm"
              >
                Close Menu
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}