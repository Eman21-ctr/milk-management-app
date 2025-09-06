import { useState, useMemo } from 'react';
import { InvoiceStatus, DistributionStatus, SELLING_PRICE_PER_CARTON } from '../constants.js';
import Modal from './Modal.jsx';
import PrintableInvoice from './PrintableInvoice.jsx';
import { PlusIcon, DownloadIcon } from './icons/Icons.jsx';

const InvoicesPage = ({ invoices, updateInvoiceStatus, sppgs, distributions, addInvoice, coordinators }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);
  const [selectedDist, setSelectedDist] = useState('');

  const availableDistributions = useMemo(() => {
    return distributions.filter(d => d.status === DistributionStatus.DELIVERED && !d.invoiceId);
  }, [distributions]);

  const handleCreateInvoice = () => {
    const distribution = availableDistributions.find(d => d.id === selectedDist);
    if (!distribution) {
      alert("Pilih distribusi yang valid.");
      return;
    }
    addInvoice(distribution);
    setIsModalOpen(false);
    setSelectedDist('');
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
        <h2 className="text-2xl font-bold text-text-primary">Invoices</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary hover:bg-primary-light text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md transition-colors text-sm">
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
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Invoice Baru">
        <div className="space-y-4">
          <div>
            <label htmlFor="distribution" className="block text-sm font-medium text-gray-700">Pilih Distribusi (Terkirim)</label>
            <select
              id="distribution"
              value={selectedDist}
              onChange={e => setSelectedDist(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">-- Pilih Surat Jalan --</option>
              {availableDistributions.map((d) => {
                const sppg = sppgs.find((k) => k.id === d.sppgId);
                return (
                  <option key={d.id} value={d.id}>
                    {d.suratJalanNumber} - {sppg?.name} ({d.cartons} Kartoon Box)
                  </option>
                )
              })}
            </select>
            {availableDistributions.length === 0 && <p className="text-xs text-gray-500 mt-1">Tidak ada distribusi terkirim yang siap dibuatkan invoice.</p>}
          </div>
          {selectedDist && (() => {
            const dist = availableDistributions.find(d => d.id === selectedDist);
            if (!dist) return null;
            return (
               <div>
                  <p className="text-sm text-gray-500">SPPG: <span className="font-bold">{getSPPGName(dist.sppgId)}</span></p>
                  <p className="text-sm text-gray-500">Jumlah Tagihan: <span className="font-bold">Rp {(dist.cartons * SELLING_PRICE_PER_CARTON).toLocaleString('id-ID')}</span></p>
               </div>
            )
          })()}
          <div className="flex justify-end pt-4">
            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Batal</button>
            <button onClick={handleCreateInvoice} disabled={!selectedDist} className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">Buat Invoice</button>
          </div>
        </div>
      </Modal>

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