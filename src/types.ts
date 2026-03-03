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
  quantity: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  date: string;
  subtotal: number;
  vat: number;
  total: number;
  payment_method: 'cash' | 'card';
  cashier_id: number;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  todaySales: number;
  totalOrders: number;
  lowStock: number;
}

export type Language = 'en' | 'ar';
