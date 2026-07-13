import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { fetchApi } from '../lib/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function HistoryService() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  
  const [services, setServices] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedService, setExpandedService] = useState(null);
  const [serviceCategories, setServiceCategories] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null); // 'cat' | 'month' | 'year' | null
  const [downloading, setDownloading] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [dlMonth, setDlMonth] = useState(new Date().getMonth());
  const [dlYear, setDlYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadData = async () => {
      if (!vehicleId) { setIsLoading(false); return; }
      try {
        const [vehicleRes, servicesRes] = await Promise.all([
          fetchApi(`/vehicles/${vehicleId}`),
          fetchApi(`/services/vehicle/${vehicleId}`)
        ]);
        if (vehicleRes.success) setVehicle(vehicleRes.data);
        if (servicesRes.success) {
          const svcs = servicesRes.data;
          // Sort by date DESC (newest first)
          svcs.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
          setServices(svcs);
          const catMap = {};
          await Promise.all(svcs.map(async (svc) => {
            try {
              const itemsRes = await fetchApi(`/services/${svc.id}`);
              if (itemsRes.success) catMap[svc.id] = [...new Set(itemsRes.data.map(i => i.category).filter(Boolean))];
            } catch {}
          }));
          setServiceCategories(catMap);
        }
      } catch (err) { console.error("Failed to load history", err); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, [vehicleId, location.key]);

  const CATEGORIES = ['Servis', 'Isi Bensin', 'Grooming'];
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const all = [];
    for (let y = currentYear; y >= currentYear - 10; y--) all.push(y);
    return all;
  }, [currentYear]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const d = new Date(s.serviceDate);
      if (selectedYear && d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== null && d.getMonth() !== selectedMonth) return false;
      if (selectedCategory && !(serviceCategories[s.id] || []).includes(selectedCategory)) return false;
      return true;
    });
  }, [services, selectedYear, selectedMonth, selectedCategory, serviceCategories]);

  useEffect(() => {
    setSelectedMonth(null); setSelectedYear(null); setSelectedCategory(null);
  }, [vehicleId]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white">Memuat...</div>;

  const openDownloadDialog = () => {
    setShowDownloadDialog(true);
    setDlMonth(new Date().getMonth());
    setDlYear(currentYear);
  };

  const handleDownload = async () => {
    setShowDownloadDialog(false);
    setDownloading(true);
    try {
      const { generateHistoryPDF } = await import('../lib/pdf');
      const pdfServices = services.filter(s => {
        const d = new Date(s.serviceDate);
        return d.getFullYear() === dlYear && d.getMonth() === dlMonth;
      });
      pdfServices.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
      await generateHistoryPDF(vehicle, pdfServices, serviceCategories);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Gagal membuat PDF. Coba lagi.');
    }
    setDownloading(false);
  };

  const getIcon = (svcId) => {
    const cats = serviceCategories[svcId] || [];
    if (cats[0] === 'Isi Bensin') return 'local_gas_station';
    if (cats[0] === 'Grooming') return 'auto_awesome';
    return 'build';
  };

  return (
    <div className="antialiased min-h-screen flex flex-col font-body-lg bg-[#0A0A0B] text-[#e5e2e3]">
      <header className="fixed top-0 w-full backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-[0_0_15px_rgba(255,107,0,0.05)] flex justify-between items-center px-container-padding-mobile h-16 z-50">
        <button onClick={() => navigate(-1)} className="hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <div className="font-display-lg text-title-md tracking-tighter text-primary">IGNITION</div>
        <button onClick={() => navigate('/garage')} className="hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined text-primary">garage</span>
        </button>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto pt-24 pb-32 px-container-padding-mobile flex flex-col gap-stack-lg">
        <section className="glass-card rounded-xl p-6 flex flex-col gap-stack-md">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-headline-lg-mobile text-lg text-on-surface">{vehicle?.name || 'Unknown'}</h1>
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

        <section className="flex flex-col gap-stack-md">
          <div className="flex items-center justify-between">
            <h2 className="font-title-md text-title-md text-on-surface">RIWAYAT</h2>
            <button onClick={openDownloadDialog} disabled={downloading || services.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[14px]">{downloading ? 'hourglass_top' : 'download'}</span>
              {downloading ? 'Membuat PDF...' : 'Download PDF'}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap relative">
            {/* Dropdown: Kategori */}
            <div className="relative">
              <button onClick={() => setOpenDropdown(openDropdown === 'cat' ? null : 'cat')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-on-surface hover:border-primary/50 transition-colors text-xs">
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                <span>{selectedCategory || 'Kategori'}</span>
                <span className="material-symbols-outlined text-[14px] text-primary">{openDropdown === 'cat' ? 'expand_less' : 'expand_more'}</span>
              </button>
              {openDropdown === 'cat' && (
                <div className="absolute top-full mt-1 left-0 glass-card rounded-lg p-2 z-50 min-w-[150px] shadow-xl">
                  <button onClick={() => { setSelectedCategory(null); setOpenDropdown(null); }}
                    className={`w-full text-left px-3 py-2 rounded text-xs ${!selectedCategory ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}>Semua</button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setSelectedCategory(cat); setOpenDropdown(null); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs ${selectedCategory === cat ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}>{cat}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown: Bulan */}
            <div className="relative">
              <button onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-on-surface hover:border-primary/50 transition-colors text-xs">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                <span>{selectedMonth !== null ? MONTHS[selectedMonth] : 'Bulan'}</span>
                <span className="material-symbols-outlined text-[14px] text-primary">{openDropdown === 'month' ? 'expand_less' : 'expand_more'}</span>
              </button>
              {openDropdown === 'month' && (
                <div className="absolute top-full mt-1 left-0 glass-card rounded-lg p-2 z-50 min-w-[120px] max-h-48 overflow-y-auto shadow-xl">
                  <button onClick={() => { setSelectedMonth(null); setOpenDropdown(null); }}
                    className={`w-full text-left px-3 py-2 rounded text-xs ${selectedMonth === null ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}>Semua</button>
                  {MONTHS.map((m, i) => (
                    <button key={m} onClick={() => { setSelectedMonth(i); setOpenDropdown(null); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs ${selectedMonth === i ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}>{m}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown: Tahun */}
            <div className="relative">
              <button onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-on-surface hover:border-primary/50 transition-colors text-xs">
                <span className="material-symbols-outlined text-[16px]">date_range</span>
                <span>{selectedYear || 'Tahun'}</span>
                <span className="material-symbols-outlined text-[14px] text-primary">{openDropdown === 'year' ? 'expand_less' : 'expand_more'}</span>
              </button>
              {openDropdown === 'year' && (
                <div className="absolute top-full mt-1 left-0 glass-card rounded-lg p-2 z-50 min-w-[100px] max-h-48 overflow-y-auto shadow-xl">
                  <button onClick={() => { setSelectedYear(null); setOpenDropdown(null); }}
                    className={`w-full text-left px-3 py-2 rounded text-xs ${selectedYear === null ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}>Semua</button>
                  {availableYears.map(y => (
                    <button key={y} onClick={() => { setSelectedYear(y); setOpenDropdown(null); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs ${selectedYear === y ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5'}`}>{y}</button>
                  ))}
                </div>
              )}
            </div>

            {(selectedMonth !== null || selectedYear || selectedCategory) && (
              <button onClick={() => { setSelectedMonth(null); setSelectedYear(null); setSelectedCategory(null); }}
                className="text-primary text-xs hover:underline">Hapus filter</button>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {filteredServices.length === 0 && services.length > 0 ? (
              <p className="text-on-surface-variant text-center my-8">Tidak ada servis di bulan ini</p>
            ) : filteredServices.length === 0 ? (
              <p className="text-on-surface-variant text-center my-8">Belum ada riwayat servis</p>
            ) : (
              filteredServices.map((svc) => {
                const cats = serviceCategories[svc.id] || [];
                const mainCat = cats[0] || '';
                const isGrooming = mainCat === 'Grooming';
                const showOdo = svc.odometerAtService > 0 && !isGrooming;
                return (
                <div key={svc.id}>
                  <div onClick={() => setExpandedService(expandedService === svc.id ? null : svc.id)} className="glass-card rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[20px]">{getIcon(svc.id)}</span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface">{svc.workshopName}</h3>
                        {showOdo && <p className="font-body-sm text-on-surface-variant">{svc.odometerAtService.toLocaleString()} km</p>}
                        {isGrooming && <p className="font-body-sm text-on-surface-variant/50">Grooming</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-body-sm font-semibold text-on-surface">
                        {new Date(svc.serviceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="font-body-sm text-primary">Rp {parseFloat(svc.totalCost).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  {expandedService === svc.id && <ServiceItems serviceId={svc.id} receiptUrl={svc.receiptImageUrl} />}
                </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-6 px-8 bg-transparent backdrop-blur-2xl bg-white/5 border-t border-white/12 shadow-2xl rounded-t-xl">
        <button onClick={() => navigate(`/vehicle/${vehicleId}`)} className="flex flex-col items-center justify-center text-secondary-fixed-dim opacity-60 hover:text-primary-fixed-dim active:scale-90 transition-all duration-200">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>directions_car</span>
          <span className="font-label-caps text-label-caps">Kendaraan</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center text-primary fill-primary hover:text-primary-fixed-dim active:scale-90 transition-all duration-200">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <span className="font-label-caps text-label-caps">History</span>
        </button>
      </nav>

      {/* Download PDF Dialog */}
      {showDownloadDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDownloadDialog(false)}>
          <div className="glass-card rounded-xl p-6 mx-4 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-title-md text-title-md text-on-surface mb-4">Download PDF</h3>
            <p className="font-body-sm text-on-surface-variant mb-4">Pilih bulan & tahun yang ingin di-download:</p>
            
            {/* Month selector */}
            <div className="mb-3">
              <p className="font-label-caps text-[10px] text-on-surface-variant mb-2">Bulan</p>
              <div className="grid grid-cols-4 gap-1.5">
                {MONTHS.map((m, i) => (
                  <button key={m} onClick={() => setDlMonth(i)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${dlMonth === i ? 'bg-primary text-white' : 'bg-white/5 text-on-surface-variant hover:bg-white/10'}`}>{m}</button>
                ))}
              </div>
            </div>

            {/* Year selector */}
            <div className="mb-5">
              <p className="font-label-caps text-[10px] text-on-surface-variant mb-2">Tahun</p>
              <div className="grid grid-cols-5 gap-1.5">
                {availableYears.map(y => (
                  <button key={y} onClick={() => setDlYear(y)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${dlYear === y ? 'bg-primary text-white' : 'bg-white/5 text-on-surface-variant hover:bg-white/10'}`}>{y}</button>
                ))}
              </div>
            </div>

            {/* Preview count */}
            <p className="font-body-sm text-on-surface-variant mb-4">
              {(() => {
                const count = services.filter(s => {
                  const d = new Date(s.serviceDate);
                  return d.getFullYear() === dlYear && d.getMonth() === dlMonth;
                }).length;
                return <span>{count} servis di {MONTHS[dlMonth]} {dlYear}</span>;
              })()}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setShowDownloadDialog(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-on-surface-variant text-sm hover:bg-white/10 transition-colors">Batal</button>
              <button onClick={handleDownload}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceItems({ serviceId, receiptUrl }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchApi(`/services/${serviceId}`)
      .then(res => { if (res.success) setItems(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [serviceId]);
  if (loading) return <div className="px-4 py-3 text-on-surface-variant/60 text-sm">Memuat...</div>;

  return (
    <div className="mt-2 ml-14 border-l-2 border-white/5 pl-4 space-y-1">
      {items.length === 0 && !receiptUrl && <p className="text-on-surface-variant/40 text-xs">Tidak ada detail</p>}
      {items.filter(i => i.itemName !== 'Liter').map((item, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span className="text-on-surface-variant">{item.itemName}{item.category ? ` (${item.category})` : ''}</span>
          <span className="text-on-surface">Rp {parseFloat(item.cost).toLocaleString('id-ID')}</span>
        </div>
      ))}
      {/* Receipt button */}
      <div className="pt-2">
        {receiptUrl ? (
          <a href={receiptUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            See Receipt
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-on-surface-variant/40 text-xs">
            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            No Receipt
          </span>
        )}
      </div>
    </div>
  );
}
