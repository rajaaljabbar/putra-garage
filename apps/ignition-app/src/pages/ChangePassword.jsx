import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/authClient';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!newPassword || newPassword.length < 8) return setErrorMsg('Kata sandi baru minimal 8 karakter');
    if (newPassword !== confirmPassword) return setErrorMsg('Konfirmasi kata sandi tidak cocok');

    setIsProcessing(true);
    try {
      // Try changePassword first (works for email users)
      if (currentPassword) {
        const { error } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
        if (error) throw new Error(error.message || 'Gagal');
      } else {
        // No current password = Google user, send reset email
        const { data: session } = await authClient.getSession();
        const email = session?.user?.email;
        if (!email) throw new Error('Email tidak ditemukan');
        const { error } = await authClient.forgetPassword({ email, redirectTo: window.location.origin + '/garage' });
        if (error) throw new Error(error.message || 'Gagal mengirim email');
        setSuccessMsg('Email reset password dikirim! Cek inbox kamu untuk membuat kata sandi baru.');
        return;
      }
      setSuccessMsg('Kata sandi berhasil diubah!');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally { setIsProcessing(false); }
  };

  const showCurrentField = true; // Always show, Google users leave empty

  return (
    <div className="min-h-screen flex flex-col font-body-lg text-body-lg bg-[#0A0A0B] text-[#e5e2e3] antialiased">
      <header className="bg-surface-container/50 backdrop-blur-[20px] border-b border-white/12 flex justify-between items-center px-container-padding-mobile py-base w-full sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="font-headline-lg-mobile font-bold text-primary tracking-tighter">Ubah Kata Sandi</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-container-padding-mobile py-stack-lg flex flex-col pb-32">
        {successMsg ? (
          <div className="glass-card rounded-xl p-6 text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-green-400">check_circle</span>
            <p className="text-on-surface font-body-lg">{successMsg}</p>
            <button onClick={() => navigate(-1)} className="text-primary hover:underline">Kembali</button>
          </div>
        ) : (
          <>
            <p className="text-on-surface-variant mb-6">
              Isi kata sandi saat ini (jika ada) dan kata sandi baru. Login Google? Kosongkan "Kata Sandi Saat Ini" untuk kirim email reset.
            </p>

            {errorMsg && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{errorMsg}</div>}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant/70 block px-1">KATA SANDI SAAT INI</label>
                <div className="relative rounded-xl">
                  <input className="w-full bg-surface-container-lowest border border-white/12 rounded-xl px-4 py-4 focus:outline-none text-on-surface placeholder:text-on-surface-variant/30" placeholder="Kosongkan jika login Google" type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" onClick={() => setShowCurrent(!showCurrent)} type="button">
                    <span className="material-symbols-outlined">{showCurrent ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant/70 block px-1">KATA SANDI BARU</label>
                <div className="relative rounded-xl">
                  <input className="w-full bg-surface-container-lowest border border-white/12 rounded-xl px-4 py-4 focus:outline-none text-on-surface placeholder:text-on-surface-variant/30" placeholder="Minimal 8 karakter" type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" onClick={() => setShowNew(!showNew)} type="button">
                    <span className="material-symbols-outlined">{showNew ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant/70 block px-1">KONFIRMASI KATA SANDI BARU</label>
                <div className="relative rounded-xl">
                  <input className="w-full bg-surface-container-lowest border border-white/12 rounded-xl px-4 py-4 focus:outline-none text-on-surface placeholder:text-on-surface-variant/30" placeholder="Ulangi kata sandi baru" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" onClick={() => setShowConfirm(!showConfirm)} type="button">
                    <span className="material-symbols-outlined">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={isProcessing} className="mt-8 w-full bg-primary-container text-white py-4 rounded-xl font-title-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all">
              <span className="material-symbols-outlined">save</span>
              {isProcessing ? 'MEMPROSES...' : currentPassword ? 'SIMPAN' : 'KIRIM EMAIL RESET'}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
