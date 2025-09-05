import { useState } from 'react';
import { DownloadIcon } from './icons/Icons.jsx';

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
        const { jsPDF } = window.jspdf;
        const canvas = await window.html2canvas(input, {
            scale: 2,
            useCORS: true, 
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps= pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const fileName = `${docType.toUpperCase()}-${distribution.suratJalanNumber.replace(/\//g,'-')}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-3xl">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
            <div>
                 <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg mr-2 hover:bg-primary-light disabled:bg-gray-400"
                >
                    {isDownloading ? (
                        <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengunduh...
                        </>
                    ) : (
                        <>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download
                        </>
                    )}
                </button>
                 <button onClick={onClose} className="text-gray-400 hover:text-gray-600 inline-flex items-center justify-center p-1 align-middle">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
            </div>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto" >
            <div id="printable-area" className="bg-white p-8 text-black font-['Arial'] text-sm">
              <header className="mb-8">
                  <div className="border-b-2 border-black pb-4">
                      <div className="flex items-center">
                        <img src="https://res.cloudinary.com/dnci7vkv4/image/upload/v1756788264/logo-kdmp_e0gttt.png" alt="KDMP Logo" className="h-16 mr-4" />
                        <div className="leading-tight">
                            <h1 className="text-base font-bold mb-1">KDMP PENFUI TIMUR</h1>
                            <p className="text-[10px]">Jln Matani Raya, Ds. Penfui Timur, Kupang, NTT</p>
                            <p className="text-[10px]">Badan Hukum No: AHU 002709.AH..01.29.TAHUN 2025</p>
                            <p className="text-[10px]">Telp: 0853-3917-0645 | Email: kopdesmerahputihpenfuitimur@gmail.com</p>
                        </div>
                      </div>
                  </div>
                   <div className="text-center mt-4">
                        <h2 className="text-2xl font-bold uppercase underline">{title}</h2>
                        <p className="text-sm text-gray-600 mt-1">Nomor: {docNumber}</p>
                    </div>
              </header>

                {docType === 'sj' ? (
                  <section className="mb-6 text-sm">
                      <p>Tanggal: {new Date(distribution.distributionDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="mt-4">Dengan ini kami kirimkan barang-barang kepada:</p>
                      <div className="grid grid-cols-[100px_1fr] gap-x-4 mt-2">
                          <div className="font-bold">Penerima</div>
                          <div>{sppg?.name || 'N/A'}</div>
                          <div className="font-bold">Alamat</div>
                          <div>{sppg?.address || 'N/A'}, {sppg?.district}</div>
                      </div>
                  </section>
                ) : (
                  <section className="mb-6 text-sm space-y-3">
                      <p>Pada hari ini, {new Date(distribution.distributionDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, yang bertanda tangan di bawah ini:</p>
                      <div className="pl-4">
                          <div className="grid grid-cols-[80px_10px_1fr] gap-x-2">
                              <span>Nama</span><span>:</span><span className="font-semibold">{coordinator?.name || '..............................'}</span>
                              <span>Lembaga</span><span>:</span><span className="font-semibold">KDMP Penfui Timur</span>
                              <span>Jabatan</span><span>:</span><span className="font-semibold">Koordinator Wilayah {coordinator?.region || ''}</span>
                          </div>
                          <p className="mt-1">Selanjutnya disebut sebagai <span className="font-bold">PIHAK PERTAMA</span>.</p>
                      </div>
                      <div className="pl-4">
                          <div className="grid grid-cols-[80px_10px_1fr] gap-x-2">
                              <span>Nama</span><span>:</span><span className="font-semibold">..............................</span>
                              <span>Jabatan</span><span>:</span><span className="font-semibold">..............................</span>
                          </div>
                          <p className="mt-1">Selanjutnya disebut sebagai <span className="font-bold">PIHAK KEDUA</span>.</p>
                      </div>
                      <p>Dengan ini menyatakan bahwa PIHAK PERTAMA telah menyerahkan barang kepada PIHAK KEDUA, dan PIHAK KEDUA telah menerima barang dengan rincian sebagai berikut:</p>
                  </section>
                )}


              <section className="mb-8">
                  <h3 className="font-bold mb-2 text-sm">Rincian Barang:</h3>
                  <table className="w-full text-sm border-collapse border border-gray-400">
                      <thead>
                          <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left">No.</th>
                              <th className="border border-gray-300 p-2 text-left">Nama Barang</th>
                              <th className="border border-gray-300 p-2 text-center">Jumlah</th>
                              <th className="border border-gray-300 p-2 text-left">Satuan</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td className="border border-gray-300 p-2 text-left">1</td>
                              <td className="border border-gray-300 p-2 text-left">Susu Milk Pro UHT</td>
                              <td className="border border-gray-300 p-2 text-center">{distribution.cartons.toLocaleString('id-ID')}</td>
                              <td className="border border-gray-300 p-2 text-left">Kartoon Box</td>
                          </tr>
                      </tbody>
                  </table>
              </section>

              <section className="mb-8 text-sm">
                  {docType === 'sj' ? (
                      <p>Mohon barang diterima dan diperiksa dengan baik. Terima kasih.</p>
                  ) : (
                      <>
                        <p className="mb-4">Barang diterima dalam kondisi baik dan sesuai dengan rincian di atas.</p>
                        <p>Demikian Berita Acara Serah Terima ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
                      </>
                  )}
              </section>

              <footer className="pt-12 text-sm">
                  <div className="flex justify-between text-center">
                      {docType === 'sj' ? (
                        <>
                           <div>
                                <p>Hormat Kami,</p>
                                <p className="font-bold">Koordinator Wilayah</p>
                                <div className="pt-20">
                                    <p className="font-semibold">( {coordinator?.name || '___________________'} )</p>
                                </div>
                            </div>
                            <div>
                                <p>Diterima oleh,</p>
                                <p className="font-bold">&nbsp;</p>
                                <div className="pt-20">
                                    <p className="font-semibold">( _________________________ )</p>
                                </div>
                            </div>
                        </>
                      ) : (
                        <>
                            <div>
                                <p>Yang Menyerahkan,</p>
                                <p className="font-bold">PIHAK PERTAMA</p>
                                <div className="pt-20">
                                    <p className="font-semibold">( {coordinator?.name || '___________________'} )</p>
                                </div>
                            </div>
                            <div>
                                <p>Yang Menerima,</p>
                                <p className="font-bold">PIHAK KEDUA</p>
                                <div className="pt-20">
                                    <p className="font-semibold">( _________________________ )</p>
                                </div>
                            </div>
                        </>
                      )}
                  </div>
              </footer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableDocument;