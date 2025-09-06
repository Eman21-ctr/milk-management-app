import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistributionStatus } from '../../constants.js';
import { ArrowLeftIcon } from '../icons/Icons.jsx';

const DistributionForm = ({ distributions, addDistribution, sppgs, coordinators, updateDistributionStatus }) => {
  const navigate = useNavigate();
  
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

    // Redirect to distributions page after successful creation
    navigate('/distributions');
  };

  const handleCancel = () => {
    navigate('/distributions');
  };

  const isFormValid = selectedCoordinator && selectedSPPG && cartons > 0 && cartons <= (selectedCoordinatorData?.stock ?? 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleCancel}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Kembali</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Buat Distribusi Baru</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-6">
            {/* Coordinator Selection */}
            <div>
              <label htmlFor="coordinator" className="block text-sm font-medium text-gray-700 mb-2">
                Koordinator Wilayah (Korwil)
              </label>
              <select
                id="coordinator"
                value={selectedCoordinator}
                onChange={e => setSelectedCoordinator(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="">-- Pilih Korwil --</option>
                {coordinators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Stok: {c.stock.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            {/* SPPG Selection */}
            <div>
              <label htmlFor="sppg" className="block text-sm font-medium text-gray-700 mb-2">
                SPPG Tujuan
              </label>
              <select
                id="sppg"
                value={selectedSPPG}
                onChange={e => setSelectedSPPG(e.target.value)}
                disabled={!selectedCoordinator}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100"
              >
                <option value="">-- Pilih SPPG --</option>
                {filteredSPPGs.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} - {k.district}
                  </option>
                ))}
              </select>
              {selectedCoordinator && filteredSPPGs.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Korwil ini tidak menangani SPPG manapun.
                </p>
              )}
            </div>

            {/* Cartons Input */}
            <div>
              <label htmlFor="cartons" className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Kartoon Box
              </label>
              <input
                type="number"
                id="cartons"
                value={cartons}
                onChange={e => setCartons(parseInt(e.target.value, 10) || 1)}
                min="1"
                max={selectedCoordinatorData?.stock ?? 0}
                disabled={!selectedCoordinator}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100"
              />
              {selectedCoordinator && (
                <p className="text-xs text-gray-500 mt-1">
                  Stok Korwil tersedia: {(selectedCoordinatorData?.stock ?? 0).toLocaleString('id-ID')} Kartoon Box
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreateDistribution}
                disabled={!isFormValid}
                className="flex-1 bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Buat Distribusi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionForm;