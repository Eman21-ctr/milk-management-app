export const MINIMUM_ORDER_CARTONS = 2130;
export const PRICE_PER_BATCH = 191700000;
export const PRICE_PER_CARTON = PRICE_PER_BATCH / MINIMUM_ORDER_CARTONS;
export const SUPPLIER_NAME = 'PT MESA MITRA SOLUSINDO';
export const COMPANY_NAME = 'KDMP Penfui Timur';

// New constants for clarity in selling price calculation
export const PRICE_PER_BOTTLE = 2800;
export const BOTTLES_PER_CARTON = 36;
export const SELLING_PRICE_PER_CARTON = PRICE_PER_BOTTLE * BOTTLES_PER_CARTON; // Equals 100,800