// import React, { useEffect, useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faChevronRight,
//   faEdit,
//   faTrash,
//   faPrint,
//   faMoneyBillWave,
//   faRoute,
//   faExternalLinkAlt,
//   faUsers,
//   faIdCard,
//   faClock,
//   faCalendarAlt,
//   faMapMarkerAlt,
//   faTag,
//   faUserCircle,
//   faPhone,
//   faEnvelope,
//   faBuilding,
//   faUniversity,
//   faCreditCard,
//   faHashtag,
//   faBox,
//   faCheckCircle,
//   faBan
// } from "@fortawesome/free-solid-svg-icons";
// import api from "../../services/api";
// import { API_CONFIG } from "../../constants/config";
// import { formatDate } from "../../utils/dateUtils";
// import SuccessModal from "../SuccessModal";
// import DeleteConfirmModal from "../DeleteConfirmModal";
// import "./BookingDetails.new.css";
// const logoSrc = '/assets/images/logo.png';

// const getImageUrl = (imagePath) => {
//   if (!imagePath) return "/assets/images/default-avatar.png";
//   if (imagePath.startsWith("http")) return imagePath;
//   return `${API_CONFIG.BASE_URL}${imagePath}`;
// };

// const getTripImageUrl = (imagePath) => {
//   if (!imagePath) return "/assets/images/default-trip.png";
//   if (imagePath.startsWith("http")) return imagePath;
//   return `${API_CONFIG.BASE_URL}${imagePath}`;
// };

// const formatTime = (time) => {
//   if (!time) return "-";
//   try {
//     let t = time.includes(" ") ? time.split(" ")[1] : time;
//     if (t.includes(".")) t = t.split(".")[0];
//     const [hh, mm] = t.split(":");
//     const h = parseInt(hh, 10);
//     const ampm = h >= 12 ? "م" : "ص";
//     const display = h % 12 || 12;
//     return `${display}:${mm} ${ampm}`;
//   } catch {
//     return time;
//   }
// };

// const extractDateFromDateTime = (dt) => (dt && dt.includes(" ") ? dt.split(" ")[0] : dt);

// const statusMap = {
//   "Provider Pending": { text: "في انتظار المزود", tone: "warn", icon: faClock },
//   "Pending Payment": { text: "في انتظار الدفع", tone: "warn", icon: faClock },
//   Paid: { text: "مدفوع", tone: "info", icon: faCheckCircle },
//   Completed: { text: "مكتمل", tone: "success", icon: faCheckCircle },
//   Canceled: { text: "ملغي", tone: "danger", icon: faBan }
// };

// export default function BookingDetails({ bookingId, onBack, onEdit, onViewCustomer, onViewProvider, onViewTrip }) {
//   const [booking, setBooking] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [successModal, setSuccessModal] = useState({ isVisible: false, message: "" });
//   const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

//   useEffect(() => {
//     const fetchBooking = async () => {
//       try {
//         setLoading(true);
//         const { data } = await api.get(`/api/admin/bookings/${bookingId}`);
//         setBooking(data);
//       } catch {
//         setError("فشل في تحميل تفاصيل الحجز");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBooking();
//   }, [bookingId]);



//   //now color with fields and wider columns
//   const printExcelStyle = (logoSrc = "") => {
//     if (!booking) return;

//     const pop = window.open('about:blank', '_blank');   // no features string
//     const popAllowed = !!pop;

//     // ---------- helpers ----------
//     const safe = (v) => (v === 0 || v ? String(v) : "-");
//     const val = (v, suf = "") => (v === 0 || v ? `${v}${suf}` : "-");
//     const firstChar = (name) => (name && String(name).trim()[0]) || "•";

//     const fmtDate = (d) => (typeof formatDate === "function" ? formatDate(d) : safe(d));
//     const onlyDate = (dt) => (dt && dt.includes(" ") ? dt.split(" ")[0] : dt || "-");
//     const fmtTime = (t) => {
//       if (typeof formatTime === "function") return formatTime(t);
//       if (!t) return "-";
//       let ts = t.includes(" ") ? t.split(" ")[1] : t;
//       if (ts.includes(".")) ts = ts.split(".")[0];
//       const [hh, mm] = ts.split(":");
//       const h = parseInt(hh, 10);
//       const ampm = h >= 12 ? "م" : "ص";
//       const display = h % 12 || 12;
//       return `${display}:${mm} ${ampm}`;
//     };

//     const statusTextMap = {
//       "Provider Pending": "في انتظار المزود",
//       "Pending Payment": "في انتظار الدفع",
//       Paid: "مدفوع",
//       Completed: "مكتمل",
//       Canceled: "ملغي",
//     };
//     const statusTone = (s) => {
//       switch (s) {
//         case "Provider Pending":
//         case "Pending Payment": return "warn";
//         case "Paid": return "info";
//         case "Completed": return "ok";
//         case "Canceled": return "bad";
//         default: return "muted";
//       }
//     };

//     // Trip image (first)
//     const tripImages = booking.trip?.images
//       ? String(booking.trip.images).split(",").map(s => s.trim()).filter(Boolean)
//       : [];
//     const firstTripImage = tripImages[0]
//       ? (tripImages[0].startsWith("http") ? tripImages[0] : `${API_CONFIG.BASE_URL}${tripImages[0]}`)
//       : "";

//     // Parse add-ons safely
//     let addOns = [];
//     try {
//       if (Array.isArray(booking.addOns)) addOns = booking.addOns;
//       else if (typeof booking.addOns === "string") addOns = JSON.parse(booking.addOns || "[]");
//     } catch { }

//     const nowStr = new Date().toLocaleString("ar-SA");
//     const startTimeStr = fmtTime(booking.startTime);
//     const endTimeStr = fmtTime(booking.endTime);
//     const startDateStr = fmtDate(onlyDate(booking.startTime));
//     const endDateStr = fmtDate(onlyDate(booking.endTime));
//     const createdStr = fmtDate(booking.createdAt);
//     const bookingDate = fmtDate(booking.bookingDate);

//     // Small avatar src/placeholder
//     const u = booking.user || {};
//     const p = booking.provider || {};

//     const providerName = safe(p.fullName || p.userName || "");
//     const fileBase = `${'حجز رقم '}${safe(booking.id)}-${providerName
//       .replace(/[\\/:*?"<>|]/g, "")
//       .replace(/\s+/g, " ")
//       }`.trim();

//     console.log("file base name: ", fileBase)
//     const userImg = u.profileImage ? (u.profileImage.startsWith("http") ? u.profileImage : `${API_CONFIG.BASE_URL}${u.profileImage}`) : "";
//     const provImg = p.profileImage ? (p.profileImage.startsWith("http") ? p.profileImage : `${API_CONFIG.BASE_URL}${p.profileImage}`) : "";

//     // ---------- HTML ----------
//     const html = `
// <!DOCTYPE html>
// <html dir="rtl" lang="ar">
// <head>
// <meta charset="utf-8" />
// <title>${fileBase}</title>

// <style>
//   /* Palette */
//   :root{
//     --accent:#0ea5a4;
//     --ink:#111827;
//     --muted:#6b7280;
//     --grid:#d1d5db;
//     --th:#eef2f7;
//     --zebra:#f8fafc;
//     --ok:#10b981;
//     --ok-bg:#10b9811a;
//     --info:#2563eb;
//     --info-bg:#2563eb1a;
//     --warn:#b45309;
//     --warn-bg:#f59e0b1a;
//     --bad:#b91c1c;
//     --bad-bg:#ef44441a;
//   }

//   @page { size: A4 portrait; margin: 0.8cm; }
//   html,body { margin:0; padding:0; background:#fff; }
//   body { font: 11.6px/1.55 Arial, "Segoe UI", Tahoma, sans-serif; color:var(--ink); }
  
//     /* --- brand/logo (CENTER TOP) --- */
//   .brand { display:flex; justify-content:center; align-items:center; margin: 2px 0 6px; }
//   /* .brand img.logo { max-height: 50px; max-width: 65%; width:auto; object-fit:contain; image-rendering: -webkit-optimize-contrast; }*/
// /* --- Circular logo (top center) --- */

// .brand{
//   display:flex;
//   flex-direction: column;   /* logo ke neeche text */
//   justify-content:center;
//   align-items:center;
//   margin: 2px 0 8px;
// }
// .brand .brand-name{
//   margin-top: 6px;
//   // font-weight: 800;
//   font-size: 17px;          /* chhota sa headline */
//   // color: var(--ink);
//   // letter-spacing: .2px;
//   text-align: right;
//   align-self: stretch;

// }

// .brand .brand-name .label{ font-weight: 900; }   /* bold label */
// .brand .brand-name .value{ font-weight: 500; }   /* normal name */

// .brand .logo{
//   width: 68px;          /* size adjust yahan se */
//   height: 68px;         /* same as width for perfect circle */
//   border-radius: 50%;   /* circle */
//   object-fit: cover;    /* crop to circle nicely */
//   display: block;
//   background: #fff;     /* optional: white badge */
//   border: 1px solid #e5e7eb; /* subtle ring */
//   padding: 2px;         /* optional inner spacing */
//   /* extra safety for odd assets (SVG/transparent) */
//   clip-path: circle(50% at 50% 50%);
// }


//   header { display:flex; align-items:center; justify-content:space-between; margin:0 0 8px 0; }
//   header .stamp { color:var(--muted); font-size:11px; }
//   h2 { margin:0; font-size:16px; }

//   .section { page-break-inside: avoid; margin-bottom:10px; }
//   .title {
//     font-weight:800; margin:8px 0 6px; padding-inline-start:10px;
//     border-inline-start: 3px solid var(--accent);
//   }

//   table { width:100%; border-collapse:collapse; table-layout: fixed; }
//   th, td { border:1px solid var(--grid); padding:6px 8px; text-align:right; vertical-align:top; word-break:break-word; }
//   thead th { background:var(--th); font-weight:800; }
//   tbody tr:nth-child(even) td { background:var(--zebra); }

//   .num { text-align:left; }  /* numbers align left in RTL */
//   .riyal { white-space:nowrap; }
//   .muted { color:var(--muted); }

//   /* Cost total row */
//   .total-row td { background:var(--ok-bg); font-weight:900; }

//   /* Status chip */
//   .chip { display:inline-block; padding:2px 8px; border-radius:999px; font-weight:700; font-size:11px; }
//   .chip.ok   { color:#065f46; background:var(--ok-bg); }
//   .chip.info { color:#1e40af; background:var(--info-bg); }
//   .chip.warn { color:var(--warn); background:var(--warn-bg); }
//   .chip.bad  { color:#7f1d1d; background:var(--bad-bg); }
//   .chip.muted{ color:var(--muted); background:#f3f4f6; }

//   /* Images */
//   .trip-thumb { width:86px; height:56px; object-fit:cover; border-radius:6px; border:1px solid #e5e7eb; }
//   .ava { width:26px; height:26px; border-radius:50%; object-fit:cover; border:1px solid #e5e7eb; background:#fff; }
//   .ph {
//     width:26px; height:26px; border-radius:50%; border:1px solid #e5e7eb;
//     background:#f3f4f6; color:#4b5563; display:inline-grid; place-items:center; font-weight:800; font-size:12px;
//   }

//   /* Keep to one page */
//   .onepage { transform: scale(0.94); transform-origin: top right; width:100%; }

//   /* ===== Users table fixes ===== */
//   .users-table { table-layout: fixed; }
//   .users-table th, .users-table td { padding:8px 10px; }

//   /* Latin/number text inside RTL cells */
//   .ltr    { direction:ltr; unicode-bidi: plaintext; }
//   .break  { overflow-wrap:anywhere; word-break:break-word; } /* emails/IBAN wrap */
//   .nowrap { white-space:nowrap; }                            /* phone stable */
// </style>
// </head>
// <body>
// <div class="onepage">

//  <!-- CENTERED LOGO BLOCK -->
// ${(logoSrc || providerName) ? `
//   <div class="brand">
//     ${logoSrc ? `<img class="logo" src="${logoSrc}" alt="Logo" />` : ``}
//     ${providerName ? `<div class="brand-name"><span class="label">اسم المزود:</span> <span class="value">${providerName}</span></div>` : ``}
//   </div>
// ` : ``}


//   <header>
//     <div class="stamp">${nowStr}</div>
//     <h2>ملخص الحجز #${safe(booking.id)}</h2>
//   </header>

//   <!-- COSTS -->
//   <div class="section">
//     <div class="title">التكاليف</div>
//     <table>
//       <thead><tr><th>البند</th><th class="num">القيمة</th></tr></thead>
//       <tbody>
//         <tr class="total-row"><td>التكلفة الإجمالية</td><td class="num riyal">${val(booking.totalCost, " ريال")}</td></tr>
//         <tr><td>تكلفة الرحلة</td><td class="num riyal">${val(booking.cost, " ريال")}</td></tr>
//   <td style="background: var(--warn-bg); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
//     عمولة المزود
//   </td>
//   <td class="num riyal"
//       style="background: var(--warn-bg); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
//     ${val(booking.providerCommission, " ريال")}
//   </td>
// </tr>

//         <tr><td>عمولة التطبيق</td><td class="num riyal">${val(booking.appCommission, " ريال")}</td></tr>
//         <tr><td>الإضافات</td><td class="num riyal">${val(booking.addOnCost, " ريال")}</td></tr>
//       </tbody>
//     </table>
//   </div>

//   <!-- BOOKING INFO -->
//   <div class="section">
//     <div class="title">معلومات الحجز</div>
//     <table>
//       <tbody>
//         <tr>
//           <td style="width:25%">الحالة</td>
//           <td class="num">
//             <span class="chip ${statusTone(booking.status)}">
//               ${safe(statusTextMap[booking.status] || booking.status)}
//             </span>
//           </td>
//         </tr>
//         <tr><td>رقم الحجز</td><td class="num">#${safe(booking.id)}</td></tr>
//         <tr><td>تاريخ الحجز</td><td class="num">${bookingDate}</td></tr>
//         <tr><td>عدد الأشخاص</td><td class="num">${safe(booking.persons)}</td></tr>
//         <tr><td>عدد الساعات</td><td class="num">${safe(booking.numOfHours)}</td></tr>
//       </tbody>
//     </table>
//   </div>

//   <!-- TIMING -->
//   <div class="section">
//     <div class="title">التوقيت</div>
//     <table>
//       <thead>
//         <tr>
//           <th>وقت البدء</th><th>تاريخ البدء</th>
//           <th>وقت الانتهاء</th><th>تاريخ الانتهاء</th>
//           <th>تاريخ الإنشاء</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td class="num">${safe(startTimeStr)}</td>
//           <td class="num">${safe(startDateStr)}</td>
//           <td class="num">${safe(endTimeStr)}</td>
//           <td class="num">${safe(endDateStr)}</td>
//           <td class="num">${safe(createdStr)}</td>
//         </tr>
//       </tbody>
//     </table>
//   </div>

//   <!-- TRIP -->
//   <div class="section">
//     <div class="title">تفاصيل الرحلة</div>
//     <table>
//       <thead>
//         <tr>
//           <th style="width:96px">صورة</th>
//           <th>العنوان</th>
//           <th>المدينة</th>
//           <th>الفئة</th>
//           <th style="width:110px">السعر</th>
//           <th style="width:150px">الحد الأقصى</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td>${firstTripImage ? `<img class="trip-thumb" src="${firstTripImage}" alt="trip" />` : `<span class="muted">—</span>`}</td>
//           <td>${safe(booking.trip?.title)}</td>
//           <td>${safe(booking.trip?.city?.name)}</td>
//           <td>${safe(booking.trip?.category?.name)}</td>
//           <td class="num riyal">${val(booking.trip?.price, " ريال")}</td>
//           <td class="num">${val(booking.trip?.maxPersons, " شخص")}</td>
//         </tr>
//       </tbody>
//     </table>
//   </div>

//   <!-- USERS -->
//   <div class="section">
//     <div class="title">المستخدمون</div>

//     <table class="users-table">
//       <colgroup>
//         <col style="width:70px" />
//         <col style="width:40px" />
//         <col style="width:18%" />
//         <col style="width:12%" />
//         <col style="width:22%" />
//         <col style="width:120px" />
//         <col style="width:12%" />
//         <col style="width:20%" />
//         <col style="width:10%" />
//       </colgroup>
//       <thead>
//         <tr>
//           <th>النوع</th>
//           <th>صورة</th>
//           <th>الاسم الكامل</th>
//           <th>اسم المستخدم</th>
//           <th>البريد الإلكتروني</th>
//           <th>رقم الهاتف</th>
//           <th>اسم الحساب</th>
//           <th>أيبان</th>
//           <th>اسم البنك</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td>مستخدم</td>
//           <td>${userImg
//         ? `<img class="ava" src="${userImg}" alt="User" />`
//         : `<span class="ph">${firstChar(u.fullName)}</span>`
//       }</td>
//           <td>${safe(u.fullName)}</td>
//           <td class="break">${safe(u.userName)}</td>
//           <td class="ltr break">${safe(u.email)}</td>
//           <td class="ltr nowrap num">${safe(u.phoneNumber)}</td>
//           <td class="muted">-</td>
//           <td class="muted">-</td>
//           <td class="muted">-</td>
//         </tr>

//         <tr>
//           <td>مزود الخدمة</td>
//           <td>${provImg
//         ? `<img class="ava" src="${provImg}" alt="Provider" />`
//         : `<span class="ph">${firstChar(p.fullName)}</span>`
//       }</td>
//           <td>${safe(p.fullName)}</td>
//           <td class="break">${safe(p.userName)}</td>
//           <td class="ltr break">${safe(p.email)}</td>
//           <td class="ltr nowrap num">${safe(p.phoneNumber)}</td>
//           <td class="break">${safe(p.accountName)}</td>
//           <td class="ltr break">${safe(p.ibanNumber)}</td>
//           <td>${safe(p.bankName)}</td>
//         </tr>
//       </tbody>
//     </table>
//   </div>

//   ${addOns.length ? `
//   <!-- ADD-ONS -->
//   <div class="section">
//     <div class="title">الإضافات</div>
//     <table>
//       <thead>
//         <tr>
//           <th>الاسم</th>
//           <th style="width:70px">الكمية</th>
//           <th style="width:110px">السعر</th>
//           <th style="width:100px">المخزون</th>
//           <th style="width:120px">المجموع الفرعي</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${addOns.map(a => {
//         const qty = a.Quantity ?? a.quantity ?? 0;
//         const price = a.Price ?? a.price ?? 0;
//         const subtotal = (Number(qty) * Number(price)) || 0;
//         const name = a.Name || a.NameEn || "-";
//         const stock = (a.Stock ?? a.stock);
//         return `<tr>
//             <td>${safe(name)}</td>
//             <td class="num">${safe(qty)}</td>
//             <td class="num riyal">${val(price, " ريال")}</td>
//             <td class="num">${stock === undefined ? "-" : safe(stock)}</td>
//             <td class="num riyal">${val(subtotal.toFixed(2), " ريال")}</td>
//           </tr>`;
//       }).join("")}
//       </tbody>
//     </table>
//   </div>` : ""}

// </div>

// <script>
//   // Wait for images to load then print (keeps layout to one page)
//   (function whenImagesReady(cb){
//     const imgs = Array.from(document.images || []);
//     if (!imgs.length) return cb();
//     let left = imgs.length;
//     const done = () => { if(--left <= 0) cb(); };
//     imgs.forEach(img => {
//       if (img.complete) return done();
//       img.addEventListener('load', done);
//       img.addEventListener('error', done);
//     });
//   })(function(){ setTimeout(function(){ window.print(); }, 60); });
// </script>
// </body>
// </html>`;

//     if (popAllowed) {
//       // ✅ Popup allowed — write into it
//       pop.document.open();
//       pop.document.write(html);    // html already has <title>${fileBase}</title>
//       pop.document.close();
//       try { pop.document.title = fileBase; } catch { }

//       pop.addEventListener('load', () => {
//         setTimeout(() => { try { pop.focus(); } catch { } }, 80);
//       });
//       pop.addEventListener('afterprint', () => {
//         try { pop.close(); } catch { }
//       });

//     } else {
//       // 🚧 Popup blocked — fallback: Blob + synthetic anchor click
//       const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.target = '_blank';
//       a.rel = 'noopener';
//       // append is optional, but safer on some browsers
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       setTimeout(() => URL.revokeObjectURL(url), 30000);
//     }

//   };

//   const handleDelete = async () => {
//     try {
//       await api.delete(`/api/admin/bookings/${bookingId}`);
//       setSuccessModal({ isVisible: true, message: "تم حذف الحجز بنجاح" });
//       setTimeout(() => {
//         setSuccessModal({ isVisible: false, message: "" });
//         onBack && onBack();
//       }, 1200);
//     } catch {
//       setError("فشل في حذف الحجز");
//     }
//   };

//   if (loading) return (
//     <div className="bd-loading"><div className="bd-spinner" />جاري تحميل تفاصيل الحجز…</div>
//   );
//   if (error) return <div className="bd-error">{error}</div>;
//   if (!booking) return null;

//   const tripImages = booking.trip?.images
//     ? booking.trip.images.split(",").map(s => s.trim()).filter(Boolean)
//     : [];
//   const firstTripImage = tripImages[0] || null;

//   let addOns = [];
//   try {
//     if (Array.isArray(booking.addOns)) addOns = booking.addOns;
//     else if (typeof booking.addOns === "string") addOns = JSON.parse(booking.addOns || "[]");
//   } catch {
//     addOns = [];
//   }

//   const statusTone = statusMap[booking.status]?.tone || "neutral";

//   return (

//     <div id="booking-print" className="bd" dir="rtl">
//       {/* Header */}
//       <div className="bd__header">
//         <button className="bd-btn bd-btn--ghost" onClick={onBack}>
//           <FontAwesomeIcon icon={faChevronRight} /><span>رجوع</span>
//         </button>
//         <h1 className="bd__title">الحجز #{booking.id}</h1>
//         <div className="bd__actions">
//           <button className="bd-icon" title="طباعة" onClick={() => printExcelStyle(logoSrc)}><FontAwesomeIcon icon={faPrint} /></button>
//           <button className="bd-icon bd-icon--primary" title="تعديل" onClick={() => onEdit && onEdit(booking.id)}><FontAwesomeIcon icon={faEdit} /></button>
//           <button className="bd-icon bd-icon--danger" title="حذف" onClick={() => setDeleteConfirmModal(true)}><FontAwesomeIcon icon={faTrash} /></button>
//         </div>
//       </div>

//       {/* COSTS */}
//       <section className="card card--stretch">
//         <div className="card__header">
//           <FontAwesomeIcon icon={faMoneyBillWave} />
//           <h3>التكاليف</h3>
//         </div>

//         <div className="bd-total">

//           {/* <div className="bd-total__label">التكلفة الإجمالية</div>
//           <div className="bd-total__value">{booking.totalCost} <span>ريال</span></div>
//          */}
//           <div className="bd-chips">
//             <div className="chip"><span>تكلفة الرحلة</span><strong>{booking.cost} ريال</strong></div>
//             <div className="chip"><span>عمولة المزود</span><strong>{booking.providerCommission} ريال</strong></div>
//             <div className="chip"><span>عمولة التطبيق</span><strong>{booking.appCommission} ريال</strong></div>
//             <div className="chip"><span>الإضافات</span><strong>{booking.addOnCost} ريال</strong></div>
//           </div>
//         </div>

//       </section>

//       {/* GRID: Trip / Booking Info */}
//       <div className="bd-grid">
//         {/* Trip */}
//         <section className="card">
//           <div className="card__header">
//             <FontAwesomeIcon icon={faRoute} />
//             <h3>تفاصيل الرحلة</h3>
//             {booking.trip?.id && (
//               <button className="bd-btn bd-btn--primary bd-btn--sm" onClick={() => onViewTrip && onViewTrip(booking.trip.id)}>
//                 <FontAwesomeIcon icon={faExternalLinkAlt} /> عرض الرحلة
//               </button>
//             )}
//           </div>

//           {firstTripImage && (
//             <div className="trip__image">
//               <img src={getTripImageUrl(firstTripImage)} alt={booking.trip?.title || "الرحلة"} />
//               <span className="trip__image-count">{tripImages.length} صورة</span>
//             </div>
//           )}

//           {booking.trip ? (
//             <div className="trip__meta">
//               <h4 className="trip__title">{booking.trip.title}</h4>
//               <div className="trip__rows">
//                 <div className="trip__row"><FontAwesomeIcon icon={faMapMarkerAlt} /><span>{booking.trip.city?.name || "-"}</span></div>
//                 <div className="trip__row"><FontAwesomeIcon icon={faTag} /><span>{booking.trip.category?.name || "-"}</span></div>
//                 <div className="trip__row"><FontAwesomeIcon icon={faMoneyBillWave} /><span>{booking.trip.price} ريال</span></div>
//                 <div className="trip__row"><FontAwesomeIcon icon={faUsers} /><span>الحد الأقصى: {booking.trip.maxPersons} شخص</span></div>
//               </div>
//             </div>
//           ) : (
//             <p className="bd-empty">لا توجد بيانات رحلة</p>
//           )}

//           {!!addOns.length && (
//             <div className="addons">
//               <div className="addons__title"><FontAwesomeIcon icon={faTag} /> الإضافات المختارة</div>
//               <div className="addons__list">
//                 {addOns.map((a, i) => (
//                   <div className="addons__item" key={a.Id || i}>
//                     <div className="addons__name"><FontAwesomeIcon icon={faTag} />{a.Name || a.NameEn || `إضافة ${i + 1}`}</div>
//                     <div className="addons__meta">
//                       {a.Quantity && <span><FontAwesomeIcon icon={faHashtag} />الكمية: {a.Quantity}</span>}
//                       {"Price" in a && <span className="price"><FontAwesomeIcon icon={faMoneyBillWave} />السعر: {a.Price} ريال</span>}
//                       {"Stock" in a && <span className="stock"><FontAwesomeIcon icon={faBox} />المخزون: {a.Stock}</span>}
//                     </div>
//                     {a.Quantity && a.Price && (
//                       <div className="addons__subtotal">
//                         <span>المجموع الفرعي</span>
//                         <strong>{(a.Quantity * a.Price).toFixed(2)} ريال</strong>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//               <div className="addons__total">
//                 <span>إجمالي الإضافات</span>
//                 <strong>{booking.addOnCost} ريال</strong>
//               </div>
//             </div>
//           )}
//         </section>

//         {/* Booking info + timing stack */}
//         <div className="col-stack">
//           <section className="card">
//             <div className="card__header">
//               <FontAwesomeIcon icon={faIdCard} />
//               <h3>معلومات الحجز</h3>
//             </div>

//             <div className={`status status--${statusTone}`}>
//               <FontAwesomeIcon icon={statusMap[booking.status]?.icon} />
//               <span>{statusMap[booking.status]?.text || booking.status}</span>
//             </div>

//             <div className="meta">
//               <div className="meta__row"><span>رقم الحجز</span><strong>#{booking.id}</strong></div>
//               <div className="meta__row"><span>تاريخ الحجز</span><strong>{formatDate(booking.bookingDate)}</strong></div>
//               <div className="meta__row"><span>عدد الأشخاص</span><strong>{booking.persons}</strong></div>
//               <div className="meta__row"><span>عدد الساعات</span><strong>{booking.numOfHours}</strong></div>
//             </div>
//           </section>

//           <section className="card">
//             <div className="card__header">
//               <FontAwesomeIcon icon={faClock} />
//               <h3>التوقيت</h3>
//             </div>

//             <div className="timing">
//               <div className="timing__item">
//                 <div className="timing__icon"><FontAwesomeIcon icon={faCalendarAlt} /></div>
//                 <div className="timing__info">
//                   <div className="timing__label">وقت البدء</div>
//                   <div className="timing__value">{formatTime(booking.startTime)}</div>
//                   <div className="timing__date">{formatDate(extractDateFromDateTime(booking.startTime))}</div>
//                 </div>
//               </div>

//               <div className="timing__item">
//                 <div className="timing__icon"><FontAwesomeIcon icon={faCalendarAlt} /></div>
//                 <div className="timing__info">
//                   <div className="timing__label">وقت الانتهاء</div>
//                   <div className="timing__value">{formatTime(booking.endTime)}</div>
//                   <div className="timing__date">{formatDate(extractDateFromDateTime(booking.endTime))}</div>
//                 </div>
//               </div>

//               <div className="timing__item">
//                 <div className="timing__icon"><FontAwesomeIcon icon={faCalendarAlt} /></div>
//                 <div className="timing__info">
//                   <div className="timing__label">تاريخ الإنشاء</div>
//                   <div className="timing__value">{formatDate(booking.createdAt)}</div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>

//       {/* Users vs right cards row */}
//       <div className="bd-grid bd-grid--users">
//         <section className="card">
//           <div className="card__header">
//             <FontAwesomeIcon icon={faUsers} />
//             <h3>المستخدمين</h3>
//           </div>

//           {/* Customer */}
//           <UserBlock
//             title="مستخدم"
//             entity={booking.user}
//             onView={() => onViewCustomer && booking.user && onViewCustomer(booking.user.id)}
//           />

//           {/* Provider */}
//           <UserBlock
//             title="مزود الخدمة"
//             entity={booking.provider}
//             onView={() => onViewProvider && booking.provider && onViewProvider(booking.provider.id)}
//             showBank
//           />
//         </section>
//       </div>

//       {/* Notes */}
//       {!!booking.notes && (
//         <section className="card">
//           <div className="card__header"><h3>الملاحظات</h3></div>
//           <div className="notes">{booking.notes}</div>
//         </section>
//       )}

//       <SuccessModal
//         message={successModal.message}
//         isVisible={successModal.isVisible}
//         onClose={() => setSuccessModal({ isVisible: false, message: "" })}
//       />
//       <DeleteConfirmModal
//         isVisible={deleteConfirmModal}
//         onClose={() => setDeleteConfirmModal(false)}
//         onConfirm={handleDelete}
//         title="تأكيد حذف الحجز"
//         message="هل أنت متأكد من أنك تريد حذف الحجز؟"
//       />
//     </div>

//   );
// }

// /* -------- Small subcomponent for users -------- */
// function UserBlock({ title, entity, onView, showBank }) {
//   return (
//     <div className="user">
//       <div className="user__head">
//         <div className="user__avatar">
//           {entity?.profileImage ? (
//             <img src={getImageUrl(entity.profileImage)} alt={title} onError={(e) => (e.target.style.display = "none")} />
//           ) : (
//             <FontAwesomeIcon icon={faUserCircle} />
//           )}
//         </div>
//         <div className="user__info">
//           <div className="user__name">{entity?.fullName || (title === "مستخدم" ? "مستخدم غير محدد" : "مزود غير محدد")}</div>
//           <div className="user__role">{title}</div>
//         </div>
//         {entity && <button className="bd-btn bd-btn--light bd-btn--sm" onClick={onView}>عرض التفاصيل</button>}
//       </div>

//       {entity && (
//         <div className="user__grid">
//           <div className="user__row"><FontAwesomeIcon icon={faPhone} /><span>اسم المستخدم</span><strong>{entity.userName}</strong></div>
//           <div className="user__row"><FontAwesomeIcon icon={faEnvelope} /><span>البريد الإلكتروني</span><strong>{entity.email}</strong></div>
//           {entity.phoneNumber && (
//             <div className="user__row"><FontAwesomeIcon icon={faPhone} /><span>رقم الهاتف</span><strong>{entity.phoneNumber}</strong></div>
//           )}
//           {showBank && entity.accountName && (
//             <div className="user__row"><FontAwesomeIcon icon={faBuilding} /><span>اسم الحساب</span><strong>{entity.accountName}</strong></div>
//           )}
//           {showBank && entity.ibanNumber && (
//             <div className="user__row"><FontAwesomeIcon icon={faCreditCard} /><span>أيبان</span><strong>{entity.ibanNumber}</strong></div>
//           )}
//           {showBank && entity.bankName && (
//             <div className="user__row"><FontAwesomeIcon icon={faUniversity} /><span>اسم البنك</span><strong>{entity.bankName}</strong></div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }