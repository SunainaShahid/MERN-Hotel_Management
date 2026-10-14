import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Crown, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { 
          email: formData.email, 
          password: formData.password 
        });

        // Safe extraction for token and user
        const token = res.data?.token || res.data?.accessToken;
        const user = res.data?.user || res.data?.data || res.data;

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/');
        } else {
          setError('Login succeeded but token was missing from server response.');
        }
      } else {
        await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        setIsLogin(true);
        setError('Registration successful! Please sign in with your credentials.');
      }
    } catch (err) {
      console.error('Auth Error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-stone-900 font-sans">
      
      {/* LOCAL BACKGROUND IMAGE WITH FALLBACK */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/auth-bg.jpg" 
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"; }}
          alt="Luxury Resort Background" 
          className="w-full h-full object-cover filter brightness-50 scale-105"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
      </div>

      {/* BACK TO HOME BUTTON */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/90 hover:text-amber-400 bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full text-xs font-bold transition border border-white/10 backdrop-blur-md"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      {/* FORM CARD CONTAINER */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* LOGO AND BRANDING */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#181614] text-amber-400 rounded-full shadow-md mb-3 ring-1 ring-amber-500/30">
            <Crown size={24} strokeWidth={2} />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-[#181614] tracking-[0.2em] leading-tight">
            LUXURY<span className="text-amber-700 font-normal">STAY</span>
          </h1>
          <p className="text-[9px] text-amber-800 font-black uppercase tracking-[0.3em] mt-1">
            HOTELS & RESORTS
          </p>
          <p className="text-xs text-stone-500 mt-2 font-medium">
            {isLogin ? 'Sign in to manage your resort bookings' : 'Create an account to unlock exclusive perks'}
          </p>
        </div>

        {/* ERROR / SUCCESS MESSAGE */}
        {error && (
          <div className="mb-5 p-3 rounded-xl text-xs font-bold text-center bg-amber-50 text-amber-900 border border-amber-200">
            {error}
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3 text-stone-400" />
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Your Name" 
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-amber-600 focus:bg-white transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3 text-stone-400" />
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="email@gmail.com" 
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-amber-600 focus:bg-white transition"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Phone Number</label>
              <div className="relative flex items-center">
                <Phone size={16} className="absolute left-3 text-stone-400" />
                <input 
                  type="text" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="0300 1234567" 
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-amber-600 focus:bg-white transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3 text-stone-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                required 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-amber-600 focus:bg-white transition"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 text-stone-400 hover:text-stone-700 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full mt-2 bg-[#181614] hover:bg-amber-600 text-amber-300 hover:text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-widest transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Account')}
          </button>
        </form>

        {/* FORM SWITCH FOOTER */}
        <div className="mt-6 text-center pt-4 border-t border-stone-100">
          <p className="text-xs text-stone-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="font-bold text-amber-700 hover:underline cursor-pointer"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}