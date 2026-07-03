import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/authClient';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleMouseMove = (e) => {
      const glows = document.querySelectorAll('.atmospheric-glow');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      glows.forEach((glow, index) => {
        const speed = (index + 1) * 20;
        glow.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/garage",
      });
    } catch (err) {
      setErrorMsg('Login dengan Google gagal');
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });
      
      if (error) {
        setErrorMsg(error.message || 'Login failed');
      } else {
        // Refresh page or context to load user state
        window.location.href = '/garage';
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-container-padding-mobile">
      {/* Atmospheric Background Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] atmospheric-glow opacity-40 blur-3xl"></div>
        <div 
          className="absolute top-[40%] -right-[20%] w-[70%] h-[70%] atmospheric-glow opacity-30 blur-3xl" 
          style={{ background: 'radial-gradient(circle, rgba(0, 158, 255, 0.05) 0%, transparent 70%)' }}
        ></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] atmospheric-glow opacity-40 blur-3xl"></div>
      </div>

      {/* Mobile Device Frame Constraint */}
      <main className="relative w-full max-w-[400px] flex flex-col items-center justify-between min-h-[751px] z-10">
        
        {/* Brand Header Section */}
        <header className="w-full flex flex-col items-center mt-stack-lg mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tighter text-center">IGNITION</h1>
          <p className="font-body-sm text-on-surface-variant opacity-60 mt-1 uppercase tracking-[0.2em]">Automotive Performance</p>
        </header>

        {/* Glassmorphic Login Card */}
        <section className="w-full glass-card rounded-3xl p-8 mb-stack-lg transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
          <div className="mb-8">
            <h2 className="font-title-md text-title-md text-on-surface mb-2">Selamat Datang</h2>
            <p className="font-body-sm text-on-surface-variant">Silahkan masuk ke akun Anda</p>
          </div>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm text-center">
              {errorMsg}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant block ml-1">EMAIL</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant opacity-50">mail</span>
                <input 
                  className="w-full h-14 bg-surface-container-lowest border border-white/10 rounded-xl pl-12 pr-4 text-on-surface font-body-lg placeholder:text-on-surface-variant/30 transition-all" 
                  placeholder="nama@email.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant">KATA SANDI</label>
                <a className="font-label-caps text-[10px] text-primary-container hover:underline transition-all" href="#">Lupa Kata Sandi?</a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant opacity-50">lock</span>
                <input 
                  className="w-full h-14 bg-surface-container-lowest border border-white/10 rounded-xl pl-12 pr-4 text-on-surface font-body-lg placeholder:text-on-surface-variant/30 transition-all" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Login Button */}
            <button 
              className="w-full h-14 bg-primary-container text-on-primary-fixed font-title-md rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all orange-glow mt-8 group disabled:opacity-50" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'MEMPROSES...' : 'MASUK'}
              {!isLoading && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </form>
          
          {/* Social Login Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="font-label-caps text-[10px] text-on-surface-variant/40">ATAU</span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>
          
          {/* Google Sign-In Button */}
          <button 
            className="w-full h-12 border border-white/10 rounded-xl flex items-center justify-center gap-3 font-body-sm text-on-surface-variant hover:bg-white/5 transition-colors"
            onClick={handleGoogleLogin}
            type="button"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 4.16-4.53z" fill="#EA4335"/>
            </svg>
            {isLoading ? 'Memproses...' : 'Lanjutkan dengan Google'}
          </button>
        </section>

        {/* Footer Link */}
        <footer className="w-full text-center pb-8 mt-auto">
          <p className="font-body-sm text-on-surface-variant">
            Belum punya akun? 
            <Link className="text-primary-container font-semibold ml-1 hover:underline" to="/register">Daftar Sekarang</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
