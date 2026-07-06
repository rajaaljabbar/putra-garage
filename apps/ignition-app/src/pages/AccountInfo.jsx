import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authClient } from '../lib/authClient';
import { fetchApi } from '../lib/api';
import PhotoCrop from '../components/PhotoCrop';

export default function AccountInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchApi('/users/me');
        if (response.success) {
          setUserProfile(response.data);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    loadProfile();
  }, []);

  const displayUser = userProfile || user;

  const handlePhotoCrop = async (base64) => {
    try {
      const uploadRes = await fetchApi('/upload', { method: 'POST', body: JSON.stringify({ file: base64 }) });
      const imageUrl = uploadRes.data?.url;
      if (imageUrl) {
        await fetchApi('/users/me', { method: 'PUT', body: JSON.stringify({ image: imageUrl }) });
        setUserProfile((prev) => ({ ...prev, image: imageUrl }));
      }
    } catch (err) {
      console.error('Upload foto profil gagal', err);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      clearTimeout(timeout);
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus akun');
      
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      if (err.name === 'AbortError') {
        setDeleteError('Penghapusan terlalu lama. Coba lagi nanti.');
      } else {
        setDeleteError('Gagal: ' + err.message);
      }
      setIsDeleting(false);
      setShowDeletePopup(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body-lg bg-[#0A0A0B] text-[#e5e2e3] antialiased">
      {/* Background Atmospheric Effect */}
      <div className="fixed inset-0 pointer-events-none z-0"></div>

      {/* TopAppBar */}
      <header className="flex justify-between items-center px-container-padding-mobile py-base w-full sticky top-0 z-50 bg-surface-container/50 backdrop-blur-[20px] border-b border-white/12 shadow-[0_0_15px_rgba(255,107,0,0.05)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="active:scale-95 transition-transform text-primary">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary tracking-tighter italic">IGNITION</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30">
          <img alt="User Profile" className="w-full h-full object-cover" src={displayUser?.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayUser?.name || 'User') + '&background=FF6B00&color=fff&size=200'} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 px-container-padding-mobile pt-stack-lg pb-32 max-w-2xl mx-auto w-full">
        {/* Profile Photo Section */}
        <section className="flex flex-col items-center mb-stack-lg">
          <PhotoCrop onCropDone={handlePhotoCrop} aspect={1} circular>
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                <img
                  alt="Profile"
                  className="w-full h-full object-cover"
                  src={displayUser?.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayUser?.name || 'User') + '&background=FF6B00&color=fff&size=200'}
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-primary-container text-on-primary-container p-2 rounded-full shadow-lg active:scale-90 transition-transform flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="text-white font-label-caps text-label-caps">UBAH FOTO</span>
              </div>
            </div>
          </PhotoCrop>
          <div className="mt-stack-md text-center">
            <h2 className="font-title-md text-title-md text-on-surface">{displayUser?.name || 'User'}</h2>
            <p className="text-primary font-label-caps text-label-caps tracking-widest mt-1">{displayUser?.memberType || 'REGULAR'}</p>
          </div>
        </section>

        {/* Personal Information Card */}
        <section className="glass-card rounded-xl p-6 mb-stack-lg">
          <div className="flex items-center gap-2 mb-stack-lg">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            <h3 className="font-title-md text-title-md text-on-surface">Informasi Pribadi</h3>
          </div>
          <form className="space-y-gutter">
            {/* Full Name */}
            <div className="space-y-base">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">NAMA LENGKAP</label>
              <div className="relative flex items-center input-focus-glow rounded-lg border border-white/12 bg-surface-container-lowest/50 transition-all">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/50">person</span>
                <input readOnly className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 text-on-surface font-body-lg focus:ring-0" value={displayUser?.name || ''} />
              </div>
            </div>
            {/* Email Address */}
            <div className="space-y-base">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">ALAMAT EMAIL</label>
              <div className="relative flex items-center input-focus-glow rounded-lg border border-white/12 bg-surface-container-lowest/50 transition-all">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/50">mail</span>
                <input readOnly className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 text-on-surface font-body-lg focus:ring-0" value={displayUser?.email || ''} />
              </div>
            </div>
            {/* Phone Number */}
            <div className="space-y-base">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">NO. HANDPHONE</label>
              <div className="relative flex items-center input-focus-glow rounded-lg border border-white/12 bg-surface-container-lowest/50 transition-all">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/50">phone_iphone</span>
                <input readOnly className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 text-on-surface font-body-lg focus:ring-0" value={displayUser?.phoneNumber || '-'} />
              </div>
            </div>
          </form>
        </section>

        {/* Security / Account Management Links */}
        <section className="glass-card rounded-xl p-4 space-y-2">
          <button 
            onClick={() => navigate('/change-account-info')}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">lock</span>
              <span className="font-body-lg text-on-surface">Ubah Informasi Pribadi</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
          <button 
            onClick={() => navigate('/change-password')}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">key</span>
              <span className="font-body-lg text-on-surface">Ubah Kata Sandi</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
        </section>
        
        {/* Logout Section */}
        <section className="mt-8">
          <button 
            onClick={async () => {
              await authClient.signOut();
              window.location.href = '/';
            }}
            className="w-full flex items-center justify-center p-4 rounded-xl border border-error/30 text-error hover:bg-error/10 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined mr-2">logout</span>
            Logout
          </button>
        </section>

        {/* Delete Account Section */}
        <section className="mt-4 mb-8">
          <button 
            onClick={() => setShowDeletePopup(true)}
            className="w-full flex items-center justify-center p-4 rounded-xl border border-red-700/40 text-red-400 hover:bg-red-950/30 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined mr-2">delete_forever</span>
            Hapus Akun
          </button>
          <p className="text-on-surface-variant/40 text-xs text-center mt-2">Semua data kendaraan & riwayat service akan dihapus permanen</p>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-6 bg-surface-container/50 backdrop-blur-[20px] border-t border-white/12 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => navigate('/garage')}
          className="flex flex-col items-center justify-center text-on-surface-variant/70 active:scale-90 transition-all duration-200 hover:text-primary/80"
        >
          <span className="material-symbols-outlined">garage</span>
          <span className="font-label-caps text-label-caps">Garage</span>
        </button>
        
        <button 
          className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-4 py-1 shadow-[0_0_10px_rgba(255,107,0,0.2)] active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-caps text-label-caps">Profil</span>
        </button>
      </nav>

      {/* Delete Account Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            {deleteError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{deleteError}</div>}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-red-400 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface mb-2">Hapus Akun?</h3>
              <p className="font-body-sm text-on-surface-variant">
                Semua data Anda — kendaraan, riwayat service, dan akun — akan dihapus <span className="text-red-400 font-semibold">secara permanen</span> dan tidak dapat dikembalikan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeletePopup(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl border border-white/10 text-on-surface-variant font-body-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-body-lg hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>Menghapus...</>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">delete_forever</span>
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
