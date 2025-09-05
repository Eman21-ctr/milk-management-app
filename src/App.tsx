import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, addDoc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import LoginPage from './components/LoginPage';
import { POStatus, DistributionStatus, InvoiceStatus, type PurchaseOrder, type Distribution, type Invoice, type SPPG, type Coordinator, type Allocation, type AllocationHistory, type User } from './types';
import Dashboard from './components/Dashboard';
import PurchaseOrdersPage from './components/PurchaseOrdersPage';
import DistributionsPage from './components/DistributionsPage';
import InvoicesPage from './components/InvoicesPage';
import SPPGsPage from './components/KitchensPage';
import CoordinatorsPage from './components/CoordinatorsPage';
import DatabasePage from './components/DatabasePage';
import { SELLING_PRICE_PER_CARTON } from './constants';
import { DashboardIcon, TruckIcon, DocumentTextIcon, ShoppingCartIcon, OfficeBuildingIcon, MenuIcon, UserGroupIcon, DatabaseIcon } from './components/icons/Icons';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State is now initialized with empty arrays, to be filled from Firestore
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [sppgs, setSPPGs] = useState<SPPG[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allocationHistory, setAllocationHistory] = useState<AllocationHistory[]>([]);
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

        const toArray = <T,>(snapshot: any): T[] => snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as T));

        setPurchaseOrders(toArray<PurchaseOrder>(poSnap).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setSPPGs(toArray<SPPG>(sppgSnap));
        setCoordinators(toArray<Coordinator>(coordSnap));
        setDistributions(toArray<Distribution>(distSnap).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setInvoices(toArray<Invoice>(invSnap).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setAllocationHistory(toArray<AllocationHistory>(allocHistSnap));

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
  
  const addPurchaseOrder = async (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'remainingCartons' | 'createdAt'>) => {
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
  
  const updatePurchaseOrderStatus = async (poId: string, status: PurchaseOrder['status']) => {
    const poRef = doc(db, 'purchaseOrders', poId);
    try {
        await updateDoc(poRef, { status });
        setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status } : po));
    } catch (error) {
        console.error("Error updating PO status:", error);
    }
  };

  const allocateStockFromPO = async (poId: string, allocations: Allocation[]) => {
    const batch = writeBatch(db);
    const poToUpdate = purchaseOrders.find(p => p.id === poId);
    if (!poToUpdate) return;

    const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.cartons, 0);
    if (totalAllocated > poToUpdate.remainingCartons) return;

    // Update PO
    const poRef = doc(db, 'purchaseOrders', poId);
    batch.update(poRef, { remainingCartons: poToUpdate.remainingCartons - totalAllocated });

    const newHistoryItems: AllocationHistory[] = [];
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
  
 const addDistribution = async (dist: Omit<Distribution, 'id' | 'suratJalanNumber' | 'bastNumber' | 'createdAt'>) => {
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
  
  const addInvoice = async (dist: Distribution) => {
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

  const addSPPG = async (sppg: Omit<SPPG, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'sppgs'), sppg);
        setSPPGs(prev => [{ id: docRef.id, ...sppg }, ...prev]);
    } catch(e) { console.error("Error adding SPPG: ", e); }
  };

  const updateSPPG = async (sppgId: string, updatedData: Partial<SPPG>) => {
    const sppgRef = doc(db, 'sppgs', sppgId);
    try {
        await updateDoc(sppgRef, updatedData);
        setSPPGs(prev => prev.map(s => s.id === sppgId ? { ...s, ...updatedData } : s));
    } catch(e) { console.error("Error updating SPPG: ", e); }
  };

  const addCoordinator = async (coord: Omit<Coordinator, 'id' | 'sppgIds' | 'stock'>) => {
    const newCoordData = { ...coord, sppgIds: [], stock: 0 };
    try {
        const docRef = await addDoc(collection(db, 'coordinators'), newCoordData);
        setCoordinators(prev => [{ id: docRef.id, ...newCoordData }, ...prev]);
    } catch(e) { console.error("Error adding coordinator: ", e); }
  };
  
  const updateCoordinator = async (coordinatorId: string, updatedData: Partial<Coordinator>) => {
    const coordRef = doc(db, 'coordinators', coordinatorId);
    try {
        await updateDoc(coordRef, updatedData);
        setCoordinators(prev => prev.map(c => c.id === coordinatorId ? { ...c, ...updatedData } : c));
    } catch(e) { console.error("Error updating coordinator: ", e); }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    const invRef = doc(db, 'invoices', invoiceId);
    try {
        await updateDoc(invRef, { status });
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv));
    } catch(e) { console.error("Error updating invoice: ", e); }
  };

  const updateDistributionStatus = async (distId: string, status: Distribution['status']) => {
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

  const NavItem = ({ to, icon, children }: { to: string, icon: React.ReactNode, children: React.ReactNode }) => (
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
              <NavItem to="/" icon={<DashboardIcon />} >Dashboard</NavItem>
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
              <Route path="/purchase-orders" element={<PurchaseOrdersPage purchaseOrders={purchaseOrders} addPurchaseOrder={addPurchaseOrder} updatePurchaseOrderStatus={updatePurchaseOrderStatus} allocationHistory={allocationHistory} coordinators={coordinators} allocateStockFromPO={allocateStockFromPO} />} />
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