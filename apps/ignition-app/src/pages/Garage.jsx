import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { authClient } from '../lib/authClient';

export default function Garage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await fetchApi('/vehicles');
        if (response.success) {
          setVehicles(response.data);
        }
      } catch (error) {
        console.error("Failed to load vehicles", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  return (
    <div className="bg-surface-container-lowest text-on-background font-body-sm min-h-screen pb-24 selection:bg-primary-container selection:text-white">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-[0_0_15px_rgba(255,107,0,0.05)] flex justify-between items-center px-container-padding-mobile h-16 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-white/10">
            <img 
              alt="User profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6dHIkIMrD2QYbps6toYH5xZFWiTsXzcpGspBMHA2vuUO1hH93b2OL4JLPhKL8dsSKGHjfhg0joFW_Iihg7McZghr015APMFWLIYskd4nwshe2Cip-lhw_u9h6g-oMjGKDvIq_SuaUJ4P_KNQjmIgD3yOwQkuiCtEGmfRrjmk2IPqWZQJpaj9QUTb53Ch3jY_I02XKDH9rcbzoVUdi1JKq1X1ssCZvF7uvH33yYzIx9hJ5_LDJKbpZgUF5qo3K-KuhWB6iKkgwDsI"
            />
          </div>
          <span className="font-display-lg text-title-md tracking-tighter text-primary">IGNITION</span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-white/5"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-24 px-container-padding-mobile max-w-3xl mx-auto flex flex-col gap-stack-lg">
        {/* Header */}
        <div className="flex flex-col gap-stack-sm">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">GARASI SAYA</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{isLoading ? 'Memuat...' : `${vehicles.length} Kendaraan terdaftar`}</p>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} onClick={() => navigate(`/vehicle/${vehicle.id}`)} className="glass-card rounded-xl overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="h-40 bg-surface-container-high relative">
                <img 
                  alt={vehicle.name}
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHphP7ahxgA9UnoNDdbuK1bDJZ3SFwCBmKqfmMYnM-SE4rzE-eQ44_bwSjOPqfna-bfcUtDm7of35pcX3gIRpO0ibgFRkz2KIGel4VCLhlFa65_-uvmgQ-2tC8Hl096OGeIEaIC7IWbKq80NeuSd0eT7Mvr_7V_uRZz7LsUqIfoyByCnDgOX7i19C5fF1vHc3JJnY_V2I4jpHsIYJGHotg-Y2e7JlWj63X-YJ3rD2IhwYwnSKvoPUmEonqvSZQQxNQ3hlc9t3Esu4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] to-transparent"></div>
              </div>
              <div className="p-4 flex flex-col gap-stack-md">
                <div>
                  <h2 className="font-title-md text-title-md text-on-surface">{vehicle.name}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{vehicle.productionYear} • {vehicle.licensePlate}</p>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                    <span className="font-body-sm text-body-sm">{vehicle.currentOdometer?.toLocaleString() || 0} km</span>
                  </div>
                  <button className="text-primary hover:text-primary-container transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Add Vehicle Action */}
        <div className="mt-8">
          <button 
            onClick={() => navigate('/add-vehicle')}
            className="w-full h-14 bg-primary-container text-white rounded-lg flex items-center justify-center gap-2 font-title-md text-title-md hover:bg-primary-container/90 active:scale-[0.98] transition-all btn-glow border border-primary/50 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="material-symbols-outlined">add</span>
            Tambah Kendaraan
          </button>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-2 pb-6 backdrop-blur-2xl bg-white/5 border-t border-white/12 shadow-2xl rounded-t-xl">
        <button className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-4 py-1 shadow-[0_0_10px_rgba(255,107,0,0.2)] active:scale-90 transition-all duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>garage</span>
          <span className="font-label-caps text-label-caps mt-1">Garage</span>
        </button>
        <button 
          onClick={() => navigate('/account-info')}
          className="flex flex-col items-center justify-center text-on-surface-variant/70 hover:text-primary/80 active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-caps text-label-caps mt-1">Profil</span>
        </button>
      </nav>
    </div>
  );
}
