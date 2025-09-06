import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { POStatus, MINIMUM_ORDER_CARTONS, PRICE_PER_BATCH, SUPPLIER_NAME } from '../../constants.js';
import { ArrowLeftIcon } from '../icons/Icons.jsx';

const PurchaseOrderForm = ({ addPurchaseOrder }) => {
  const navigate = useNavigate();
  
  const [batches, setBatches] = useState(1);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalCartons, setTotalCartons] = useState(batches * MINIMUM_ORDER_CARTONS);
  const [totalPrice, setTotalPrice] = useState(batches * PRICE_PER_BATCH);
  const [status, setStatus] = useState(POStatus.SENT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTotalCartons(batches * MINIMUM_ORDER_CARTONS);
    setTotalPrice(batches * PRICE_PER_BATCH);
  }, [batches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (batches < 1) {
      alert("Jumlah batch minimal adalah 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addPurchaseOrder({
        supplier: SUPPLIER_NAME,
        orderDate: orderDate,
        batches: batches,
        totalCartons: totalCartons,
        totalPrice: totalPrice,
        status: status,
      });

      // Navigate back to purchase orders page
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Terjadi kesalahan saat membuat PO. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/purchase-orders');
  };

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
          <h1 className="text-lg font-semibold text-text-primary">Buat PO Baru</h1>
          <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-surface rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Supplier Info */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-1">Informasi Supplier</h3>
              <p className="text-sm text-blue-700">{SUPPLIER_NAME}</p>
            </div>

            {/* Order Date */}
            <div>
              <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Order
              </label>
              <input
                type="date"
                id="orderDate"
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                required
              />
            </div>

            {/* Jumlah Batch */}
            <div>
              <label htmlFor="batches" className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Batch
              </label>
              <input
                type="number"
                id="batches"
                value={batches}
                onChange={e => setBatches(parseInt(e.target.value, 10) || 1)}
                min="1"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimal 1 batch ({MINIMUM_ORDER_CARTONS} kartoon box per batch)
              </p>
            </div>

            {/* Calculated Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Kartoon Box */}
              <div>
                <label htmlFor="totalCartons" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Kartoon Box
                </label>
                <input
                  type="number"
                  id="totalCartons"
                  value={totalCartons}
                  onChange={e => setTotalCartons(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-base"
                  readOnly
                />
              </div>

              {/* Total Harga */}
              <div>
                <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Harga
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                  <input
                    type="number"
                    id="totalPrice"
                    value={totalPrice}
                    onChange={e => setTotalPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-base"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select 
                id="status" 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              >
                {Object.values(POStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20 rounded-lg p-4">
              <h3 className="font-medium text-primary-dark mb-3">Ringkasan Order</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah Batch:</span>
                  <span className="font-medium">{batches} batch</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Kartoon Box:</span>
                  <span className="font-medium">{totalCartons.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total Harga:</span>
                  <span className="font-semibold text-primary-dark">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

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
                disabled={isSubmitting || batches < 1}
                className="w-full sm:flex-1 px-6 py-3 bg-primary hover:bg-primary-light text-white font-medium rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Membuat PO...' : 'Buat Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;