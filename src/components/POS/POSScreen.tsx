import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Printer,
  Barcode,
  ShoppingCart,
  Package,
  X,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'motion/react';
import { Product, CartItem, Language, User } from '../../types';
import { TRANSLATIONS, VAT_RATE, CATEGORIES } from '../../constants';
import { storageService } from '../../services/storageService';
import Receipt from '../Receipt/Receipt';

interface POSScreenProps {
  language: Language;
}

export default function POSScreen({ language }: POSScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    barcodeInputRef.current?.focus();
  }, []);

  const fetchProducts = () => {
    const data = storageService.getProducts();
    setProducts(data);
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(t.lowStockAlert);
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const setItemQuantity = (id: number, qty: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, qty) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const setItemPrice = (id: number, price: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, price: Math.max(0, price) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotal = total / (1 + VAT_RATE);
  const tax = total - subtotal;
  const vat = total - subtotal;

  const handleCheckout = (method: 'cash' | 'card') => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      const sale = storageService.createSale({
        items: cart,
        subtotal,
        vat,
        total,
        payment_method: method,
        cashier_id: 1
      });
      
      setLastSale({ ...sale, items: cart, subtotal, vat, total, payment_method: method });
      setCart([]);
      setShowReceipt(true);
      fetchProducts(); // Refresh stock
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.barcode?.includes(searchQuery) || 
                         p.sku?.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBarcodeScan = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const product = products.find(p => p.barcode === searchQuery);
      if (product) {
        addToCart(product);
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Left Side: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 gap-4">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2
                ${selectedCategory === cat 
                  ? 'border-orange-500 text-orange-600 bg-orange-50/50' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 pr-2">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="group bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all text-center flex flex-col items-center gap-3"
            >
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner border-4 border-white dark:border-slate-700">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Package size={32} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm dark:text-white line-clamp-2 mb-1">{product.name}</h3>
                <span className="text-slate-900 dark:text-white font-black text-base">${product.price.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: Cart & Checkout */}
      <div className="w-full md:w-[400px] flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700">
              <Plus size={18} />
              Add Customer
            </button>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700">
                <Plus size={18} />
              </button>
              <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700">
                <LayoutDashboard size={18} />
              </button>
              <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700">
                <motion.div whileTap={{ rotate: 180 }}>
                  <Plus size={18} className="rotate-45" />
                </motion.div>
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                <ShoppingCart size={64} />
                <p className="font-bold">{t.emptyCart}</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={item.id} className="space-y-3">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-bold text-sm">{index + 1}</span>
                      <h4 className="text-sm font-bold dark:text-white">{item.name}</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Expandable details for the last added item */}
                  {index === cart.length - 1 && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Quantity</label>
                          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><Minus size={14}/></button>
                            <input 
                              type="number" 
                              className="w-full text-center font-bold text-sm bg-transparent outline-none dark:text-white" 
                              value={item.quantity}
                              onChange={(e) => setItemQuantity(item.id, parseInt(e.target.value) || 0)}
                            />
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><Plus size={14}/></button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Discount(%)</label>
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2">
                            <input type="number" className="w-full text-right font-bold text-sm bg-transparent outline-none dark:text-white" defaultValue={0} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="font-bold dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Tax</span>
              <span className="font-bold dark:text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-black dark:text-white">Payable Amount</span>
              <span className="font-black text-orange-600 dark:text-orange-400">${total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button className="flex items-center justify-center gap-2 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 transition-all">
                <motion.div whileTap={{ scale: 0.9 }}>Hold Order</motion.div>
              </button>
              <button 
                onClick={() => handleCheckout('cash')}
                disabled={cart.length === 0 || isProcessing}
                className="flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all"
              >
                <motion.div whileTap={{ scale: 0.9 }}>Proceed</motion.div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold dark:text-white">{t.paymentSuccess}</h3>
              <button onClick={() => setShowReceipt(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X size={20} className="dark:text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Receipt sale={lastSale} language={language} />
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold"
              >
                <Printer size={20} />
                {t.print}
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="py-3 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl font-bold"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Area using Portal */}
      {lastSale && createPortal(
        <Receipt sale={lastSale} language={language} />,
        document.getElementById('print-portal')!
      )}
    </div>
  );
}
