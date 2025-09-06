import { useState, useMemo, useEffect } from 'react';
import { DistributionStatus } from '../constants.js';
import Modal from './Modal.jsx';
import PrintableDocument from './PrintableDocument.jsx';
import { PlusIcon, DownloadIcon } from './icons/Icons.jsx';

const DistributionsPage = ({ distributions, addDistribution, sppgs, coordinators, updateDistributionStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [docToPrint, setDocToPrint] = useState(null);

  const [selectedSPPG, setSelectedSPPG] = useState('');
  const [selectedCoordinator, setSelectedCoordinator] = useState('');
  const [cartons, setCartons] = useState(1);
  const [status, setStatus] = useState(DistributionStatus.PENDING);

  const selectedCoordinatorData = useMemo(() => {
    return coordinators.find(c => c.id === selectedCoordinator);
  }, [selectedCoordinator, coordinators]);

  const filteredSPPGs = useMemo(() => {
      if (!selectedCoordinatorData) return [];
      const coordinatorSPPGIds = selectedCoordinatorData.sppgIds;
      return sppgs.filter(k => coordinatorSPPGIds.includes(k.id));
  }, [selectedCoordinatorData, sppgs]);

  // Reset SPPG selection if coordinator changes
  useEffect(() => {
    setSelectedSPPG('');
  }, [selectedCoordinator]);

  // Cap cartons based on selected coordinator's stock
   useEffect(() => {
    const maxStock = selectedCoordinatorData?.stock ?? 0;
    if (cartons > maxStock && maxStock > 0) {
        setCartons(maxStock);
    } else if (cartons < 1) {
        setCartons(1);
    }
  }, [cartons, selectedCoordinatorData]);

  const handleCreateDistribution = () => {
    if (!selectedCoordinator) {
        alert("Pilih koordinator wilayah (Korwil).");
        return;
    }
    if (!selectedSPPG) {
        alert("Pilih SPPG tujuan.");
        return;
    }
    const maxStock = selectedCoordinatorData?.stock ?? 0;
    if (cartons < 1) {
      alert("Jumlah Kartoon Box minimal 1.");
      return;
    }
    if (cartons > maxStock) {
      alert(`Stok Korwil tidak mencukupi. Sisa: ${maxStock} Kartoon Box.`);
      return;
    }

    addDistribution({
      distributionDate: new Date().toISOString().split('T')[0],
      sppgId: selectedSPPG,
      coordinatorId: selectedCoordinator,
      cartons: cartons,
      status: status,
    });

    setIsModalOpen(false);
    setSelectedCoordinator('');
    setSelectedSPPG('');
    setCartons(1);
    setStatus(DistributionStatus.PENDING);
  };
  
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

  const isFormValid = selectedCoordinator && selectedSPPG && cartons > 0 && cartons <= (selectedCoordinatorData?.stock ?? 0);

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
        <h2 className="text-2xl font-bold text-text-primary">Distribusi Susu</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary hover:bg-primary-light text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md transition-colors text-sm">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Distribusi Baru">
        <div className="space-y-4">
          <div>
            <label htmlFor="coordinator" className="block text-sm font-medium text-gray-700">Koordinator Wilayah (Korwil)</label>
            <select
              id="coordinator"
              value={selectedCoordinator}
              onChange={e => setSelectedCoordinator(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">-- Pilih Korwil --</option>
              {coordinators.map((c) => <option key={c.id} value={c.id}>{c.name} (Stok: {c.stock.toLocaleString('id-ID')})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sppg" className="block text-sm font-medium text-gray-700">SPPG Tujuan</label>
            <select
              id="sppg"
              value={selectedSPPG}
              onChange={e => setSelectedSPPG(e.target.value)}
              disabled={!selectedCoordinator}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100"
            >
              <option value="">-- Pilih SPPG --</option>
              {filteredSPPGs.map((k) => <option key={k.id} value={k.id}>{k.name} - {k.district}</option>)}
            </select>
            {selectedCoordinator && filteredSPPGs.length === 0 && <p className="text-xs text-gray-500 mt-1">Korwil ini tidak menangani SPPG manapun.</p>}
          </div>
          <div>
            <label htmlFor="cartons" className="block text-sm font-medium text-gray-700">Jumlah Kartoon Box</label>
            <input
              type="number"
              id="cartons"
              value={cartons}
              onChange={e => setCartons(parseInt(e.target.value, 10) || 1)}
              min="1"
              max={selectedCoordinatorData?.stock ?? 0}
              disabled={!selectedCoordinator}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100"
            />
             {selectedCoordinator && <p className="text-xs text-gray-500 mt-1">Stok Korwil tersedia: {(selectedCoordinatorData?.stock ?? 0).toLocaleString('id-ID')} Kartoon Box</p>}
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Batal</button>
            <button 
                onClick={handleCreateDistribution} 
                disabled={!isFormValid}
                className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                Buat Distribusi
            </button>
          </div>
        </div>
      </Modal>

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