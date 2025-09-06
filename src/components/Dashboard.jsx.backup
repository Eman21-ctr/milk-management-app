import { InvoiceStatus, DistributionStatus, POStatus } from '../constants.js';
import { TruckIcon, DocumentTextIcon, ArchiveIcon } from './icons/Icons.jsx';

// A reusable card component for displaying statistics.
const StatCard = ({ title, value, icon, subtext }) => (
    <div className="bg-surface rounded-xl shadow-md p-6 flex items-center border-l-4 border-primary">
        <div className="bg-primary-light p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
        </div>
    </div>
);

// A reusable component for listing recent activities.
const RecentActivityList = ({ title, items, renderItem }) => (
    <div className="bg-surface rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-primary-dark mb-4">{title}</h3>
        <ul className="space-y-3">
            {items.length > 0 ? items.slice(0, 5).map(renderItem) : <p className="text-sm text-gray-500">Tidak ada aktivitas terbaru.</p>}
        </ul>
    </div>
);

// Props for the Dashboard component, as provided in App.jsx
const Dashboard = ({ purchaseOrders, distributions, invoices, availableStock, coordinators }) => {
    // Calculate key statistics for the dashboard cards.
    const pendingDistributions = distributions.filter(d => d.status !== DistributionStatus.DELIVERED).length;
    const unpaidInvoices = invoices.filter(i => i.status === InvoiceStatus.UNPAID);
    const unpaidInvoicesCount = unpaidInvoices.length;
    const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const getCoordinatorName = (id) => coordinators.find(c => c.id === id)?.name || 'N/A';

    return (
        <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Dashboard</h2>
            
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard 
                    title="Total Stok Tersedia"
                    value={`${availableStock.toLocaleString('id-ID')} Karton`}
                    icon={<ArchiveIcon className="h-6 w-6 text-white" />}
                    subtext="Di semua Koordinator Wilayah"
                />
                <StatCard 
                    title="Distribusi Pending"
                    value={pendingDistributions.toLocaleString('id-ID')}
                    icon={<TruckIcon className="h-6 w-6 text-white" />}
                    subtext="Menunggu pengiriman/konfirmasi"
                />
                <StatCard 
                    title="Invoice Belum Lunas"
                    value={unpaidInvoicesCount.toLocaleString('id-ID')}
                    icon={<DocumentTextIcon className="h-6 w-6 text-white" />}
                    subtext={`Total: Rp ${unpaidAmount.toLocaleString('id-ID')}`}
                />
            </div>
            
            {/* Recent Activities Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivityList 
                    title="Purchase Orders Terbaru"
                    items={purchaseOrders}
                    renderItem={(po) => (
                        <li key={po.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50 transition-colors">
                            <div>
                                <p className="font-medium text-primary-dark">{po.poNumber}</p>
                                <p className="text-text-secondary">{new Date(po.orderDate).toLocaleDateString('id-ID')}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                po.status === POStatus.RECEIVED ? 'bg-green-100 text-green-800' 
                                : po.status === POStatus.SENT ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                                {po.status}
                            </span>
                        </li>
                    )}
                />
                <RecentActivityList 
                    title="Distribusi Terbaru"
                    items={distributions}
                    renderItem={(dist) => (
                        <li key={dist.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50 transition-colors">
                            <div>
                                <p className="font-medium text-primary-dark">{dist.suratJalanNumber}</p>
                                <p className="text-text-secondary">{dist.cartons} Karton (Korwil: {getCoordinatorName(dist.coordinatorId)})</p>
                            </div>
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                 dist.status === DistributionStatus.DELIVERED ? 'bg-green-100 text-green-800' 
                                 : dist.status === DistributionStatus.IN_TRANSIT ? 'bg-yellow-100 text-yellow-800'
                                 : 'bg-gray-100 text-gray-800'
                            }`}>
                                {dist.status}
                            </span>
                        </li>
                    )}
                />
            </div>
        </div>
    );
};

export default Dashboard;