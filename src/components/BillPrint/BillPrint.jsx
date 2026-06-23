/**
 * POS Receipt Print Utility for Request Payment Tab (Customer Bill)
 *
 * Paper width : 74 mm
 * Printable   : ~70 mm
 */

export function printOrderBillReceipt(order, shopInfo = {}) {
  if (!order) return;

  const baseApiUrl = import.meta.env.VITE_BASE_URL || 'https://e-restaurant-api.mobios.lk/api/v1';
  const logoUrl = shopInfo.logo ? `${baseApiUrl}/media/${shopInfo.logo}?type=profile` : '';
  const shopName = shopInfo.name || order.shopName || 'BURLEY\'S';
  const shopAddress = shopInfo.address || order.shopAddress || 'Malabe, Sri Lanka';
  const shopPhone = shopInfo.contact || order.shopPhone || '+94113698899';
  const isReprint = order.status === 'COMPLETED';

  // Extract date & time
  const createdAtVal = order.createdAt || order.raw?.created_datetime || order.raw?.created_at;
  let dateStr = '';
  let timeStr = '';
  if (createdAtVal) {
    const orderDate = new Date(createdAtVal);
    if (!Number.isNaN(orderDate.getTime())) {
      dateStr = new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(orderDate);
      timeStr = orderDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    }
  }

  // Extract customer name
  const customerName = order.customerName || order.raw?.user?.name || order.raw?.user?.f_name || 'Walk-in Customer';

  // Extract total amount
  const totalAmount = order.total || 0;

  // ── 1. Create a hidden iframe ──────────────────────────────────────
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = '74mm';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    console.error('[printReceipt] Could not access iframe document.');
    document.body.removeChild(iframe);
    return;
  }

  // ── 2. Build the print document ────────────────────────────────────
  iframeDoc.open();
  iframeDoc.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>POS Receipt</title>
  <style>
    @page {
      size: 74mm auto;
      margin: 0mm 2mm;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border: none;
    }

    html, body {
      width: 74mm;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Receipt wrapper ── */
    .receipt-root {
      width: 70mm;
      max-width: 70mm;
      margin: 0 auto;
      padding: 2mm 0;
      font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #000;
    }

    /* ── Typography ── */
    h1              { font-size: 16px; font-weight: 800; margin: 0; text-align: center; }
    .text-center    { text-align: center; }
    .text-right     { text-align: right; }
    .text-left      { text-align: left; }
    .font-bold      { font-weight: 700; }
    .font-semibold  { font-weight: 600; }
    .font-medium    { font-weight: 500; }
    .font-extrabold { font-weight: 800; }
    .uppercase      { text-transform: uppercase; }
    .tracking-wide  { letter-spacing: 0.05em; }
    .tracking-widest { letter-spacing: 0.12em; }

    /* Font sizes */
    .text-base         { font-size: 14px; }
    .text-sm           { font-size: 12px; }
    .text-xs           { font-size: 10px; }
    .text-lg           { font-size: 18px; }

    /* ── Colors ── */
    .text-gray-600     { color: #444; }
    .text-gray-500     { color: #666; }

    /* ── Layout ── */
    .flex              { display: flex; }
    .flex-col          { display: flex; flex-direction: column; }
    .justify-between   { justify-content: space-between; }
    .items-start       { align-items: flex-start; }
    .items-center      { align-items: center; }

    /* Column widths for item rows */
    .w-\\[50\\%\\]     { width: 50%; flex-shrink: 0; }
    .w-\\[12\\%\\]     { width: 12%; flex-shrink: 0; }
    .w-\\[18\\%\\]     { width: 18%; flex-shrink: 0; }
    .w-\\[20\\%\\]     { width: 20%; flex-shrink: 0; }

    @media print {
      html, body {
        width: 74mm;
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-root">
    ${logoUrl ? `<img src="${logoUrl}" style="max-height: 12mm; display: block; margin: 0 auto 2mm; object-fit: contain;" />` : ''}
    <h1>${shopName}</h1>
    <div class="text-center text-xs text-gray-600" style="margin-bottom: 0.5mm;">${shopAddress}</div>
    <div class="text-center text-xs text-gray-600">Tel: ${shopPhone}</div>
    
    <div style="border-bottom: 1px dashed #000; margin: 2mm 0;"></div>
    
    <div class="flex justify-between text-xs py-0.5">
      <span class="text-gray-500">Date/Time:</span>
      <span class="font-medium">${dateStr} ${timeStr}</span>
    </div>
    <div class="flex justify-between text-xs py-0.5">
      <span class="text-gray-500">Bill Ref:</span>
      <span class="font-bold">#${order.orderNumber}</span>
    </div>
    <div class="flex justify-between text-xs py-0.5">
      <span class="text-gray-500">Customer:</span>
      <span class="font-medium">${customerName}</span>
    </div>
    <div class="flex justify-between text-xs py-0.5">
      <span class="text-gray-500">Staff:</span>
      <span class="font-medium">Steward: Owner</span>
    </div>

    ${isReprint ? `<div class="text-center font-extrabold text-sm uppercase tracking-widest" style="margin-bottom: 2mm; border: 1.5px solid #000; padding: 1mm 0;">*** REPRINT ***</div>` : ''}
        
    <div style="border-bottom: 1.5px solid #000; margin: 2mm 0;"></div>
    
    <div class="flex justify-between font-bold text-xs" style="padding-bottom: 1mm;">
      <span class="w-\\[50\\%\\] text-left">ITEM DESCRIPTION</span>
      <span class="w-\\[12\\%\\] text-center">QTY</span>
      <span class="w-\\[18\\%\\] text-right">PRICE</span>
      <span class="w-\\[20\\%\\] text-right">TOTAL</span>
    </div>
    
    <div style="border-bottom: 1px solid #000; margin-bottom: 2mm;"></div>

    <div class="flex-col">
      ${order.items.map(item => `
        <div style="margin-bottom: 1.5mm;">
          <div class="flex justify-between items-start text-xs leading-tight">
            <span class="w-\\[50\\%\\] font-semibold text-left" style="word-break: break-word;">${item.name}</span>
            <span class="w-\\[12\\%\\] text-center font-medium">${item.quantity}</span>
            <span class="w-\\[18\\%\\] text-right text-gray-500">${Number(item.price).toFixed(2)}</span>
            <span class="w-\\[20\\%\\] text-right font-bold">${Number(item.price * item.quantity).toFixed(2)}</span>
          </div>
          ${item.note ? `<div class="text-[9px] text-gray-500" style="margin-left: 3mm; font-style: italic; margin-top: 0.5mm;">↳ * ${item.note}</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div style="border-bottom: 1px dashed #000; margin: 2mm 0;"></div>
    
    <div class="flex justify-between text-xs py-0.5">
      <span class="text-gray-500">Sub Total</span>
      <span class="font-semibold">${Number(totalAmount).toFixed(2)}</span>
    </div>
    
    <div class="flex justify-between items-center" style="border-top: 1.5px double #000; border-bottom: 1.5px double #000; margin: 2.5mm 0; padding: 2mm 0;">
      <span class="font-extrabold text-sm" style="font-size: 13px;">NET TOTAL</span>
      <span class="font-extrabold text-base" style="font-size: 16px;">LKR ${Number(totalAmount).toFixed(2)}</span>
    </div>

    <div class="flex justify-between text-xs py-0.5">
      <span class="uppercase text-gray-500">PAID VIA (${order.paymentMethod || 'CASH'})</span>
      <span class="font-bold">${Number(totalAmount).toFixed(2)}</span>
    </div>
    
    <div class="text-[10px] text-gray-500" style="margin-top: 2.5mm; text-align: center;">
      Total Items: ${order.items.length} &nbsp;&nbsp;|&nbsp;&nbsp; Total Units: ${order.items.reduce((sum, item) => sum + Number(item.quantity), 0)}
    </div>
    
    <div style="border-bottom: 1px dashed #000; margin: 2mm 0;"></div>
    
    <div class="text-center font-bold text-xs uppercase tracking-wide" style="margin: 2mm 0 1mm;">
      Thank You, Come Again!
    </div>
  </div>
</body>
</html>
  `);
  iframeDoc.close();

  // ── 3. Trigger print ──────────────────────────────────────────────
  iframe.onload = () => {
    triggerPrint();
  };

  // Fallback: if onload already fired
  setTimeout(triggerPrint, 500);

  let printed = false;
  function triggerPrint() {
    if (printed) return;
    printed = true;

    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('[printReceipt] Print failed:', err);
    }

    // Clean up after print dialog closes
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }
}
 