import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faEdit,
  faTrash,
  faUser,
  faUserTie,
  faUsers,
  faCalendarAlt,
  faMoneyBillWave,
  faInfoCircle,
  faChevronRight,
  faPhone,
  faEnvelope,
  faIdCard,
  faClock,
  faStickyNote,
  faMapMarkerAlt,
  faTag,
  faCheckCircle,
  faBan,
  faRoute,
  faEye,
  faExternalLinkAlt,
  faPrint,
  faBuilding,
  faUserCircle,
  faCreditCard,
  faUniversity,
  faHashtag,
  faBox,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
// import './BookingsList.css';
import './Bookings_List.css';
import './BookingDetails.css';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-avatar.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const getTripImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-trip.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

// Function to format time as AM/PM
const formatTime = (time) => {
  if (!time) return '-';
  try {
    // Handle datetime format: "2025-07-13 04:00:00.000"
    let timeString = time;
    if (time.includes(' ')) {
      timeString = time.split(' ')[1]; // Extract time part after space
    }

    // Remove milliseconds if present
    if (timeString.includes('.')) {
      timeString = timeString.split('.')[0];
    }

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

// Function to extract date from datetime string
const extractDateFromDateTime = (datetime) => {
  if (!datetime) return null;
  if (datetime.includes(' ')) {
    return datetime.split(' ')[0];
  }
  return datetime;
};

const statusMap = {
  'Provider Pending': { text: 'في انتظار المزود', color: '#f59e0b', icon: faClock },
  'Pending Payment': { text: 'في انتظار الدفع', color: '#f59e0b', icon: faClock },
  'Paid': { text: 'مدفوع', color: '#1fc1de', icon: faCheckCircle },
  'Completed': { text: 'مكتمل', color: '#10b981', icon: faCheckCircle },
  'Canceled': { text: 'ملغي', color: '#ef4444', icon: faBan },
};

const BookingDetails = ({ bookingId, onBack, onEdit, onViewCustomer, onViewProvider, onViewTrip }) => {
  const [booking, setBooking] = useState(null);
  console.log('BookingDetails booking:', booking);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [successModal, setSuccessModal] = useState({ isVisible: false, message: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (err) {
      setError('فشل في تحميل تفاصيل الحجز');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/admin/bookings/${bookingId}`);
      setSuccessModal({ isVisible: true, message: 'تم حذف الحجز بنجاح' });
      setTimeout(() => {
        setSuccessModal({ isVisible: false, message: '' });
        onBack();
      }, 1200);
    } catch (err) {
      setError('فشل في حذف الحجز');
    }
  };

  const generatePDF = async () => {
    if (!contentRef.current) return;

    setIsGeneratingPDF(true);

    try {
      // Create invoice-like PDF container
      const pdfContainer = document.createElement('div');
      pdfContainer.style.width = '1200px';
      pdfContainer.style.padding = '30px';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.fontFamily = 'Cairo, Tajawal, Noto Kufi Arabic, Arial, sans-serif';
      pdfContainer.style.fontSize = '16px';
      pdfContainer.style.lineHeight = '1.5';
      pdfContainer.style.color = '#1e293b';

      // Invoice Header
      const header = document.createElement('div');
      header.style.display = 'grid';
      header.style.gridTemplateColumns = '1fr 1fr';
      header.style.gap = '40px';
      header.style.marginBottom = '40px';
      header.style.paddingBottom = '20px';
      header.style.borderBottom = '3px solid #31beb5';

      // Left side - Company Info
      const companyInfo = document.createElement('div');
      companyInfo.style.textAlign = 'right';

      const companyTitle = document.createElement('h1');
      companyTitle.textContent = 'تطبيق طلعات';
      companyTitle.style.fontSize = '36px';
      companyTitle.style.fontWeight = '700';
      companyTitle.style.color = '#31beb5';
      companyTitle.style.margin = '0 0 15px 0';
      companyInfo.appendChild(companyTitle);



      const companySubtitle = document.createElement('p');
      companySubtitle.textContent = 'نظام إدارة الحجوزات';
      companySubtitle.style.fontSize = '20px';
      companySubtitle.style.color = '#64748b';
      companyInfo.appendChild(companySubtitle);

      const invoiceInfo = document.createElement('div');
      invoiceInfo.style.fontSize = '18px';
      invoiceInfo.style.color = '#64748b';
      invoiceInfo.innerHTML = `
        <div style="margin-bottom: 5px;color">رقم الحجز: #${booking.id}</div>
        <div style="margin-bottom: 5px;">تاريخ الحجز: ${formatDate(booking.createdAt)}</div>
        <div>الحالة: ${statusMap[booking.status]?.text || booking.status}</div>
      `;
      companyInfo.appendChild(invoiceInfo);

      header.appendChild(companyInfo);

      // Right side - Booking Details
      const bookingInfo = document.createElement('div');
      bookingInfo.style.textAlign = 'left';

      const bookingTitle = document.createElement('h2');
      bookingTitle.textContent = 'تفاصيل الحجز';
      bookingTitle.style.fontSize = '24px';
      bookingTitle.style.fontWeight = '600';
      bookingTitle.style.color = '#1e293b';
      bookingTitle.style.margin = '0 0 20px 0';
      bookingInfo.appendChild(bookingTitle);

      const bookingDetails = document.createElement('div');
      bookingDetails.style.fontSize = '18px';
      bookingDetails.style.color = '#64748b';
      bookingDetails.innerHTML = `
        <div style="margin-bottom: 8px;">عدد الأشخاص: ${booking.persons} شخص</div>
        <div style="margin-bottom: 8px;">عدد الساعات: ${booking.numberOfHours || booking.numOfHours} ساعات</div>
        <div style="margin-bottom: 8px;">وقت البدء: ${formatTime(booking.startTime)} - ${formatDate(extractDateFromDateTime(booking.startTime))}</div>
        <div>وقت الانتهاء: ${formatTime(booking.endTime)} - ${formatDate(extractDateFromDateTime(booking.endTime))}</div>
      `;
      bookingInfo.appendChild(bookingDetails);

      header.appendChild(bookingInfo);
      pdfContainer.appendChild(header);

      // Centered Header Text
      const centeredHeader = document.createElement('div');
      centeredHeader.style.textAlign = 'center';
      centeredHeader.style.marginBottom = '30px';
      centeredHeader.style.padding = '20px';

      const headerText = document.createElement('h2');
      const headerTripTitle = booking.trip?.title || 'رحلة غير محددة';
      headerText.textContent = `حجز رقم #${booking.id} - ${headerTripTitle}`;
      headerText.style.fontSize = '28px';
      headerText.style.fontWeight = '700';
      headerText.style.color = '#10b981';
      headerText.style.margin = '0';
      headerText.style.textAlign = 'center';

      centeredHeader.appendChild(headerText);
      pdfContainer.appendChild(centeredHeader);

      // Cost Breakdown Table
      const costTable = document.createElement('div');
      costTable.style.marginBottom = '30px';

      const costTitle = document.createElement('h3');
      costTitle.textContent = 'تفاصيل التكاليف';
      costTitle.style.fontSize = '22px';
      costTitle.style.fontWeight = '600';
      costTitle.style.color = '#1e293b';
      costTitle.style.margin = '0 0 20px 0';
      costTitle.style.textAlign = 'right';
      costTable.appendChild(costTitle);

      const costGrid = document.createElement('div');
      costGrid.style.display = 'grid';
      costGrid.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
      costGrid.style.gap = '15px';
      costGrid.style.marginBottom = '20px';

      const costItems = [
        { label: 'تكلفة الرحلة', value: `${booking.cost} ريال`, color: '#f1f5f9' },
        { label: 'الإضافات', value: `${booking.addOnCost} ريال`, color: '#f1f5f9' },
        { label: 'عمولة التطبيق', value: `${booking.appCommission} ريال`, color: '#fef3c7' },
        { label: 'عمولة المزود', value: `${booking.providerCommission} ريال`, color: '#fef3c7' }
      ];

      costItems.forEach(item => {
        const costItem = document.createElement('div');
        costItem.style.padding = '15px';
        costItem.style.backgroundColor = item.color;
        costItem.style.borderRadius = '6px';
        costItem.style.textAlign = 'center';

        const label = document.createElement('div');
        label.textContent = item.label;
        label.style.fontSize = '16px';
        label.style.color = '#64748b';
        label.style.marginBottom = '8px';
        costItem.appendChild(label);

        const value = document.createElement('div');
        value.textContent = item.value;
        value.style.fontSize = '20px';
        value.style.fontWeight = '600';
        value.style.color = '#1e293b';
        costItem.appendChild(value);

        costGrid.appendChild(costItem);
      });

      costTable.appendChild(costGrid);

      // Total Cost
      const totalCost = document.createElement('div');
      totalCost.style.textAlign = 'center';
      totalCost.style.padding = '25px';
      totalCost.style.backgroundColor = '#31beb5';
      totalCost.style.color = '#ffffff';
      totalCost.style.borderRadius = '8px';
      totalCost.style.fontSize = '24px';
      totalCost.style.fontWeight = '700';
      totalCost.textContent = `التكلفة الإجمالية: ${booking.totalCost} ريال`;
      costTable.appendChild(totalCost);

      pdfContainer.appendChild(costTable);

      // Customer and Provider Information Grid
      const userGrid = document.createElement('div');
      userGrid.style.display = 'grid';
      userGrid.style.gridTemplateColumns = '1fr 1fr';
      userGrid.style.gap = '30px';
      userGrid.style.marginBottom = '30px';

      // Customer Information
      const customerInfo = document.createElement('div');
      customerInfo.style.padding = '20px';
      customerInfo.style.backgroundColor = '#f8fafc';
      customerInfo.style.borderRadius = '8px';
      customerInfo.style.borderRight = '4px solid #31beb5';

      const customerTitle = document.createElement('h4');
      customerTitle.textContent = 'معلومات العميل';
      customerTitle.style.fontSize = '20px';
      customerTitle.style.fontWeight = '600';
      customerTitle.style.color = '#1e293b';
      customerTitle.style.margin = '0 0 20px 0';
      customerTitle.style.textAlign = 'right';
      customerInfo.appendChild(customerTitle);

      if (booking.user) {
        const customerDetails = document.createElement('div');
        customerDetails.style.fontSize = '16px';
        customerDetails.style.color = '#64748b';
        customerDetails.innerHTML = `
          <div style="margin-bottom: 8px; text-align: right;">الاسم: ${booking.user.fullName || 'غير محدد'}</div>
          <div style="margin-bottom: 8px; text-align: right;">اسم المستخدم: ${booking.user.userName || '-'}</div>
          <div style="margin-bottom: 8px; text-align: right;">البريد الإلكتروني: ${booking.user.email || '-'}</div>
          ${booking.user.phoneNumber ? `<div style="text-align: right;">رقم الهاتف: ${booking.user.phoneNumber}</div>` : ''}
        `;
        customerInfo.appendChild(customerDetails);
      } else {
        const noCustomer = document.createElement('p');
        noCustomer.textContent = 'لا توجد بيانات العميل';
        noCustomer.style.color = '#64748b';
        noCustomer.style.textAlign = 'right';
        customerInfo.appendChild(noCustomer);
      }

      userGrid.appendChild(customerInfo);

      // Provider Information
      const providerInfo = document.createElement('div');
      providerInfo.style.padding = '20px';
      providerInfo.style.backgroundColor = '#f8fafc';
      providerInfo.style.borderRadius = '8px';
      providerInfo.style.borderRight = '4px solid #31beb5';

      const providerTitle = document.createElement('h4');
      providerTitle.textContent = 'معلومات المزود';
      providerTitle.style.fontSize = '20px';
      providerTitle.style.fontWeight = '600';
      providerTitle.style.color = '#1e293b';
      providerTitle.style.margin = '0 0 20px 0';
      providerTitle.style.textAlign = 'right';
      providerInfo.appendChild(providerTitle);

      if (booking.provider) {
        const providerDetails = document.createElement('div');
        providerDetails.style.fontSize = '16px';
        providerDetails.style.color = '#64748b';
        providerDetails.innerHTML = `
          <div style="margin-bottom: 8px; text-align: right;">الاسم: ${booking.provider.fullName || 'غير محدد'}</div>
          <div style="margin-bottom: 8px; text-align: right;">اسم المستخدم: ${booking.provider.userName || '-'}</div>
          <div style="margin-bottom: 8px; text-align: right;">البريد الإلكتروني: ${booking.provider.email || '-'}</div>
          ${booking.provider.phoneNumber ? `<div style="margin-bottom: 8px; text-align: right;">رقم الهاتف: ${booking.provider.phoneNumber}</div>` : ''}
          ${booking.provider.accountName ? `<div style="margin-bottom: 8px; text-align: right;">اسم الحساب: ${booking.provider.accountName}</div>` : ''}
        `;
        providerInfo.appendChild(providerDetails);
      } else {
        const noProvider = document.createElement('p');
        noProvider.textContent = 'لا توجد بيانات المزود';
        noProvider.style.color = '#64748b';
        noProvider.style.textAlign = 'right';
        providerInfo.appendChild(noProvider);
      }

      userGrid.appendChild(providerInfo);
      pdfContainer.appendChild(userGrid);

      // Provider Bank Details Section - Simplified
      if (booking.provider && booking.provider.bankName) {
        const bankSection = document.createElement('div');
        bankSection.style.marginBottom = '30px';
        bankSection.style.padding = '20px';
        bankSection.style.backgroundColor = '#f1f5f9';
        bankSection.style.borderRadius = '8px';
        bankSection.style.border = '2px solid #31beb5';

        const bankTitle = document.createElement('h3');
        bankTitle.textContent = 'معلومات البنك';
        bankTitle.style.fontSize = '20px';
        bankTitle.style.fontWeight = '600';
        bankTitle.style.color = '#1e293b';
        bankTitle.style.margin = '0 0 15px 0';
        bankTitle.style.textAlign = 'right';
        bankSection.appendChild(bankTitle);

        const bankDetails = document.createElement('div');
        bankDetails.style.fontSize = '16px';
        bankDetails.style.color = '#64748b';
        bankDetails.style.textAlign = 'right';

        let bankInfo = '';
        if (booking.provider.bankName) {
          bankInfo += `<div>اسم البنك: <span style="font-weight: 600; color: #1e293b;">${booking.provider.bankName}</span></div>`;
        }

        bankDetails.innerHTML = bankInfo;
        bankSection.appendChild(bankDetails);

        pdfContainer.appendChild(bankSection);
      }

      // Trip and Add-ons Section - Last Section
      const tripAddonsRow = document.createElement('div');
      tripAddonsRow.style.display = 'grid';
      tripAddonsRow.style.gridTemplateColumns = '1fr 1fr';
      tripAddonsRow.style.gap = '20px';
      tripAddonsRow.style.marginBottom = '30px';

      // Trip Section - Left side
      const tripSection = document.createElement('div');
      tripSection.style.padding = '15px';
      tripSection.style.backgroundColor = '#f8fafc';
      tripSection.style.borderRadius = '8px';
      tripSection.style.border = '1px solid #31beb5';

      // Trip Header
      const tripHeader = document.createElement('div');
      tripHeader.style.display = 'flex';
      tripHeader.style.alignItems = 'center';
      tripHeader.style.marginBottom = '12px';
      tripHeader.style.justifyContent = 'start';

      const tripSectionTitle = document.createElement('h3');
      tripSectionTitle.textContent = 'تفاصيل الرحلة';
      tripSectionTitle.style.fontSize = '18px';
      tripSectionTitle.style.fontWeight = '600';
      tripSectionTitle.style.color = '#1e293b';
      tripSectionTitle.style.marginLeft = '8px';
      tripHeader.appendChild(tripSectionTitle);



      tripSection.appendChild(tripHeader);

      if (booking.trip) {
        // Simple trip info row
        const tripInfoRow = document.createElement('div');
        tripInfoRow.style.display = 'flex';
        tripInfoRow.style.justifyContent = 'space-between';
        tripInfoRow.style.alignItems = 'center';
        tripInfoRow.style.padding = '12px';
        tripInfoRow.style.backgroundColor = '#ffffff';
        tripInfoRow.style.borderRadius = '6px';
        tripInfoRow.style.border = '1px solid #e2e8f0';

        const tripInfo = document.createElement('div');
        tripInfo.style.textAlign = 'right';

        const tripName = document.createElement('div');
        tripName.textContent = booking.trip.title;
        tripName.style.fontSize = '16px';
        tripName.style.fontWeight = '600';
        tripName.style.color = '#1e293b';
        tripName.style.marginBottom = '4px';
        tripInfo.appendChild(tripName);

        const tripDetails = document.createElement('div');
        tripDetails.style.fontSize = '14px';
        tripDetails.style.color = '#64748b';
        tripDetails.innerHTML = `
          <span style="margin-left: 15px;">عدد الساعات: ${booking?.numOfHours || 'غير محدد'}</span>
          <span style="margin-left: 15px;">عدد الأشخاص: ${booking.persons}</span>
        `;
        tripInfo.appendChild(tripDetails);

        tripInfoRow.appendChild(tripInfo);

        const tripPrice = document.createElement('div');
        tripPrice.style.textAlign = 'center';
        tripPrice.style.padding = '8px 16px';
        tripPrice.style.color = '#000000';
        tripPrice.style.borderRadius = '6px';
        tripPrice.style.fontSize = '16px';
        tripPrice.style.fontWeight = '600';
        tripPrice.textContent = `${booking.trip.price} ريال / ${booking.numOfHours} ساعات`;
        tripInfoRow.appendChild(tripPrice);

        tripSection.appendChild(tripInfoRow);

      } else {
        // No trip data - simplified
        const noTripText = document.createElement('div');
        noTripText.style.padding = '12px';
        noTripText.style.textAlign = 'center';
        noTripText.style.color = '#64748b';
        noTripText.style.fontSize = '14px';
        noTripText.textContent = 'لا توجد بيانات رحلة متاحة';
        tripSection.appendChild(noTripText);
      }

      tripAddonsRow.appendChild(tripSection);

      // Add-ons Section - Right side
      const addonsSection = document.createElement('div');
      addonsSection.style.padding = '15px';
      addonsSection.style.backgroundColor = '#f8fafc';
      addonsSection.style.borderRadius = '8px';
      addonsSection.style.border = '1px solid #31beb5';

      const addonsTitle = document.createElement('h3');
      addonsTitle.textContent = 'الإضافات المختارة';
      addonsTitle.style.fontSize = '18px';
      addonsTitle.style.fontWeight = '600';
      addonsTitle.style.color = '#1e293b';
      addonsTitle.style.margin = '0 0 12px 0';
      addonsTitle.style.textAlign = 'right';
      addonsSection.appendChild(addonsTitle);

      if (parsedAddOns && Array.isArray(parsedAddOns) && parsedAddOns.length > 0) {
        const addonsList = document.createElement('div');
        addonsList.style.fontSize = '14px';
        addonsList.style.color = '#64748b';

        parsedAddOns.forEach((addon, index) => {
          const addonItem = document.createElement('div');
          addonItem.style.padding = '8px 12px';
          addonItem.style.backgroundColor = '#ffffff';
          addonItem.style.borderRadius = '6px';
          addonItem.style.border = '1px solid #e2e8f0';
          addonItem.style.marginBottom = '8px';
          addonItem.style.textAlign = 'right';

          const addonName = document.createElement('div');
          addonName.textContent = addon.Name || addon.NameEn || `إضافة ${index + 1}`;
          addonName.style.fontSize = '14px';
          addonName.style.fontWeight = '600';
          addonName.style.color = '#1e293b';
          addonName.style.marginBottom = '4px';
          addonItem.appendChild(addonName);

          const addonDetails = document.createElement('div');
          addonDetails.style.fontSize = '12px';
          addonDetails.style.color = '#64748b';

          let detailsText = '';
          if (addon.Quantity) detailsText += `الكمية: ${addon.Quantity} | `;
          if (addon.Price) detailsText += `السعر: ${addon.Price} ريال`;

          if (addon.Quantity && addon.Price) {
            detailsText += ` | المجموع: ${(addon.Quantity * addon.Price).toFixed(2)} ريال`;
          }

          addonDetails.textContent = detailsText;
          addonItem.appendChild(addonDetails);

          addonsList.appendChild(addonItem);
        });

        addonsSection.appendChild(addonsList);
      } else {
        // Empty add-ons section placeholder
        const emptyAddonsText = document.createElement('div');
        emptyAddonsText.style.padding = '12px';
        emptyAddonsText.style.textAlign = 'center';
        emptyAddonsText.style.color = '#64748b';
        emptyAddonsText.style.fontSize = '14px';
        emptyAddonsText.textContent = 'لا توجد إضافات';
        addonsSection.appendChild(emptyAddonsText);
      }

      tripAddonsRow.appendChild(addonsSection);
      pdfContainer.appendChild(tripAddonsRow);

      // Footer
      const footer = document.createElement('div');
      footer.style.marginTop = '40px';
      footer.style.paddingTop = '20px';
      footer.style.borderTop = '2px solid #e2e8f0';
      footer.style.textAlign = 'center';
      footer.style.fontSize = '16px';
      footer.style.color = '#64748b';
      footer.innerHTML = `
        <div style="margin-bottom: 10px;">تم إنشاء هذا التقرير بواسطة نظام طلعات الإداري</div>
        <div>تاريخ الإنشاء: ${formatDate(booking.createdAt)}</div>
      `;
      pdfContainer.appendChild(footer);

      // Temporarily append PDF container to body
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      document.body.appendChild(pdfContainer);

      // No images to wait for - removed for cleaner PDF

      // Generate canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: pdfContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        windowHeight: pdfContainer.scrollHeight,
        imageTimeout: 10000,
        logging: false,
        removeContainer: true
      });

      // Remove PDF container from DOM
      document.body.removeChild(pdfContainer);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add border to the entire PDF page
      pdf.setDrawColor(49, 190, 181); // #31beb5 color
      pdf.setLineWidth(1);
      pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);

      // Calculate image dimensions with border consideration
      const imgWidth = pdfWidth - 30; // Reduced width to account for border
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if content fits on one page
      if (imgHeight <= pdfHeight - 30) {
        // Single page
        pdf.addImage(imgData, 'PNG', 15, 15, imgWidth, imgHeight);
      } else {
        // Multiple pages if needed
        let heightLeft = imgHeight;
        let position = 15;

        pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 30);

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight + 15;
          pdf.addPage();
          // Add border to new page
          pdf.setDrawColor(49, 190, 181);
          pdf.setLineWidth(1);
          pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);
          pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 30);
        }
      }

      // Save PDF with Arabic filename
      const tripTitle = booking.trip?.title || 'رحلة غير محددة';
      const fileName = `حجز رقم #${booking.id} - ${tripTitle}.pdf`;
      pdf.save(fileName);

      setSuccessModal({ isVisible: true, message: 'تم إنشاء ملف PDF بنجاح' });
      setTimeout(() => {
        setSuccessModal({ isVisible: false, message: '' });
      }, 2000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('فشل في إنشاء ملف PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const printBooking = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="booking-details-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">جاري تحميل تفاصيل الحجز...</div>
      </div>
    );
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  if (!booking) {
    return null;
  }

  // Process trip images and get only the first one
  const tripImages = booking.trip?.images ? booking.trip.images.split(',').filter(img => img.trim()) : [];
  const firstTripImage = tripImages.length > 0 ? tripImages[0] : null;

  // Parse addOns from JSON string to array
  let parsedAddOns = [];
  try {
    if (booking.addOns && typeof booking.addOns === 'string') {
      parsedAddOns = JSON.parse(booking.addOns);
    } else if (Array.isArray(booking.addOns)) {
      parsedAddOns = booking.addOns;
    }
  } catch (error) {
    console.error('Error parsing addOns JSON:', error);
    parsedAddOns = [];
  }

  return (
    <div className="booking-details">
      <div className="booking-details-header">
        <button className="btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faChevronRight} />
          <span>العودة للقائمة</span>
        </button>
        <h1 className="booking-details-title">
          <FontAwesomeIcon icon={faIdCard} style={{ marginLeft: '12px' }} />
          الحجز #{booking.id}
        </h1>
        <div className="booking-details-actions">
          <button
            className="btn-pdf"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            title="تحميل PDF"
          >
            <FontAwesomeIcon icon={isGeneratingPDF ? faClock : faDownload} />
          </button>

          <button className="btn-edit" onClick={() => onEdit(booking.id)} title="تعديل الحجز">
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button className="btn-delete" onClick={() => setDeleteConfirmModal(true)} title="حذف الحجز">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      <div className="booking-details-content" ref={contentRef}>
        {/* Invoice Header - Similar to PDF */}
        <div className="invoice-header">
          <div className="company-info">
            <h1 className="company-title">تطبيق طلعات</h1>
            <p className="company-subtitle">نظام إدارة الحجوزات</p>
            <div className="invoice-meta">
              <div>رقم الحجز: #{booking.id}</div>
              <div>تاريخ الحجز: {formatDate(booking.createdAt)}</div>
              <div>الحالة: {statusMap[booking.status]?.text || booking.status}</div>
            </div>
          </div>
          <div className="booking-info">
            <h2 className="booking-title">تفاصيل الحجز</h2>
            <div className="booking-meta">
              <div>عدد الأشخاص: {booking.persons} شخص</div>
              <div>عدد الساعات: {booking.numOfHours || booking.numOfHours} ساعات</div>
              <div>وقت البدء: {formatTime(booking.startTime)} - {formatDate(extractDateFromDateTime(booking.startTime))}</div>
              <div>وقت الانتهاء: {formatTime(booking.endTime)} - {formatDate(extractDateFromDateTime(booking.endTime))}</div>
            </div>
          </div>
        </div>

        {/* Centered Header - Like PDF */}
        <div className="centered-header">
          <h2 className="centered-title">
            حجز رقم #{booking.id} - {booking.trip?.title || 'رحلة غير محددة'}
          </h2>
        </div>

        {/* Cost Breakdown - Grid Layout */}
        <div className="cost-breakdown-section">
          <h3 className="section-title">تفاصيل التكاليف</h3>
          <div className="cost-grid">
            <div className="cost-item">
              <div className="cost-label">تكلفة الرحلة</div>
              <div className="cost-value">{booking.cost} ريال</div>
            </div>
            <div className="cost-item">
              <div className="cost-label">الإضافات</div>
              <div className="cost-value">{booking.addOnCost} ريال</div>
            </div>
            <div className="cost-item commission">
              <div className="cost-label">عمولة التطبيق</div>
              <div className="cost-value">{booking.appCommission} ريال</div>
            </div>
            <div className="cost-item commission">
              <div className="cost-label">عمولة المزود</div>
              <div className="cost-value">{booking.providerCommission} ريال</div>
            </div>
          </div>
          <div className="total-cost">
            <div className="total-cost-text">التكلفة الإجمالية: {booking.totalCost} ريال</div>
          </div>
        </div>

        {/* User Information Grid */}
        <div className="user-grid">
          {/* Customer Information */}
          <div className="user-card customer-card">
            <h4 className="user-card-title">معلومات العميل</h4>
            {booking.user ? (
              <div className="user-details">
                <div className="user-detail">الاسم: {booking.user.fullName || 'غير محدد'}</div>
                <div className="user-detail">اسم المستخدم: {booking.user.userName || '-'}</div>
                <div className="user-detail">البريد الإلكتروني: {booking.user.email || '-'}</div>
                {booking.user.phoneNumber && (
                  <div className="user-detail">رقم الهاتف: {booking.user.phoneNumber}</div>
                )}
              </div>
            ) : (
              <div className="no-data">لا توجد بيانات العميل</div>
            )}
          </div>

          {/* Provider Information */}
          <div className="user-card provider-card">
            <h4 className="user-card-title">معلومات المزود</h4>
            {booking.provider ? (
              <div className="user-details">
                <div className="user-detail">الاسم: {booking.provider.fullName || 'غير محدد'}</div>
                <div className="user-detail">اسم المستخدم: {booking.provider.userName || '-'}</div>
                <div className="user-detail">البريد الإلكتروني: {booking.provider.email || '-'}</div>
                {booking.provider.phoneNumber && (
                  <div className="user-detail">رقم الهاتف: {booking.provider.phoneNumber}</div>
                )}
                {booking.provider.accountName && (
                  <div className="user-detail">اسم الحساب: {booking.provider.accountName}</div>
                )}
              </div>
            ) : (
              <div className="no-data">لا توجد بيانات المزود</div>
            )}
          </div>
        </div>

        {/* Bank Details Section */}
        {booking.provider && booking.provider.bankName && (
          <div className="bank-section">
            <h3 className="section-title">معلومات البنك</h3>
            <div className="bank-details">
              <div className="bank-info">اسم البنك: <span className="bank-value">{booking.provider.bankName}</span></div>
            </div>
          </div>
        )}

        {/* Trip and Add-ons Row */}
        <div className="trip-addons-row">
          {/* Trip Section */}
          <div className="trip-section">
            <h3 className="section-title">تفاصيل الرحلة</h3>
            {booking.trip ? (
              <div className="trip-info">
                <div className="trip-name">{booking.trip.title}</div>
                {/* <div className="trip-details">
                  <span>عدد الساعات: {booking.package?.numberOfHours || 'غير محدد'}</span>
                  <span>عدد الأشخاص: {booking.persons}</span>
                </div> */}
                <div className="trip-price">
                  {booking.trip.price} ريال / {booking.numOfHours} ساعات
                </div>
              </div>
            ) : (
              <div className="no-data">لا توجد بيانات رحلة متاحة</div>
            )}
          </div>

          {/* Add-ons Section */}
          <div className="addons-section">
            <h3 className="section-title">الإضافات المختارة</h3>
            {parsedAddOns && Array.isArray(parsedAddOns) && parsedAddOns.length > 0 ? (
              <div className="addons-list">
                {parsedAddOns.map((addon, index) => (
                  <div key={addon.Id || index} className="addon-item">
                    <div className="addon-name">{addon.Name || addon.NameEn || `إضافة ${index + 1}`}</div>
                    <div className="addon-details">
                      {addon.Quantity && <span>الكمية: {addon.Quantity}</span>}
                      {addon.Price && <span>السعر: {addon.Price} ريال</span>}
                      {addon.Quantity && addon.Price && (
                        <span>المجموع: {(addon.Quantity * addon.Price).toFixed(2)} ريال</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">لا توجد إضافات</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-text">تم إنشاء هذا التقرير بواسطة نظام طلعات الإداري</div>
          <div className="footer-date">تاريخ الإنشاء: {formatDate(booking.createdAt)}</div>
        </div>
      </div>

      <SuccessModal
        message={successModal.message}
        isVisible={successModal.isVisible}
        onClose={() => setSuccessModal({ isVisible: false, message: '' })}
      />
      <DeleteConfirmModal
        isVisible={deleteConfirmModal}
        onClose={() => setDeleteConfirmModal(false)}
        onConfirm={handleDelete}
        title="تأكيد حذف الحجز"
        message="هل أنت متأكد من أنك تريد حذف الحجز؟"
      />
    </div>
  );
};

export default BookingDetails; 