import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return canvas.toDataURL('image/jpeg', 0.9);
};

export default function PhotoCrop({ children, onCropDone, aspect = 1, circular = false }) {
  const fileInputRef = useRef(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels || !cropSrc) return;
    try {
      const cropped = await getCroppedImg(cropSrc, croppedAreaPixels);
      onCropDone(cropped);
      setCropSrc(null);
    } catch (e) {
      console.error('Crop failed', e);
    }
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
        {children}
      </div>

      {cropSrc && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          <div className="relative flex-1">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={circular ? 'round' : 'rect'}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="bg-black/90 px-4 py-4 pb-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white/60">zoom_out</span>
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-primary-container" />
              <span className="material-symbols-outlined text-white/60">zoom_in</span>
            </div>
            <div className="flex gap-3">
              <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl bg-primary-container text-white font-body-lg">Pilih</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
