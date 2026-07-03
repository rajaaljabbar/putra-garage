import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';

export default function AddVehicle() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    currentOdometer: '',
    tankCapacity: ''
  });

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.brand || !formData.currentOdometer) {
      alert("Mohon lengkapi data wajib (Nama, Merk, Odometer)");
      return;
    }
    
    setIsProcessing(true);
    try {
      let imageUrl = null;
      
      // Upload image to Cloudinary if selected
      if (selectedImage) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(selectedImage);
        });
        
        const uploadRes = await fetchApi('/upload', {
          method: 'POST',
          body: JSON.stringify({ file: base64 }),
        });
        imageUrl = uploadRes.data?.url;
      }

      const response = await fetchApi('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          currentOdometer: parseInt(formData.currentOdometer),
          tankCapacity: formData.tankCapacity ? parseFloat(formData.tankCapacity) : 0,
          imageUrl,
        })
      });
      
      if (response.success) {
        navigate('/garage');
      }
    } catch (err) {
      console.error("Gagal menambah kendaraan", err);
      alert("Gagal menambah kendaraan");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background Atmospheric Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-tertiary-container/5 rounded-full blur-[120px]"></div>
      </div>

      {/* TopAppBar Component */}
      <header className="fixed top-0 w-full backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-[0_0_15px_rgba(255,107,0,0.05)] flex justify-between items-center px-container-padding-mobile h-16 z-50">
        <button 
          className="flex items-center gap-1 active:scale-95 transition-transform hover:opacity-80" 
          onClick={() => navigate('/garage')}
        >
          <span className="material-symbols-outlined text-primary">chevron_left</span>
          <span className="font-title-md text-body-lg text-primary">Batal</span>
        </button>
        <h1 className="font-display-lg text-title-md tracking-tighter text-primary">Tambah Motor</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      <main className="pt-24 pb-32 px-container-padding-mobile max-w-md mx-auto relative z-10">
        {/* Hero Section: Image Upload */}
        <section className="mb-stack-lg">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <div className="relative group" onClick={() => fileInputRef.current?.click()}>
            <div className="w-full aspect-video rounded-xl overflow-hidden glass-card flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-all relative border-dashed border-2 border-white/20">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-stack-md">
                  <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container border border-primary-container/20">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'wght' 200" }}>add_a_photo</span>
                  </div>
                  <p className="font-title-md text-on-surface text-center">Unggah Foto Motor</p>
                  <p className="font-body-sm text-on-surface-variant/60 text-center px-8">Ambil gambar terbaik dari sisi samping motor Anda</p>
                </div>
              )}
              {/* Decorative HUD elements */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/40 z-10"></div>
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/40 z-10"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/40 z-10"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/40 z-10"></div>
            </div>
            {imagePreview && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center z-20 hover:bg-red-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </section>

        {/* Form Section */}
        <section className="space-y-stack-lg">
          <div className="glass-card rounded-xl p-6 space-y-6">
            {/* Nama Kendaraan */}
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-primary/70 ml-1">NAMA KENDARAAN</label>
              <div className="relative group/input">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within/input:text-primary">two_wheeler</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-white/12 rounded-lg py-4 pl-12 pr-4 font-body-lg text-on-surface focus:ring-0 focus:outline-none input-glow transition-all" 
                  placeholder="Contoh: Vario 150 Black" 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            {/* Tipe/Merk */}
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-primary/70 ml-1">TIPE / MERK</label>
              <div className="relative group/input">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within/input:text-primary">branding_watermark</span>
                <select 
                  className="w-full bg-surface-container-lowest border border-white/12 rounded-lg py-4 pl-12 pr-4 font-body-lg text-on-surface focus:ring-0 focus:outline-none input-glow transition-all appearance-none"
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                >
                  <option disabled value="">Pilih Merk</option>
                  <option>Honda</option>
                  <option>Yamaha</option>
                  <option>Kawasaki</option>
                  <option>Suzuki</option>
                  <option>Vespa / Piaggio</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Odometer */}
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-primary/70 ml-1 uppercase">Odometer (km)</label>
                <div className="relative group/input">
                  <input 
                    className="w-full bg-surface-container-lowest border border-white/12 rounded-lg py-4 px-4 font-body-lg text-on-surface focus:ring-0 focus:outline-none input-glow transition-all" 
                    placeholder="0" 
                    type="number"
                    value={formData.currentOdometer}
                    onChange={e => setFormData({...formData, currentOdometer: e.target.value})}
                  />
                </div>
              </div>

              {/* Tank Cap */}
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-primary/70 ml-1 uppercase">Tangki (L)</label>
                <div className="relative group/input">
                  <input 
                    className="w-full bg-surface-container-lowest border border-white/12 rounded-lg py-4 px-4 font-body-lg text-on-surface focus:ring-0 focus:outline-none input-glow transition-all" 
                    placeholder="0.0" 
                    step="0.1" 
                    type="number"
                    value={formData.tankCapacity}
                    onChange={e => setFormData({...formData, tankCapacity: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Detail Info */}
          <div className="glass-card rounded-xl p-4 flex items-start gap-4 border-l-4 border-l-primary-container">
            <span className="material-symbols-outlined text-primary-container">info</span>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              Data ini akan digunakan untuk menghitung estimasi servis berkala dan konsumsi bahan bakar kendaraan Anda secara akurat.
            </p>
          </div>
        </section>
      </main>

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 w-full p-container-padding-mobile backdrop-blur-2xl bg-black/40 border-t border-white/10 z-50">
        <button 
          onClick={handleSave}
          disabled={isProcessing}
          className="w-full max-w-md mx-auto bg-primary-container text-white py-5 rounded-xl font-display-lg text-title-md tracking-widest uppercase btn-primary-glow active:scale-95 transition-all flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-80"
        >
          {isProcessing ? (
            <>
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="ml-2">MEMPROSES...</span>
            </>
          ) : (
            <>
              <span>SIMPAN</span>
              <span className="material-symbols-outlined">check_circle</span>
            </>
          )}
        </button>
      </div>

      {/* Background Visual: Carbon Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '24px 24px' }}
      ></div>
    </div>
  );
}
