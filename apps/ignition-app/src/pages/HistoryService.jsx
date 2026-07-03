import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';

export default function HistoryService() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  
  const [services, setServices] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!vehicleId) {
        setIsLoading(false);
        return;
      }
      try {
        const [vehicleRes, servicesRes] = await Promise.all([
          fetchApi(`/vehicles/${vehicleId}`),
          fetchApi(`/services/vehicle/${vehicleId}`)
        ]);
        
        if (vehicleRes.success) {
          setVehicle(vehicleRes.data);
        }
        if (servicesRes.success) {
          setServices(servicesRes.data);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [vehicleId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white">Memuat...</div>;
  }

  return (
    <div className="antialiased min-h-screen flex flex-col font-body-lg bg-[#0A0A0B] text-[#e5e2e3]">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-[0_0_15px_rgba(255,107,0,0.05)] flex justify-between items-center px-container-padding-mobile h-16 z-50">
        <button onClick={() => navigate(-1)} className="hover:opacity-80 transition-opacity active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <div className="font-display-lg text-title-md tracking-tighter text-primary">IGNITION</div>
        <button 
          onClick={() => navigate('/')}
          className="hover:opacity-80 transition-opacity active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-primary" data-icon="logout">logout</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto pt-24 pb-32 px-container-padding-mobile md:px-container-padding-desktop flex flex-col gap-stack-lg">
        {/* Header & Odo Stats (Glass Card) */}
        <section className="glass-card rounded-xl p-6 flex flex-col gap-stack-md">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{vehicle?.name || 'Unknown Vehicle'}</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{vehicle?.licensePlate || ''}</p>
            </div>
            <div className="bg-surface-container-high rounded-full px-3 py-1 flex items-center gap-1 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              <span className="font-label-caps text-label-caps text-on-surface">Active</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-surface-container-lowest/50 rounded-lg p-4 border border-white/5">
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Odometer</p>
              <p className="font-title-md text-title-md text-primary">{vehicle?.currentOdometer?.toLocaleString() || 0} <span className="font-body-sm text-body-sm text-on-surface-variant">km</span></p>
            </div>
            <div className="bg-surface-container-lowest/50 rounded-lg p-4 border border-white/5">
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Servis</p>
              <p className="font-title-md text-title-md text-secondary">{services.length} <span className="font-body-sm text-body-sm text-on-surface-variant">kali</span></p>
            </div>
          </div>
        </section>

        {/* RIWAYAT Section */}
        <section className="flex flex-col gap-stack-md">
          <div className="flex items-center justify-between">
            <h2 className="font-title-md text-title-md text-on-surface">RIWAYAT</h2>
          </div>
          {/* Filter Chips */}
          <div className="flex items-center gap-2 mb-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-on-surface hover:border-primary/50 transition-colors font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Okt 2023</span>
              <span className="material-symbols-outlined text-[18px] text-primary">expand_more</span>
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-on-surface hover:border-primary/50 transition-colors font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span>Semua Kategori</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {services.length === 0 ? (
              <p className="text-on-surface-variant text-center my-8">Belum ada riwayat servis</p>
            ) : (
              services.map((svc) => (
                <div key={svc.id} className="glass-card rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[20px]">build</span>
                    </div>
                    <div>
                      <h3 className="font-title-md text-title-md text-on-surface">{svc.workshopName}</h3>
                      <p className="font-body-sm text-on-surface-variant">{svc.odometerAtService.toLocaleString()} km</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-body-sm font-semibold text-on-surface">
                      {new Date(svc.serviceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="font-body-sm text-primary">Rp {parseFloat(svc.totalCost).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-6 px-8 bg-transparent backdrop-blur-2xl bg-white/5 border-t border-white/12 shadow-2xl rounded-t-xl">
        <button 
          onClick={() => navigate('/garage')}
          className="flex flex-col items-center justify-center text-secondary-fixed-dim opacity-60 hover:text-primary-fixed-dim active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>garage</span>
          <span className="font-label-caps text-label-caps">Garage</span>
        </button>
        <button 
          onClick={() => navigate('/history')}
          className="flex flex-col items-center justify-center text-primary fill-primary hover:text-primary-fixed-dim active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <span className="font-label-caps text-label-caps">History</span>
        </button>
      </nav>
    </div>
  );
}
