// App.jsx - Mobile-First FLOWMILK Implementation
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, addDoc, updateDoc, writeBatch, Timestamp, deleteDoc } from 'firebase/firestore';
import LoginPage from './components/LoginPage.jsx';
import { InvoiceStatus } from './constants.js';
import Dashboard from './components/Dashboard.jsx';
import PurchaseOrdersPage from './components/PurchaseOrdersPage.jsx';
import DistributionsPage from './components/DistributionsPage.jsx';
import InvoicesPage from './components/InvoicesPage.jsx';
import SPPGsPage from './components/KitchensPage.jsx';
import CoordinatorsPage from './components/CoordinatorsPage.jsx';
import DatabasePage from './components/DatabasePage.jsx';
import ReportsPage from './components/ReportsPage.jsx';
// Import LaporanPage jika sudah ada, atau buat yang baru. Saya asumsikan ada.
// import ReportsPage from './components/ReportsPage.jsx'; // <--- Tambahkan ini jika Anda punya komponen ReportsPage
import { SELLING_PRICE_PER_CARTON } from './constants.js';
import './flowmilk-styles.css'; // New CSS file for FLOWMILK styling
import DistributionForm from './components/forms/DistributionForm.jsx';
import PurchaseOrderForm from './components/forms/PurchaseOrderForm.jsx';
import InvoiceForm from './components/forms/InvoiceForm.jsx';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ... (keep all your existing state and functions - purchaseOrders, sppgs, etc.)
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [sppgs, setSPPGs] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [allocationHistory, setAllocationHistory] = useState([]);

  // ... (keep all your existing functions - fetchData, addPurchaseOrder, etc.)
  const fetchData = useCallback(async () => {
    // ... (keep your existing fetchData implementation)
  try {
          const collections = {
              purchaseOrders: collection(db, 'purchaseOrders'),
              sppgs: collection(db, 'sppgs'),
              coordinators: collection(db, 'coordinators'),
              distributions: collection(db, 'distributions'),
              invoices: collection(db, 'invoices'),
              allocationHistory: collection(db, 'allocationHistory'),
          };
  
          const [poSnap, sppgSnap, coordSnap, distSnap, invSnap, allocHistSnap] = await Promise.all([
              getDocs(collections.purchaseOrders),
              getDocs(collections.sppgs),
              getDocs(collections.coordinators),
              getDocs(collections.distributions),
              getDocs(collections.invoices),
              getDocs(collections.allocationHistory),
          ]);
  
          const toArray = (snapshot) => snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  
          setPurchaseOrders(toArray(poSnap).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setSPPGs(toArray(sppgSnap));
          setCoordinators(toArray(coordSnap));
          setDistributions(toArray(distSnap).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setInvoices(toArray(invSnap).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setAllocationHistory(toArray(allocHistSnap));
  
      } catch (error) {
          console.error("Error fetching data from Firestore:", error);
          alert("Gagal memuat data dari database.");
      }
    }, []);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser({ uid: user.uid, email: user.email || 'No Email', role: 'Admin' });
          fetchData();
        } else {
          setCurrentUser(null);
          // Clear data on logout
          setPurchaseOrders([]);
          setSPPGs([]);
          setCoordinators([]);
          setDistributions([]);
          setInvoices([]);
          setAllocationHistory([]);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }, [fetchData]);
    
    const addPurchaseOrder = async (po) => {
      const newPOData = {
        ...po,
        poNumber: `PO-KDMP-PT-${Date.now()}`,
        remainingCartons: po.totalCartons,
        createdAt: Timestamp.now().toDate().toISOString(),
      };
      try {
          const docRef = await addDoc(collection(db, 'purchaseOrders'), newPOData);
          setPurchaseOrders(prev => [{ id: docRef.id, ...newPOData }, ...prev]);
      } catch (error) {
          console.error("Error adding PO:", error);
      }
    };
    const deletePurchaseOrder = async (poId) => {
    const poToDelete = purchaseOrders.find(p => p.id === poId);
    if (!poToDelete) return;
  
    // Cari semua alokasi yang terkait dengan PO ini
    const relatedAllocations = allocationHistory.filter(alloc => alloc.poId === poId);
    
    if (relatedAllocations.length > 0) {
      // Ada stok yang sudah dialokasi, harus dikembalikan
      const batch = writeBatch(db);
      const updatedCoords = new Map(coordinators.map(c => [c.id, {...c}]));
      
      // Kembalikan stok ke masing-masing koordinator
      relatedAllocations.forEach(alloc => {
        const coord = updatedCoords.get(alloc.coordinatorId);
        if (coord) {
          const coordRef = doc(db, 'coordinators', alloc.coordinatorId);
          const newStock = coord.stock - alloc.cartons; // Kurangi stok karena dikembalikan
          batch.update(coordRef, { stock: Math.max(0, newStock) }); // Pastikan tidak minus
          coord.stock = Math.max(0, newStock);
        }
      });
  
      // Hapus history alokasi terkait PO ini
      for (const alloc of relatedAllocations) {
        const allocRef = doc(db, 'allocationHistory', alloc.id);
        batch.delete(allocRef);
      }
  
      // Hapus PO dari database
      const poRef = doc(db, 'purchaseOrders', poId);
      batch.delete(poRef);
  
      try {
        await batch.commit();
        
        // Update state lokal
        setPurchaseOrders(prev => prev.filter(p => p.id !== poId));
        setCoordinators(Array.from(updatedCoords.values()));
        setAllocationHistory(prev => prev.filter(alloc => alloc.poId !== poId));
        
        alert(`PO ${poToDelete.poNumber} berhasil dihapus dan stok dikembalikan.`);
      } catch (error) {
        console.error("Error deleting PO:", error);
        alert("Gagal menghapus PO.");
      }
    } else {
      // Tidak ada alokasi, langsung hapus PO saja
      try {
        const poRef = doc(db, 'purchaseOrders', poId);
        await deleteDoc(poRef);
        
        setPurchaseOrders(prev => prev.filter(p => p.id !== poId));
        alert(`PO ${poToDelete.poNumber} berhasil dihapus.`);
      } catch (error) {
        console.error("Error deleting PO:", error);
        alert("Gagal menghapus PO.");
      }
    }
  };
    const updatePurchaseOrderStatus = async (poId, status) => {
      const poRef = doc(db, 'purchaseOrders', poId);
      try {
          await updateDoc(poRef, { status });
          setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status } : po));
      } catch (error) {
          console.error("Error updating PO status:", error);
      }
    };
  
    const allocateStockFromPO = async (poId, allocations) => {
      const batch = writeBatch(db);
      const poToUpdate = purchaseOrders.find(p => p.id === poId);
      if (!poToUpdate) return;
  
      const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.cartons, 0);
      if (totalAllocated > poToUpdate.remainingCartons) return;
  
      // Update PO
      const poRef = doc(db, 'purchaseOrders', poId);
      batch.update(poRef, { remainingCartons: poToUpdate.remainingCartons - totalAllocated });
  
      const newHistoryItems = [];
      const updatedCoords = new Map(coordinators.map(c => [c.id, {...c}]));
  
      allocations.forEach(alloc => {
        const coord = updatedCoords.get(alloc.coordinatorId);
        if (coord) {
            const coordRef = doc(db, 'coordinators', alloc.coordinatorId);
            const newStock = coord.stock + alloc.cartons;
            batch.update(coordRef, { stock: newStock });
            coord.stock = newStock;
            
            const historyData = {
              poId,
              coordinatorId: alloc.coordinatorId,
              cartons: alloc.cartons,
              date: new Date().toISOString().split('T')[0],
            };
            const historyRef = doc(collection(db, 'allocationHistory'));
            batch.set(historyRef, historyData);
            newHistoryItems.push({ id: historyRef.id, ...historyData });
        }
      });
  
      try {
          await batch.commit();
          setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, remainingCartons: p.remainingCartons - totalAllocated } : p));
          setCoordinators(Array.from(updatedCoords.values()));
          setAllocationHistory(prev => [...newHistoryItems, ...prev]);
          alert('Alokasi stok berhasil!');
      } catch (error) {
          console.error("Error allocating stock:", error);
      }
    };
    
    const addDistribution = async (dist) => {
      const coordinator = coordinators.find(c => c.id === dist.coordinatorId);
      if (!coordinator || coordinator.stock < dist.cartons) return;
  
      const batch = writeBatch(db);
      const now = new Date();
      const newDistData = {
          ...dist,
          suratJalanNumber: `KDMP-PT/SJ/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(distributions.length + 1).padStart(3, '0')}`,
          bastNumber: `KDMP-PT/BAST/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(distributions.length + 1).padStart(3, '0')}`,
          createdAt: Timestamp.now().toDate().toISOString(),
      };
  
      const newDistRef = doc(collection(db, 'distributions'));
      batch.set(newDistRef, newDistData);
      
      const coordRef = doc(db, 'coordinators', dist.coordinatorId);
      const newStock = coordinator.stock - dist.cartons;
      batch.update(coordRef, { stock: newStock });
  
      try {
          await batch.commit();
          setDistributions(prev => [{ id: newDistRef.id, ...newDistData }, ...prev]);
          setCoordinators(prev => prev.map(c => c.id === dist.coordinatorId ? { ...c, stock: newStock } : c));
      } catch (error) {
          console.error("Error adding distribution:", error);
      }
    };
    
    const addInvoice = async (dist) => {
      const batch = writeBatch(db);
      const now = new Date();
      const newInvoiceData = {
          invoiceNumber: `KDMP-PT/INV/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(invoices.length + 1).padStart(3, '0')}`,
          distributionId: dist.id,
          sppgId: dist.sppgId,
          issueDate: now.toISOString().split('T')[0],
          dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: dist.cartons * SELLING_PRICE_PER_CARTON,
          status: InvoiceStatus.UNPAID,
          createdAt: Timestamp.now().toDate().toISOString(),
      };
  
      const newInvoiceRef = doc(collection(db, 'invoices'));
      batch.set(newInvoiceRef, newInvoiceData);
  
      const distRef = doc(db, 'distributions', dist.id);
      batch.update(distRef, { invoiceId: newInvoiceRef.id });
  
      try {
          await batch.commit();
          setInvoices(prev => [{ id: newInvoiceRef.id, ...newInvoiceData }, ...prev]);
          setDistributions(prev => prev.map(d => d.id === dist.id ? { ...d, invoiceId: newInvoiceRef.id } : d));
      } catch (error) {
          console.error("Error adding invoice:", error);
      }
    };
  
    const addSPPG = async (sppg) => {
      try {
          const docRef = await addDoc(collection(db, 'sppgs'), sppg);
          setSPPGs(prev => [{ id: docRef.id, ...sppg }, ...prev]);
      } catch(e) { console.error("Error adding SPPG: ", e); }
    };
  
    const updateSPPG = async (sppgId, updatedData) => {
      const sppgRef = doc(db, 'sppgs', sppgId);
      try {
          await updateDoc(sppgRef, updatedData);
          setSPPGs(prev => prev.map(s => s.id === sppgId ? { ...s, ...updatedData } : s));
      } catch(e) { console.error("Error updating SPPG: ", e); }
    };
  
    const addCoordinator = async (coord) => {
      const newCoordData = { ...coord, sppgIds: [], stock: 0 };
      try {
          const docRef = await addDoc(collection(db, 'coordinators'), newCoordData);
          setCoordinators(prev => [{ id: docRef.id, ...newCoordData }, ...prev]);
      } catch(e) { console.error("Error adding coordinator: ", e); }
    };
    
    const updateCoordinator = async (coordinatorId, updatedData) => {
      const coordRef = doc(db, 'coordinators', coordinatorId);
      try {
          await updateDoc(coordRef, updatedData);
          setCoordinators(prev => prev.map(c => c.id === coordinatorId ? { ...c, ...updatedData } : c));
      } catch(e) { console.error("Error updating coordinator: ", e); }
    };
  
    const updateInvoiceStatus = async (invoiceId, status) => {
      const invRef = doc(db, 'invoices', invoiceId);
      try {
          await updateDoc(invRef, { status });
          setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv));
      } catch(e) { console.error("Error updating invoice: ", e); }
    };
  
    const updateDistributionStatus = async (distId, status) => {
      const distRef = doc(db, 'distributions', distId);
      try {
          await updateDoc(distRef, { status });
          setDistributions(prev => prev.map(dist => dist.id === distId ? { ...dist, status } : dist));
      } catch(e) { console.error("Error updating distribution:", e); }
    };

  const availableStock = coordinators.reduce((acc, c) => acc + c.stock, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Mobile-First Header Component
  const MobileHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const getPageInfo = () => {
      const path = location.pathname;
      if (path === '/') return { title: 'Dashboard', showBack: false };
      if (path.startsWith('/purchase-orders')) return { title: 'Purchase Orders', showBack: true };
      if (path.startsWith('/distributions')) return { title: 'Distribusi', showBack: true };
      if (path.startsWith('/invoices')) return { title: 'Invoice', showBack: true };
      if (path.startsWith('/sppgs')) return { title: 'SPPG', showBack: true };
      if (path.startsWith('/coordinators')) return { title: 'Korwil', showBack: true };
      if (path.startsWith('/database')) return { title: 'Database', showBack: true };
      // Tambahkan rute untuk Laporan jika ada
      if (path.startsWith('/reports')) return { title: 'Laporan', showBack: true };
      return { title: 'FLOWMILK', showBack: false };
    };

    const pageInfo = getPageInfo();

    return (
      <header className="flowmilk-header">
        <div className="flowmilk-header-content">
          <div className="flowmilk-header-left">
            {pageInfo.showBack ? (
              <button onClick={() => navigate(-1)} className="flowmilk-back-btn">
                ←
              </button>
            ) : (
              <div className="flowmilk-logo">
                <span className="flowmilk-logo-flow">FLOW</span>MILK
              </div>
            )}
            <h1 className="flowmilk-page-title">{pageInfo.title}</h1>
          </div>
          <div className="flowmilk-header-right">
            <div className="flowmilk-notification-badge">3</div>
            <button onClick={handleLogout} className="flowmilk-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>
    );
  };

  // Mobile Dashboard Component (Enhanced)
  const MobileDashboard = () => {
    const pendingDistributions = distributions.filter(d => d.status !== 'Terkirim').length;
    const unpaidInvoices = invoices.filter(i => i.status === InvoiceStatus.UNPAID);
    const todayDistributions = distributions.filter(d => 
      new Date(d.createdAt).toDateString() === new Date().toDateString()
    ).length;

    return (
      <div className="flowmilk-dashboard">
        {/* Stats Card */}
        <div className="flowmilk-stats-card">
          <div className="flowmilk-stats-title">Total Stok Aktif</div>
          <div className="flowmilk-stats-amount">{availableStock.toLocaleString('id-ID')} Karton</div>
          <div className="flowmilk-stats-summary">
            <div className="flowmilk-stats-item">
              <div className="flowmilk-stats-number">{coordinators.length}</div>
              <div className="flowmilk-stats-label">Gudang Aktif</div>
            </div>
            <div className="flowmilk-stats-item">
              <div className="flowmilk-stats-number">{todayDistributions}</div>
              <div className="flowmilk-stats-label">Distribusi Hari Ini</div>
            </div>
            <div className="flowmilk-stats-item">
              <div className="flowmilk-stats-number">{purchaseOrders.filter(po => po.status === 'Draft').length}</div>
              <div className="flowmilk-stats-label">PO Pending</div>
            </div>
          </div>
          {/* Ubah link ini agar tidak mengarah ke Database, tapi bisa ke dashboard/overview stok atau hapus saja jika tidak relevan */}
          {/* <NavLink to="/database" className="flowmilk-view-all"> */}
          <NavLink to="/" className="flowmilk-view-all"> {/* Mengarah ke dashboard utama atau bisa disesuaikan */}
            Detail Stok per Gudang
            <span>→</span>
          </NavLink>
        </div>

        {/* Search Bar */}
        <div className="flowmilk-search-bar">
          🔍 Cari Distribusi, SPPG, atau Korwil...
        </div>

        {/* Quick Actions - Update ke 3 actions yang route langsung ke form */}
<div className="flowmilk-quick-actions">
  <NavLink to="/distributions/create" className="flowmilk-quick-action">
    📦 Buat Distribusi
  </NavLink>
  <NavLink to="/purchase-orders/create" className="flowmilk-quick-action">
    📋 PO Baru
  </NavLink>
  <NavLink to="/invoices/create" className="flowmilk-quick-action">
    💰 Buat Invoice
  </NavLink>
</div>

        {/* Menu Grid - Hapus Database dan Laporan */}
        <div className="flowmilk-menu-grid">
          <NavLink to="/" className="flowmilk-menu-item">
            <div className="flowmilk-menu-icon dashboard">📊</div>
            <div className="flowmilk-menu-title">Dashboard</div>
            <div className="flowmilk-menu-subtitle">Overview & Statistik</div>
          </NavLink>

          <NavLink to="/purchase-orders" className="flowmilk-menu-item">
            {purchaseOrders.filter(po => po.status === 'Draft').length > 0 && (
              <div className="flowmilk-notification-dot"></div>
            )}
            <div className="flowmilk-menu-icon po">🛒</div>
            <div className="flowmilk-menu-title">Purchase Order</div>
            <div className="flowmilk-menu-subtitle">PO ke Jawa</div>
          </NavLink>

          <NavLink to="/distributions" className="flowmilk-menu-item">
            <div className="flowmilk-menu-icon distribusi">🚛</div>
            <div className="flowmilk-menu-title">Distribusi</div>
            <div className="flowmilk-menu-subtitle">Surat Jalan & BAST</div>
          </NavLink>

          <NavLink to="/invoices" className="flowmilk-menu-item">
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
            <div className="flowmilk-menu-icon korwil">👥</div>
            <div className="flowmilk-menu-title">Korwil</div>
            <div className="flowmilk-menu-subtitle">Koordinator Wilayah</div>
          </NavLink>

          {/* Hapus NavLink ke /database */}
          {/* Hapus NavLink ke /reports (sebelumnya ada di /database) */}
        </div>
      </div>
    );
  };

  // Bottom Navigation - Hanya HOME, DATABASE, LAPORAN
  const BottomNavigation = () => (
    <nav className="flowmilk-bottom-nav">
      <NavLink to="/" className={({ isActive }) => `flowmilk-nav-item ${isActive ? 'active' : ''}`}>
        <span className="flowmilk-nav-icon">🏠</span>
        Home
      </NavLink>
      <NavLink to="/database" className={({ isActive }) => `flowmilk-nav-item ${isActive ? 'active' : ''}`}>
        <span className="flowmilk-nav-icon">💾</span>
        Database
      </NavLink>
      <NavLink to="/reports" className={({ isActive }) => `flowmilk-nav-item ${isActive ? 'active' : ''}`}> {/* Ubah /database menjadi /reports */}
        <span className="flowmilk-nav-icon">📈</span>
        Laporan
      </NavLink>
    </nav>
  );

  if (loading) {
    return (
      <div className="flowmilk-loading">
        <div className="flowmilk-loading-content">
          <div className="flowmilk-logo">
            <span className="flowmilk-logo-flow">FLOW</span>MILK
          </div>
          <p>Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <HashRouter>
      <div className="flowmilk-app">
        <MobileHeader />
        <main className="flowmilk-main">
          <Routes>
            <Route path="/" element={<MobileDashboard />} />
            <Route path="/purchase-orders" element={
              <div className="flowmilk-page-wrapper">
                <PurchaseOrdersPage 
                  purchaseOrders={purchaseOrders}
                  addPurchaseOrder={addPurchaseOrder}
                  updatePurchaseOrderStatus={updatePurchaseOrderStatus}
                  deletePurchaseOrder={deletePurchaseOrder}
                  allocationHistory={allocationHistory}
                  coordinators={coordinators}
                  allocateStockFromPO={allocateStockFromPO}
                />
              </div>
            } />
            <Route path="/distributions" element={
              <div className="flowmilk-page-wrapper">
                <DistributionsPage
                  distributions={distributions}
                  sppgs={sppgs}
                  coordinators={coordinators}
                  updateDistributionStatus={updateDistributionStatus}
                />
              </div>
            } />
            {/* NEW ROUTE: Distribution Form */}
            <Route path="/distributions/create" element={
              <div className="flowmilk-page-wrapper">
                <DistributionForm
                  distributions={distributions}
                  addDistribution={addDistribution}
                  sppgs={sppgs}
                  coordinators={coordinators}
                  updateDistributionStatus={updateDistributionStatus}
                />
              </div>
            } />
            <Route path="/invoices" element={
              <div className="flowmilk-page-wrapper">
                <InvoicesPage
                  invoices={invoices}
                  updateInvoiceStatus={updateInvoiceStatus}
                  sppgs={sppgs}
                  distributions={distributions}
                  addInvoice={addInvoice}
                  coordinators={coordinators}
                />
              </div>
            } />
            <Route path="/sppgs" element={
              <div className="flowmilk-page-wrapper">
                <SPPGsPage sppgs={sppgs} updateSPPG={updateSPPG} addSPPG={addSPPG} />
              </div>
            } />
            <Route path="/coordinators" element={
              <div className="flowmilk-page-wrapper">
                <CoordinatorsPage
                  coordinators={coordinators}
                  sppgs={sppgs}
                  updateCoordinator={updateCoordinator}
                  addCoordinator={addCoordinator}
                />
              </div>
            } />
            <Route path="/database" element={
              <div className="flowmilk-page-wrapper">
                <DatabasePage
                  purchaseOrders={purchaseOrders}
                  distributions={distributions}
                  invoices={invoices}
                  sppgs={sppgs}
                  coordinators={coordinators}
                />
              </div>
            } />
            {/* Tambahkan rute untuk Laporan. Asumsi Anda memiliki komponen ReportsPage */}
            <Route path="/reports" element={
  <div className="flowmilk-page-wrapper">
    <ReportsPage
      purchaseOrders={purchaseOrders}
      distributions={distributions}
      invoices={invoices}
      sppgs={sppgs}
      coordinators={coordinators}
    />
  </div>
} />
            <Route 
              path="/purchase-orders/create" 
              element={
                <PurchaseOrderForm 
                  addPurchaseOrder={addPurchaseOrder}
                />
              } 
            />
            <Route 
              path="/invoices/create" 
              element={
                <InvoiceForm 
                  addInvoice={addInvoice}
                  sppgs={sppgs}
                  distributions={distributions}
                />
              } 
            />
          </Routes>
        </main>
        <BottomNavigation />
      </div>
    </HashRouter>
  );
};

export default App;