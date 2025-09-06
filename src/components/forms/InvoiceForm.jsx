import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistributionStatus, SELLING_PRICE_PER_CARTON } from '../../constants.js';
import { ArrowLeftIcon } from '../icons/Icons.jsx';

const InvoiceForm = ({ addInvoice, sppgs, distributions }) => {
  const navigate = useNavigate();
  
  const [selectedDist, setSelectedDist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDistributions = useMemo(() => {
    return distributions.filter(d => d.status === DistributionStatus.DELIVERED && !d.invoiceId);
  }, [distributions]);

  const selectedDistribution = availableDistributions.find(d => d.id === selectedDist);
  const selectedSppg = selectedDistribution ? sppgs.find(s => s.id === selectedDistribution.sppgId) : null;
  const calculatedAmount = selectedDistribution ? selectedDistribution.cartons * SELLING_PRICE_PER_CARTON : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const distribution = availableDistributions.find(d => d.id === selectedDist);
    if (!distribution) {
      alert("Pilih distribusi yang valid.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addInvoice(distribution);
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Terjadi kesalahan saat membuat invoice. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/invoices');
  };

  const getSPPGName = (sppgId) => sppgs.find(s => s.id === sppgId)?.name || 'N/A';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="bg-surface shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleCancel}
            className="flex items-center text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Kembali</span>
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Buat Invoice Baru</h1>
          <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-surface rounded-xl shadow-md p-6">
          {availableDistributions.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Distribusi Siap</h3>
              <p className="text-gray-500 mb-4">
                Tidak ada distribusi terkirim yang siap dibuatkan invoice.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Invoice hanya dapat dibuat untuk distribusi dengan status "DELIVERED" yang belum memiliki invoice.
              </p>
              <button
                onClick={handleCancel}
                className="bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Kembali ke Invoice
              </button>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info Card */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-1">Buat Invoice</h3>
                <p className="text-sm text-blue-700">
                  Pilih distribusi yang sudah terkirim untuk dibuatkan invoice tagihan
                </p>
              </div>

              {/* Distribution Selection */}
              <div>
                <label htmlFor="distribution" className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Distribusi (Status: Terkirim)
                </label>
                <select
                  id="distribution"
                  value={selectedDist}
                  onChange={e => setSelectedDist(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  required
                >
                  <option value="">-- Pilih Surat Jalan --</option>
                  {availableDistributions.map((d) => {
                    const sppg = sppgs.find((k) => k.id === d.sppgId);
                    return (
                      <option key={d.id} value={d.id}>
                        {d.suratJalanNumber} - {sppg?.name} ({d.cartons} Karton)
                      </option>
                    )
                  })}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Tersedia {availableDistributions.length} distribusi siap ditagih
                </p>
              </div>

              {/* Distribution Details */}
              {selectedDistribution && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-800">Detail Distribusi</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nomor Surat Jalan:</span>
                      <p className="font-medium text-gray-900">{selectedDistribution.suratJalanNumber}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">SPPG:</span>
                      <p className="font-medium text-gray-900">{getSPPGName(selectedDistribution.sppgId)}</p>
                    </div>

                    <div>
                      <span className="text-gray-600">Tanggal Kirim:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedDistribution.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium text-green-600">{selectedDistribution.status}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Jumlah Karton:</span>
                      <span className="font-medium">{selectedDistribution.cartons} Karton</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Harga per Karton:</span>
                      <span className="font-medium">Rp {SELLING_PRICE_PER_CARTON.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Summary */}
              {selectedDistribution && (
                <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-medium text-primary-dark mb-3">Ringkasan Invoice</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">SPPG:</span>
                      <span className="font-medium">{selectedSppg?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lokasi:</span>
                      <span className="font-medium">{selectedSppg?.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah Karton:</span>
                      <span className="font-medium">{selectedDistribution.cartons} Karton</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total Tagihan:</span>
                      <span className="font-semibold text-primary-dark text-lg">
                        Rp {calculatedAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDist}
                  className="w-full sm:flex-1 px-6 py-3 bg-primary hover:bg-primary-light text-white font-medium rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Membuat Invoice...' : 'Buat Invoice'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;