import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';

export default function ChangeAccountInfo() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchApi('/users/me');
        if (response.success && response.data) {
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            phoneNumber: response.data.phoneNumber || ''
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const response = await fetchApi('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber
        })
      });
      if (response.success) {
        navigate(-1);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      alert('Gagal menyimpan profil');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="font-body-lg text-body-lg bg-[#131314] text-[#e5e2e3] min-h-screen">
      {/* Top AppBar */}
      <header className="bg-surface-container/50 backdrop-blur-[20px] text-primary border-b border-white/12 shadow-[0_0_15px_rgba(255,107,0,0.05)] sticky top-0 z-50 flex justify-between items-center px-container-padding-mobile py-base w-full">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} aria-label="Kembali" className="active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">Ubah Informasi Pribadi</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border border-white/12">
          <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3gwQpuvZ6zzPQKPxWghNnsP_zSZXuz9-dhCA_0jYIgQbQiUks1M0IlUUxBwdfiWiAdZijelkNa7gRvFChLUJhUKM4ZwvvwcrS2ViSClLVZNqOysUsJmjRyjDEkZzavckIjbJCu-5hzb17883Wkue8pqGW4XxvY8OUIykIRvZjOkq0AiY2aLrsVc-Ud56O0LUoo3S6tOLLxV2qrGlE_VooYy3Jp6AyQGQO-wPR0mcgjHECczpi19RPvUf2zr8RjxKHpsxAzk_5C9Y" />
        </div>
      </header>

      <main className="min-h-screen px-container-padding-mobile py-stack-lg pb-32">
        {/* Profile Picture Update Section */}
        <section className="flex flex-col items-center mb-stack-lg">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-2 border-primary/30 p-1">
              <div className="w-full h-full rounded-full overflow-hidden glass-card">
                <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdHWxjQ8IC1gGN_lOyx33yra30pRFZIoTmuvtbcyohKu3-N9Siiy3eIfuWyQGBpoEF7N5srpEX9Ach69kBJ7vgChzvuFC_EX8g8xlEotOMzjuRjeb-zVFRBNXcxEn7y8DHRveWt2VDqnzblu7RfDxqPbCWOcp-ldFffIkA0pKhcZ-SbrQ7Mo0i4VACFZgYbjO2CFXRts_6XLnYRi7ky6PrCT-cFM4b3acdu7cBNaz3vRxKkN8kWVDcvhd1e5F7QEWYdrMehK0JsaU" />
              </div>
            </div>
            <button className="absolute bottom-1 right-1 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container shadow-lg active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </button>
          </div>
          <p className="mt-stack-md font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest">Ubah Foto Profil</p>
        </section>

        {/* Input Fields */}
        <div className="flex flex-col gap-gutter">
          {/* Nama Lengkap */}
          <div className="glass-card rounded-xl p-base px-stack-md flex flex-col gap-1 focus-within:border-primary/40 focus-within:bg-white/10 transition-colors">
            <label className="font-label-caps text-label-caps text-primary/70 ml-1">Nama Lengkap</label>
            <div className="flex items-center gap-stack-md">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
              <input 
                className="bg-transparent border-none w-full text-on-surface font-title-md text-title-md p-0 focus:ring-0 focus:outline-none" 
                placeholder="Masukkan nama lengkap" 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
          </div>
          
          {/* Alamat Email */}
          <div className="glass-card rounded-xl p-base px-stack-md flex flex-col gap-1 focus-within:border-primary/40 focus-within:bg-white/10 transition-colors">
            <label className="font-label-caps text-label-caps text-primary/70 ml-1">Alamat Email</label>
            <div className="flex items-center gap-stack-md">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">mail</span>
              <input 
                className="bg-transparent border-none w-full text-on-surface font-title-md text-title-md p-0 focus:ring-0 focus:outline-none opacity-60" 
                placeholder="nama@email.com" 
                type="email" 
                value={formData.email} 
                readOnly
              />
            </div>
          </div>
          
          {/* No. Handphone */}
          <div className="glass-card rounded-xl p-base px-stack-md flex flex-col gap-1 focus-within:border-primary/40 focus-within:bg-white/10 transition-colors">
            <label className="font-label-caps text-label-caps text-primary/70 ml-1">No. Handphone</label>
            <div className="flex items-center gap-stack-md">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">call</span>
              <input 
                className="bg-transparent border-none w-full text-on-surface font-title-md text-title-md p-0 focus:ring-0 focus:outline-none" 
                placeholder="+62" 
                type="tel" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-stack-lg p-stack-md rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex gap-stack-md">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                Pastikan informasi yang Anda masukkan sudah benar untuk kelancaran sinkronisasi data kendaraan dan layanan premium IGNITION.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Actions Container */}
      <div className="fixed left-0 w-full px-container-padding-mobile pb-base z-40 bottom-0 bg-gradient-to-t from-[#131314] via-[#131314]/90 to-transparent pt-6">
        <button 
          onClick={handleSave}
          disabled={isProcessing}
          className="w-full bg-primary-container text-on-primary-container font-label-caps text-label-caps py-4 rounded-xl orange-glow font-bold tracking-[0.2em] active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-80 disabled:bg-tertiary-container"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              MENYIMPAN...
            </>
          ) : (
            <>
              SIMPAN PERUBAHAN
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Background Atmosphere */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
    </div>
  );
}
