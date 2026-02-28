/**
 * InvoicePreview.jsx
 * Client-side printable/downloadable invoice.
 * Shown after successful payment on the success screen.
 * Uses window.print() with @media print styles.
 */
import { useRef } from 'react';
import { CONTACT_CONFIG } from '../config/contactConfig';

const COMPANY = {
  name:    'BuildMart Pvt. Ltd.',
  tagline: 'Premium Building Materials Supplier',
  address: '12 Industrial Layout, Peenya Industrial Area',
  city:    'Bangalore, Karnataka 560058',
  phone:   CONTACT_CONFIG.phone    || '+91 98765 43210',
  email:   CONTACT_CONFIG.email?.sales || 'sales@buildmart.in',
  website: 'https://buildmart.in',
};

const fmtINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');
const today  = () => new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

export default function InvoicePreview({ orderId, paymentId, customer, items, pricing, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=1100');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${orderId} — BuildMart</title>
        <meta charset="utf-8"/>
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#fff}
          .invoice-wrap{max-width:700px;margin:0 auto;padding:32px}
          .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
          .brand{font-size:28px;font-weight:900;color:#FDB913;letter-spacing:-0.5px}
          .brand-tag{font-size:10px;color:#6b7280;margin-top:2px}
          .inv-title{text-align:right}
          .inv-title h2{font-size:22px;font-weight:900;text-transform:uppercase;color:#111}
          .inv-title p{font-size:10px;color:#6b7280;margin-top:2px}
          .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-bottom:20px}
          .meta-label{font-size:9px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;font-weight:700}
          .meta-val{font-size:12px;font-weight:700;color:#111;margin-top:1px}
          .section-title{font-size:9px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;font-weight:700;margin-bottom:6px}
          .bill-to{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:20px}
          .bill-name{font-size:14px;font-weight:800;color:#111}
          .bill-detail{font-size:11px;color:#374151;margin-top:3px}
          table{width:100%;border-collapse:collapse;margin-bottom:0}
          thead tr{background:#1a1a1a;color:#fff}
          thead th{padding:8px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
          thead th:last-child,thead th:nth-child(4),thead th:nth-child(5){text-align:right}
          tbody tr:nth-child(even){background:#f9fafb}
          tbody td{padding:8px 10px;font-size:11px;border-bottom:1px solid #f3f4f6}
          tbody td:last-child,tbody td:nth-child(4),tbody td:nth-child(5){text-align:right;font-weight:600}
          .totals{display:flex;justify-content:flex-end;margin-top:12px}
          .totals-box{width:260px}
          .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6}
          .total-row.grand{background:#1a1a1a;color:#FDB913;font-weight:900;font-size:14px;padding:10px 12px;border-radius:6px;margin-top:4px;border:none}
          .pay-info{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px 12px;margin-top:10px;font-size:10px;color:#166534}
          .footer{text-align:center;margin-top:28px;padding-top:16px;border-top:2px solid #FDB913}
          .footer-msg{font-size:13px;font-weight:700;color:#111;margin-bottom:4px}
          .footer-sub{font-size:10px;color:#6b7280}
          @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}thead tr{-webkit-print-color-adjust:exact}}
        </style>
      </head>
      <body><div class="invoice-wrap">${content}</div></body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };

  const subtotal      = pricing?.subtotal      || 0;
  const deliveryCharge= pricing?.deliveryCharge || 0;
  const grandTotal    = pricing?.grandTotal     || 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

        {/* Modal toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-black text-gray-900 text-lg">Invoice Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Print / Download PDF
            </button>
            <button onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Invoice content (printable) */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div ref={printRef}>

            {/* ── HEADER ── */}
            <div className="header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
              <div>
                <div className="brand" style={{ fontSize:'24px', fontWeight:900, color:'#FDB913', letterSpacing:'-0.5px', fontFamily:'Arial Black, sans-serif' }}>BUILDMART</div>
                <div className="brand-tag" style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }}>{COMPANY.tagline}</div>
                <div style={{ fontSize:'10px', color:'#374151', marginTop:'6px', lineHeight:'1.6' }}>
                  {COMPANY.address}<br/>{COMPANY.city}<br/>
                  {COMPANY.phone} · {COMPANY.email}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'22px', fontWeight:900, textTransform:'uppercase', color:'#111', fontFamily:'Arial Black, sans-serif' }}>INVOICE</div>
                <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'3px' }}>Invoice No: <strong>{orderId}</strong></div>
                <div style={{ fontSize:'10px', color:'#6b7280' }}>Date: <strong>{today()}</strong></div>
              </div>
            </div>

            {/* ── META ── */}
            <div className="meta-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'12px', marginBottom:'16px' }}>
              <div>
                <div className="meta-label" style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', fontWeight:700 }}>Order ID</div>
                <div className="meta-val" style={{ fontWeight:700, color:'#111', fontFamily:'monospace' }}>{orderId}</div>
              </div>
              <div>
                <div className="meta-label" style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', fontWeight:700 }}>Payment Status</div>
                <div className="meta-val" style={{ fontWeight:800, color:'#059669', fontSize:'13px' }}>✓ PAID</div>
              </div>
              <div>
                <div className="meta-label" style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', fontWeight:700 }}>Payment ID</div>
                <div className="meta-val" style={{ fontWeight:700, color:'#111', fontFamily:'monospace', fontSize:'10px' }}>{paymentId || 'N/A'}</div>
              </div>
              <div>
                <div className="meta-label" style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', fontWeight:700 }}>Delivery Type</div>
                <div className="meta-val" style={{ fontWeight:700, color:'#111' }}>{customer?.deliveryType || 'Site Delivery'}</div>
              </div>
            </div>

            {/* ── BILL TO ── */}
            <div className="section-title" style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', fontWeight:700, marginBottom:'6px' }}>Bill To</div>
            <div className="bill-to" style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'8px', padding:'10px 12px', marginBottom:'16px' }}>
              <div className="bill-name" style={{ fontSize:'14px', fontWeight:800, color:'#111' }}>{customer?.name || 'Customer'}</div>
              <div className="bill-detail" style={{ fontSize:'11px', color:'#374151', marginTop:'3px' }}>
                📞 {customer?.phone || 'N/A'} &nbsp; ✉ {customer?.email || 'N/A'}
              </div>
              {customer?.address && (
                <div className="bill-detail" style={{ fontSize:'11px', color:'#374151', marginTop:'2px' }}>
                  📍 {customer.address}{customer.area ? ', ' + customer.area : ''}
                </div>
              )}
            </div>

            {/* ── ITEMS TABLE ── */}
            <div className="section-title" style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', fontWeight:700, marginBottom:'6px' }}>Products Ordered</div>
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'0', fontSize:'11px' }}>
              <thead>
                <tr style={{ background:'#1a1a1a', color:'#fff' }}>
                  <th style={{ padding:'8px 10px', textAlign:'left', fontWeight:700, textTransform:'uppercase', fontSize:'10px' }}>#</th>
                  <th style={{ padding:'8px 10px', textAlign:'left', fontWeight:700, textTransform:'uppercase', fontSize:'10px' }}>Product</th>
                  <th style={{ padding:'8px 10px', textAlign:'left', fontWeight:700, textTransform:'uppercase', fontSize:'10px' }}>Category</th>
                  <th style={{ padding:'8px 10px', textAlign:'right', fontWeight:700, textTransform:'uppercase', fontSize:'10px' }}>Unit Price</th>
                  <th style={{ padding:'8px 10px', textAlign:'right', fontWeight:700, textTransform:'uppercase', fontSize:'10px' }}>Qty</th>
                  <th style={{ padding:'8px 10px', textAlign:'right', fontWeight:700, textTransform:'uppercase', fontSize:'10px' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(items || []).map((item, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff' }}>
                    <td style={{ padding:'8px 10px', borderBottom:'1px solid #f3f4f6', color:'#6b7280' }}>{i + 1}</td>
                    <td style={{ padding:'8px 10px', borderBottom:'1px solid #f3f4f6', fontWeight:600 }}>{item.name || item.productName}</td>
                    <td style={{ padding:'8px 10px', borderBottom:'1px solid #f3f4f6', color:'#6b7280' }}>{item.category}</td>
                    <td style={{ padding:'8px 10px', borderBottom:'1px solid #f3f4f6', textAlign:'right' }}>{fmtINR(item.basePrice || item.unitPrice)}</td>
                    <td style={{ padding:'8px 10px', borderBottom:'1px solid #f3f4f6', textAlign:'right' }}>{item.quantity} {item.unit}</td>
                    <td style={{ padding:'8px 10px', borderBottom:'1px solid #f3f4f6', textAlign:'right', fontWeight:700 }}>
                      {fmtINR((item.basePrice || item.unitPrice || 0) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── TOTALS ── */}
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'12px' }}>
              <div style={{ width:'240px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#374151', borderBottom:'1px solid #f3f4f6' }}>
                  <span>Subtotal</span><span style={{ fontWeight:600 }}>{fmtINR(subtotal)}</span>
                </div>
                {deliveryCharge > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#374151', borderBottom:'1px solid #f3f4f6' }}>
                    <span>Delivery Charge</span><span style={{ fontWeight:600 }}>{fmtINR(deliveryCharge)}</span>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', background:'#1a1a1a', color:'#FDB913', fontWeight:900, fontSize:'14px', borderRadius:'6px', marginTop:'4px' }}>
                  <span>Grand Total</span><span>{fmtINR(grandTotal)}</span>
                </div>
                {paymentId && (
                  <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'6px', padding:'8px 10px', marginTop:'8px', fontSize:'10px', color:'#166534' }}>
                    <div style={{ fontWeight:700 }}>✓ Payment Confirmed</div>
                    <div style={{ marginTop:'2px', fontFamily:'monospace', fontSize:'9px' }}>ID: {paymentId}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{ textAlign:'center', marginTop:'24px', paddingTop:'16px', borderTop:'2px solid #FDB913' }}>
              <div style={{ fontWeight:700, fontSize:'13px', color:'#111', marginBottom:'4px' }}>
                Thank you for your business! Materials will be delivered as per schedule.
              </div>
              <div style={{ fontSize:'10px', color:'#6b7280' }}>
                For support: {COMPANY.phone} &nbsp;·&nbsp; {COMPANY.email} &nbsp;·&nbsp; {COMPANY.website}
              </div>
              <div style={{ fontSize:'9px', color:'#d1d5db', marginTop:'8px' }}>
                This is a computer-generated invoice and does not require a physical signature.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
