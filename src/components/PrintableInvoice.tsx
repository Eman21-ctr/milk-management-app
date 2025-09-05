import { useState } from 'react';
import { type Invoice, type Distribution, type SPPG, type Coordinator } from '../types';
import { DownloadIcon } from './icons/Icons';
import { SELLING_PRICE_PER_CARTON, BOTTLES_PER_CARTON } from '../constants';

// Helper function to convert number to Indonesian words
const numberToWords = (num: number): string => {
    const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
    const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
    const thousands = ['', 'ribu', 'juta', 'miliar', 'triliun'];

    if (num === 0) return 'Nol';

    const convertLessThanThousand = (n: number): string => {
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

interface PrintableInvoiceProps {
    isOpen: boolean;
    onClose: () => void;
    invoice?: Invoice;
    distribution?: Distribution;
    sppg?: SPPG;
    coordinator?: Coordinator;
}

const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ isOpen, onClose, invoice, distribution, sppg }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (!isOpen || !invoice || !distribution || !sppg) return null;

  const handleDownloadPDF = async () => {
    const input = document.getElementById('printable-invoice-area');
    if (!input || isDownloading) return;

    setIsDownloading(true);
    try {
        const { jsPDF } = (window as any).jspdf;
        const canvas = await (window as any).html2canvas(input, {
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
        
        const fileName = `INVOICE-${invoice.invoiceNumber.replace(/\//g,'-')}.pdf`;
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
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-4xl">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary">Pratinjau Invoice</h3>
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
        <div className="p-2 max-h-[80vh] overflow-y-auto bg-gray-200" >
            <div id="printable-invoice-area" className="bg-white p-10 mx-auto max-w-3xl text-gray-800 font-['Arial'] text-sm">
                {/* Header */}
                <div className="flex justify-between items-start pb-4 border-b-2 border-black">
                    <div className="flex items-center">
                        <img src="https://res.cloudinary.com/dnci7vkv4/image/upload/v1756788264/logo-kdmp_e0gttt.png" alt="KDMP Logo" className="h-16 mr-4" />
                        <div className="leading-tight">
                            <h1 className="text-base font-bold mb-1">KDMP PENFUI TIMUR</h1>
                            <p className="text-[10px]">Jln Matani Raya, Ds. Penfui Timur, Kupang, NTT</p>
                            <p className="text-[10px]">Badan Hukum No: AHU 002709.AH..01.29.TAHUN 2025</p>
                            <p className="text-[10px]">Telp: 0853-3917-0645 | Email: kopdesmerahputihpenfuitimur@gmail.com</p>
                        </div>
                    </div>
                    <div className="bg-gray-100 px-6 py-2 rounded-md">
                        <h2 className="text-2xl font-serif font-bold tracking-widest">INVOICE</h2>
                    </div>
                </div>

                {/* Recipient & Details */}
                <div className="flex justify-between mt-6">
                    <div className="text-xs">
                        <p>Kepada Yth.</p>
                        <p className="font-semibold text-sm">{sppg.name}</p>
                        <p>{sppg.address}</p>
                    </div>
                    <div>
                        <table className="text-left text-[10px]">
                            <tbody>
                                <tr><td className="font-semibold pr-2">Invoice No</td><td className="px-1">:</td><td>{invoice.invoiceNumber}</td></tr>
                                <tr><td className="font-semibold pr-2">Tanggal</td><td className="px-1">:</td><td>{new Date(invoice.issueDate).toLocaleDateString('id-ID')}</td></tr>
                                <tr className="h-1"><td colSpan={3}></td></tr>
                                <tr><td className="font-semibold pr-2" colSpan={3}>Berdasarkan:</td></tr>
                                <tr><td className="font-semibold pr-2">BAST No</td><td className="px-1">:</td><td>{distribution.bastNumber}</td></tr>
                                <tr><td className="font-semibold pr-2">Tanggal</td><td className="px-1">:</td><td>{new Date(distribution.distributionDate).toLocaleDateString('id-ID')}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mt-6">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-center">No</th>
                                <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-left">Deskripsi Produk</th>
                                <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-center">Satuan</th>
                                <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-center">Jumlah</th>
                                <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">Harga Satuan (Rp)</th>
                                <th className="p-2 font-semibold text-[9px] uppercase tracking-wider text-right">Total Harga (Rp)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-xs">
                            <tr>
                                <td className="p-2 text-center align-top h-24">1</td>
                                <td className="p-2 align-top">
                                    Susu Milk Pro
                                    <br />
                                    <span className="text-gray-600 text-[10px]">Kemasan: Dus, Isi: {BOTTLES_PER_CARTON} pcs/dus</span>
                                </td>
                                <td className="p-2 text-center align-top">Dus</td>
                                <td className="p-2 text-center align-top">{distribution.cartons}</td>
                                <td className="p-2 text-right align-top">{SELLING_PRICE_PER_CARTON.toLocaleString('id-ID')}</td>
                                <td className="p-2 text-right align-top">{invoice.amount.toLocaleString('id-ID')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals & Terbilang */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-start">
                        <div className="w-3/5">
                           <p className="text-[10px]"><span className="font-bold">Terbilang:</span> <span className="italic">{numberToWords(invoice.amount)} Rupiah</span></p>
                        </div>
                        <div className="w-2/5 text-right">
                           <div className="bg-gray-100 p-3 rounded">
                               <span className="font-bold text-base">TOTAL TAGIHAN : Rp {invoice.amount.toLocaleString('id-ID')}</span>
                           </div>
                        </div>
                    </div>
                </div>


                {/* Payment & Signature */}
                <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                    <div>
                         <table className="text-[10px]">
                            <tbody>
                                <tr>
                                    <td className="font-semibold w-20 align-top">Pembayaran</td>
                                    <td className="align-top px-1">:</td>
                                    <td className="align-top">Transfer Bank</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold align-top">Nama</td>
                                    <td className="align-top px-1">:</td>
                                    <td className="align-top">KDMP Penfui Timur</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold align-top">Bank</td>
                                    <td className="align-top px-1">:</td>
                                    <td className="align-top">Bank NTT</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold align-top">No Rekening</td>
                                    <td className="align-top px-1">:</td>
                                    <td className="align-top">001.02.02.123456-7</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="text-center text-xs">
                        <p>Hormat Kami</p>
                        <p>KDMP Penfui Timur</p>
                        <div className="h-16"></div> {/* Spacer for signature */}
                        <p className="font-bold underline">Susi Maulani</p>
                        <p>Manajer Distribusi</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoice;