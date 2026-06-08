import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

// Punktga jo'natish yorlig'i (label) — Ssmart logo + QR + mahsulot kodi +
// buyurtmachi ismi + punkt nomi/manzili. Printerga to'g'ridan-to'g'ri chop etish
// uchun tayyor PDF. O'lcham: 80×120mm; yon tomonlarda oq joy (PAD) qoldiriladi,
// kod esa enga moslab (auto-fit) chiziladi — siqilib/kesilib qolmasligi uchun.

const LABEL_W = 80;
const LABEL_H = 120;
const PAD = 7;                       // yon tomonlardagi oq joy (mm)
const CONTENT_W = LABEL_W - PAD * 2; // matn/QR uchun foydali kenglik

const PT_TO_MM = 0.3528;

// Rasmni (logo) <img> orqali yuklash — addImage HTMLImageElement'ni qabul qiladi,
// shu bilan birga tabiiy o'lchamlarini (nisbat) ham olamiz.
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function generateTransitLabelPdf({
  code,
  customerName = '',
  pointName = '',
  pointAddress = '',
}) {
  if (!code) throw new Error("Mahsulot kodi yo'q");

  // QR — mahsulot (transit) kodini kodlaydi; punkt admini skaner qilib qabul qiladi.
  const qrDataUrl = await QRCode.toDataURL(String(code), {
    margin: 1,
    width: 600,
    errorCorrectionLevel: 'M',
  });

  const doc = new jsPDF({ unit: 'mm', format: [LABEL_W, LABEL_H] });
  const cx = LABEL_W / 2;
  let y = 7;

  // Ssmart logo — yuqorida, markazda (yuklab bo'lmasa yorliq logosiz davom etadi)
  try {
    const logo = await loadImage('/logo.png');
    const lw = 36;
    const lh = (lw * logo.height) / logo.width;
    doc.addImage(logo, 'PNG', cx - lw / 2, y, lw, lh);
    y += lh + 4;
  } catch {
    y += 2;
  }

  // QR rasmi — markazda
  const qrSize = 44;
  doc.addImage(qrDataUrl, 'PNG', cx - qrSize / 2, y, qrSize, qrSize);
  y += qrSize + 7;

  // Mahsulot kodi — 4 talikka bo'lib ("1234 5678"), enga moslab kattalashtiriladi
  const grouped = String(code).replace(/(.{4})(?=.)/g, '$1 ');
  doc.setFont('courier', 'bold');
  let codeSize = 30;
  doc.setFontSize(codeSize);
  while (doc.getTextWidth(grouped) > CONTENT_W && codeSize > 8) {
    codeSize -= 1;
    doc.setFontSize(codeSize);
  }
  doc.text(grouped, cx, y, { align: 'center' });
  y += codeSize * PT_TO_MM + 5;

  // Buyurtmachi ismi
  if (customerName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(`Mijoz: ${customerName}`, CONTENT_W);
    doc.text(lines, cx, y, { align: 'center' });
    y += lines.length * 5 + 2;
  }

  // Punkt nomi
  if (pointName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(pointName), CONTENT_W);
    doc.text(lines, cx, y, { align: 'center' });
    y += lines.length * 4.6;
  }

  // Punkt manzili
  if (pointAddress) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(String(pointAddress), CONTENT_W);
    doc.text(lines, cx, y, { align: 'center' });
  }

  doc.save(`yorliq-${code}.pdf`);
}
