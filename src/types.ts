export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
  image_url: string;
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
}

export interface StoreInfo {
  name: string;
  nameAr: string;
  crNumber: string;
  vatNumber: string;
  address: string;
  addressAr: string;
  phone: string;
  thankYou: string;
  thankYouAr: string;
  logoUrl?: string;
  logoText?: string;
}

export interface Sale {
  id: number;
  invoice_number: string;
  date: string;
  subtotal: number;
  vat: number;
  total: number;
  payment_method: 'cash' | 'card' | 'split';
  cash_amount?: number;
  card_amount?: number;
  cashier_id: number;
  items: CartItem[];
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  price: number;
  discount_amount?: number;
}

export interface DashboardStats {
  todaySales: number;
  totalOrders: number;
  lowStock: number;
}

export type Language = 'en' | 'ar';
