import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col font-body-lg text-body-lg bg-[#0A0A0B] text-[#e5e2e3] antialiased">
      {/* TopAppBar */}
      <header className="bg-surface-container/50 backdrop-blur-[20px] text-primary border-b border-white/12 shadow-[0_0_15px_rgba(255,107,0,0.05)] flex justify-between items-center px-container-padding-mobile py-base w-full sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} aria-label="Kembali" className="hover:opacity-80 transition-opacity active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary tracking-tighter italic">Ubah Kata Sandi</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/12">
          <img alt="User profile avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPpqpVAdyZDX-5IQd7AXphq9J0fN3GooOHhtSv-Firb3LJ7wM2pHJdZyhTLwDI1zMF7my9jNXEml7C7h1ggiWdQjO4ytluP_r1porY7Db9nWo2Ix3RA1GzUyq4ctEB092cRYutyKhg_zAVsWGjbcbACd6by5Erdu8ojXy6WVFQkeUpJkhpUKjAzggXM7if0XO-tDKj6NClM1kYfkCnZn2yNXTLJ9aF3FXwhLe198bv6LPz1b-h_6c_sTdX1C_J6u6f4Hb8yLQT3Xg" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-container-padding-mobile py-stack-lg flex flex-col pb-32">
        {/* Instruction Section */}
        <div className="mb-stack-lg">
          <p className="text-on-surface-variant font-body-lg text-body-lg">
            Masukkan kata sandi baru Anda untuk mengamankan akun.
          </p>
        </div>

        {/* Form Section */}
        <div className="space-y-6 flex-1">
          {/* Kata Sandi Saat Ini */}
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant/70 block px-1">KATA SANDI SAAT INI</label>
            <div className="relative group input-glow transition-all duration-300 focus-within:scale-[1.01] focus-within:shadow-[0_0_15px_rgba(255,182,147,0.15)] rounded-xl border-transparent focus-within:border-[#ffb693]">
              <input 
                className="w-full bg-surface-container-lowest border border-white/12 rounded-xl px-4 py-4 focus:outline-none focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 font-body-lg focus:border-transparent" 
                placeholder="••••••••" 
                type={showCurrent ? "text" : "password"} 
              />
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors" 
                onClick={() => setShowCurrent(!showCurrent)} 
                type="button"
              >
                <span className="material-symbols-outlined">{showCurrent ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {/* Kata Sandi Baru */}
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant/70 block px-1">KATA SANDI BARU</label>
            <div className="relative group input-glow transition-all duration-300 focus-within:scale-[1.01] focus-within:shadow-[0_0_15px_rgba(255,182,147,0.15)] rounded-xl border-transparent focus-within:border-[#ffb693]">
              <input 
                className="w-full bg-surface-container-lowest border border-white/12 rounded-xl px-4 py-4 focus:outline-none focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 font-body-lg focus:border-transparent" 
                placeholder="••••••••" 
                type={showNew ? "text" : "password"} 
              />
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors" 
                onClick={() => setShowNew(!showNew)} 
                type="button"
              >
                <span className="material-symbols-outlined">{showNew ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant/50 px-1">Minimal 8 karakter dengan kombinasi angka dan huruf.</p>
          </div>

          {/* Konfirmasi Kata Sandi Baru */}
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant/70 block px-1">KONFIRMASI KATA SANDI BARU</label>
            <div className="relative group input-glow transition-all duration-300 focus-within:scale-[1.01] focus-within:shadow-[0_0_15px_rgba(255,182,147,0.15)] rounded-xl border-transparent focus-within:border-[#ffb693]">
              <input 
                className="w-full bg-surface-container-lowest border border-white/12 rounded-xl px-4 py-4 focus:outline-none focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 font-body-lg focus:border-transparent" 
                placeholder="••••••••" 
                type={showConfirm ? "text" : "password"} 
              />
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors" 
                onClick={() => setShowConfirm(!showConfirm)} 
                type="button"
              >
                <span className="material-symbols-outlined">{showConfirm ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {/* Decorative Visual Element */}
          <div className="glass-card rounded-2xl p-6 flex items-center gap-4 mt-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-primary">Keamanan Akun</h3>
              <p className="text-body-sm text-on-surface-variant text-sm">Pastikan kata sandi Anda unik untuk melindungi data performa kendaraan Anda.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button Area */}
      <div className="fixed bottom-0 left-0 w-full px-container-padding-mobile pb-base pt-6 z-40 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent">
        <button 
          onClick={handleSave}
          disabled={isProcessing}
          className="w-full py-4 bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded-xl primary-glow active:scale-[0.98] transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-80"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined animate-spin text-base">sync</span>
              MENYIMPAN...
            </>
          ) : (
            <>
              SIMPAN PERUBAHAN
              <span className="material-symbols-outlined text-base">save</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
      </div>
    </div>
  );
}
