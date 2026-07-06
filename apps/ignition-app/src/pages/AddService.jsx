import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import PhotoCrop from '../components/PhotoCrop';

const CATEGORIES = [
  { id: 'Servis', icon: 'build', label: 'Servis' },
  { id: 'Isi Bensin', icon: 'local_gas_station', label: 'Isi Bensin' },
  { id: 'Grooming', icon: 'auto_awesome', label: 'Grooming' },
];

const GROOMING_ITEMS = ['Cuci', 'Poles', 'Coating', 'Steam', 'Tambal Ban', 'Kuras Ban', 'Lainnya'];

const SERVIS_ITEMS = ['Oli Mesin', 'Service', 'Kampas Rem'];

const FUEL_BRANDS = {
  Pertamina: ['Pertalite (RON 90)', 'Pertamax (RON 92)', 'Pertamax Turbo (RON 98)', 'Pertamax Green (RON 95)', 'Dexlite', 'Dex'],
  Shell: ['Shell Super (RON 92)', 'Shell V-Power (RON 95)', 'Shell V-Power Nitro+ (RON 98)', 'Shell Diesel'],
  'BP AKR': ['BP 90', 'BP 92', 'BP Ultimate (RON 95)', 'BP Diesel'],
  Vivo: ['Vivo 90', 'Vivo 92', 'Vivo 95'],
};

export default function AddService() {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleId = location.state?.vehicleId;
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [category, setCategory] = useState('Servis');
  const [odometer, setOdometer] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [items, setItems] = useState([{ itemName: '', cost: '' }]);
  const [fuelBrand, setFuelBrand] = useState('Pertamina');
  const [fuelType, setFuelType] = useState('Pertalite (RON 90)');
  const [fuelPrice, setFuelPrice] = useState('');
  const [fuelTotalRp, setFuelTotalRp] = useState('');

  // Receipt upload
  const [receiptUrl, setReceiptUrl] = useState('');

  // Grooming "Lainnya" custom input
  const [customLainnya, setCustomLainnya] = useState({ name: '', cost: '' });
  // Servis "Lainnya" custom input
  const [customServisLainnya, setCustomServisLainnya] = useState({ name: '', cost: '' });

  const fuelTypes = FUEL_BRANDS[fuelBrand] || [];

  const fuelCalc = useMemo(() => {
    const price = parseFloat(fuelPrice) || 0;
    const total = parseFloat(fuelTotalRp) || 0;
    return { liters: price > 0 ? total / price : 0, total };
  }, [fuelPrice, fuelTotalRp]);

  const toggleGroomingItem = (name) => {
    if (name === 'Lainnya') {
      // Toggle custom input
      if (items.some(i => i.itemName === 'Lainnya')) {
        setItems(items.filter(i => i.itemName !== 'Lainnya'));
        setCustomLainnya({ name: '', cost: '' });
      } else {
        setItems([...items, { itemName: 'Lainnya', cost: '' }]);
      }
      return;
    }
    const exists = items.find(i => i.itemName === name);
    setItems(exists ? items.filter(i => i.itemName !== name) : [...items.filter(i => i.itemName), { itemName: name, cost: '' }]);
  };

  const addCustomLainnya = () => {
    if (!customLainnya.name.trim()) return;
    setItems(items.filter(i => i.itemName !== 'Lainnya').concat([{ itemName: customLainnya.name, cost: customLainnya.cost || '' }]));
    setCustomLainnya({ name: '', cost: '' });
  };

  const toggleServisItem = (name) => {
    const exists = items.find(i => i.itemName === name);
    setItems(exists ? items.filter(i => i.itemName !== name) : [...items.filter(i => i.itemName), { itemName: name, cost: '' }]);
  };

  const addCustomServisLainnya = () => {
    if (!customServisLainnya.name.trim()) return;
    setItems(items.filter(i => i.itemName !== 'Lainnya').concat([{ itemName: customServisLainnya.name, cost: customServisLainnya.cost || '' }]));
    setCustomServisLainnya({ name: '', cost: '' });
  };

  const handleReceiptCrop = async (base64) => {
    try {
      const res = await fetchApi('/upload', { method: 'POST', body: JSON.stringify({ file: base64 }) });
      if (res.data?.url) setReceiptUrl(res.data.url);
    } catch (e) { console.error('Upload nota gagal', e); }
  };

  const grandTotal = category === 'Isi Bensin' ? fuelCalc.total : items.reduce((acc, c) => acc + (parseInt(c.cost) || 0), 0);

  const handleSave = async () => {
    if (!vehicleId) return setErrorMsg("Kendaraan tidak ditemukan");
    setIsProcessing(true);
    setErrorMsg('');
    try {
      let record, serviceItems;
      if (category === 'Isi Bensin') {
        if (!fuelTotalRp || !fuelPrice) return setErrorMsg("Mohon isi harga/liter dan total bayar");
        record = { odometerAtService: odometer || '0', workshopName: fuelBrand, totalCost: grandTotal, receiptImageUrl: receiptUrl || null };
        serviceItems = [{ itemName: `${fuelBrand} - ${fuelType}`, cost: grandTotal, category: 'Isi Bensin' }];
      } else if (category === 'Servis') {
        if (!odometer) return setErrorMsg("Mohon isi odometer");
        const valid = items.filter(i => i.itemName && i.cost);
        record = { odometerAtService: odometer, workshopName, totalCost: grandTotal, receiptImageUrl: receiptUrl || null };
        serviceItems = valid.map(i => ({ ...i, category: 'Servis' }));
      } else {
        const valid = items.filter(i => i.itemName && i.cost);
        record = { odometerAtService: '0', workshopName, totalCost: grandTotal, receiptImageUrl: receiptUrl || null };
        serviceItems = valid.map(i => ({ ...i, category: 'Grooming' }));
      }
      const res = await fetchApi(`/services/vehicle/${vehicleId}`, { method: 'POST', body: JSON.stringify({ record, items: serviceItems }) });
      if (res.success) navigate(`/history?vehicleId=${vehicleId}`);
    } catch (err) { setErrorMsg("Gagal mencatat: " + (err.message || '')); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col overflow-x-hidden selection:bg-primary-container selection:text-white">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary-container/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-secondary-container/5 blur-[120px] rounded-full"></div>
      </div>
      <header className="relative z-50 flex justify-between items-center px-container-padding-mobile h-16 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-white/5"><span className="material-symbols-outlined">close</span></button>
        <h1 className="font-title-md text-title-md text-on-surface">Catat Servis</h1>
        <div className="w-10"></div>
      </header>
      <main className="relative z-10 flex-grow px-container-padding-mobile pt-stack-lg pb-[120px] max-w-3xl md:mx-auto w-full flex flex-col gap-stack-lg">

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">{errorMsg}</div>
        )}

        <section className="glass-card rounded-xl p-4">
          <p className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase mb-3">Kategori</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setCategory(c.id); setItems([]); }}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${category === c.id ? 'bg-primary-container/20 border-primary-container text-primary' : 'border-white/10 text-on-surface-variant hover:border-white/20'}`}>
                <span className="material-symbols-outlined text-xl">{c.icon}</span><span className="font-label-caps text-[10px]">{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        {category === 'Servis' && (
          <div className="flex flex-col gap-stack-sm">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest pl-1">Odometer (km)</label>
            <div className="relative"><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70">speed</span>
              <input className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary-container transition-all" placeholder="15000" type="number" value={odometer} onChange={e => setOdometer(e.target.value)} />
            </div>
          </div>
        )}

        {category === 'Isi Bensin' && (
          <section className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="font-title-md text-on-surface border-b border-white/10 pb-3">Detail Isi Bensin</h2>
            <div>
              <label className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase">Merk BBM</label>
              <select className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 mt-1 text-on-surface" value={fuelBrand} onChange={e => { setFuelBrand(e.target.value); setFuelType(FUEL_BRANDS[e.target.value]?.[0] || ''); }}>
                {Object.keys(FUEL_BRANDS).map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase">Tipe BBM</label>
              <select className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 mt-1 text-on-surface" value={fuelType} onChange={e => setFuelType(e.target.value)}>
                {fuelTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase">Harga / Liter (Rp)</label>
              <input className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 mt-1 text-on-surface" type="number" placeholder="Contoh: 10000" value={fuelPrice} onChange={e => setFuelPrice(e.target.value)} />
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase">Total Bayar (Rp)</label>
              <input className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 mt-1 text-on-surface" type="number" placeholder="Contoh: 50000" value={fuelTotalRp} onChange={e => setFuelTotalRp(e.target.value)} />
            </div>
            {fuelPrice && fuelTotalRp ? (
              <div className="bg-primary-container/10 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Liter didapat:</span><span className="text-on-surface font-semibold">{fuelCalc.liters.toFixed(2)} L</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Total:</span><span className="text-primary font-title-md">Rp {fuelCalc.total.toLocaleString('id-ID')}</span></div>
              </div>
            ) : null}
          </section>
        )}

        {category !== 'Isi Bensin' && (
          <div className="flex flex-col gap-stack-sm">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest pl-1">{category === 'Servis' ? 'Bengkel' : 'Tempat'}</label>
            <div className="relative"><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70">home_repair_service</span>
              <input className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary-container transition-all" placeholder={category === 'Servis' ? 'Nama bengkel' : 'Nama tempat'} type="text" value={workshopName} onChange={e => setWorkshopName(e.target.value)} />
            </div>
          </div>
        )}

        {category !== 'Isi Bensin' && (
          <section className="glass-card rounded-xl p-5 flex flex-col gap-stack-md">
            <h2 className="font-title-md text-on-surface border-b border-white/10 pb-3">Rincian</h2>
            {category === 'Grooming' && (
              <>
                <div className="flex flex-wrap gap-2">
                  {GROOMING_ITEMS.map(g => { const sel = items.some(i => i.itemName === g);
                    return <button key={g} onClick={() => toggleGroomingItem(g)} className={`px-3 py-2 rounded-lg border text-sm transition-all ${sel ? 'bg-primary-container/20 border-primary-container text-primary' : 'border-white/10 text-on-surface-variant hover:border-white/20'}`}>{g}</button>;
                  })}
                </div>
                {/* Custom "Lainnya" input */}
                {items.some(i => i.itemName === 'Lainnya') && (
                  <div className="flex gap-2 mt-2">
                    <input placeholder="Nama servis..." className="flex-1 bg-surface-container-low border border-white/10 rounded-lg py-2 px-3 text-sm text-on-surface" value={customLainnya.name} onChange={e => setCustomLainnya({...customLainnya, name: e.target.value})} />
                    <input placeholder="Biaya" type="number" className="w-28 bg-surface-container-low border border-white/10 rounded-lg py-2 px-3 text-sm text-on-surface" value={customLainnya.cost} onChange={e => setCustomLainnya({...customLainnya, cost: e.target.value})} />
                    <button onClick={addCustomLainnya} className="bg-primary-container text-white px-4 rounded-lg text-sm font-semibold">Tambah</button>
                  </div>
                )}
              </>
            )}
            {category === 'Servis' && (
              <div className="flex flex-wrap gap-2">
                {SERVIS_ITEMS.map(s => { const sel = items.some(i => i.itemName === s);
                  return <button key={s} onClick={() => toggleServisItem(s)} className={`px-3 py-2 rounded-lg border text-sm transition-all ${sel ? 'bg-primary-container/20 border-primary-container text-primary' : 'border-white/10 text-on-surface-variant hover:border-white/20'}`}>{s}</button>;
                })}
              </div>
            )}
            {/* Lainnya custom input */}
            {category === 'Servis' && items.some(i => i.itemName === 'Lainnya') && (
              <div className="flex gap-2 mt-2">
                <input placeholder="Nama item..." className="flex-1 bg-surface-container-low border border-white/10 rounded-lg py-2 px-3 text-sm text-on-surface" value={customServisLainnya.name} onChange={e => setCustomServisLainnya({...customServisLainnya, name: e.target.value})} />
                <input placeholder="Biaya" type="number" className="w-28 bg-surface-container-low border border-white/10 rounded-lg py-2 px-3 text-sm text-on-surface" value={customServisLainnya.cost} onChange={e => setCustomServisLainnya({...customServisLainnya, cost: e.target.value})} />
                <button onClick={addCustomServisLainnya} className="bg-primary-container text-white px-4 rounded-lg text-sm font-semibold">Tambah</button>
              </div>
            )}
            <ul className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-1 bg-surface-container-low/50 border border-white/5 rounded-lg p-2">
                  <input placeholder="Nama Item" className="text-on-surface flex-1 min-w-0 bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:outline-none focus:border-primary" value={item.itemName} onChange={e => {
                    const n = [...items]; n[idx].itemName = e.target.value; setItems(n);
                  }} />
                  <input placeholder="Biaya" type="number" className="w-20 bg-transparent border-b border-white/20 px-1 py-1 text-on-surface-variant focus:outline-none focus:border-primary text-right text-sm" value={item.cost} onChange={e => {
                    const n = [...items]; n[idx].cost = e.target.value; setItems(n);
                  }} />
                  <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-error opacity-60 hover:opacity-100 flex-shrink-0"><span className="material-symbols-outlined text-sm">delete</span></button>
                </li>
              ))}
            </ul>
            {category === 'Servis' && (
              <button onClick={() => setItems([...items, { itemName: '', cost: '' }])} className="mt-2 w-full border border-dashed border-white/20 rounded-lg py-3 flex items-center justify-center gap-2 text-primary hover:bg-primary-container/10 transition-all">
                <span className="material-symbols-outlined text-sm">add</span><span className="font-label-caps text-label-caps uppercase">Tambah Item</span>
              </button>
            )}
          </section>
        )}

        <section className="glass-card rounded-xl p-5 flex justify-between items-end border-l-4 border-l-primary-container relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-1"><span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total</span><span className="font-body-sm text-surface-tint">{category === 'Isi Bensin' ? `${fuelCalc.liters.toFixed(1)} Liter` : `${items.filter(i => i.itemName && i.cost).length} Items`}</span></div>
          <div className="relative z-10 font-headline-lg-mobile text-headline-lg-mobile text-primary-container">Rp {grandTotal.toLocaleString('id-ID')}</div>
        </section>

        <section className="flex flex-col gap-stack-sm mt-2">
          <p className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">Unggah Nota</p>
          {receiptUrl ? (
            <div className="relative">
              <img src={receiptUrl} alt="Nota" className="w-full h-48 object-contain rounded-xl glass-card" />
              <button onClick={() => setReceiptUrl('')} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
          ) : (
            <PhotoCrop onCropDone={handleReceiptCrop} aspect={4/3}>
              <div className="w-full glass-card rounded-xl py-6 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center hover:scale-110 transition-all shadow-lg"><span className="material-symbols-outlined text-primary text-[28px]">photo_camera</span></div>
                <span className="font-title-md text-on-surface">Unggah Nota</span>
                <span className="font-body-sm text-on-surface-variant">Tap untuk ambil foto atau pilih file</span>
              </div>
            </PhotoCrop>
          )}
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-container-padding-mobile pb-8 bg-gradient-to-t from-background via-background/90 to-transparent z-50 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <button onClick={handleSave} disabled={isProcessing} className="w-full bg-primary-container text-white font-title-md rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-[#ff7a1f] active:scale-[0.98] transition-all disabled:opacity-50">
            <span className="material-symbols-outlined">save</span><span className="tracking-wide">{isProcessing ? 'MENYIMPAN...' : 'SIMPAN'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
