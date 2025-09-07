import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistributionStatus } from '../constants.js';
import PrintableDocument from './PrintableDocument.jsx';
import { PlusIcon, DownloadIcon } from './icons/Icons.jsx';

const DistributionsPage = ({ distributions, sppgs, coordinators, updateDistributionStatus }) => {
  const navigate = useNavigate();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [docToPrint, setDocToPrint] = useState(null);

  const handlePrintClick = (dist, type) => {
    setDocToPrint({ dist, type });
    setIsPrintModalOpen(true);
  }

  const getStatusClass = (status) => {
    switch(status) {
      case DistributionStatus.PENDING: return 'bg-gray-100 text-gray-800';
      case DistributionStatus.IN_TRANSIT: return 'bg-yellow-100 text-yellow-800';
      case DistributionStatus.DELIVERED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const getSPPGName = (sppgId) => sppgs.find(k => k.id === sppgId)?.name || 'N/A';
  const getCoordinatorName = (coordinatorId) => coordinators.find(c => c.id === coordinatorId)?.name || 'N/A';

  const Card = ({ dist }) => (
    <div className="bg-surface rounded-lg shadow p-4 space-y-2 border-l-4 border-accent">
        <div className="flex justify-between items-center">
            <p className="font-bold text-primary-dark">{dist.suratJalanNumber}</p>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(dist.status)}`}>
                {dist.status}
            </span>
        </div>
        <p className="text-sm text-text-secondary">{new Date(dist.distributionDate).toLocaleDateString('id-ID')}</p>
        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">SPPG:</span>
            <span className="font-medium text-text-primary">{getSPPGName(dist.sppgId)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Korwil:</span>
            <span className="font-medium text-text-primary">{getCoordinatorName(dist.coordinatorId)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Jumlah:</span>
            <span className="font-medium text-text-primary">{dist.cartons.toLocaleString('id-ID')} Kartoon Box</span>
          </div>
        </div>
         <div className="pt-2 border-t flex items-center justify-end space-x-2">
            {dist.status !== DistributionStatus.DELIVERED && (
              <button onClick={() => updateDistributionStatus(dist.id, DistributionStatus.DELIVERED)} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded">
                  Tandai Diterima
              </button>
            )}
            <button title="Download Surat Jalan" onClick={() => handlePrintClick(dist, 'sj')} className="text-blue-600 hover:text-blue-800 p-1"><DownloadIcon className="h-4 w-4" /></button>
            <button title="Download BAST" onClick={() => handlePrintClick(dist, 'bast')} className="text-blue-600 hover:text-blue-800 p-1"><DownloadIcon className="h-4 w-4" /></button>
        </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button 
  onClick={() => navigate('/distributions/create')} 
  className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md transition-all duration-200 text-sm"
>
          <PlusIcon className="mr-2 h-4 w-4" />
          Buat Distribusi
        </button>
      </div>
      
      <div className="bg-surface rounded-xl shadow-md p-2 sm:p-6">
        {/* Desktop View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-semibold text-sm">Surat Jalan</th>
                <th className="p-3 font-semibold text-sm">Tanggal</th>
                <th className="p-3 font-semibold text-sm">SPPG Tujuan</th>
                <th className="p-3 font-semibold text-sm">Korwil</th>
                <th className="p-3 font-semibold text-sm">Jumlah</th>
                <th className="p-3 font-semibold text-sm">Status</th>
                <th className="p-3 font-semibold text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map((dist) => (
                <tr key={dist.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-primary-dark">{dist.suratJalanNumber}</td>
                  <td className="p-3">{new Date(dist.distributionDate).toLocaleDateString('id-ID')}</td>
                  <td className="p-3">{getSPPGName(dist.sppgId)}</td>
                  <td className="p-3">{getCoordinatorName(dist.coordinatorId)}</td>
                  <td className="p-3">{dist.cartons.toLocaleString('id-ID')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(dist.status)}`}>
                        {dist.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    {dist.status !== DistributionStatus.DELIVERED && (
                      <button onClick={() => updateDistributionStatus(dist.id, DistributionStatus.DELIVERED)} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded">
                          Diterima
                      </button>
                    )}
                     <button title="Download Surat Jalan" onClick={() => handlePrintClick(dist, 'sj')} className="text-blue-600 hover:text-blue-800 p-1"><DownloadIcon /></button>
                     <button title="Download BAST" onClick={() => handlePrintClick(dist, 'bast')} className="text-blue-600 hover:text-blue-800 p-1"><DownloadIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile View */}
        <div className="md:hidden space-y-3">
            {distributions.map((dist) => <Card key={dist.id} dist={dist} />)}
        </div>
      </div>

      {isPrintModalOpen && docToPrint && (
        <PrintableDocument 
            isOpen={isPrintModalOpen} 
            onClose={() => setIsPrintModalOpen(false)} 
            distribution={docToPrint.dist}
            docType={docToPrint.type}
            sppg={sppgs.find((k) => k.id === docToPrint.dist.sppgId)}
            coordinator={coordinators.find((c) => c.id === docToPrint.dist.coordinatorId)}
        />
      )}
    </div>
  );
};

export default DistributionsPage;