import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchApi } from '../lib/api';

export default function AddService() {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleId = location.state?.vehicleId;
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [odometer, setOdometer] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [items, setItems] = useState([
    { itemName: '', cost: '' }
  ]);

  const handleAddItem = () => {
    setItems([...items, { itemName: '', cost: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const grandTotal = items.reduce((acc, curr) => acc + (parseInt(curr.cost) || 0), 0);

  const handleSave = async () => {
    if (!vehicleId) {
      alert("No vehicle selected");
      return;
    }
    setIsProcessing(true);
    try {
      const validItems = items.filter(i => i.itemName && i.cost);
      
      const payload = {
        record: {
          odometerAtService: odometer,
          workshopName: workshopName,
          totalCost: grandTotal
        },
        items: validItems
      };
      
      const response = await fetchApi(`/services/vehicle/${vehicleId}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (response.success) {
        navigate(`/history?vehicleId=${vehicleId}`);
      }
    } catch (error) {
      console.error("Gagal mencatat servis", error);
      alert("Gagal mencatat servis");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-primary-container selection:text-[#ffffff]">
      {/* Decorative Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary-container/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-secondary-container/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Header (Transactional) */}
      <header className="relative z-50 flex justify-between items-center px-container-padding-mobile h-16 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-[0_0_15px_rgba(255,107,0,0.05)] md:px-container-padding-desktop">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Close" 
          className="text-on-surface-variant hover:text-primary transition-opacity active:scale-95 flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-white/5"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
        </button>
        <h1 className="font-title-md text-title-md text-on-surface tracking-wide">Catat Servis</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex-grow px-container-padding-mobile pt-stack-lg pb-[120px] md:px-container-padding-desktop max-w-3xl md:mx-auto w-full flex flex-col gap-stack-lg">
        {/* Input Fields Group */}
        <section className="flex flex-col gap-gutter">
          {/* Odometer Input */}
          <div className="flex flex-col gap-stack-sm">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest pl-1">Current Odometer (km)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70" style={{ fontVariationSettings: "'FILL' 0" }}>speed</span>
              <input 
                className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 pl-12 pr-4 font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-primary-container input-glow transition-all" 
                placeholder="e.g. 15000" 
                type="number" 
                value={odometer}
                onChange={e => setOdometer(e.target.value)}
              />
            </div>
          </div>
          {/* Workshop Name Input */}
          <div className="flex flex-col gap-stack-sm">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest pl-1">Workshop Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70" style={{ fontVariationSettings: "'FILL' 0" }}>home_repair_service</span>
              <input 
                className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 pl-12 pr-4 font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-primary-container input-glow transition-all" 
                placeholder="Enter workshop name" 
                type="text" 
                value={workshopName}
                onChange={e => setWorkshopName(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Line Items Section */}
        <section className="glass-card rounded-xl p-5 flex flex-col gap-stack-md">
          <h2 className="font-title-md text-title-md text-on-surface border-b border-white/10 pb-3 mb-1">Rincian Pengerjaan</h2>
          <ul className="flex flex-col gap-3">
            {items.map((item, index) => (
              <li key={index} className="flex flex-col gap-2 bg-surface-container-low/50 border border-white/5 rounded-lg p-3 group hover:border-white/10 transition-colors">
                <div className="flex justify-between items-center w-full gap-2">
                  <input 
                    placeholder="Nama Item" 
                    className="flex-1 bg-transparent border-b border-white/20 px-1 py-1 text-on-surface focus:outline-none focus:border-primary"
                    value={item.itemName}
                    onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                  />
                  <input 
                    placeholder="Biaya" 
                    type="number"
                    className="w-32 bg-transparent border-b border-white/20 px-1 py-1 text-on-surface-variant focus:outline-none focus:border-primary text-right"
                    value={item.cost}
                    onChange={(e) => updateItem(index, 'cost', e.target.value)}
                  />
                  <button onClick={() => removeItem(index)} className="text-error opacity-60 hover:opacity-100">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {/* Add Button */}
          <button onClick={handleAddItem} className="mt-2 w-full border border-dashed border-white/20 rounded-lg py-3 flex items-center justify-center gap-2 text-primary hover:bg-primary-container/10 hover:border-primary-container/50 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Tambah Pengerjaan</span>
          </button>
        </section>

        {/* Grand Total Section */}
        <section className="glass-card rounded-xl p-5 flex justify-between items-end border-l-4 border-l-primary-container relative overflow-hidden">
          {/* Subtle gradient background for emphasis */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Grand Total</span>
            <span className="font-body-sm text-body-sm text-surface-tint">{items.length} Items</span>
          </div>
          <div className="relative z-10 font-headline-lg-mobile text-headline-lg-mobile text-primary-container tracking-tight">
            Rp {grandTotal.toLocaleString()}
          </div>
        </section>

        {/* Upload Document Section */}
        <section className="flex flex-col gap-stack-sm mt-2">
          <button className="w-full glass-card rounded-xl py-6 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors group">
            <div className="w-14 h-14 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/50 transition-all shadow-lg shadow-black/50">
              <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 0" }}>photo_camera</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-title-md text-title-md text-on-surface">Unggah Nota</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Tap to open camera</span>
            </div>
          </button>
        </section>
      </main>

      {/* Fixed Footer Action */}
      <footer className="fixed bottom-0 left-0 w-full p-container-padding-mobile pb-8 bg-gradient-to-t from-background via-background/90 to-transparent z-50 md:px-container-padding-desktop pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <button 
            onClick={handleSave}
            disabled={isProcessing}
            className="w-full bg-primary-container text-[#ffffff] font-title-md text-title-md rounded-xl py-4 flex items-center justify-center gap-2 led-shadow-primary hover:bg-[#ff7a1f] active:scale-[0.98] transition-all relative overflow-hidden group disabled:opacity-50"
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none mix-blend-overlay group-hover:border-white/40 transition-colors"></div>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            <span className="tracking-wide">{isProcessing ? 'MENYIMPAN...' : 'SIMPAN'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
