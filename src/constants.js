// Original constants
export const MINIMUM_ORDER_CARTONS = 2233;
export const PRICE_PER_BATCH = 200970000;
export const PRICE_PER_CARTON = PRICE_PER_BATCH / MINIMUM_ORDER_CARTONS;
export const SUPPLIER_NAME = 'PT MESA MITRA SOLUSINDO';
export const COMPANY_NAME = 'KDMP Penfui Timur';

// New constants for clarity in selling price calculation
export const PRICE_PER_BOTTLE = 3000;
export const BOTTLES_PER_CARTON = 36;
export const SELLING_PRICE_PER_CARTON = PRICE_PER_BOTTLE * BOTTLES_PER_CARTON; // Equals 108,000

// Status constants (converted from TypeScript interfaces)
export const POStatus = Object.freeze({
  DRAFT: 'Draft',
  SENT: 'Terkirim',
  RECEIVED: 'Diterima',
});

export const DistributionStatus = Object.freeze({
  PENDING: 'Menunggu Pengiriman',
  IN_TRANSIT: 'Dalam Perjalanan',
  DELIVERED: 'Terkirim',
});

export const InvoiceStatus = Object.freeze({
  UNPAID: 'Belum Dibayar',
  PAID: 'Lunas',
  OVERDUE: 'Jatuh Tempo',
});

// Default templates for data validation (optional)
export const defaultPurchaseOrder = {
  id: '',
  poNumber: '',
  supplier: '',
  orderDate: '',
  batches: 0,
  totalCartons: 0,
  totalPrice: 0,
  status: POStatus.DRAFT,
  remainingCartons: 0,
  createdAt: ''
};

export const defaultCoordinator = {
  id: '',
  name: '',
  region: '',
  contactPerson: '',
  contactPhone: '',
  sppgIds: [],
  stock: 0
};

export const defaultDistribution = {
  id: '',
  distributionDate: '',
  sppgId: '',
  coordinatorId: '',
  cartons: 0,
  status: DistributionStatus.PENDING,
  suratJalanNumber: '',
  bastNumber: '',
  invoiceId: '',
  createdAt: ''
};

export const defaultInvoice = {
  id: '',
  invoiceNumber: '',
  distributionId: '',
  sppgId: '',
  issueDate: '',
  dueDate: '',
  amount: 0,
  status: InvoiceStatus.UNPAID,
  createdAt: ''
};

export const defaultAllocationHistory = {
  id: '',
  poId: '',
  coordinatorId: '',
  cartons: 0,
  date: ''
};