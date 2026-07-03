import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';

export default function VehicleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const response = await fetchApi(`/vehicles/${id}`);
        if (response.success) {
          setVehicle(response.data);
        }
      } catch (err) {
        console.error("Failed to load vehicle", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadVehicle();
  }, [id]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white">Memuat...</div>;
  }
  
  if (!vehicle) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white">Kendaraan tidak ditemukan</div>;
  }

  return (
    <div className="antialiased min-h-screen flex flex-col pb-24 md:pb-0 overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding-mobile h-16 bg-transparent backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-[0_0_15px_rgba(255,107,0,0.05)]">
        <button 
          onClick={() => navigate(-1)}
          className="text-primary hover:opacity-80 transition-opacity active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tighter">{vehicle.name}</h1>
        <button 
          aria-label="logout" 
          onClick={() => navigate('/')}
          className="text-primary hover:opacity-80 transition-opacity active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 px-container-padding-mobile md:max-w-[1200px] md:mx-auto w-full grid grid-cols-4 md:grid-cols-12 gap-gutter relative">
        {/* Background Hero Image */}
        <div className="col-span-4 md:col-span-12 h-48 md:h-64 rounded-xl overflow-hidden relative mb-stack-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent z-10"></div>
          <img 
            alt="Motorcycle close up" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ52vaZ5iCmxCM2pKngBra8aolc8_lz90JoPej8xJ7sdaUWEzcISkmQHHmSodYM-AiFqqBqLnRTkB1nuclrZtpDIE8qGDU2CFmx2Hn_eY8Q_IczP5EW0R0DM6PyCcMz5sVeLs98pBWc8TFS5mEFMEZrjyAEwzpA37zD6A7PoUtKDn3rPefgyxIRVH_41t4bDWHP1Vuz9oIkEycDF5tmXwmiHNeIkmuEESGmbGTZVE-jL5UPrIVStXyTMm9jy07v5NjVdhEiCLx6cE"
          />
          <div className="absolute bottom-gutter left-gutter z-20">
            <p className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-widest mb-1">CURRENT ODO</p>
            <div className="font-display-lg text-display-lg text-primary flex items-baseline gap-2">
              {vehicle.currentOdometer?.toLocaleString() || 0} <span className="font-title-md text-title-md text-on-surface">km</span>
            </div>
          </div>
        </div>

        {/* KONDISI KENDARAAN Section */}
        <div className="col-span-4 md:col-span-8 flex flex-col gap-stack-lg">
          <div>
            <h2 className="font-title-md text-title-md text-on-surface mb-stack-md flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 0" }}>build</span>
              KONDISI KENDARAAN
            </h2>
            <div className="flex flex-col gap-stack-md">
              {/* Oli Mesin */}
              <div className="glass-card rounded-lg p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-body-lg text-body-lg text-on-surface font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 0" }}>oil_barrel</span>
                    Oli Mesin
                  </span>
                  <span className="font-label-caps text-label-caps bg-[#1B2A1B] text-[#4ADE80] border border-[#4ADE80]/30 px-2 py-1 rounded-full">Aman</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary to-[#4ADE80] w-[60%] rounded-full shadow-[0_0_10px_#4ADE80]"></div>
                </div>
                <div className="text-right font-body-sm text-body-sm text-on-surface-variant">60%</div>
              </div>

              {/* Kampas Rem */}
              <div className="glass-card rounded-lg p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-body-lg text-body-lg text-on-surface font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 0" }}>settings</span>
                    Kampas Rem
                  </span>
                  <span className="font-label-caps text-label-caps bg-[#3A2500] text-[#FBBF24] border border-[#FBBF24]/30 px-2 py-1 rounded-full">Dekat</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary to-[#FBBF24] w-[85%] rounded-full shadow-[0_0_10px_#FBBF24]"></div>
                </div>
                <div className="text-right font-body-sm text-body-sm text-on-surface-variant">85%</div>
              </div>

              {/* Oli Gardan */}
              <div className="glass-card rounded-lg p-4 flex flex-col gap-2 border-error/30 animate-pulse-red bg-error/5">
                <div className="flex justify-between items-center">
                  <span className="font-body-lg text-body-lg text-on-surface font-semibold flex items-center gap-2 text-error">
                    <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    Oli Gardan
                  </span>
                  <span className="font-label-caps text-label-caps bg-error-container text-error border border-error px-2 py-1 rounded-full font-bold">GANTI</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-error w-[100%] rounded-full shadow-[0_0_10px_#FFB4AB]"></div>
                </div>
                <div className="text-right font-body-sm text-body-sm text-error font-bold">100%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar placeholder for desktop */}
        <div className="hidden md:block md:col-span-4 glass-card rounded-xl p-stack-lg">
          <h3 className="font-title-md text-title-md text-on-surface mb-stack-md">Quick Stats</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Next major service recommended at 15,000 km.</p>
        </div>

        {/* FAB */}
        <div className="fixed bottom-24 md:bottom-12 right-container-padding-mobile md:right-8 z-40">
          <button 
            onClick={() => navigate('/add-service', { state: { vehicleId: vehicle.id } })}
            className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.4)] hover:bg-primary transition-colors active:scale-95 border border-primary-fixed"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
          </button>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-6 px-8 bg-transparent backdrop-blur-2xl bg-white/5 border-t border-white/12 shadow-2xl rounded-t-xl">
        <button 
          onClick={() => navigate('/garage')}
          className="flex flex-col items-center justify-center text-primary fill-primary hover:text-primary-fixed-dim active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>garage</span>
          <span className="font-label-caps text-label-caps">Garage</span>
        </button>
        <button 
          onClick={() => navigate(`/history?vehicleId=${vehicle.id}`)}
          className="flex flex-col items-center justify-center text-secondary-fixed-dim opacity-60 hover:text-primary-fixed-dim active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>history</span>
          <span className="font-label-caps text-label-caps">History</span>
        </button>
      </nav>
    </div>
  );
}
