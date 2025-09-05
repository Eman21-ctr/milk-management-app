import React from 'react';
import { POStatus, DistributionStatus, InvoiceStatus } from '../types';
import { ShoppingCartIcon, TruckIcon, DocumentTextIcon, ArchiveIcon } from './icons/Icons';

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-surface rounded-xl shadow-md p-6 flex items-center">
    <div className={`rounded-full p-3 ${color}`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm text-text-secondary font-medium">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

const ActivityCard = ({ item }) => {
    const isPO = 'poNumber' in item;
    const date = isPO ? item.orderDate : item.distributionDate;
    const type = isPO ? 'Purchase Order' : 'Distribusi';
    const detail = isPO ? `${item.poNumber} - ${item.totalCartons.toLocaleString('id-ID')} Kartoon Box` : `${item.suratJalanNumber} - ${item.cartons.toLocaleString('id-ID')} Kartoon Box`;
    const status = item.status;
    const statusClass = isPO ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
    const borderColor = isPO ? 'border-primary' : 'border-accent';
    const typeColor = isPO ? 'text-primary-dark' : 'text-accent';

    return (
        <div className={`bg-white p-4 rounded-lg shadow border-l-4 ${borderColor}`}>
            <div className="flex justify-between items-center mb-2">
                <p className={`font-bold text-sm ${typeColor}`}>{type}</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>{status}</span>
            </div>
            <p className="text-sm text-text-primary mb-3">{detail}</p>
            <p className="text-xs text-text-secondary text-right">{new Date(date).toLocaleDateString('id-ID')}</p>
        </div>
    );
};

const Dashboard = ({ purchaseOrders, distributions, invoices, availableStock, coordinators }) => {
  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + po.totalPrice, 0);
  const maxStock = Math.max(...coordinators.map(c => c.stock), 1); // Use 1 to prevent division by zero
  const recentActivities = [...purchaseOrders, ...distributions].sort((a,b) => new Date('orderDate' in a ? a.orderDate : a.distributionDate).getTime() < new Date('orderDate' in b ? b.orderDate : b.distributionDate).getTime() ? 1 : -1).slice(0, 5);


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Ringkasan Kinerja</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
                <StatCard
                    icon={<ArchiveIcon className="h-6 w-6 text-white" />}
                    title="Stok Tersedia (Kartoon Box)"
                    value={availableStock.toLocaleString('id-ID')}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={<ShoppingCartIcon className="h-6 w-6 text-white" />}
                    title="Total Nilai PO"
                    value={`Rp ${totalPOValue.toLocaleString('id-ID')}`}
                    color="bg-green-500"
                />
            </div>
            <div className="lg:col-span-2 bg-surface rounded-xl shadow-md p-6">
                 <h3 className="text-xl font-bold text-text-primary mb-4">Stok Terkini per Wilayah</h3>
                 {coordinators.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      {coordinators.map(coordinator => {
                        const barWidth = maxStock > 0 ? (coordinator.stock / maxStock) * 100 : 0;
                        return (
                          <div key={coordinator.id} className="flex items-center group" title={`${coordinator.region}: ${coordinator.stock.toLocaleString('id-ID')} karton`}>
                            <div className="w-24 md:w-32 text-right pr-4">
                              <p className="text-xs md:text-sm text-text-secondary font-medium truncate">{coordinator.region}</p>
                            </div>
                            <div className="flex-1 flex items-center">
                              <div className="w-full bg-gray-200 rounded-md h-5">
                                <div 
                                   className="bg-primary-light h-5 rounded-md group-hover:bg-primary-dark transition-colors duration-200"
                                   style={{ width: `${barWidth}%` }}
                                ></div>
                              </div>
                              <p className="ml-3 text-sm font-bold text-text-primary w-14 text-left">{coordinator.stock.toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48">
                        <p className="text-text-secondary">Tidak ada data koordinator.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <div className="bg-surface rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-text-primary mb-4">Aktivitas Terbaru</h3>
        
        {/* Desktop View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-semibold text-sm">Tanggal</th>
                <th className="p-3 font-semibold text-sm">Aktivitas</th>
                <th className="p-3 font-semibold text-sm">Detail</th>
                <th className="p-3 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map(item => {
                if ('poNumber' in item) { // It's a PurchaseOrder
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{new Date(item.orderDate).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 font-medium text-primary-dark">Purchase Order</td>
                      <td className="p-3">{item.poNumber} - {item.totalCartons.toLocaleString('id-ID')} Kartoon Box</td>
                      <td className="p-3"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{item.status}</span></td>
                    </tr>
                  )
                } else { // It's a Distribution
                  return (
                     <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{new Date(item.distributionDate).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 font-medium text-accent">Distribusi</td>
                      <td className="p-3">{item.suratJalanNumber} - {item.cartons.toLocaleString('id-ID')} Kartoon Box</td>
                      <td className="p-3"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{item.status}</span></td>
                    </tr>
                  )
                }
              })}
            </tbody>
          </table>
        </div>

         {/* Mobile View */}
         <div className="md:hidden space-y-3">
             {recentActivities.length > 0 ? (
                 recentActivities.map(item => <ActivityCard key={item.id} item={item} />)
             ) : (
                 <p className="text-center text-text-secondary">Tidak ada aktivitas terbaru.</p>
             )}
         </div>

      </div>
    </div>
  );
};

export default Dashboard;