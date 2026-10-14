import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Crown, Menu, Search, LogIn, User, LogOut, Bell, MapPin, PhoneCall, 
  Award, ShieldCheck, HeartHandshake, Sparkles, Building2, Utensils, X,
  Coffee, Info, PhoneForwarded, CalendarCheck, Send, ChevronLeft, ChevronRight, Globe
} from 'lucide-react';

export default function About() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Page States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribedMsg, setSubscribedMsg] = useState(false);

  // Chatbot Drawer States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Welcome to LuxuryStay! How can I assist you with your booking or stay today?' }
  ]);

  const chipsScrollRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const isStaff = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'].includes(user.role);

  // Footer Newsletter Submit Handler
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribedMsg(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribedMsg(false), 4000);
    }
  };

  // Chatbot Message Sender
  const handleSendChatMessage = (presetText) => {
    const query = presetText || chatInput;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    let botReply = "Thank you for reaching out! Our reception desk on Club Road is active 24/7. You can also reach us directly at +92 (21) 111-589-999.";

    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('check-in')) {
      botReply = "Standard check-in time is 2:00 PM and check-out is 12:00 PM. Early check-in is subject to room availability.";
    } else if (lowerQuery.includes('rate') || lowerQuery.includes('suite')) {
      botReply = "Our deluxe suites start from PKR 25,000/night. Direct online bookings come with a Best Rate Guarantee.";
    } else if (lowerQuery.includes('pickup') || lowerQuery.includes('airport')) {
      botReply = "We offer complimentary airport shuttle pick & drop services for Executive Suite guests.";
    } else if (lowerQuery.includes('dining') || lowerQuery.includes('breakfast')) {
      botReply = "Complimentary buffet breakfast is served at Lal Qila / Chandni Rooftop from 7:00 AM to 10:30 AM.";
    } else if (lowerQuery.includes('pool') || lowerQuery.includes('gym')) {
      botReply = "Our temperature-controlled swimming pool & fitness center are open daily from 6:00 AM to 10:00 PM.";
    } else if (lowerQuery.includes('cancellation') || lowerQuery.includes('refund')) {
      botReply = "Free cancellation is available up to 24 hours prior to check-in date.";
    }

    setChatMessages((prev) => [...prev, userMsg, { sender: 'bot', text: botReply }]);
    if (!presetText) setChatInput('');
  };

  // Scroll Quick Chips Slider
  const scrollChips = (direction) => {
    if (chipsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      chipsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
          
          {/* LEFT: Menu Trigger + Search */}
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

          {/* CENTER: LOGO */}
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

          {/* RIGHT: Notifications & Account */}
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
                      ✨ Welcome to LuxuryStay! Explore our 25-year legacy of hospitality.
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

        {/* SECONDARY NAVIGATION STRIP */}
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

      {/* FULL SIDEBAR DRAWER */}
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
            src="/images/aboutus-banner.jpeg" 
            alt="Luxury Stay Exterior" 
            className="w-full h-full object-cover object-center filter brightness-[0.65]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181614] via-black/35 to-black/20"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <span className="text-amber-400 text-xs font-extrabold uppercase tracking-[0.3em] block">
            ABOUT LUXURYSTAY
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
            Our Journey & Commitment to Hospitality
          </h1>
          <p className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto pt-1 drop-shadow-sm">
            Combining authentic Pakistani warmth with world-class five-star luxury on Club Road, Karachi since 2001.
          </p>
        </div>
      </section>

      {/* DETAILED LEGACY STORY & DISTINCTIONS */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} /> Our Vision & Foundation
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
              Over Two Decades of Unrivaled Pakistani Hospitality
            </h2>
            
            <div className="space-y-4 text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
              <p>
                Established in 2001, LuxuryStay Hotel & Resort was founded with a single driving vision: to redefine Pakistani luxury travel by seamlessly fusing traditional Eastern warmth with contemporary 5-star hospitality standards.
              </p>
              <p>
                Situated in the prestigious heart of Karachi on Club Road, our flagship resort has stood as an iconic landmark for over twenty-five years. We have had the privilege of hosting international diplomats, corporate visionaries, cultural icons, and families seeking an extraordinary sanctuary away from home.
              </p>
              <p>
                From our opulent presidential suites and temperature-controlled swimming pools to our legendary culinary collection—including Sakura, Chandni, and Bakers Boutique—every touchpoint is meticulously engineered to deliver peace of mind, privacy, and aesthetic perfection.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-200/80 flex items-center gap-8 text-stone-800">
              <div>
                <span className="font-serif font-extrabold text-2xl text-amber-700 block">25+</span>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Years of Distinction</span>
              </div>
              <div className="w-[1px] h-10 bg-stone-200"></div>
              <div>
                <span className="font-serif font-extrabold text-2xl text-amber-700 block">100k+</span>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Satisfied Guests</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-7 shadow-sm space-y-6 lg:sticky lg:top-24">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-3">
              Distinctions at a Glance
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200/60 flex-shrink-0">
                  <Crown size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">5-Star Excellence</h4>
                  <p className="text-stone-500 text-xs mt-0.5">Consistently awarded Karachi's leading luxury resort experience.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200/60 flex-shrink-0">
                  <Utensils size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Award-Winning Dining</h4>
                  <p className="text-stone-500 text-xs mt-0.5">4 Signature specialty restaurants including Sakura & Chandni BBQ.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200/60 flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Diplomat-Grade Safety</h4>
                  <p className="text-stone-500 text-xs mt-0.5">24/7 Monitored gated premises & high-security private valet.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PROFESSIONAL LINEAR TIMELINE */}
      <section className="py-20 bg-[#F4F1EA] border-y border-stone-300/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">MILESTONES</span>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">Our Evolutionary Journey</h2>
          </div>

          <div className="relative border-t-2 border-amber-600/30 pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
            
            <div className="relative space-y-2">
              <div className="absolute -top-[49px] left-0 w-4 h-4 bg-amber-600 rounded-full ring-4 ring-[#F4F1EA]"></div>
              <span className="text-amber-700 font-serif font-extrabold text-xl block">2001</span>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Grand Inception</h4>
              <p className="text-stone-600 text-xs leading-relaxed font-light">Opened flagship doors on Club Road with 50 executive suites and personalized butler concierge service.</p>
            </div>

            <div className="relative space-y-2">
              <div className="absolute -top-[49px] left-0 w-4 h-4 bg-amber-600 rounded-full ring-4 ring-[#F4F1EA]"></div>
              <span className="text-amber-700 font-serif font-extrabold text-xl block">2012</span>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Culinary Expansion</h4>
              <p className="text-stone-600 text-xs leading-relaxed font-light">Unveiled Sakura Japanese and Chandni Rooftop BBQ to national critical acclaim.</p>
            </div>

            <div className="relative space-y-2">
              <div className="absolute -top-[49px] left-0 w-4 h-4 bg-amber-600 rounded-full ring-4 ring-[#F4F1EA]"></div>
              <span className="text-amber-700 font-serif font-extrabold text-xl block">2020</span>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">5-Star Renovation</h4>
              <p className="text-stone-600 text-xs leading-relaxed font-light">Complete architectural upgrade introducing luxury spa wing and automated room controls.</p>
            </div>

            <div className="relative space-y-2">
              <div className="absolute -top-[49px] left-0 w-4 h-4 bg-amber-600 rounded-full ring-4 ring-[#F4F1EA]"></div>
              <span className="text-amber-700 font-serif font-extrabold text-xl block">2026</span>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Smart HMS Integration</h4>
              <p className="text-stone-600 text-xs leading-relaxed font-light">Launched direct instant online reservations and 24/7 AI Luxury Concierge assistant.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <span className="text-amber-700 text-xs font-bold uppercase tracking-widest block mb-1">OUR ETHOS</span>
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-12">Driven by Core Values</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200/60">
              <HeartHandshake size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900 mb-2">Unmatched Hospitality</h3>
            <p className="text-stone-500 text-xs leading-relaxed">Every guest is treated like family with personalized attention and warmth.</p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200/60">
              <Award size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900 mb-2">Uncompromising Quality</h3>
            <p className="text-stone-500 text-xs leading-relaxed">From 5G Wi-Fi to high-end dining, we maintain peak 5-star standards.</p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200/60">
              <Building2 size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900 mb-2">Cultural Pride</h3>
            <p className="text-stone-500 text-xs leading-relaxed">Celebrating Pakistani heritage through local architecture, food, and music.</p>
          </div>
        </div>
      </section>

      {/* EXACT HOME PAGE FOOTER */}
      <footer className="bg-[#1A1816] text-stone-300 relative border-t border-amber-500/20 pt-16 pb-12 overflow-hidden">
        
        {/* History Banner */}
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

        {/* Links & Newsletter Columns */}
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

        {/* Bottom Rights */}
        <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-500">
          <p>© 2026 LUXURYSTAY HOTELS & RESORTS PAKISTAN. ALL RIGHTS RESERVED.</p>
          <p className="mt-2 sm:mt-0 text-amber-500/80 font-medium">Designed for Luxury HMS Project</p>
        </div>

        {/* FLOATING CROWN BUTTON */}
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

      {/* CHATBOT DRAWER WITH PREVIOUS / NEXT ARROWS FOR QUICK QUESTIONS */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
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

          {/* Quick Option Chips Slider */}
          <div className="bg-stone-50 p-2 border-b border-stone-200/80 flex items-center gap-1 relative">
            <button 
              onClick={() => scrollChips('left')}
              className="p-1 text-stone-500 hover:text-amber-700 bg-white border border-stone-200 rounded-full shadow-sm z-10 flex-shrink-0"
              title="Previous Questions"
            >
              <ChevronLeft size={14} />
            </button>

            <div ref={chipsScrollRef} className="flex gap-1.5 overflow-x-auto text-[10px] scrollbar-none scroll-smooth flex-1 py-1 px-0.5">
              <button onClick={() => handleSendChatMessage("Check-in Time?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition shadow-2xs">
                🕒 Check-in Time
              </button>
              <button onClick={() => handleSendChatMessage("Room Rates?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition shadow-2xs">
                🏨 Suite Rates
              </button>
              <button onClick={() => handleSendChatMessage("Airport Pickup?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition shadow-2xs">
                ✈️ Airport Pickup
              </button>
              <button onClick={() => handleSendChatMessage("Breakfast & Dining?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition shadow-2xs">
                🍳 Dining & Buffet
              </button>
              <button onClick={() => handleSendChatMessage("Swimming Pool & Gym?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition shadow-2xs">
                🏊 Pool & Gym
              </button>
              <button onClick={() => handleSendChatMessage("Cancellation Policy?")} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap transition shadow-2xs">
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

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBF9F5]/50">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#181614] text-amber-300 rounded-br-none' 
                    : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Field */}
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

    </div>
  );
}