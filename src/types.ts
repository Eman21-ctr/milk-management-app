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

export interface User {
  uid: string;
  email: string;
  role: 'Admin' | 'User';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  batches: number;
  totalCartons: number;
  totalPrice: number;
  status: typeof POStatus[keyof typeof POStatus];
  remainingCartons: number;
  createdAt: string;
}

export interface SPPG {
  id: string;
  name: string;
  district: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
}

export interface Coordinator {
  id: string;
  name: string;
  region: string;
  contactPerson: string;
  contactPhone: string;
  sppgIds: string[];
  stock: number;
}

export interface Allocation {
    coordinatorId: string;
    cartons: number;
}

export interface Distribution {
  id: string;
  distributionDate: string;
  sppgId: string;
  coordinatorId: string;
  cartons: number;
  status: typeof DistributionStatus[keyof typeof DistributionStatus];
  suratJalanNumber: string;
  bastNumber: string;
  invoiceId?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  distributionId: string;
  sppgId: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: typeof InvoiceStatus[keyof typeof InvoiceStatus];
  createdAt: string;
}

export interface AllocationHistory {
    id: string;
    poId: string;
    coordinatorId: string;
    cartons: number;
    date: string;
}

export interface AllocationHistory {
    id: string;
    poId: string;
    coordinatorId: string;
    cartons: number;
    date: string;
}