import { useState } from 'react';
import { SELLING_PRICE_PER_CARTON, BOTTLES_PER_CARTON } from '../constants.js';

// Icon Components - didefinisikan langsung di file
const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const PrintIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const CloseIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SpinnerIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// Helper function to convert number to Indonesian words
const numberToWords = (num) => {
    const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
    const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
    const thousands = ['', 'ribu', 'juta', 'miliar', 'triliun'];

    if (num === 0) return 'Nol';

    const convertLessThanThousand = (n) => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        if (n < 1000) {
            const hundred = Math.floor(n / 100);
            return (hundred === 1 ? 'seratus' : ones[hundred] + ' ratus') + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        }
        return '';
    };

    let result = '';
    let i = 0;
    let n = num;

    while (n > 0) {
        const chunk = n % 1000;
        if (chunk > 0) {
            let chunkStr = convertLessThanThousand(chunk);
            if (i > 0) {
                if (chunk === 1 && i === 1) { 
                    chunkStr = 'seribu';
                } else {
                    chunkStr += ' ' + thousands[i];
                }
            }
            result = chunkStr + (result ? ' ' + result : '');
        }
        n = Math.floor(n / 1000);
        i++;
    }
    
    const finalResult = result.trim();
    return finalResult.charAt(0).toUpperCase() + finalResult.slice(1);
};

const PrintableInvoice = ({ isOpen, onClose, invoice, distribution, sppg }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Sample data untuk preview jika props tidak ada
  const sampleInvoice = {
    invoiceNumber: 'INV/2025/001',
    issueDate: new Date().toISOString(),
    amount: 750000
  };
  
  const sampleDistribution = {
    bastNumber: 'BAST/2025/001', 
    distributionDate: new Date().toISOString(),
    cartons: 10
  };
  
  const sampleSppg = {
    name: 'Toko ABC',
    address: 'Jln. Contoh No. 123, Ende'
  };
  
  // Gunakan sample data jika props tidak ada (untuk demo)
  const invoiceData = invoice || sampleInvoice;
  const distributionData = distribution || sampleDistribution;
  const sppgData = sppg || sampleSppg;
  
  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    const input = document.getElementById('printable-invoice-area');
    if (!input || isDownloading) return;

    setIsDownloading(true);
    try {
        // Cek apakah jsPDF dan html2canvas tersedia
        if (!window.jspdf || !window.html2canvas) {
            alert('Perpustakaan PDF tidak tersedia. Silakan gunakan tombol Print sebagai alternatif.');
            return;
        }

        const { jsPDF } = window.jspdf;
        
        // Improved canvas configuration untuk kualitas dan sizing yang lebih baik
        const canvas = await window.html2canvas(input, {
            scale: 1.5,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            width: input.scrollWidth,
            height: input.scrollHeight,
            windowWidth: 794, // A4 width dalam pixels pada 96 DPI
            windowHeight: 1123 // A4 height dalam pixels pada 96 DPI
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Dimensi A4 dalam mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        
        // Hitung dimensi gambar agar fit A4 dengan margin
        const margin = 10;
        const maxWidth = pdfWidth - (margin * 2);
        const maxHeight = pdfHeight - (margin * 2);
        
        const imgProps = pdf.getImageProperties(imgData);
        const imgRatio = imgProps.height / imgProps.width;
        
        let finalWidth = maxWidth;
        let finalHeight = maxWidth * imgRatio;
        
        // Jika height melebihi max, scale down
        if (finalHeight > maxHeight) {
            finalHeight = maxHeight;
            finalWidth = maxHeight / imgRatio;
        }

        // Center gambar di halaman
        const xPos = (pdfWidth - finalWidth) / 2;
        const yPos = margin;

        pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight);
        
        const fileName = `INVOICE-${invoiceData.invoiceNumber.replace(/\//g,'-')}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Gagal membuat PDF. Silakan coba lagi atau gunakan tombol Print.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice-area');
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${invoiceData.invoiceNumber}</title>
            <style>
                /* Print-specific styles */
                @page {
                    size: A4;
                    margin: 15mm;
                }
                
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #333;
                    background: white;
                }
                
                .print-container {
                    width: 100%;
                    max-width: none;
                    margin: 0;
                    padding: 0;
                }
                
                /* Pastikan tabel tidak putus */
                table {
                    page-break-inside: avoid;
                    border-collapse: collapse;
                }
                
                /* Hindari memotong elemen ini */
                .no-break {
                    page-break-inside: avoid;
                }
                
                /* Sembunyikan elemen yang tidak perlu saat print */
                .no-print {
                    display: none !important;
                }
                
                /* Styling spesifik untuk elemen invoice */
                .invoice-header {
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                
                .invoice-table th {
                    background-color: #f5f5f5 !important;
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                
                .invoice-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                
                img {
                    max-width: 64px;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                ${printContent.outerHTML}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
  };

  return (
     <>
        {/* Print-specific CSS styles */}
        <style>{`
            @media print {
                @page {
                    size: A4;
                    margin: 15mm;
                }
                
                .print-only {
                    display: block !important;
                }
                
                .no-print {
                    display: none !important;
                }
                
                .printable-invoice-container {
                    width: 100% !important;
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    background: white !important;
                }
            }
            
            .printable-invoice-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                box-sizing: border-box;
            }
        `}</style>
        
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[200] flex justify-center items-center p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-900">Pratinjau Invoice</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <PrintIcon className="mr-2 h-4 w-4" />
                        Print
                    </button>
                     <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isDownloading ? (
                            <>
                            <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                            Mengunduh...
                            </>
                        ) : (
                            <>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download PDF
                            </>
                        )}
                    </button>
                     <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                     >
                        <CloseIcon className="w-6 h-6" />
                     </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                <div 
                    id="printable-invoice-area" 
                    className="printable-invoice-container bg-white shadow-lg mx-auto"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '15mm',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '12px',
                        lineHeight: '1.4',
                        color: '#333'
                    }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start pb-4 mb-6 border-b-2 border-black invoice-header no-break">
                        <div className="flex items-start">
                            <img 
                                src="https://res.cloudinary.com/dnci7vkv4/image/upload/v1756788264/logo-kdmp_e0gttt.png" 
                                alt="KDMP Logo" 
                                className="h-16 mr-4 flex-shrink-0" 
                                style={{ maxWidth: '64px', height: 'auto' }}
                            />
                            <div className="leading-tight">
                                <h1 className="text-base font-bold mb-0.5 leading-none">
        KOPERASI DESA MERAH PUTIH<br />
        PENFUI TIMUR
    </h1>
                                <p className="text-[10px] mb-0.5">Jln Matani Raya, Ds. Penfui Timur, Kupang, NTT</p>
                                <p className="text-[10px] mb-0.5">Badan Hukum No: AHU 002709.AH..01.29.TAHUN 2025</p>
                                <p className="text-[10px]">Telp: 0853-3917-0645 | Email: kopdesmerahputihpenfuitimur@gmail.com</p>
                            </div>
                        </div>
                        <div className="bg-gray-100 px-6 py-3 rounded-md flex-shrink-0">
                            <h2 className="text-2xl font-serif font-bold tracking-widest">INVOICE</h2>
                        </div>
                    </div>

                    {/* Recipient & Details */}
                    <div className="flex justify-between mb-6 no-break">
                        <div className="text-xs flex-1">
                            <p className="mb-1">Kepada Yth.</p>
                            <p className="font-semibold text-sm mb-1">{sppgData.name}</p>
                            <p>{sppgData.address}</p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                            <table className="text-xs leading-tight">
                                <tbody>
                                    <tr><td className="font-semibold pr-3 py-0.5">Invoice No</td><td className="px-2">:</td><td>{invoiceData.invoiceNumber}</td></tr>
                                    <tr><td className="font-semibold pr-3 py-0.5">Tanggal</td><td className="px-2">:</td><td>{new Date(invoiceData.issueDate).toLocaleDateString('id-ID')}</td></tr>
                                    <tr className="h-2"><td colSpan={3}></td></tr>
                                    <tr><td className="font-semibold pr-3 py-0.5" colSpan={3}>Berdasarkan:</td></tr>
                                    <tr><td className="font-semibold pr-3 py-0.5">BAST No</td><td className="px-2">:</td><td>{distributionData.bastNumber}</td></tr>
                                    <tr><td className="font-semibold pr-3 py-0.5">Tanggal</td><td className="px-2">:</td><td>{new Date(distributionData.distributionDate).toLocaleDateString('id-ID')}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-6 no-break">
                        <table className="w-full invoice-table" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 font-semibold text-xs text-center border border-gray-300" style={{ width: '8%' }}>No</th>
                                    <th className="p-3 font-semibold text-xs text-left border border-gray-300" style={{ width: '35%' }}>Deskripsi Produk</th>
                                    <th className="p-3 font-semibold text-xs text-center border border-gray-300" style={{ width: '12%' }}>Satuan</th>
                                    <th className="p-3 font-semibold text-xs text-center border border-gray-300" style={{ width: '12%' }}>Jumlah</th>
                                    <th className="p-3 font-semibold text-xs text-right border border-gray-300" style={{ width: '16%' }}>Harga Satuan (Rp)</th>
                                    <th className="p-3 font-semibold text-xs text-right border border-gray-300" style={{ width: '17%' }}>Total Harga (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 text-center border border-gray-300 align-top">1</td>
                                    <td className="p-3 border border-gray-300 align-top">
                                        <div className="font-medium mb-1">Susu Milk Pro</div>
                                        <div className="text-gray-600 text-xs">Kemasan: Dus, Isi: {BOTTLES_PER_CARTON} pcs/dus</div>
                                    </td>
                                    <td className="p-3 text-center border border-gray-300 align-top">Dus</td>
                                    <td className="p-3 text-center border border-gray-300 align-top">{distributionData.cartons}</td>
                                    <td className="p-3 text-right border border-gray-300 align-top">{SELLING_PRICE_PER_CARTON.toLocaleString('id-ID')}</td>
                                    <td className="p-3 text-right border border-gray-300 align-top font-medium">{invoiceData.amount.toLocaleString('id-ID')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Totals & Terbilang */}
                    <div className="mb-8 pt-4 border-t border-gray-200 no-break">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                               <p className="text-xs">
                                   <span className="font-bold">Terbilang:</span> 
                                   <span className="italic ml-1">{numberToWords(invoiceData.amount)} Rupiah</span>
                               </p>
                            </div>
                            <div className="flex-shrink-0" style={{ minWidth: '200px' }}>
                               <div className="bg-gray-100 p-4 rounded text-right">
                                   <div className="font-bold text-sm">TOTAL TAGIHAN: Rp {invoiceData.amount.toLocaleString('id-ID')}</div>
                               </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment & Signature */}
                    <div className="flex justify-between mt-auto pt-6 border-t border-gray-200">
                        <div className="flex-1">
                             <table className="text-xs leading tight">
                                <tbody>
                                    <tr>
                                        <td className="font-semibold pr-4 py-0.5 align-top" style={{ width: '80px' }}>Pembayaran</td>
                                        <td className="px-2 py-0.5 align-top">:</td>
                                        <td className="py-0.5 align-top">Transfer Bank</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold pr-4 py-0.5 align-top">Nama</td>
                                        <td className="px-2 py-0.5 align-top">:</td>
                                        <td className="py-0.5 align-top">Koperasi Desa Merah Putih Penfui Timur</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold pr-4 py-0.5 align-top">Bank</td>
                                        <td className="px-2 py-0.5 align-top">:</td>
                                        <td className="py-0.5 align-top">Bank BRI</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold pr-4 py-0.5 align-top">No. Rek</td>
                                        <td className="px-2 py-0.5 align-top">:</td>
                                        <td className="py-0.5 align-top">1696-01-0000061-30-9</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="text-center text-xs flex-shrink-0 ml-8">
                            <p className="mb-1">Hormat Kami</p>
                            <p className="mb-1">KDMP Penfui Timur</p>
                            <div style={{ height: '60px' }}></div> {/* Spacer untuk tanda tangan */}
                            <p className="font-bold underline mb-1">Susi Wahyuni, M.Si</p>
                            <p>Manajer Distribusi</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
     </>
  );
};

export default PrintableInvoice;