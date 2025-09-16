import { useState } from 'react';

// Self-contained DownloadIcon to avoid import issues  
const DownloadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

const PrintIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

const SpinnerIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const PrintableDocument = ({ isOpen, onClose, docType, distribution, sppg, coordinator }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const title = docType === 'sj' ? 'Surat Jalan' : 'Berita Acara Serah Terima (BAST)';
  const docNumber = docType === 'sj' ? distribution.suratJalanNumber : distribution.bastNumber;

  const handleDownloadPDF = async () => {
    const input = document.getElementById('printable-area');
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
        
        const fileName = `${docType.toUpperCase()}-${distribution.suratJalanNumber.replace(/\//g,'-')}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Gagal membuat PDF. Silakan coba lagi atau gunakan tombol Print.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-area');
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title} - ${docNumber}</title>
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
                    width: 100%;
                }
                
                table th, table td {
                    border: 1px solid #333;
                    padding: 8px;
                    text-align: left;
                    font-size: 11px;
                }
                
                table th {
                    background-color: #f5f5f5 !important;
                    font-weight: bold;
                }
                
                /* Hindari memotong elemen ini */
                .no-break {
                    page-break-inside: avoid;
                }
                
                /* Sembunyikan elemen yang tidak perlu saat print */
                .no-print {
                    display: none !important;
                }
                
                /* Styling spesifik untuk elemen dokumen */
                .doc-header {
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                
                .doc-signature {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                }
                
                .doc-signature > div {
                    width: 45%;
                    text-align: center;
                    font-size: 11px;
                }
                
                img {
                    max-width: 60px;
                    height: auto;
                }
                
                h1 { font-size: 14px; margin: 0 0 5px 0; }
                h2 { font-size: 16px; margin: 10px 0; }
                h3 { font-size: 12px; margin: 10px 0 5px 0; }
                p { font-size: 11px; margin: 3px 0; }
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
      {/* Print-specific CSS styles - same approach as PrintableInvoice */}
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
              
              .printable-document-container {
                  width: 100% !important;
                  max-width: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  background: white !important;
              }
          }
          
          .printable-document-container {
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
              <h3 className="text-lg font-bold text-gray-900">Pratinjau {title}</h3>
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
                  id="printable-area" 
                  className="printable-document-container bg-white shadow-lg mx-auto"
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
<div className="pb-2 doc-header no-break">
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
</div>

{/* Garis pemisah */}
<div className="border-b-2 border-black mb-6"></div>

{/* Title */}
<div className="text-center mb-6">
    <h2 className="text-xl font-bold uppercase underline">{title}</h2>
    <p className="text-sm text-gray-600 mt-1">Nomor: {docNumber}</p>
</div>

                {docType === 'sj' ? (
                  <section className="mb-6 text-sm no-break">
                      <p className="mb-4">Tanggal: {new Date(distribution.distributionDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="mb-4">Dengan ini kami kirimkan barang-barang kepada:</p>
                      <table className="text-sm mb-6" style={{ borderCollapse: 'collapse', border: 'none' }}>
                          <tbody>
                              <tr>
                                  <td style={{ border: 'none', padding: '2px 0', width: '100px' }} className="font-bold">Penerima</td>
                                  <td style={{ border: 'none', padding: '2px 8px', width: '10px' }}>:</td>
                                  <td style={{ border: 'none', padding: '2px 0' }}>{sppg?.name || 'N/A'}</td>
                              </tr>
                              <tr>
                                  <td style={{ border: 'none', padding: '2px 0' }} className="font-bold">Alamat</td>
                                  <td style={{ border: 'none', padding: '2px 8px' }}>:</td>
                                  <td style={{ border: 'none', padding: '2px 0' }}>{sppg?.address || 'N/A'}, {sppg?.district}</td>
                              </tr>
                          </tbody>
                      </table>
                  </section>
                ) : (
                  <section className="mb-6 text-sm space-y-4 no-break">
                      <p>Pada hari ini, {new Date(distribution.distributionDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, yang bertanda tangan di bawah ini:</p>
                      
                      <div className="pl-4">
                          <table className="text-sm mb-2" style={{ borderCollapse: 'collapse', border: 'none' }}>
                              <tbody>
                                  <tr>
                                      <td style={{ border: 'none', padding: '1px 0', width: '80px' }}>Nama</td>
                                      <td style={{ border: 'none', padding: '1px 8px', width: '10px' }}>:</td>
                                      <td style={{ border: 'none', padding: '1px 0' }} className="font-semibold">{coordinator?.name || '..............................'}</td>
                                  </tr>
                                  <tr>
                                      <td style={{ border: 'none', padding: '1px 0' }}>Lembaga</td>
                                      <td style={{ border: 'none', padding: '1px 8px' }}>:</td>
                                      <td style={{ border: 'none', padding: '1px 0' }} className="font-semibold">KDMP Penfui Timur</td>
                                  </tr>
                                  <tr>
                                      <td style={{ border: 'none', padding: '1px 0' }}>Jabatan</td>
                                      <td style={{ border: 'none', padding: '1px 8px' }}>:</td>
                                      <td style={{ border: 'none', padding: '1px 0' }} className="font-semibold">Koordinator Wilayah {coordinator?.region || ''}</td>
                                  </tr>
                              </tbody>
                          </table>
                          <p className="mt-2">Selanjutnya disebut sebagai <span className="font-bold">PIHAK PERTAMA</span>.</p>
                      </div>
                      
                      <div className="pl-4">
                          <table className="text-sm mb-2" style={{ borderCollapse: 'collapse', border: 'none' }}>
                              <tbody>
                                  <tr>
                                      <td style={{ border: 'none', padding: '1px 0', width: '80px' }}>Nama</td>
                                      <td style={{ border: 'none', padding: '1px 8px', width: '10px' }}>:</td>
                                      <td style={{ border: 'none', padding: '1px 0' }} className="font-semibold">..............................</td>
                                  </tr>
                                  <tr>
                                      <td style={{ border: 'none', padding: '1px 0' }}>Jabatan</td>
                                      <td style={{ border: 'none', padding: '1px 8px' }}>:</td>
                                      <td style={{ border: 'none', padding: '1px 0' }} className="font-semibold">..............................</td>
                                  </tr>
                              </tbody>
                          </table>
                          <p className="mt-2">Selanjutnya disebut sebagai <span className="font-bold">PIHAK KEDUA</span>.</p>
                      </div>
                      
                      <p>Dengan ini menyatakan bahwa PIHAK PERTAMA telah menyerahkan barang kepada PIHAK KEDUA, dan PIHAK KEDUA telah menerima barang dengan rincian sebagai berikut:</p>
                  </section>
                )}

                {/* Items Table */}
                <div className="mb-6 no-break">
                    <h3 className="font-bold mb-4 text-sm">Rincian Barang:</h3>
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 font-bold text-xs text-center border border-gray-300" style={{ width: '10%' }}>No.</th>
                                <th className="p-3 font-bold text-xs text-left border border-gray-300" style={{ width: '50%' }}>Nama Barang</th>
                                <th className="p-3 font-bold text-xs text-center border border-gray-300" style={{ width: '20%' }}>Jumlah</th>
                                <th className="p-3 font-bold text-xs text-left border border-gray-300" style={{ width: '20%' }}>Satuan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-3 text-center border border-gray-300 align-top">1</td>
                                <td className="p-3 border border-gray-300 align-top">Susu Milk Pro</td>
                                <td className="p-3 text-center border border-gray-300 align-top font-semibold">{distribution.cartons.toLocaleString('id-ID')}</td>
                                <td className="p-3 border border-gray-300 align-top">Kartoon Box</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <section className="mb-8 text-sm no-break">
                    {docType === 'sj' ? (
                        <p>Mohon barang diterima dan diperiksa dengan baik. Terima kasih.</p>
                    ) : (
                        <>
                          <p className="mb-4">Barang diterima dalam kondisi baik dan sesuai dengan rincian di atas.</p>
                          <p>Demikian Berita Acara Serah Terima ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
                        </>
                    )}
                </section>

                {/* Signature */}
                <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="doc-signature flex justify-between text-center">
                        {docType === 'sj' ? (
                          <>
                             <div className="text-center text-xs" style={{ width: '45%' }}>
                                  <p className="mb-2">Hormat Kami,</p>
                                  <p className="font-bold mb-2">Koordinator Wilayah</p>
                                  <div style={{ height: '60px' }}></div>
                                  <p className="font-bold underline mb-1">( {coordinator?.name || '___________________'} )</p>
                              </div>
                              <div className="text-center text-xs" style={{ width: '45%' }}>
                                  <p className="mb-2">Diterima oleh,</p>
                                  <p className="font-bold mb-2">&nbsp;</p>
                                  <div style={{ height: '60px' }}></div>
                                  <p className="font-bold underline mb-1">( _________________________ )</p>
                              </div>
                          </>
                        ) : (
                          <>
                              <div className="text-center text-xs" style={{ width: '45%' }}>
                                  <p className="mb-2">Yang Menyerahkan,</p>
                                  <p className="font-bold mb-2">PIHAK PERTAMA</p>
                                  <div style={{ height: '60px' }}></div>
                                  <p className="font-bold underline mb-1">( {coordinator?.name || '___________________'} )</p>
                              </div>
                              <div className="text-center text-xs" style={{ width: '45%' }}>
                                  <p className="mb-2">Yang Menerima,</p>
                                  <p className="font-bold mb-2">PIHAK KEDUA</p>
                                  <div style={{ height: '60px' }}></div>
                                  <p className="font-bold underline mb-1">( _________________________ )</p>
                              </div>
                          </>
                        )}
                    </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintableDocument;