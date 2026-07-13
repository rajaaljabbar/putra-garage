import { jsPDF } from 'jspdf';

/**
 * Convert image URL to base64 data URL
 */
async function urlToBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try { resolve(canvas.toDataURL('image/jpeg', 0.85)); }
      catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Draw header row */
function drawHeader(doc, x, y, colW, h, cells) {
  const totalW = colW.reduce((a, b) => a + b, 0);
  doc.setFillColor(234, 88, 12);
  doc.rect(x, y, totalW, h, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  let cx = x;
  for (let i = 0; i < cells.length; i++) {
    doc.rect(cx, y, colW[i], h, 'S');
    doc.text(String(cells[i]), cx + colW[i] / 2, y + h / 2, { align: 'center', baseline: 'middle' });
    cx += colW[i];
  }
  return y + h;
}

/** Draw data row */
function drawRow(doc, x, y, colW, h, cells, alt) {
  const totalW = colW.reduce((a, b) => a + b, 0);
  doc.setFillColor(alt ? 250 : 255, alt ? 250 : 255, alt ? 250 : 255);
  doc.rect(x, y, totalW, h, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);

  let cx = x;
  for (let i = 0; i < cells.length; i++) {
    doc.rect(cx, y, colW[i], h, 'S');
    // Header already center; data rows: No=center, Tanggal/Kategori/Detail=left, Odometer/Harga=right
    const isCenter = i === 0;
    const isRight = i >= 4;
    const align = isCenter ? 'center' : (isRight ? 'right' : 'left');
    const padX = isRight ? cx + colW[i] - 1 : (isCenter ? cx + colW[i] / 2 : cx + 1);
    doc.text(String(cells[i]), padX, y + h / 2, { align, baseline: 'middle' });
    cx += colW[i];
  }
  return y + h;
}

/**
 * Generate PDF history for a vehicle
 */
export async function generateHistoryPDF(vehicle, services, serviceCategories) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  // ── Header ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(234, 88, 12);
  doc.text('IGNITION', margin, y);
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Riwayat Servis \u2014 ${vehicle?.name || 'Kendaraan'} (${vehicle?.licensePlate || '-'})`, margin, y);
  y += 5;
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Summary ──
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total Servis: ${services.length} kali`, margin, y);
  y += 4;
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y);
  y += 6;

  // ── Table ──
  const colWidths = [8, 24, 20, 68, 24, 38];
  const rowH = 10;

  if (y + rowH > 270) { doc.addPage(); y = margin; }
  y = drawHeader(doc, margin, y, colWidths, rowH, ['No', 'Tanggal', 'Kategori', 'Detail', 'Odometer', 'Harga']);

  let lastTableY = y;
  services.forEach((svc, i) => {
    if (y + rowH > 275) { doc.addPage(); y = margin; }
    const cats = serviceCategories[svc.id] || [];
    const mainCat = cats[0] || '-';
    const d = new Date(svc.serviceDate);
    const dateStr = `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
    const odo = svc.odometerAtService > 0 ? `${svc.odometerAtService.toLocaleString()} km` : (mainCat === 'Grooming' ? '-' : '0 km');
    const items = cats.join(', ') || svc.workshopName;
    const detail = items.length > 35 ? items.slice(0, 33) + '..' : items;
    const price = `Rp ${parseFloat(svc.totalCost).toLocaleString('id-ID')}`;
    y = drawRow(doc, margin, y, colWidths, rowH, [i + 1, dateStr, mainCat, detail, odo, price], i % 2 === 0);
    lastTableY = y;
  });

  // ── Receipt Images (1/4 Folio = ~52mm x 82mm) ──
  const receiptServices = services.filter(s => s.receiptImageUrl);
  if (receiptServices.length > 0) {
    y = lastTableY + 8;
    if (y > 180) { doc.addPage(); y = margin; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(234, 88, 12);
    doc.text('Nota / Receipt', margin, y);
    y += 6;

    const receiptW = 52;
    const receiptH = 82;
    const gap = 6;
    let x = margin;

    for (const svc of receiptServices) {
      if (!svc.receiptImageUrl) continue;
      const dataUrl = await urlToBase64(svc.receiptImageUrl);
      if (!dataUrl) continue;

      if (x + receiptW > pageW - margin) {
        x = margin;
        y += receiptH + gap + 8;
        if (y + receiptH > 270) { doc.addPage(); y = margin; }
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 100, 100);
      const d = new Date(svc.serviceDate);
      doc.text(`${svc.workshopName} \u2014 ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, x, y);
      doc.addImage(dataUrl, 'JPEG', x, y + 2, receiptW, receiptH);
      x += receiptW + gap;
    }
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Putra Garage \u2014 Halaman ${i} dari ${pageCount}`, pageW / 2, 290, { align: 'center' });
  }

  // ── Save ──
  const fileName = `riwayat-${(vehicle?.name || 'kendaraan').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
