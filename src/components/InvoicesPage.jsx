import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceStatus } from '../constants.js';
import PrintableInvoice from './PrintableInvoice.jsx';
import { PlusIcon, DownloadIcon } from './icons/Icons.jsx';

const InvoicesPage = ({ invoices, updateInvoiceStatus, sppgs, distributions, coordinators }) => {
  const navigate = useNavigate();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };

  const handlePrintClick = (invoice) => {
    setInvoiceToPrint(invoice);
    setIsPrintModalOpen(true);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case InvoiceStatus.UNPAID: return 'bg-red-100 text-red-800';
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-800';
      case InvoiceStatus.OVERDUE: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const getSPPGName = (sppgId) => sppgs.find(k => k.id === sppgId)?.name || 'N/A';
  
  const handleStatusChange = (invoiceId, newStatus) => {
    updateInvoiceStatus(invoiceId, newStatus);
  };

  const Card = ({ inv }) => (
    <div className="bg-surface rounded-lg shadow p-4 space-y-2 border-l-4 border-red-500">
       <div className="flex justify-between items-center">
            <p className="font-bold text-primary-dark">{inv.invoiceNumber}</p>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(inv.status)}`}>
                {inv.status}
            </span>
        </div>
        <p className="text-sm text-text-secondary">Terbit: {new Date(inv.issueDate).toLocaleDateString('id-ID')}</p>
        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">SPPG:</span>
            <span className="font-medium text-text-primary">{getSPPGName(inv.sppgId)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Jumlah:</span>
            <span className="font-medium text-text-primary">Rp {inv.amount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Jatuh Tempo:</span>
            <span className="font-medium text-text-primary">{new Date(inv.dueDate).toLocaleDateString('id-ID')}</span>
          </div>
        </div>
        <div className="pt-2 border-t flex justify-end items-center space-x-2">
            <button title="Download Invoice" onClick={() => handlePrintClick(inv)} className="text-blue-600 hover:text-blue-800 p-1">
                <DownloadIcon className="h-4 w-4" />
            </button>
            {inv.status === InvoiceStatus.UNPAID && (
              <button onClick={() => handleStatusChange(inv.id, InvoiceStatus.PAID)} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded">
                  Tandai Lunas
              </button>
            )}
        </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button 
  onClick={handleCreateInvoice} 
  className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md transition-all duration-200 text-sm"
>
          <PlusIcon className="mr-2 h-4 w-4" />
          Buat Invoice
        </button>
      </div>

      <div className="bg-surface rounded-xl shadow-md p-2 sm:p-6">
        {/* Desktop View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-semibold text-sm">Invoice Number</th>
                <th className="p-3 font-semibold text-sm">Tanggal Terbit</th>
                <th className="p-3 font-semibold text-sm">Jatuh Tempo</th>
                <th className="p-3 font-semibold text-sm">SPPG</th>
                <th className="p-3 font-semibold text-sm">Jumlah</th>
                <th className="p-3 font-semibold text-sm">Status</th>
                <th className="p-3 font-semibold text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-primary-dark">{inv.invoiceNumber}</td>
                  <td className="p-3">{new Date(inv.issueDate).toLocaleDateString('id-ID')}</td>
                  <td className="p-3">{new Date(inv.dueDate).toLocaleDateString('id-ID')}</td>
                  <td className="p-3">{getSPPGName(inv.sppgId)}</td>
                  <td className="p-3">Rp {inv.amount.toLocaleString('id-ID')}</td>
                  <td className="p-3">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(inv.status)}`}>
                        {inv.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button title="Download Invoice" onClick={() => handlePrintClick(inv)} className="text-blue-600 hover:text-blue-800 p-1">
                      <DownloadIcon />
                    </button>
                    {inv.status === InvoiceStatus.UNPAID && (
                       <button onClick={() => handleStatusChange(inv.id, InvoiceStatus.PAID)} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded">
                          Tandai Lunas
                       </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden space-y-3">
            {invoices.map((inv) => <Card key={inv.id} inv={inv} />)}
        </div>

        {/* Empty State */}
        {invoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">Belum ada invoice</p>
            <button 
              onClick={handleCreateInvoice}
              className="bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Buat Invoice Pertama
            </button>
          </div>
        )}
      </div>

      {/* Print Modal */}
      {isPrintModalOpen && invoiceToPrint && (() => {
          const distribution = distributions.find((d) => d.id === invoiceToPrint.distributionId);
          return (
            <PrintableInvoice
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                invoice={invoiceToPrint}
                distribution={distribution}
                sppg={sppgs.find((k) => k.id === invoiceToPrint.sppgId)}
                coordinator={coordinators.find((c) => c.id === distribution?.coordinatorId)}
            />
          )
      })()}
    </div>
  );
};

export default InvoicesPage;