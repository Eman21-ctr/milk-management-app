// Enhanced Dashboard.jsx - FLOWMILK Mobile-First Integration
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { InvoiceStatus, DistributionStatus, POStatus } from '../constants.js';

const Dashboard = ({ purchaseOrders, distributions, invoices, availableStock, coordinators }) => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('today');

    // Calculate statistics based on timeframe
    const getDateFilter = (timeframe) => {
        const today = new Date();
        switch (timeframe) {
            case 'today':
                return (date) => new Date(date).toDateString() === today.toDateString();
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return (date) => new Date(date) >= weekAgo;
            case 'month':
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                return (date) => new Date(date) >= monthAgo;
            default:
                return () => true;
        }
    };

    const dateFilter = getDateFilter(selectedTimeframe);
    
    // Enhanced Statistics
    const stats = {
        totalStock: availableStock,
        activeWarehouses: coordinators.filter(c => c.stock > 0).length,
        todayDistributions: distributions.filter(d => dateFilter(d.createdAt)).length,
        pendingPOs: purchaseOrders.filter(po => po.status === POStatus.DRAFT).length,
        pendingDistributions: distributions.filter(d => d.status !== DistributionStatus.DELIVERED).length,
        unpaidInvoices: invoices.filter(i => i.status === InvoiceStatus.UNPAID).length,
        totalRevenue: invoices.filter(i => i.status === InvoiceStatus.PAID && dateFilter(i.createdAt))
                            .reduce((sum, inv) => sum + inv.amount, 0),
        lowStockWarehouses: coordinators.filter(c => c.stock > 0 && c.stock < 50).length
    };

    // Quick Actions Data
    const quickActions = [
    {
        title: '📦 Buat Distribusi',
        subtitle: 'Distribusi baru ke dapur',
        link: '/distributions/create', // CHANGED: langsung ke form
        color: 'primary',
        count: stats.activeWarehouses
    },
    {
        title: '📋 PO Baru',
        subtitle: 'Purchase Order ke Jawa',
        link: '/purchase-orders/create', // CHANGED: langsung ke form (untuk consistency)
        color: 'secondary',
        count: stats.pendingPOs
    },
    {
        title: '💰 Buat Invoice',
        subtitle: 'Invoice untuk distribusi',
        link: '/invoices/create', // NEW: tambah invoice quick action
        color: 'accent',
        count: stats.unpaidInvoices
    }
];

    // Recent Activities with enhanced data
    const recentActivities = [
        {
            title: 'Distribusi Terbaru',
            items: distributions.slice(0, 3).map(dist => ({
                id: dist.id,
                title: dist.suratJalanNumber || 'Distribusi',
                subtitle: `${dist.cartons} Karton • ${coordinators.find(c => c.id === dist.coordinatorId)?.name || 'Unknown'}`,
                date: new Date(dist.createdAt).toLocaleDateString('id-ID'),
                status: dist.status,
                link: '/distributions'
            }))
        },
        {
            title: 'PO Terbaru', 
            items: purchaseOrders.slice(0, 3).map(po => ({
                id: po.id,
                title: po.poNumber || 'Purchase Order',
                subtitle: `${po.totalCartons} Karton • ${po.supplier || 'Supplier'}`,
                date: new Date(po.orderDate || po.createdAt).toLocaleDateString('id-ID'),
                status: po.status,
                link: '/purchase-orders'
            }))
        }
    ];

    // Stock Alert Component
    const StockAlert = () => {
        const lowStockCoords = coordinators.filter(c => c.stock > 0 && c.stock < 50);
        
        if (lowStockCoords.length === 0) return null;

        return (
            <div className="flowmilk-alert-card">
                <div className="flowmilk-alert-header">
                    <span className="flowmilk-alert-icon">⚠️</span>
                    <div>
                        <h4 className="flowmilk-alert-title">Stok Menipis</h4>
                        <p className="flowmilk-alert-subtitle">{lowStockCoords.length} gudang perlu restok</p>
                    </div>
                </div>
                <div className="flowmilk-alert-content">
                    {lowStockCoords.slice(0, 2).map(coord => (
                        <div key={coord.id} className="flowmilk-alert-item">
                            <span className="flowmilk-alert-name">{coord.name}</span>
                            <span className="flowmilk-alert-stock">{coord.stock} karton</span>
                        </div>
                    ))}
                </div>
                <NavLink to="/coordinators" className="flowmilk-alert-action">
                    Lihat Semua →
                </NavLink>
            </div>
        );
    };

    return (
        <div className="flowmilk-dashboard">
            {/* Enhanced Stats Card */}
            <div className="flowmilk-stats-card">
                <div className="flowmilk-stats-header">
                    <div>
                        <div className="flowmilk-stats-title">Total Stok Aktif</div>
                        <div className="flowmilk-stats-amount">{stats.totalStock.toLocaleString('id-ID')} Karton</div>
                    </div>
                    <div className="flowmilk-timeframe-selector">
                        <select 
                            value={selectedTimeframe} 
                            onChange={(e) => setSelectedTimeframe(e.target.value)}
                            className="flowmilk-timeframe-select"
                        >
                            <option value="today">Hari Ini</option>
                            <option value="week">7 Hari</option>
                            <option value="month">30 Hari</option>
                        </select>
                    </div>
                </div>
                
                <div className="flowmilk-stats-summary">
                    <div className="flowmilk-stats-item">
                        <div className="flowmilk-stats-number">{stats.activeWarehouses}</div>
                        <div className="flowmilk-stats-label">Gudang Aktif</div>
                    </div>
                    <div className="flowmilk-stats-item">
                        <div className="flowmilk-stats-number">{stats.todayDistributions}</div>
                        <div className="flowmilk-stats-label">Distribusi {selectedTimeframe === 'today' ? 'Hari Ini' : 'Periode'}</div>
                    </div>
                    <div className="flowmilk-stats-item">
                        <div className="flowmilk-stats-number">{stats.pendingPOs}</div>
                        <div className="flowmilk-stats-label">PO Pending</div>
                    </div>
                </div>
                
                <NavLink to="/database" className="flowmilk-view-all">
                    Detail Stok per Gudang
                    <span>→</span>
                </NavLink>
            </div>

            {/* Stock Alert */}
            <StockAlert />

            {/* Search Bar */}
            <div className="flowmilk-search-bar" onClick={() => document.querySelector('.flowmilk-search-input')?.focus()}>
                <input 
                    type="text" 
                    placeholder="🔍 Cari Distribusi, SPPG, atau Korwil..."
                    className="flowmilk-search-input"
                    style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#666' }}
                />
            </div>

            {/* Enhanced Quick Actions */}
            <div className="flowmilk-quick-actions">
    {quickActions.map((action, index) => (
        <NavLink key={index} to={action.link} className={`flowmilk-quick-action ${action.color}`}>
            <div className="flowmilk-quick-action-content">
                <div className="flowmilk-quick-action-title">{action.title}</div>
                <div className="flowmilk-quick-action-subtitle">{action.subtitle}</div>
            </div>
            {action.count > 0 && (
                <div className="flowmilk-quick-action-badge">{action.count}</div>
            )}
        </NavLink>
    ))}
</div>

            {/* Performance Cards */}
            <div className="flowmilk-performance-grid">
                <div className="flowmilk-performance-card">
                    <div className="flowmilk-performance-icon">💰</div>
                    <div className="flowmilk-performance-content">
                        <div className="flowmilk-performance-value">
                            Rp {stats.totalRevenue.toLocaleString('id-ID')}
                        </div>
                        <div className="flowmilk-performance-label">Revenue {selectedTimeframe === 'today' ? 'Hari Ini' : 'Periode'}</div>
                    </div>
                </div>
                
                <div className="flowmilk-performance-card">
                    <div className="flowmilk-performance-icon">📋</div>
                    <div className="flowmilk-performance-content">
                        <div className="flowmilk-performance-value">{stats.unpaidInvoices}</div>
                        <div className="flowmilk-performance-label">Invoice Belum Lunas</div>
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="flowmilk-menu-grid">
                <NavLink to="/" className={({isActive}) => `flowmilk-menu-item ${isActive ? 'active' : ''}`}>
                    <div className="flowmilk-menu-icon dashboard">📊</div>
                    <div className="flowmilk-menu-title">Dashboard</div>
                    <div className="flowmilk-menu-subtitle">Overview & Statistik</div>
                </NavLink>

                <NavLink to="/purchase-orders" className="flowmilk-menu-item">
                    {stats.pendingPOs > 0 && <div className="flowmilk-notification-dot"></div>}
                    <div className="flowmilk-menu-icon po">🛒</div>
                    <div className="flowmilk-menu-title">Purchase Order</div>
                    <div className="flowmilk-menu-subtitle">PO ke Jawa</div>
                </NavLink>

                <NavLink to="/distributions" className="flowmilk-menu-item">
                    {stats.pendingDistributions > 0 && <div className="flowmilk-notification-dot"></div>}
                    <div className="flowmilk-menu-icon distribusi">🚛</div>
                    <div className="flowmilk-menu-title">Distribusi</div>
                    <div className="flowmilk-menu-subtitle">Surat Jalan & BAST</div>
                </NavLink>

                <NavLink to="/invoices" className="flowmilk-menu-item">
                    {stats.unpaidInvoices > 0 && <div className="flowmilk-notification-dot"></div>}
                    <div className="flowmilk-menu-icon invoice">💰</div>
                    <div className="flowmilk-menu-title">Invoice</div>
                    <div className="flowmilk-menu-subtitle">Tagihan Dapur</div>
                </NavLink>

                <NavLink to="/sppgs" className="flowmilk-menu-item">
                    <div className="flowmilk-menu-icon sppg">🏪</div>
                    <div className="flowmilk-menu-title">SPPG</div>
                    <div className="flowmilk-menu-subtitle">Data Dapur MBG</div>
                </NavLink>

                <NavLink to="/coordinators" className="flowmilk-menu-item">
                    {stats.lowStockWarehouses > 0 && <div className="flowmilk-notification-dot"></div>}
                    <div className="flowmilk-menu-icon korwil">👥</div>
                    <div className="flowmilk-menu-title">Korwil</div>
                    <div className="flowmilk-menu-subtitle">Koordinator Wilayah</div>
                </NavLink>

                <NavLink to="/database" className="flowmilk-menu-item">
                    <div className="flowmilk-menu-icon database">💾</div>
                    <div className="flowmilk-menu-title">Database</div>
                    <div className="flowmilk-menu-subtitle">Pusat Data</div>
                </NavLink>

                <div className="flowmilk-menu-item" onClick={() => alert('Laporan feature coming soon!')}>
                    <div className="flowmilk-menu-icon laporan">📈</div>
                    <div className="flowmilk-menu-title">Laporan</div>
                    <div className="flowmilk-menu-subtitle">Keuangan & Analytics</div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="flowmilk-recent-section">
                <h3 className="flowmilk-section-title">Aktivitas Terbaru</h3>
                
                <div className="flowmilk-recent-grid">
                    {recentActivities.map((section, index) => (
                        <div key={index} className="flowmilk-recent-card">
                            <div className="flowmilk-recent-header">
                                <h4 className="flowmilk-recent-title">{section.title}</h4>
                                <NavLink to={section.items[0]?.link || '#'} className="flowmilk-recent-link">
                                    Lihat Semua →
                                </NavLink>
                            </div>
                            
                            <div className="flowmilk-recent-list">
                                {section.items.length > 0 ? section.items.map(item => (
                                    <div key={item.id} className="flowmilk-recent-item">
                                        <div className="flowmilk-recent-content">
                                            <div className="flowmilk-recent-item-title">{item.title}</div>
                                            <div className="flowmilk-recent-item-subtitle">{item.subtitle}</div>
                                            <div className="flowmilk-recent-item-date">{item.date}</div>
                                        </div>
                                        <div className={`flowmilk-recent-status status-${item.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {item.status}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flowmilk-empty-state">
                                        <p>Tidak ada aktivitas terbaru</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;