import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/authClient';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      });
      
      if (error) {
        setErrorMsg(error.message || 'Pendaftaran gagal');
      } else {
        window.location.href = '/garage';
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan yang tidak terduga');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/garage`,
      });
    } catch (err) {
      setErrorMsg('Pendaftaran dengan Google gagal');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Hero Background Animation Decor */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none"></div>

      {/* Main Content Container */}
      <main className="relative z-10 flex flex-col w-full max-w-md mx-auto px-container-padding-mobile pt-12 pb-8 flex-grow">
        {/* Header Section */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-container/10 border border-primary-container/20 mb-6">
            <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2 tracking-tight">Daftar Akun Baru</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant/80">Bergabunglah dengan ekosistem performa Ignition.</p>
        </header>

        {/* Glassmorphic Registration Form */}
        <section className="glass-card rounded-xl p-6 mb-8">
          {errorMsg && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm text-center">
              {errorMsg}
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="full_name">Nama Lengkap</label>
              <div className="relative flex items-center glass-card border-white/10 rounded-lg overflow-hidden input-glow focus-within:bg-white/10 transition-all">
                <div className="pl-4 text-primary-container/60">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none py-3.5 px-3 text-on-surface focus:ring-0 placeholder:text-on-surface-variant/30 font-body-lg text-body-lg" 
                  id="full_name" 
                  placeholder="John Doe" 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="email">Email</label>
              <div className="relative flex items-center glass-card border-white/10 rounded-lg overflow-hidden input-glow focus-within:bg-white/10 transition-all">
                <div className="pl-4 text-primary-container/60">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none py-3.5 px-3 text-on-surface focus:ring-0 placeholder:text-on-surface-variant/30 font-body-lg text-body-lg" 
                  id="email" 
                  placeholder="email@contoh.com" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="password">Kata Sandi</label>
              <div className="relative flex items-center glass-card border-white/10 rounded-lg overflow-hidden input-glow focus-within:bg-white/10 transition-all">
                <div className="pl-4 text-primary-container/60">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none py-3.5 px-3 text-on-surface focus:ring-0 placeholder:text-on-surface-variant/30 font-body-lg text-body-lg" 
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="pr-4 text-on-surface-variant/40 hover:text-primary-container transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-3 pt-2">
              <div className="relative flex items-center h-5">
                <input 
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-container focus:ring-primary-container/50 focus:ring-offset-0 transition-colors" 
                  id="terms" 
                  type="checkbox" 
                  required
                />
              </div>
              <label className="font-body-sm text-body-sm text-on-surface-variant leading-tight" htmlFor="terms">
                Setuju dengan <a className="text-primary-container hover:underline" href="#">Syarat &amp; Ketentuan</a> serta Kebijakan Privasi kami.
              </label>
            </div>

            {/* Register Button */}
            <div className="pt-4">
              <button 
                className="w-full bg-primary-container text-on-primary-fixed py-4 rounded-lg font-label-caps text-label-caps glow-button tracking-widest flex items-center justify-center space-x-2 disabled:opacity-50" 
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? 'MEMPROSES...' : 'DAFTAR'}</span>
                {!isLoading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
              </button>
            </div>
          </form>
        </section>

        {/* Social Register Divider */}
        <div className="flex items-center mb-8 px-4">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="px-4 font-label-caps text-[10px] text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">Atau Daftar Dengan</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <button 
            type="button" 
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="flex items-center justify-center py-3 glass-card rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <div className="w-5 h-5 mr-2 flex items-center justify-center">
              <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
              </svg>
            </div>
            <span className="font-body-sm text-body-sm">Google</span>
          </button>
          <button 
            type="button"
            onClick={() => alert('Login dengan Apple saat ini belum tersedia.')}
            className="flex items-center justify-center py-3 glass-card rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>apps</span>
            <span className="font-body-sm text-body-sm">Apple</span>
          </button>
        </div>

        {/* Footer Link */}
        <footer className="mt-auto text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Sudah punya akun? 
            <Link className="text-primary-container font-semibold ml-1 hover:underline" to="/">Masuk</Link>
          </p>
        </footer>
      </main>

      {/* Visual Atmosphere: Image Accent at Bottom */}
      <div className="fixed bottom-0 left-0 w-full h-1/4 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-t from-primary-container/30 to-transparent absolute z-10"></div>
        <img 
          className="absolute bottom-0 w-full h-full object-cover" 
          alt="A low-angle high-speed motion blur shot of a luxury performance sports car's glowing taillights at night." 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnynKnnrPrczpyyk5VYTO6lGhBQkQo1StsbynF_7bybnDE8-0KvnKmZjxhb1mTP1GT6Hm2xDKeNgnlkottwL26QrSYpUzUhnaWG4r484BPGwiHON7VeYJRY9p8zplu-mW8-6Swke1E-UxNJwx8JlPx3h67UB14Jl9sWFPWOq8Qal429HkJLWOGT_iXaV57qkZl598YURLH3gQgnhtgqJmXiP4Oxx1yHKtFzSGodnSHb0zhJ-UO4OncDc3IHhaf4uZy9YQQNzfYJgc"
        />
      </div>
    </div>
  );
}
