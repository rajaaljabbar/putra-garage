import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { fetchApi } from '../lib/api';
import PhotoCrop from '../components/PhotoCrop';

export default function VehicleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ licensePlate: '', productionYear: '', imageUrl: '', currentOdometer: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [vehRes, svcRes] = await Promise.all([
          fetchApi(`/vehicles/${id}`),
          fetchApi(`/services/vehicle/${id}`),
        ]);
        if (vehRes.success) setVehicle(vehRes.data);
        if (svcRes.success) setServices(svcRes.data || []);
      } catch (err) {
        console.error("Failed to load vehicle", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // Condition calculation — MUST be before any returns (React hooks rule)
  const condition = useMemo(() => {
    const currentOdo = vehicle?.currentOdometer || 0;
    let lastOliOdo = 0, lastServiceOdo = 0;
    for (const svc of services) {
      if (!lastOliOdo && (svc.workshopName || '').toLowerCase().includes('oli')) lastOliOdo = svc.odometerAtService;
      if (!lastServiceOdo && (svc.workshopName || '').toLowerCase().includes('servis')) lastServiceOdo = svc.odometerAtService;
    }
    const oliPct = lastOliOdo ? Math.min(100, Math.max(0, ((currentOdo - lastOliOdo) / 2000) * 100)) : 0;
    const svcPct = lastServiceOdo ? Math.min(100, Math.max(0, ((currentOdo - lastServiceOdo) / 3000) * 100)) : 0;
    return {
      oli: { percent: oliPct, sinceKm: lastOliOdo ? currentOdo - lastOliOdo : 0 },
      service: { percent: svcPct, sinceKm: lastServiceOdo ? currentOdo - lastServiceOdo : 0 },
    };
  }, [vehicle, services]);

  const getCondColor = (pct) => pct >= 90 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#22c55e';
  const getCondLabel = (pct) => pct >= 90 ? 'Ganti' : pct >= 60 ? 'Segera' : 'Aman';

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white">Memuat...</div>;
  if (!vehicle) return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white">Kendaraan tidak ditemukan</div>;

  const lastService = services[0];

  const startEdit = () => {
    setEditForm({
      licensePlate: vehicle.licensePlate || '',
      productionYear: vehicle.productionYear || '',
      imageUrl: vehicle.imageUrl || '',
      currentOdometer: vehicle.currentOdometer || '',
    });
    setIsEditing(true);
  };

  const handlePhotoCrop = async (base64) => {
    try {
      const uploadRes = await fetchApi('/upload', { method: 'POST', body: JSON.stringify({ file: base64 }) });
      if (uploadRes.data?.url) {
        setEditForm((prev) => ({ ...prev, imageUrl: uploadRes.data.url }));
      }
    } catch (err) { console.error('Upload foto gagal', err); }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const res = await fetchApi(`/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          licensePlate: editForm.licensePlate || null,
          productionYear: editForm.productionYear ? parseInt(editForm.productionYear) : null,
          imageUrl: editForm.imageUrl || null,
          currentOdometer: editForm.currentOdometer ? parseInt(editForm.currentOdometer) : null,
        }),
      });
      if (res.success) {
        setVehicle((prev) => ({ ...prev, ...editForm, productionYear: editForm.productionYear ? parseInt(editForm.productionYear) : null, currentOdometer: editForm.currentOdometer ? parseInt(editForm.currentOdometer) : prev.currentOdometer }));
        setIsEditing(false);
      }
    } catch (err) { console.error('Gagal update kendaraan', err); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="antialiased min-h-screen flex flex-col pb-40 md:pb-28 overflow-x-hidden">
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
          onClick={() => navigate(`/vehicle/${id}`)}
          className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>refresh</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 px-container-padding-mobile max-w-2xl mx-auto w-full space-y-stack-lg">
        
        {/* Hero Image */}
        <div className="h-48 md:h-64 rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent z-10"></div>
          <img 
            alt={vehicle.name} 
            className="w-full h-full object-cover" 
            src={vehicle.imageUrl || DEFAULT_BIKE_IMG}
          />
          <div className="absolute bottom-gutter left-gutter z-20">
            <p className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-widest mb-1">Odometersaat ini</p>
            <div className="font-display-lg text-display-lg text-primary flex items-baseline gap-2">
              {vehicle.currentOdometer?.toLocaleString() || 0} <span className="font-title-md text-title-md text-on-surface">km</span>
            </div>
          </div>
        </div>

        {/* Vehicle Info Card */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-title-md text-on-surface">Info Kendaraan</h2>
            {!isEditing && (
              <button onClick={startEdit} className="text-primary hover:opacity-80 flex items-center gap-1 font-body-sm">
                <span className="material-symbols-outlined text-lg">edit</span> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase mb-2">Foto</p>
                <PhotoCrop onCropDone={handlePhotoCrop} aspect={16/9}>
                  <div className="w-full h-40 rounded-lg overflow-hidden bg-surface-container-lowest border border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    {editForm.imageUrl ? (
                      <img src={editForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                        <span className="font-body-sm">Unggah Foto</span>
                      </div>
                    )}
                  </div>
                </PhotoCrop>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">Plat Nomor</label>
                <input className="w-full bg-surface-container-lowest border border-white/12 rounded-lg py-3 px-4 mt-1 text-on-surface" value={editForm.licensePlate} onChange={(e) => setEditForm({...editForm, licensePlate: e.target.value})} placeholder="F 1234 XX" />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">Tahun Produksi</label>
                <input className="w-full bg-surface-container-lowest border border-white/12 rounded-lg py-3 px-4 mt-1 text-on-surface" type="number" value={editForm.productionYear} onChange={(e) => setEditForm({...editForm, productionYear: e.target.value})} placeholder="2022" min="1900" max="2100" />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">Odometer (km)</label>
                <input className="w-full bg-surface-container-lowest border border-white/12 rounded-lg py-3 px-4 mt-1 text-on-surface" type="number" value={editForm.currentOdometer} onChange={(e) => setEditForm({...editForm, currentOdometer: e.target.value})} placeholder="45000" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-on-surface-variant">Batal</button>
                <button onClick={handleSaveEdit} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-primary-container text-white disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">Merk</p>
                <p className="font-title-md text-on-surface mt-1">{vehicle.brand || '-'}</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">Tahun</p>
                <p className="font-title-md text-on-surface mt-1">{vehicle.productionYear || '-'}</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">Plat Nomor</p>
                <p className="font-title-md text-on-surface mt-1">{vehicle.licensePlate || '-'}</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">Kap. Tangki</p>
                <p className="font-title-md text-on-surface mt-1">{vehicle.tankCapacity ? `${vehicle.tankCapacity}L` : '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">Status</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full font-label-caps text-label-caps ${vehicle.status === 'AKTIF' ? 'bg-[#1B2A1B] text-[#4ADE80] border border-[#4ADE80]/30' : 'bg-[#3A2500] text-[#FBBF24] border border-[#FBBF24]/30'}`}>
                  {vehicle.status === 'AKTIF' ? 'Aktif' : 'Terparkir'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Condition Bars */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h2 className="font-title-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">monitoring</span>
            Kondisi Servis
          </h2>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-on-surface-variant">🛢️ Oli Mesin</span>
              <span style={{ color: getCondColor(condition.oli.percent) }} className="font-semibold text-xs">
                {getCondLabel(condition.oli.percent)} · {condition.oli.sinceKm} km
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${condition.oli.percent}%`, backgroundColor: getCondColor(condition.oli.percent) }}></div>
            </div>
            <p className="text-on-surface-variant/40 text-[10px] mt-1">Maks 2.000 km</p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-on-surface-variant">⚙️ Service Berkala</span>
              <span style={{ color: getCondColor(condition.service.percent) }} className="font-semibold text-xs">
                {getCondLabel(condition.service.percent)} · {condition.service.sinceKm} km
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${condition.service.percent}%`, backgroundColor: getCondColor(condition.service.percent) }}></div>
            </div>
            <p className="text-on-surface-variant/40 text-[10px] mt-1">Maks 3.000 km</p>
          </div>
        </div>
      </main>

      {/* FAB Add Service */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50">
        <button 
          onClick={() => navigate('/add-service', { state: { vehicleId: vehicle.id } })}
          className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.4)] hover:bg-primary transition-colors active:scale-95 border border-primary-fixed"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
        </button>
      </div>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center pt-2 pb-6 px-8 bg-transparent backdrop-blur-2xl bg-white/5 border-t border-white/12 shadow-2xl rounded-t-xl">
        <button onClick={() => navigate('/garage')} className="flex flex-col items-center justify-center text-primary fill-primary active:scale-90 transition-all duration-200">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>garage</span>
          <span className="font-label-caps text-label-caps">Garage</span>
        </button>
        <button onClick={() => navigate(`/history?vehicleId=${vehicle.id}`)} className="flex flex-col items-center justify-center text-secondary-fixed-dim opacity-60 active:scale-90 transition-all duration-200">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>history</span>
          <span className="font-label-caps text-label-caps">History</span>
        </button>
      </nav>
    </div>
  );
}
