import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 25;

      cardRef.current.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    const handleMouseLeave = () => {
      if (!cardRef.current) return;
      cardRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
      cardRef.current.style.transition = 'all 0.5s ease';
    };

    const handleMouseEnter = () => {
      if (!cardRef.current) return;
      cardRef.current.style.transition = 'none';
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('mouseenter', handleMouseEnter);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(identifier, password);
      toast.success(`Selamat datang, ${identifier || 'User'}!`);

      if (response.must_change_password) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Email/NIP/NIS atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-full flex items-center justify-center overflow-hidden relative font-outfit"
      style={{
        backgroundColor: '#115e59',
        perspective: '1000px'
      }}
    >
      {/* Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full -z-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #0d9488 0%, #115e59 60%, #0f766e 100%)'
        }}
      />

      {/* Blobs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute bg-emerald-400 w-96 h-96 rounded-full top-0 left-0 mix-blend-overlay opacity-60 animate-blob" />
        <div className="absolute bg-yellow-300 w-96 h-96 rounded-full bottom-0 right-0 mix-blend-overlay opacity-50 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bg-cyan-400 w-80 h-80 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mix-blend-overlay opacity-50 animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* 3D Card Container */}
      <div
        ref={cardRef}
        className="w-full max-w-[400px] p-8 rounded-3xl relative mx-4 glass-card"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Decorative Glow inside Card */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-mi-gold opacity-20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-10 transform translate-z-10 relative z-10">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-white/30 to-white/5 rounded-2xl border border-white/50 flex items-center justify-center mb-5 shadow-xl backdrop-blur-md group hover:rotate-12 transition-transform duration-500">
            <img
              src="/images/logo.webp"
              alt="Logo MI Al-Ghazali"
              className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-wider drop-shadow-md font-sans">MI AL-GHAZALI</h1>
          <p className="text-emerald-50 text-xs font-semibold tracking-[0.2em] uppercase opacity-90">Sistem Akademik Terpadu</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

          {/* Username */}
          <div className="relative group">
            <input
              type="text"
              id="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="peer bg-white/10 border border-white/40 text-white p-4 pl-12 w-full rounded-xl outline-none transition-all duration-300 focus:bg-white/20 focus:border-mi-gold focus:shadow-[0_0_20px_rgba(252,211,77,0.25)] placeholder-shown:border-white/40 placeholder-transparent font-medium"
              placeholder="Username"
              required
              autoComplete="off"
            />
            <i className="fas fa-user absolute left-4 top-4.5 text-white/80 transition-colors duration-300 peer-focus:text-mi-gold" />
            <label
              htmlFor="username"
              className="absolute left-12 top-4 pointer-events-none text-white/90 transition-all duration-300 
              peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-mi-dark peer-focus:bg-mi-gold peer-focus:px-2.5 peer-focus:rounded-full peer-focus:font-bold peer-focus:shadow-sm
              peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-mi-dark peer-not-placeholder-shown:bg-mi-gold peer-not-placeholder-shown:px-2.5 peer-not-placeholder-shown:rounded-full peer-not-placeholder-shown:font-bold peer-not-placeholder-shown:shadow-sm"
            >
              Username
            </label>
          </div>

          {/* Password */}
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer bg-white/10 border border-white/40 text-white p-4 pl-12 pr-12 w-full rounded-xl outline-none transition-all duration-300 focus:bg-white/20 focus:border-mi-gold focus:shadow-[0_0_20px_rgba(252,211,77,0.25)] placeholder-shown:border-white/40 placeholder-transparent font-medium"
              placeholder="Kata Sandi"
              required
            />
            <i className="fas fa-lock absolute left-4 top-4.5 text-white/80 transition-colors duration-300 peer-focus:text-mi-gold" />
            <label
              htmlFor="password"
              className="absolute left-12 top-4 pointer-events-none text-white/90 transition-all duration-300 
              peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-mi-dark peer-focus:bg-mi-gold peer-focus:px-2.5 peer-focus:rounded-full peer-focus:font-bold peer-focus:shadow-sm
              peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-mi-dark peer-not-placeholder-shown:bg-mi-gold peer-not-placeholder-shown:px-2.5 peer-not-placeholder-shown:rounded-full peer-not-placeholder-shown:font-bold peer-not-placeholder-shown:shadow-sm"
            >
              Kata Sandi
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-4 top-4 text-white/70 hover:text-yellow-300 transition-colors z-10 ${showPassword ? 'text-mi-gold' : ''}`}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>

          {/* Options */}
          <div className="flex justify-between items-center text-xs text-white/90 mt-2 font-medium">
            <label className="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors">
              <input type="checkbox" className="accent-yellow-400 w-3.5 h-3.5 bg-white/20 border-white/50 rounded cursor-pointer" />
              Ingat Saya
            </label>
            <a href="#" className="hover:text-yellow-300 transition-colors decoration-yellow-300 hover:underline hover:underline-offset-4">Lupa Password?</a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl text-white font-extrabold text-sm uppercase tracking-widest shadow-xl mt-6 flex items-center justify-center gap-2 group border border-white/20 transition-all duration-300 relative overflow-hidden
            ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:scale-102 hover:shadow-[0_0_25px_rgba(251,191,36,0.6)]'}`}
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
            }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />

            <span className="relative z-10 drop-shadow-md">{isLoading ? 'Authenticating...' : 'Masuk Sekarang'}</span>
            {!isLoading && <i className="fas fa-arrow-right relative z-10 group-hover:translate-x-1 transition-transform duration-300 drop-shadow-md" />}
            {isLoading && <span className="relative z-10 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/20 text-center relative z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/40 backdrop-blur-md shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              <span className="text-[10px] text-white font-mono tracking-wide font-semibold">v1.0.0 (Rilis Perdana)</span>
            </div>

            {/* Developer Credit */}
            <a href="https://alfian.dev" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/60 hover:text-yellow-300 transition-colors duration-300 font-medium tracking-widest uppercase decoration-transparent group">
              Developed by <span className="font-bold text-white/80 group-hover:text-yellow-300">alfian.dev</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
