import { Product, Sale, DashboardStats } from '../types';
import { VAT_RATE } from '../constants';

const PRODUCTS_KEY = 'smartpos_products';
const SALES_KEY = 'smartpos_sales';
const STORE_INFO_KEY = 'smartpos_store_info';

const DEFAULT_STORE_INFO = {
  name: "SmartPOS Retail",
  nameAr: "سمارت بوس للتجزئة",
  crNumber: "1234567890",
  vatNumber: "300012345600003",
  address: "Riyadh, Saudi Arabia",
  addressAr: "الرياض، المملكة العربية السعودية",
  phone: "+966 50 000 0000",
  thankYou: "Thank you for shopping with us!",
  thankYouAr: "شكراً لتسوقكم معنا!",
};

const SEED_PRODUCTS: Product[] = [
  { id: 1, name: "Fresh Milk 1L", sku: "MILK-001", barcode: "6281234567890", category: "Grocery", price: 6.50, cost_price: 4.50, stock: 50, image_url: "https://picsum.photos/seed/milk/400/400" },
  { id: 2, name: "Arabic Coffee 500g", sku: "COFFEE-001", barcode: "6289876543210", category: "Beverages", price: 45.00, cost_price: 30.00, stock: 20, image_url: "https://picsum.photos/seed/coffee/400/400" },
  { id: 3, name: "Dates (Khalas) 1kg", sku: "DATES-001", barcode: "6285554443332", category: "Snacks", price: 25.00, cost_price: 15.00, stock: 100, image_url: "https://picsum.photos/seed/dates/400/400" },
  { id: 4, name: "Mineral Water 330ml", sku: "WATER-001", barcode: "6281112223334", category: "Beverages", price: 1.00, cost_price: 0.50, stock: 200, image_url: "https://picsum.photos/seed/water/400/400" },
  { id: 5, name: "Basmati Rice 5kg", sku: "RICE-001", barcode: "6287778889990", category: "Grocery", price: 55.00, cost_price: 40.00, stock: 15, image_url: "https://picsum.photos/seed/rice/400/400" }
];

export const storageService = {
  init: () => {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(SALES_KEY)) {
      localStorage.setItem(SALES_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORE_INFO_KEY)) {
      localStorage.setItem(STORE_INFO_KEY, JSON.stringify(DEFAULT_STORE_INFO));
    }
  },

  // Store Info
  getStoreInfo: () => {
    const data = localStorage.getItem(STORE_INFO_KEY);
    return data ? JSON.parse(data) : DEFAULT_STORE_INFO;
  },

  saveStoreInfo: (info: any) => {
    localStorage.setItem(STORE_INFO_KEY, JSON.stringify(info));
  },

  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveProduct: (product: Partial<Product>): Product => {
    const products = storageService.getProducts();
    let newProduct: Product;

    if (product.id) {
      const index = products.findIndex(p => p.id === product.id);
      newProduct = { ...products[index], ...product } as Product;
      products[index] = newProduct;
    } else {
      newProduct = {
        ...product,
        id: Date.now(),
        stock: product.stock || 0,
        price: product.price || 0,
      } as Product;
      products.push(newProduct);
    }

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return newProduct;
  },

  deleteProduct: (id: number) => {
    const products = storageService.getProducts().filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  // Sales
  getSales: (): Sale[] => {
    const data = localStorage.getItem(SALES_KEY);
    return data ? JSON.parse(data) : [];
  },

  createSale: (saleData: any): Sale => {
    const sales = storageService.getSales();
    const products = storageService.getProducts();

    const newSale: Sale = {
      id: Date.now(),
      invoice_number: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      ...saleData
    };

    // Update stock
    const updatedProducts = products.map(p => {
      const cartItem = saleData.items.find((item: any) => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });

    sales.unshift(newSale);
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));

    return newSale;
  },

  // Stats
  getStats: (): DashboardStats => {
    const products = storageService.getProducts();
    const sales = storageService.getSales();
    const today = new Date().toISOString().split('T')[0];

    const todaySales = sales
      .filter(s => s.date.startsWith(today))
      .reduce((sum, s) => sum + s.total, 0);

    const totalOrders = sales.filter(s => s.date.startsWith(today)).length;
    const lowStock = products.filter(p => p.stock < 10).length;

    return { todaySales, totalOrders, lowStock };
  }
};
