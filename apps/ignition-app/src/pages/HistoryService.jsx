import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { fetchApi } from '../lib/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function HistoryService() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  
  const [services, setServices] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedService, setExpandedService] = useState(null);
  const [serviceCategories, setServiceCategories] = useState({}); // { serviceId: [cat1, cat2] }

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
          const svcs = servicesRes.data;
          setServices(svcs);
          // Fetch categories for each service
          const catMap = {};
          await Promise.all(svcs.map(async (svc) => {
            try {
              const itemsRes = await fetchApi(`/services/${svc.id}`);
              if (itemsRes.success) {
                catMap[svc.id] = [...new Set(itemsRes.data.map(i => i.category).filter(Boolean))];
              }
            } catch {}
          }));
          setServiceCategories(catMap);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [vehicleId]);

  // All years range (current year ±1 if no data)
  const availableYears = useMemo(() => {
    const years = [...new Set(services.map(s => new Date(s.serviceDate).getFullYear()))];
    if (years.length === 0) return [new Date().getFullYear()];
    const min = Math.min(...years), max = Math.max(...years);
    const all = [];
    for (let y = min; y <= max; y++) all.push(y);
    return all.sort((a, b) => b - a);
  }, [services]);

  // Available categories from all services — always show 3 main + dynamic
  const availableCategories = useMemo(() => {
    const cats = new Set();
    Object.values(serviceCategories).forEach(arr => arr.forEach(c => cats.add(c)));
    // Ensure main categories are always available
    const main = ['Servis', 'Isi Bensin', 'Grooming'];
    main.forEach(c => cats.add(c));
    return [...cats].sort();
  }, [serviceCategories]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const d = new Date(s.serviceDate);
      if (selectedYear && d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== null && d.getMonth() !== selectedMonth) return false;
      if (selectedCategory && !(serviceCategories[s.id] || []).includes(selectedCategory)) return false;
      return true;
    });
  }, [services, selectedYear, selectedMonth, selectedCategory, serviceCategories]);

  // Reset filters when vehicle changes
  useEffect(() => {
    setSelectedMonth(null);
    setSelectedYear(null);
    setSelectedCategory(null);
  }, [vehicleId]);

  const toggleFilter = (month, year) => {
    if (selectedMonth === month && selectedYear === year) {
      setSelectedMonth(null);
      setSelectedYear(null);
    } else {
      setSelectedMonth(month);
      setSelectedYear(year);
    }
  };

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
          onClick={() => navigate('/garage')}
          className="hover:opacity-80 transition-opacity active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-primary">garage</span>
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
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* Month Filter */}
            <div className="relative">
              <button 
                onClick={() => { setShowMonthPicker(!showMonthPicker); setShowCatPicker(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-on-surface hover:border-primary/50 transition-colors font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <span>{selectedMonth !== null && selectedYear ? `${MONTHS[selectedMonth]} ${selectedYear}` : 'Semua Bulan'}</span>
                <span className="material-symbols-outlined text-[18px] text-primary">expand_more</span>
              </button>
              {showMonthPicker && (
                <div className="absolute top-full mt-2 left-0 glass-card rounded-xl p-3 z-50 min-w-[200px] max-h-48 overflow-y-auto shadow-xl">
                  <button 
                    onClick={() => { setSelectedMonth(null); setSelectedYear(null); setShowMonthPicker(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-body-sm mb-1 ${selectedMonth === null ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}
                  >
                    Semua Bulan
                  </button>
                  {availableYears.map(year => (
                    <div key={year}>
                      <p className="text-on-surface-variant/40 font-label-caps text-[10px] px-3 py-1">{year}</p>
                      {MONTHS.map((m, i) => {
                        const hasData = services.some(s => {
                          const d = new Date(s.serviceDate);
                          return d.getFullYear() === year && d.getMonth() === i;
                        });
                        const isActive = selectedMonth === i && selectedYear === year;
                        return (
                          <button
                            key={i}
                            onClick={() => { toggleFilter(i, year); setShowMonthPicker(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg font-body-sm ${isActive ? 'bg-primary-container/20 text-primary' : hasData ? 'text-on-surface-variant hover:bg-white/5' : 'text-on-surface-variant/25'}`}
                          >
                            {m} {year}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button 
                onClick={() => { setShowCatPicker(!showCatPicker); setShowMonthPicker(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-on-surface hover:border-primary/50 transition-colors font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                <span>{selectedCategory || 'Semua Kategori'}</span>
                <span className="material-symbols-outlined text-[18px] text-primary">expand_more</span>
              </button>
              {showCatPicker && (
                <div className="absolute top-full mt-2 left-0 glass-card rounded-xl p-3 z-50 min-w-[180px] max-h-48 overflow-y-auto shadow-xl">
                  <button 
                    onClick={() => { setSelectedCategory(null); setShowCatPicker(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-body-sm mb-1 ${!selectedCategory ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}
                  >
                    Semua Kategori
                  </button>
                  {availableCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setShowCatPicker(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-body-sm ${selectedCategory === cat ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(selectedMonth !== null || selectedCategory) && (
              <button 
                onClick={() => { setSelectedMonth(null); setSelectedYear(null); setSelectedCategory(null); }}
                className="text-primary font-body-sm hover:underline"
              >
                Hapus filter
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {filteredServices.length === 0 && services.length > 0 ? (
              <p className="text-on-surface-variant text-center my-8">Tidak ada servis di bulan ini</p>
            ) : filteredServices.length === 0 ? (
              <p className="text-on-surface-variant text-center my-8">Belum ada riwayat servis</p>
            ) : (
              filteredServices.map((svc) => (
                <div key={svc.id}>
                  <div onClick={() => setExpandedService(expandedService === svc.id ? null : svc.id)} className="glass-card rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors">
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
                        {new Date(svc.serviceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="font-body-sm text-primary">Rp {parseFloat(svc.totalCost).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  {/* Expanded: load service items */}
                  {expandedService === svc.id && (
                    <ServiceItems serviceId={svc.id} />
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-6 px-8 bg-transparent backdrop-blur-2xl bg-white/5 border-t border-white/12 shadow-2xl rounded-t-xl">
        <button 
          onClick={() => navigate(`/vehicle/${vehicleId}`)}
          className="flex flex-col items-center justify-center text-secondary-fixed-dim opacity-60 hover:text-primary-fixed-dim active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>directions_car</span>
          <span className="font-label-caps text-label-caps">Kendaraan</span>
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

// Sub-component: loads & displays service items for a record
function ServiceItems({ serviceId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/services/${serviceId}`)
      .then(res => { if (res.success) setItems(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) return <div className="px-4 py-3 text-on-surface-variant/60 text-sm">Memuat...</div>;
  if (items.length === 0) return null;

  return (
    <div className="mt-2 ml-14 border-l-2 border-white/5 pl-4 space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span className="text-on-surface-variant">{item.itemName}{item.category ? ` (${item.category})` : ''}</span>
          <span className="text-on-surface">Rp {parseFloat(item.cost).toLocaleString('id-ID')}</span>
        </div>
      ))}
    </div>
  );
}
