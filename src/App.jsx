import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, addDoc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import LoginPage from './components/LoginPage.jsx';
import { InvoiceStatus } from './constants.js';
import Dashboard from './components/Dashboard.jsx';
import PurchaseOrdersPage from './components/PurchaseOrdersPage.jsx';
import DistributionsPage from './components/DistributionsPage.jsx';
import InvoicesPage from './components/InvoicesPage.jsx';
import SPPGsPage from './components/KitchensPage.jsx';
import CoordinatorsPage from './components/CoordinatorsPage.jsx';
import DatabasePage from './components/DatabasePage.jsx';
import { SELLING_PRICE_PER_CARTON } from './constants.js';
import { DashboardIcon, TruckIcon, DocumentTextIcon, ShoppingCartIcon, OfficeBuildingIcon, MenuIcon, UserGroupIcon, DatabaseIcon } from './components/icons/Icons.jsx';
import { collection, getDocs, doc, addDoc, updateDoc, writeBatch, Timestamp, deleteDoc } from 'firebase/firestore';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State is now initialized with empty arrays, to be filled from Firestore
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [sppgs, setSPPGs] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [allocationHistory, setAllocationHistory] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Fetch all data from Firestore
  const fetchData = useCallback(async () => {
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
      poNumber: `PO-KDMP-${Date.now()}`,
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
        suratJalanNumber: `KDMP/SJ/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(distributions.length + 1).padStart(3, '0')}`,
        bastNumber: `KDMP/BAST/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(distributions.length + 1).padStart(3, '0')}`,
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
        invoiceNumber: `KDMP/INV/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(invoices.length + 1).padStart(3, '0')}`,
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
    } catch(e) { console.error("Error updating distribution: ", e); }
  };
  
  const availableStock = coordinators.reduce((acc, c) => acc + c.stock, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const NavItem = ({ to, icon, children }) => (
    <li>
      <NavLink to={to} className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary-light text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`} onClick={() => setSidebarOpen(false)}>
        {icon}
        <span className="ml-3 font-medium">{children}</span>
      </NavLink>
    </li>
  );

  const Header = () => {
    const location = useLocation();
    const getTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        if (path.startsWith('/purchase-orders')) return 'PO';
        if (path.startsWith('/distributions')) return 'Distribusi';
        if (path.startsWith('/invoices')) return 'Invoices';
        if (path.startsWith('/sppgs')) return 'SPPG';
        if (path.startsWith('/coordinators')) return 'Koordinator Wilayah';
        if (path.startsWith('/database')) return 'Database';
        return 'Sistem Distribusi';
    }

    return (
        <header className="bg-surface shadow-sm sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                         <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden mr-4 text-gray-500 hover:text-primary-dark">
                             <MenuIcon />
                         </button>
                         <h1 className="text-xl font-bold text-primary-dark">{getTitle()}</h1>
                    </div>
                    <div className="flex items-center">
                        <div className="text-right mr-4 hidden sm:block">
                            <p className="text-sm font-semibold text-text-primary">{currentUser?.role}</p>
                            <p className="text-xs text-text-secondary">{currentUser?.email}</p>
                        </div>
                        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors" title="Logout">
                          Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-background"><p>Memuat aplikasi...</p></div>;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-background">
        <aside className={`fixed md:relative inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out bg-surface w-64 shadow-lg z-30`}>
          <div className="flex items-center justify-start h-20 border-b px-4">
             <img src="https://res.cloudinary.com/dnci7vkv4/image/upload/v1756788264/logo-kdmp_e0gttt.png" alt="KDMP Logo" className="h-12 mr-3" />
             <div>
               <h1 className="text-md font-bold text-primary-dark leading-tight">KDMP Penfui Timur</h1>
               <p className="text-xs text-text-secondary leading-tight">Milk Management</p>
             </div>
          </div>
          <nav className="p-4">
            <ul>
              <NavItem to="/" icon={<DashboardIcon />}>Dashboard</NavItem>
              <NavItem to="/purchase-orders" icon={<ShoppingCartIcon />}>PO</NavItem>
              <NavItem to="/distributions" icon={<TruckIcon />}>Distribusi</NavItem>
              <NavItem to="/invoices" icon={<DocumentTextIcon />}>Invoices</NavItem>
              <NavItem to="/sppgs" icon={<OfficeBuildingIcon />}>SPPG</NavItem>
              <NavItem to="/coordinators" icon={<UserGroupIcon />}>Korwil</NavItem>
              <NavItem to="/database" icon={<DatabaseIcon />}>Database</NavItem>
            </ul>
          </nav>
        </aside>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
             <Routes>
              <Route path="/" element={<Dashboard purchaseOrders={purchaseOrders} distributions={distributions} invoices={invoices} availableStock={availableStock} coordinators={coordinators} />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersPage purchaseOrders={purchaseOrders} addPurchaseOrder={addPurchaseOrder} updatePurchaseOrderStatus={updatePurchaseOrderStatus} deletePurchaseOrder={deletePurchaseOrder} allocationHistory={allocationHistory} coordinators={coordinators} allocateStockFromPO={allocateStockFromPO} />} />
              <Route path="/distributions" element={<DistributionsPage distributions={distributions} addDistribution={addDistribution} sppgs={sppgs} coordinators={coordinators} updateDistributionStatus={updateDistributionStatus} />} />
              <Route path="/invoices" element={<InvoicesPage invoices={invoices} updateInvoiceStatus={updateInvoiceStatus} sppgs={sppgs} distributions={distributions} addInvoice={addInvoice} coordinators={coordinators} />} />
              <Route path="/sppgs" element={<SPPGsPage sppgs={sppgs} updateSPPG={updateSPPG} addSPPG={addSPPG} />} />
              <Route path="/coordinators" element={<CoordinatorsPage coordinators={coordinators} sppgs={sppgs} updateCoordinator={updateCoordinator} addCoordinator={addCoordinator} />} />
              <Route path="/database" element={<DatabasePage purchaseOrders={purchaseOrders} distributions={distributions} invoices={invoices} sppgs={sppgs} coordinators={coordinators} />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;