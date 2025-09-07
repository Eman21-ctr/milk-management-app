// ReportsPage.jsx - Halaman Laporan untuk FLOWMILK
import React, { useState } from 'react';

const ReportsPage = ({ purchaseOrders, distributions, invoices, sppgs, coordinators }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownloadReport = () => {
    if (!startDate || !endDate) {
      alert('Silakan pilih rentang tanggal terlebih dahulu!');
      return;
    }

    // Filter data berdasarkan rentang tanggal
    const filteredDistributions = distributions.filter(dist => {
      const distDate = new Date(dist.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return distDate >= start && distDate <= end;
    });

    const filteredInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return invDate >= start && invDate <= end;
    });

    // Hitung total untuk laporan keuangan
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalDistributions = filteredDistributions.length;
    const totalCartons = filteredDistributions.reduce((sum, dist) => sum + dist.cartons, 0);

    // Siapkan data untuk CSV (format yang bisa dibuka Excel)
    let csvContent = "\uFEFF"; // BOM untuk UTF-8
    
    // Header laporan
    csvContent += "LAPORAN KEUANGAN FLOWMILK\n";
    csvContent += `Periode: ${startDate} sampai ${endDate}\n`;
    csvContent += `Tanggal Generate: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    
    // Ringkasan
    csvContent += "=== RINGKASAN LAPORAN ===\n";
    csvContent += "Kategori;Jumlah\n";
    csvContent += `Total Distribusi;${totalDistributions}\n`;
    csvContent += `Total Karton;${totalCartons.toLocaleString('id-ID')}\n`;
    csvContent += `Total Pendapatan;Rp ${totalRevenue.toLocaleString('id-ID')}\n\n`;
    
    // Detail Distribusi
    csvContent += "=== DETAIL DISTRIBUSI ===\n";
    csvContent += "No;Tanggal;Surat Jalan;SPPG;Koordinator;Karton;Status\n";
    
    filteredDistributions.forEach((dist, index) => {
      const sppg = sppgs.find(s => s.id === dist.sppgId);
      const coordinator = coordinators.find(c => c.id === dist.coordinatorId);
      const tanggal = new Date(dist.createdAt).toLocaleDateString('id-ID');
      
      csvContent += `${index + 1};${tanggal};${dist.suratJalanNumber || 'N/A'};${sppg?.name || 'N/A'};${coordinator?.name || 'N/A'};${dist.cartons};${dist.status || 'N/A'}\n`;
    });
    
    // Detail Invoice
    csvContent += "\n=== DETAIL INVOICE ===\n";
    csvContent += "No;Tanggal;No Invoice;SPPG;Jumlah;Status\n";
    
    filteredInvoices.forEach((inv, index) => {
      const sppg = sppgs.find(s => s.id === inv.sppgId);
      const tanggal = new Date(inv.createdAt).toLocaleDateString('id-ID');
      
      csvContent += `${index + 1};${tanggal};${inv.invoiceNumber};${sppg?.name || 'N/A'};Rp ${inv.amount.toLocaleString('id-ID')};${inv.status}\n`;
    });

    // Download file (format yang Excel-friendly)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Keuangan_${startDate}_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ Laporan keuangan periode ${startDate} s/d ${endDate} berhasil didownload!\n\n📝 Tips: File CSV ini bisa dibuka langsung di Excel dengan double-click.`);
  };

  return (
    <div className="flowmilk-reports-page">
      <div className="flowmilk-reports-header">
        <h2>Laporan Keuangan</h2>
        <p>Generate laporan berdasarkan rentang tanggal</p>
      </div>

      <div className="flowmilk-reports-form">
        <div className="flowmilk-date-range">
          <div className="flowmilk-date-input">
            <label htmlFor="startDate">Tanggal Mulai</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flowmilk-input"
            />
          </div>

          <div className="flowmilk-date-input">
            <label htmlFor="endDate">Tanggal Akhir</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flowmilk-input"
            />
          </div>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={!startDate || !endDate}
          className="flowmilk-download-btn"
        >
          📊 Download Laporan Keuangan
        </button>

        {startDate && endDate && (
          <div className="flowmilk-report-preview">
            <h3>Preview Laporan</h3>
            <div className="flowmilk-report-stats">
              <div className="flowmilk-stat-item">
                <span className="flowmilk-stat-label">Total Distribusi:</span>
                <span className="flowmilk-stat-value">
                  {distributions.filter(dist => {
                    const distDate = new Date(dist.createdAt);
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    return distDate >= start && distDate <= end;
                  }).length}
                </span>
              </div>
              <div className="flowmilk-stat-item">
                <span className="flowmilk-stat-label">Total Karton:</span>
                <span className="flowmilk-stat-value">
                  {distributions
                    .filter(dist => {
                      const distDate = new Date(dist.createdAt);
                      const start = new Date(startDate);
                      const end = new Date(endDate);
                      return distDate >= start && distDate <= end;
                    })
                    .reduce((sum, dist) => sum + dist.cartons, 0)
                    .toLocaleString('id-ID')} karton
                </span>
              </div>
              <div className="flowmilk-stat-item">
                <span className="flowmilk-stat-label">Total Pendapatan:</span>
                <span className="flowmilk-stat-value">
                  Rp {invoices
                    .filter(inv => {
                      const invDate = new Date(inv.createdAt);
                      const start = new Date(startDate);
                      const end = new Date(endDate);
                      return invDate >= start && invDate <= end;
                    })
                    .reduce((sum, inv) => sum + inv.amount, 0)
                    .toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;