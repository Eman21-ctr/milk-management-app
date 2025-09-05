import React, { useState } from 'react';
import { InvoiceStatus } from '../types';
import { DownloadIcon, DatabaseIcon as PageIcon } from './icons/Icons';

const DataCard = ({ title, onDownloadExcel, onDownloadPdf }) => (
    <div className="bg-surface rounded-xl shadow-md p-6 border-l-4 border-primary">
        <div className="flex items-center mb-4">
            <PageIcon className="h-8 w-8 text-primary-light mr-4" />
            <h3 className="text-lg font-bold text-primary-dark">{title}</h3>
        </div>
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button onClick={onDownloadExcel} className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Excel (CSV)
            </button>
            <button onClick={onDownloadPdf} className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                <DownloadIcon className="mr-2 h-4 w-4" />
                PDF
            </button>
        </div>
    </div>
);


const FinancialReportCard = ({ onDownload }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const handleDownload = (type) => {
        if (!startDate || !endDate) {
            alert('Silakan pilih periode tanggal mulai dan selesai.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai.');
            return;
        }
        onDownload(type, startDate, endDate);
    };
    
    return (
        <div className="bg-surface rounded-xl shadow-md p-6 border-l-4 border-primary">
            <div className="flex items-center mb-4">
                <PageIcon className="h-8 w-8 text-primary-light mr-4" />
                <h3 className="text-lg font-bold text-primary-dark">Laporan Keuangan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
                    <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
                    <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button onClick={() => handleDownload('csv')} className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Excel (CSV)
                </button>
                <button onClick={() => handleDownload('pdf')} className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    PDF
                </button>
            </div>
        </div>
    );
};


const DatabasePage = ({ purchaseOrders, distributions, invoices, sppgs, coordinators }) => {
    
    const getSppgName = (sppgId) => sppgs.find(s => s.id === sppgId)?.name || 'N/A';

    const convertToCSV = (data, headers) => {
        const headerRow = headers.map(h => h.label).join(',');
        const dataRows = data.map(row => {
            return headers.map(header => {
                const value = String(row[header.key] || '').replace(/"/g, '""');
                return `"${value}"`;
            }).join(',');
        });
        return [headerRow, ...dataRows].join('\n');
    };

    const downloadCSV = (csvString, filename) => {
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadGenericPDF = (data, headers, title, filename) => {
        // FIX: Cast window to 'any' to access jspdf library which is loaded via script tag.
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        let pageCount = 1;

        const addHeader = (pageTitle) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('KDMP Penfui Timur', margin, 18);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text('Jln. Matani Raya, Penfui Timur, Kupang, NTT | Telp: 0853-3917-0645', margin, 24);
            doc.setDrawColor(180);
            doc.line(margin, 27, pageWidth - margin, 27);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(pageTitle, pageWidth / 2, 38, { align: 'center' });
        };
    
        const addFooter = (pageNumber) => {
            doc.setFontSize(8);
            doc.text(`Halaman ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        };
        
        addHeader(title);
        addFooter(pageCount);

        const tableStartY = 45;
        const headerHeight = 10;
        const tableBottom = pageHeight - 20;
        let y = tableStartY;
        const colWidths = headers.map(() => (pageWidth - 2 * margin) / headers.length);

        const drawTableHeader = () => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setFillColor(230, 230, 230);
            doc.rect(margin, y, pageWidth - 2 * margin, headerHeight, 'F');
            let x = margin;
            headers.forEach((header, i) => {
                doc.text(header.label, x + 2, y + headerHeight / 2 + 3, { maxWidth: colWidths[i] - 4, align: 'left' });
                x += colWidths[i];
            });
            y += headerHeight;
        };

        drawTableHeader();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        data.forEach((item, rowIndex) => {
            const rowData = headers.map(h => String(item[h.key] ?? ''));
            
            let maxLines = 1;
            rowData.forEach((cell, i) => {
                const lines = doc.splitTextToSize(cell, colWidths[i] - 4);
                if (lines.length > maxLines) maxLines = lines.length;
            });
            const neededHeight = maxLines * 5 + 4;

            if (y + neededHeight > tableBottom) {
                doc.addPage();
                pageCount++;
                addHeader(title);
                addFooter(pageCount);
                y = tableStartY;
                drawTableHeader();
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
            }

            if (rowIndex % 2 !== 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, y, pageWidth - 2 * margin, neededHeight, 'F');
            }

            let x = margin;
            rowData.forEach((cell, i) => {
                doc.text(cell, x + 2, y + neededHeight / 2 - (maxLines - 1) * 1.5 + 2, { maxWidth: colWidths[i] - 4, align: 'left' });
                x += colWidths[i];
            });
            
            y += neededHeight;
        });

        doc.save(filename);
    };

    // FIX: Made startDate and endDate optional to match calls from DataCard components.
    const handleDownload = (type, dataType, startDate?, endDate?) => {
        if (dataType === 'finance') {
             if (!startDate || !endDate) {
                alert("Periode tanggal harus diisi untuk laporan keuangan.");
                return;
            }

            const filteredPOs = purchaseOrders.filter(po => po.orderDate >= startDate && po.orderDate <= endDate);
            const filteredInvoices = invoices.filter(inv => inv.issueDate >= startDate && inv.issueDate <= endDate);
            
            const totalRevenue = filteredInvoices.filter(i => i.status === InvoiceStatus.PAID).reduce((sum, i) => sum + i.amount, 0);
            const totalExpenses = filteredPOs.reduce((sum, po) => sum + po.totalPrice, 0);
            const netProfit = totalRevenue - totalExpenses;
            const accountsReceivable = filteredInvoices.filter(i => i.status !== InvoiceStatus.PAID).reduce((sum, i) => sum + i.amount, 0);

            const periodString = `Periode: ${new Date(startDate).toLocaleDateString('id-ID')} s/d ${new Date(endDate).toLocaleDateString('id-ID')}`;

            if (type === 'csv') {
                let csvContent = "Laporan Keuangan\n";
                csvContent += `${periodString}\n\n`;
                csvContent += "Ringkasan\n";
                csvContent += "Item,Jumlah (Rp)\n";
                csvContent += `"Total Pendapatan (dari Invoice Lunas)","${totalRevenue}"\n`;
                csvContent += `"Total Pengeluaran (dari PO)","${totalExpenses}"\n`;
                csvContent += `"Laba/Rugi Bersih","${netProfit}"\n`;
                csvContent += `"Piutang (Invoice Belum Dibayar)","${accountsReceivable}"\n\n`;

                csvContent += "Rincian Pendapatan (Invoice Lunas)\n";
                csvContent += "Invoice No.,Tanggal Lunas,SPPG,Jumlah (Rp)\n";
                filteredInvoices.filter(i => i.status === InvoiceStatus.PAID).forEach(inv => {
                    csvContent += `"${inv.invoiceNumber}","${inv.issueDate}","${getSppgName(inv.sppgId)}","${inv.amount}"\n`;
                });
                csvContent += "\n";

                csvContent += "Rincian Pengeluaran (Purchase Orders)\n";
                csvContent += "PO No.,Tanggal Order,Supplier,Jumlah (Rp)\n";
                filteredPOs.forEach(po => {
                    csvContent += `"${po.poNumber}","${po.orderDate}","${po.supplier}","${po.totalPrice}"\n`;
                });

                downloadCSV(csvContent, 'laporan-keuangan.csv');

            } else { // PDF
                // FIX: Cast window to 'any' to access jspdf library which is loaded via script tag.
                const { jsPDF } = (window as any).jspdf;
                const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 14;
                let pageCount = 1;

                const addHeader = (pageTitle) => {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(14);
                    doc.text('KDMP Penfui Timur', margin, 18);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.text('Jln. Matani Raya, Penfui Timur, Kupang, NTT | Telp: 0853-3917-0645', margin, 24);
                    doc.setDrawColor(180);
                    doc.line(margin, 27, pageWidth - margin, 27);
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text(pageTitle, pageWidth / 2, 38, { align: 'center' });
                };
            
                const addFooter = (pageNumber) => {
                    doc.setFontSize(8);
                    doc.text(`Halaman ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
                };

                addHeader("Laporan Keuangan");
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(periodString, margin, 44);
                addFooter(pageCount);

                let y = 55;
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text("Ringkasan Keuangan", margin, y);
                y += 8;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                const summaryItems = [
                    { label: "Total Pendapatan:", value: `Rp ${totalRevenue.toLocaleString('id-ID')}` },
                    { label: "Total Pengeluaran:", value: `Rp ${totalExpenses.toLocaleString('id-ID')}` },
                    { label: "Piutang:", value: `Rp ${accountsReceivable.toLocaleString('id-ID')}` },
                ];
                summaryItems.forEach(item => { doc.text(item.label, margin, y); doc.text(item.value, 80, y, { align: 'right' }); y += 7; });
                
                y += 2;
                doc.setDrawColor(180);
                doc.line(margin, y, 80, y);
                y += 5;

                doc.setFont('helvetica', 'bold');
                doc.text("Laba / Rugi Bersih:", margin, y);
                doc.setTextColor(netProfit >= 0 ? 34 : 220, netProfit >= 0 ? 34 : 38, netProfit >= 0 ? 34 : 38);
                doc.text(`Rp ${netProfit.toLocaleString('id-ID')}`, 80, y, { align: 'right' });
                doc.setTextColor(0, 0, 0);
                y += 15;

                const drawTable = (title, headers, data, startY) => {
                    let tableY = startY;
                    const headerHeight = 9;
                    const tableBottom = pageHeight - 20;

                    const drawHeader = () => {
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(9);
                        doc.setFillColor(230, 230, 230);
                        doc.rect(margin, tableY, pageWidth - 2 * margin, headerHeight, 'F');
                        let x = margin;
                        headers.forEach(h => {
                            doc.text(h.label, x + 2, tableY + headerHeight / 2 + 3, { maxWidth: h.width - 4 });
                            x += h.width;
                        });
                        tableY += headerHeight;
                    };

                    if (data.length === 0) {
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'italic');
                        doc.text(`Tidak ada data ${title.toLowerCase()} untuk periode ini.`, margin, startY + 8);
                        return startY + 15;
                    }
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(title, margin, tableY);
                    tableY += 8;

                    drawHeader();
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);

                    data.forEach((item, rowIndex) => {
                        const rowData = headers.map(h => String(item[h.key] || ''));
                        let maxLines = 1;
                        rowData.forEach((cell, i) => {
                            const lines = doc.splitTextToSize(cell, headers[i].width - 4);
                            if (lines.length > maxLines) maxLines = lines.length;
                        });
                        const neededHeight = maxLines * 4 + 5;

                        if (tableY + neededHeight > tableBottom) {
                            doc.addPage();
                            pageCount++;
                            addHeader("Laporan Keuangan");
                            doc.setFontSize(10);
                            doc.setFont('helvetica', 'normal');
                            doc.text(periodString, margin, 44);
                            addFooter(pageCount);
                            tableY = 40;
                            drawHeader();
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(8);
                        }
                        
                        if (rowIndex % 2 !== 0) {
                            doc.setFillColor(245, 245, 245);
                            doc.rect(margin, tableY, pageWidth - 2 * margin, neededHeight, 'F');
                        }
                        
                        let x = margin;
                        rowData.forEach((cell, i) => {
                            doc.text(cell, x + 2, tableY + neededHeight / 2 - (maxLines - 1) * 1.5 + 1.5, { maxWidth: headers[i].width - 4 });
                            x += headers[i].width;
                        });
                        tableY += neededHeight;
                    });
                    return tableY;
                };

                const incomeData = filteredInvoices.filter(i => i.status === InvoiceStatus.PAID).map(i => ({...i, sppgName: getSppgName(i.sppgId), amountFmt: `Rp ${i.amount.toLocaleString('id-ID')}`}));
                const incomeHeaders = [
                    { key: 'invoiceNumber', label: 'Invoice No.', width: 40 }, { key: 'issueDate', label: 'Tanggal', width: 30 },
                    { key: 'sppgName', label: 'SPPG', width: 80 }, { key: 'amountFmt', label: 'Jumlah', width: 32 }
                ];
                y = drawTable('Rincian Pendapatan (Invoice Lunas)', incomeHeaders, incomeData, y);

                y += 10;
                
                if (y > pageHeight - 80) { doc.addPage(); pageCount++; addHeader("Laporan Keuangan"); addFooter(pageCount); y = 40; }
                
                const expenseData = filteredPOs.map(po => ({...po, totalPriceFmt: `Rp ${po.totalPrice.toLocaleString('id-ID')}`}));
                const expenseHeaders = [
                    { key: 'poNumber', label: 'PO No.', width: 40 }, { key: 'orderDate', label: 'Tanggal', width: 30 },
                    { key: 'supplier', label: 'Supplier', width: 80 }, { key: 'totalPriceFmt', label: 'Jumlah', width: 32 }
                ];
                drawTable('Rincian Pengeluaran (Purchase Order)', expenseHeaders, expenseData, y);

                doc.save('laporan-keuangan.pdf');
            }
            return;
        }


        let data, headers, title, filename;

        switch(dataType) {
            case 'po':
                data = purchaseOrders;
                headers = [
                    { key: 'poNumber', label: 'PO Number' }, { key: 'orderDate', label: 'Tanggal' },
                    { key: 'totalCartons', label: 'Total Karton' }, { key: 'totalPrice', label: 'Total Harga' },
                    { key: 'status', label: 'Status' }, { key: 'remainingCartons', label: 'Sisa Stok' },
                ];
                title = 'Data Purchase Order';
                filename = 'data-purchase-order';
                break;
            case 'dist':
                data = distributions.map(d => ({...d, sppgName: sppgs.find(s => s.id === d.sppgId)?.name || 'N/A', coordinatorName: coordinators.find(c => c.id === d.coordinatorId)?.name || 'N/A' }));
                headers = [
                    { key: 'suratJalanNumber', label: 'Surat Jalan' }, { key: 'distributionDate', label: 'Tanggal' },
                    { key: 'sppgName', label: 'SPPG' }, { key: 'coordinatorName', label: 'Korwil' },
                    { key: 'cartons', label: 'Jml Karton' }, { key: 'status', label: 'Status' },
                ];
                title = 'Data Distribusi';
                filename = 'data-distribusi';
                break;
            case 'inv':
                data = invoices.map(i => ({...i, sppgName: sppgs.find(s => s.id === i.sppgId)?.name || 'N/A'}));
                headers = [
                    { key: 'invoiceNumber', label: 'Invoice No.' }, { key: 'issueDate', label: 'Tgl Terbit' },
                    { key: 'dueDate', label: 'Jatuh Tempo' }, { key: 'sppgName', label: 'SPPG' },
                    { key: 'amount', label: 'Jumlah (Rp)' }, { key: 'status', label: 'Status' },
                ];
                title = 'Data Invoice';
                filename = 'data-invoice';
                break;
            case 'sppg':
                data = sppgs;
                headers = [
                    { key: 'name', label: 'Nama SPPG' }, { key: 'district', label: 'Kab/Kota' },
                    { key: 'address', label: 'Alamat' }, { key: 'contactPerson', label: 'PJ' },
                    { key: 'contactPhone', label: 'Telepon' },
                ];
                title = 'Data SPPG';
                filename = 'data-sppg';
                break;
            case 'coord':
                data = coordinators;
                headers = [
                    { key: 'name', label: 'Nama Korwil' }, { key: 'region', label: 'Wilayah' },
                    { key: 'contactPerson', label: 'Kontak' }, { key: 'contactPhone', label: 'Telepon' },
                    { key: 'stock', label: 'Stok' },
                ];
                title = 'Data Koordinator';
                filename = 'data-koordinator';
                break;
            default: return;
        }

        if (type === 'csv') {
            downloadCSV(convertToCSV(data, headers), `${filename}.csv`);
        } else {
            downloadGenericPDF(data, headers, title, `${filename}.pdf`);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">Pusat Unduhan Data</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataCard title="Data Purchase Order" onDownloadExcel={() => handleDownload('csv', 'po')} onDownloadPdf={() => handleDownload('pdf', 'po')} />
                <DataCard title="Data Distribusi" onDownloadExcel={() => handleDownload('csv', 'dist')} onDownloadPdf={() => handleDownload('pdf', 'dist')} />
                <DataCard title="Data Invoice" onDownloadExcel={() => handleDownload('csv', 'inv')} onDownloadPdf={() => handleDownload('pdf', 'inv')} />
                <DataCard title="Data SPPG" onDownloadExcel={() => handleDownload('csv', 'sppg')} onDownloadPdf={() => handleDownload('pdf', 'sppg')} />
                <DataCard title="Data Koordinator (Korwil)" onDownloadExcel={() => handleDownload('csv', 'coord')} onDownloadPdf={() => handleDownload('pdf', 'coord')} />
                <FinancialReportCard onDownload={(type, start, end) => handleDownload(type, 'finance', start, end)} />
            </div>
        </div>
    );
};

export default DatabasePage;
