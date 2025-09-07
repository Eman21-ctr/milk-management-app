import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { POStatus } from '../constants.js';
import Modal from './Modal.jsx';
import { PlusIcon, InfoIcon, SwitchHorizontalIcon, TrashIcon } from './icons/Icons.jsx';

const AllocationModal = ({ isOpen, onClose, po, coordinators, onAllocate }) => {
    const [allocations, setAllocations] = useState({});

    React.useEffect(() => {
        if (isOpen) {
            setAllocations({});
        }
    }, [isOpen]);

    const handleAllocationChange = (coordinatorId, value) => {
        const cartons = parseInt(value, 10) || 0;
        setAllocations(prev => ({...prev, [coordinatorId]: cartons < 0 ? 0 : cartons }));
    };

    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    const remainingToAllocate = Number(po.remainingCartons) - totalAllocated;

    const handleSave = () => {
        if (totalAllocated > Number(po.remainingCartons)) {
            alert('Jumlah alokasi melebihi sisa stok PO.');
            return;
        }
        const allocationData = Object.entries(allocations)
            .map(([coordinatorId, cartons]) => ({ coordinatorId, cartons: Number(cartons) }))
            .filter(a => a.cartons > 0);
        
        onAllocate(allocationData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Alokasi Stok dari ${po.poNumber}`}>
            <div className="space-y-4">
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md">
                    <p>Sisa Stok PO (Belum dialokasikan): <span className="font-bold">{po.remainingCartons.toLocaleString('id-ID')}</span> Kartoon Box</p>
                    <p className={remainingToAllocate < 0 ? 'text-red-600' : 'text-green-600'}>Sisa untuk dialokasikan: <span className="font-bold">{remainingToAllocate.toLocaleString('id-ID')}</span> Kartoon Box</p>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {coordinators.map(c => (
                    <div key={c.id}>
                        <label htmlFor={`alloc-${c.id}`} className="block text-sm font-medium text-gray-700">{c.name} ({c.region})</label>
                        <input
                            type="number"
                            id={`alloc-${c.id}`}
                            value={allocations[c.id] || ''}
                            onChange={e => handleAllocationChange(c.id, e.target.value)}
                            min="0"
                            max={po.remainingCartons}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                ))}
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Batal</button>
                    <button onClick={handleSave} disabled={totalAllocated <= 0 || remainingToAllocate < 0} className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">Alokasikan</button>
                </div>
            </div>
        </Modal>
    );
};

const PurchaseOrdersPage = ({ 
  purchaseOrders, 
  updatePurchaseOrderStatus, 
  deletePurchaseOrder, 
  coordinators, 
  allocationHistory, 
  allocateStockFromPO 
}) => {
  const navigate = useNavigate();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  const handleCreatePO = () => {
    navigate('/purchase-orders/create');
  };
  
  const handleShowDetails = (po) => {
    setSelectedPO(po);
    setIsDetailsModalOpen(true);
  };

  const handleShowAllocation = (po) => {
    setSelectedPO(po);
    setIsAllocationModalOpen(true);
  };

  const handleAllocate = (allocations) => {
      if(selectedPO) {
          allocateStockFromPO(selectedPO.id, allocations);
      }
      setIsAllocationModalOpen(false);
  };

  const handleDelete = (po) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus PO ${po.poNumber}?\n\n` +
      `Jika PO ini sudah memiliki alokasi stok, stok akan dikembalikan ke sistem.\n\n` +
      `Tindakan ini tidak dapat dibatalkan.`
    );
    
    if (confirmDelete) {
      deletePurchaseOrder(po.id);
    }
  };
  
  const getStatusClass = (status) => {
    switch(status) {
      case POStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case POStatus.SENT: return 'bg-blue-100 text-blue-800';
      case POStatus.RECEIVED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  const Card = ({ po }) => (
    <div className="bg-surface rounded-lg shadow p-4 space-y-2 border-l-4 border-primary">
        <div className="flex justify-between items-center">
            <p className="font-bold text-primary-dark">{po.poNumber}</p>
        </div>
        <p className="text-sm text-text-secondary">{new Date(po.orderDate).toLocaleDateString('id-ID')}</p>
        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total Kartoon Box:</span>
            <span className="font-medium text-text-primary">{po.totalCartons.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Sisa Stok (Un-allocated):</span>
            <span className="font-medium text-text-primary">{po.remainingCartons.toLocaleString('id-ID')}</span>
          </div>
           <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total Harga:</span>
            <span className="font-medium text-text-primary">Rp {po.totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="pt-2 border-t flex items-center justify-between">
            <select
                value={po.status}
                onChange={(e) => updatePurchaseOrderStatus(po.id, e.target.value)}
                className={`text-xs border-gray-300 rounded-md shadow-sm p-1 ${getStatusClass(po.status)}`}
                onClick={(e) => e.stopPropagation()}
            >
                {Object.values(POStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="space-x-2">
                <button onClick={() => handleShowDetails(po)} className="text-blue-600 hover:text-blue-800 p-1">
                    <InfoIcon className="h-4 w-4" />
                </button>
                {po.status === POStatus.RECEIVED && po.remainingCartons > 0 && (
                    <button onClick={() => handleShowAllocation(po)} className="text-green-600 hover:text-green-800 p-1">
                        <SwitchHorizontalIcon className="h-4 w-4" />
                    </button>
                )}
                <button onClick={() => handleDelete(po)} className="text-red-600 hover:text-red-800 p-1">
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button 
  onClick={handleCreatePO} 
  className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md transition-all duration-200 text-sm"
>
          <PlusIcon className="mr-2 h-4 w-4" />
          Buat PO Baru
        </button>
      </div>

      <div className="bg-surface rounded-xl shadow-md p-2 sm:p-6">
         {/* Desktop View */}
         <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-semibold text-sm">PO Number</th>
                <th className="p-3 font-semibold text-sm">Tanggal</th>
                <th className="p-3 font-semibold text-sm">Total Kartoon Box</th>
                <th className="p-3 font-semibold text-sm">Sisa Stok (Un-allocated)</th>
                <th className="p-3 font-semibold text-sm">Total Harga</th>
                <th className="p-3 font-semibold text-sm">Status</th>
                <th className="p-3 font-semibold text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map(po => (
                <tr key={po.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-primary-dark">{po.poNumber}</td>
                  <td className="p-3">{new Date(po.orderDate).toLocaleDateString('id-ID')}</td>
                  <td className="p-3">{po.totalCartons.toLocaleString('id-ID')}</td>
                  <td className="p-3 font-bold">{po.remainingCartons.toLocaleString('id-ID')}</td>
                  <td className="p-3">Rp {po.totalPrice.toLocaleString('id-ID')}</td>
                  <td className="p-3">
                    <select 
                      value={po.status} 
                      onChange={e => updatePurchaseOrderStatus(po.id, e.target.value)}
                      className={`text-xs border-gray-300 rounded-md shadow-sm p-1 w-full ${getStatusClass(po.status)}`}
                    >
                      {Object.values(POStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button title="Lihat Detail Alokasi" onClick={() => handleShowDetails(po)} className="text-blue-600 hover:text-blue-800 p-1 inline-block">
                        <InfoIcon />
                    </button>
                     {po.status === POStatus.RECEIVED && po.remainingCartons > 0 && (
                       <button title="Alokasi Stok ke Korwil" onClick={() => handleShowAllocation(po)} className="text-green-600 hover:text-green-800 p-1 inline-block">
                           <SwitchHorizontalIcon />
                       </button>
                     )}
                     <button title="Hapus PO" onClick={() => handleDelete(po)} className="text-red-600 hover:text-red-800 p-1 inline-block">
                         <TrashIcon />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden space-y-3">
            {purchaseOrders.map(po => <Card key={po.id} po={po} />)}
        </div>

        {/* Empty State */}
        {purchaseOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <PlusIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 mb-4">Belum ada Purchase Order</p>
            <button 
              onClick={handleCreatePO}
              className="bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Buat PO Pertama
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPO && (
         <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Detail Alokasi untuk ${selectedPO.poNumber}`}>
             {(() => {
                 const relatedAllocations = allocationHistory.filter(a => a.poId === selectedPO.id);
                 if (relatedAllocations.length === 0) {
                     return <p>Belum ada alokasi stok dari PO ini.</p>;
                 }
                 return (
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                           <thead className="sticky top-0 bg-gray-50">
                               <tr className="border-b">
                                   <th className="p-2 font-semibold">Tanggal</th>
                                   <th className="p-2 font-semibold">Korwil</th>
                                   <th className="p-2 font-semibold text-right">Jumlah Dialokasikan</th>
                               </tr>
                           </thead>
                           <tbody>
                               {relatedAllocations.map(alloc => (
                                   <tr key={alloc.id} className="border-b">
                                       <td className="p-2">{new Date(alloc.date).toLocaleDateString('id-ID')}</td>
                                       <td className="p-2">{coordinators.find(c=>c.id === alloc.coordinatorId)?.name || 'N/A'}</td>
                                       <td className="p-2 text-right">{alloc.cartons.toLocaleString('id-ID')} Kartoon Box</td>
                                   </tr>
                               ))}
                           </tbody>
                        </table>
                    </div>
                 );
             })()}
         </Modal>
      )}

      {/* Allocation Modal */}
      {selectedPO && (
        <AllocationModal 
            isOpen={isAllocationModalOpen}
            onClose={() => setIsAllocationModalOpen(false)}
            po={selectedPO}
            coordinators={coordinators}
            onAllocate={handleAllocate}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersPage;