import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Crown, Menu, Search, LogIn, User, LogOut, Bell, MapPin, PhoneCall, 
  Building2, Utensils, X, Coffee, Info, PhoneForwarded, CalendarCheck, 
  Send, Sparkles, Mail, Globe
} from 'lucide-react';

export default function Contact() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    firstName: user.name ? user.name.split(' ')[0] : '',
    lastName: user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
    email: user.email || '',
    phone: user.phone || '',
    message: ''
  });

  const [statusMsg, setStatusMsg] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribedMsg, setSubscribedMsg] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const isStaff = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'].includes(user.role);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatusMsg('Thank you for reaching out! Our Concierge team has received your query.');
        setTimeout(() => {
          setStatusMsg('');
          setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
        }, 4000);
      } else {
        setStatusMsg('Failed to submit query. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatusMsg('Network error. Please check server connection.');
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Top Announcement Bar */}
      <div className="bg-[#151311] text-amber-100/90 px-4 sm:px-8 py-2 text-xs flex justify-between items-center border-b border-amber-500/20">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><MapPin size={13} className="text-amber-400" /> Club Road, Karachi, Pakistan</span>
          <span className="hidden md:flex items-center gap-1.5"><PhoneCall size={13} className="text-amber-400" /> +92 (21) 111-589-999</span>
        </div>
        <div className="text-amber-400 font-semibold tracking-wide">Best Rate Guarantee on Direct Bookings</div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-white sticky top-0 z-40 border-b border-stone-200 shadow-sm">
        <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between relative">
          
          <div className="flex items-center gap-3 sm:gap-4 z-10">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-stone-50 hover:bg-amber-50 text-stone-800 hover:text-amber-800 rounded-lg border border-stone-200 transition shadow-sm"
              title="Open Menu"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 w-48 lg:w-60 text-xs focus-within:border-amber-600 focus-within:bg-white transition">
              <Search size={14} className="text-stone-400 mr-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search Suite / Room #" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-stone-900 placeholder-stone-400 w-full font-medium"
              />
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link to="/" className="pointer-events-auto flex items-center gap-3 group">
              <div className="p-2 bg-[#181614] text-amber-400 rounded-full shadow-md group-hover:bg-amber-600 group-hover:text-white transition duration-300">
                <Crown size={18} strokeWidth={2} />
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-lg sm:text-xl font-serif font-extrabold text-[#181614] tracking-[0.22em] flex items-center leading-tight">
                  LUXURY<span className="text-amber-700 font-normal">STAY</span>
                </h1>
                <p className="text-[7.5px] sm:text-[8px] text-amber-800 font-black uppercase tracking-[0.32em] text-center w-full">
                  HOTELS & RESORTS
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 z-10">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-700 rounded-full border border-stone-200 transition relative shadow-sm"
              >
                <Bell size={16} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-stone-800 border border-stone-200 rounded-xl shadow-xl p-3 z-50">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-600"><X size={14} /></button>
                  </div>
                  <div className="py-3 text-[11px] text-stone-600">
                    <p className="bg-amber-50 border border-amber-200/60 p-2 rounded-lg text-amber-900 font-medium">
                      ✨ Need help? Our concierge desk is available 24/7.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {token ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 bg-[#181614] text-white px-3.5 py-1.5 rounded-full shadow-sm">
                  <User size={13} className="text-amber-400" />
                  <span className="text-xs font-medium">Hi, <strong className="text-amber-400 font-bold">{user.name}</strong></span>
                </div>

                {isStaff && (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm uppercase tracking-wider"
                  >
                    Staff Portal
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 bg-[#181614] hover:bg-amber-600 text-amber-300 hover:text-white font-bold px-4 py-2 rounded-full text-xs uppercase tracking-widest shadow-sm transition"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#F6F4EE] border-t border-stone-200 px-4 sm:px-8 py-2 hidden md:flex items-center justify-center gap-10 text-[11px] font-extrabold uppercase tracking-widest text-stone-700">
          <Link to="/#overview" className="hover:text-amber-700 transition">Overview</Link>
          <Link to="/#facilities" className="hover:text-amber-700 transition">Facilities</Link>
          <Link to="/#dining" className="hover:text-amber-700 transition text-amber-800 font-extrabold">Restaurants & Dining</Link>
          <Link to="/#rooms" className="hover:text-amber-700 transition">Suites & Rates</Link>
          <Link to="/#amenities" className="hover:text-amber-700 transition">Amenities</Link>
          {token && user.role === 'GUEST' && (
            <Link to="/my-bookings" className="text-amber-800 font-extrabold hover:underline">My Bookings</Link>
          )}
        </div>
      </nav>

      {/* SIDEBAR DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
          <div className="relative w-80 max-w-[85vw] bg-white text-stone-900 h-full shadow-2xl flex flex-col justify-between z-50 border-r border-stone-200 animate-in slide-in-from-left duration-300">
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
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 pb-3 border-b border-stone-100 mb-3">
                  Navigation Menu
                </p>

                {token && user.role === 'GUEST' && (
                  <Link 
                    to="/my-bookings" 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="flex items-center p-3 rounded-lg bg-amber-50 text-amber-900 font-bold text-xs hover:bg-amber-100/80 transition border border-amber-200/80 mb-2"
                  >
                    <span className="flex items-center gap-3">
                      <CalendarCheck size={16} className="text-amber-700" /> My Bookings & Reservations
                    </span>
                  </Link>
                )}

                <Link to="/#dining" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg bg-amber-50/60 text-amber-900 font-bold text-xs tracking-wide transition border-b border-stone-100/60">
                  <span className="flex items-center gap-3"><Coffee size={16} className="text-amber-700" /> Restaurants & Dining</span>
                </Link>

                <Link to="/#rooms" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition border-b border-stone-100/60">
                  <span className="flex items-center gap-3"><Building2 size={16} className="text-stone-400" /> Hotels & Suites</span>
                </Link>

                <Link to="/#facilities" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition border-b border-stone-100/60">
                  <span className="flex items-center gap-3"><Utensils size={16} className="text-stone-400" /> Popular Facilities</span>
                </Link>

                <Link to="/#amenities" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition border-b border-stone-100/60">
                  <span className="flex items-center gap-3"><Sparkles size={16} className="text-stone-400" /> Hotel Amenities</span>
                </Link>

                <Link to="/about" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition border-b border-stone-100/60">
                  <span className="flex items-center gap-3"><Info size={16} className="text-stone-400" /> About Us</span>
                </Link>

                <Link to="/contact" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium text-xs tracking-wide transition">
                  <span className="flex items-center gap-3"><PhoneForwarded size={16} className="text-stone-400" /> Contact Us</span>
                </Link>
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
                  <button onClick={handleLogout} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Logout Account"><LogOut size={16} /></button>
                </div>
              ) : (
                <button onClick={() => { setIsSidebarOpen(false); navigate('/auth'); }} className="w-full py-2.5 bg-[#181614] hover:bg-amber-600 text-amber-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition">Sign In / Register</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HERO HEADER */}
      <section className="relative bg-stone-900 text-white min-h-[380px] sm:min-h-[440px] flex items-center justify-center px-6 text-center border-b border-amber-500/30 overflow-hidden py-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/contact-banner.webp" 
            alt="Luxury Stay Resort" 
            className="w-full h-full object-cover object-center filter brightness-[0.65]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181614] via-black/35 to-black/20"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <span className="text-amber-400 text-xs font-extrabold uppercase tracking-[0.3em] block">
            CONTACT US
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
            Let's connect and make your next experience unforgettable.
          </h1>
        </div>
      </section>

      {/* INTRODUCTORY BANNER */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-4 text-center">
        <p className="text-stone-700 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
          At LuxuryStay Hospitality, we value your trust and strive to provide you with the best possible experience during your stay. Please reach out to us with any query below:
        </p>
      </div>

      {/* CONTACT FORM & HOTEL DETAILS */}
      <section className="py-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 bg-[#181614] text-white rounded-2xl p-8 shadow-xl space-y-8">
            <div>
              <span className="text-amber-400 text-[10px] font-extrabold uppercase tracking-[0.25em] block mb-1">
                KARACHI PROPERTY
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">
                LuxuryStay Hotel & Resort
              </h3>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                Ideally situated on Club Road in the heart of Karachi, offering luxury suites, fine dining, and event spaces.
              </p>
            </div>

            <div className="space-y-5 text-xs pt-4 border-t border-stone-800">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-stone-900 text-amber-400 rounded-xl border border-stone-800">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">Address</span>
                  <p className="text-stone-200 font-medium mt-0.5">Club Road, Karachi - 75530, Pakistan</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-stone-900 text-amber-400 rounded-xl border border-stone-800">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">UAN Helpline</span>
                  <p className="text-stone-200 font-medium mt-0.5">+92 (21) 111-589-999</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-stone-900 text-amber-400 rounded-xl border border-stone-800">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">Email Inquiry</span>
                  <p className="text-stone-200 font-medium mt-0.5">info@luxurystay.com.pk</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-stone-200/90 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Get in Touch</h3>

            {statusMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-bold uppercase mb-1">First Name *</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    required 
                    value={formData.firstName} 
                    onChange={handleChange}
                    placeholder="First Name" 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 outline-none focus:border-amber-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold uppercase mb-1">Last Name *</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    required 
                    value={formData.lastName} 
                    onChange={handleChange}
                    placeholder="Last Name" 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 outline-none focus:border-amber-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-bold uppercase mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange}
                    placeholder="name@example.com" 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 outline-none focus:border-amber-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold uppercase mb-1">Phone Number *</label>
                  <input 
                    type="text" 
                    name="phone" 
                    required 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="0300 1234567" 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 outline-none focus:border-amber-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-bold uppercase mb-1">How Can We Help You? *</label>
                <textarea 
                  name="message" 
                  rows="4" 
                  required 
                  value={formData.message} 
                  onChange={handleChange}
                  placeholder="How can we help you?" 
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 outline-none focus:border-amber-600 transition"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="inline-flex items-center gap-2 bg-[#C69C6D] hover:bg-[#b08759] text-stone-950 font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-widest transition shadow-md"
              >
                <Send size={14} /> Submit Query
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* GOOGLE MAP */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-3 px-2">
            <MapPin size={18} className="text-amber-700" />
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Find Us on Map</h4>
          </div>
          <div className="w-full h-80 rounded-xl overflow-hidden">
            <iframe 
              title="LuxuryStay Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.3789066531985!2d67.0268593!3d24.8510825!2m3!1f0!0!0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e72166e9271%3A0x6fb83df348e02fa8!2sClub%20Rd%2C%20Civil%20Lines%2C%20Karachi!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk" 
              className="w-full h-full border-0"
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
            <p><Link to="/#dining" className="text-stone-400 hover:text-amber-400 transition">Restaurants & Dining</Link></p>
            <p><Link to="/#facilities" className="text-stone-400 hover:text-amber-400 transition">Popular Facilities</Link></p>
            <p><Link to="/#rooms" className="text-stone-400 hover:text-amber-400 transition">Executive Suites</Link></p>
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
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 rounded-full transition" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 rounded-full transition" title="Twitter / X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
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

      </footer>

    </div>
  );
}