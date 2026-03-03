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
  X
} from 'lucide-react';
import { Product, CartItem, Language, User } from '../../types';
import { TRANSLATIONS, VAT_RATE, CATEGORIES } from '../../constants';
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

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
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
  const vat = total - subtotal;

  const handleCheckout = async (method: 'cash' | 'card') => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          subtotal,
          vat,
          total,
          payment_method: method,
          cashier_id: 1 // Hardcoded for now
        })
      });
      
      const data = await res.json();
      setLastSale({ ...data, items: cart, subtotal, vat, total, payment_method: method, date: new Date().toISOString() });
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
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Left Side: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 gap-4">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder={t.searchProducts}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeScan}
            />
            <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                  ${selectedCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pr-2">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="group bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left flex flex-col h-full"
            >
              <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 mb-3 overflow-hidden relative">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                    <Package size={40} />
                  </div>
                )}
                {product.stock < 10 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    {product.stock} left
                  </div>
                )}
              </div>
              <h3 className="font-bold text-sm dark:text-white line-clamp-2 mb-1">{product.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{product.category}</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{product.price.toFixed(2)} SAR</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Plus size={18} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: Cart & Checkout */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-600" />
              <h2 className="font-bold dark:text-white">{t.cart}</h2>
            </div>
            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
                <ShoppingCart size={48} />
                <p>{t.emptyCart}</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold dark:text-white truncate">{item.name}</h4>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 text-xs bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none dark:text-slate-400"
                        value={item.price}
                        onChange={(e) => setItemPrice(item.id, parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-[10px] text-slate-500">SAR</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      className="text-sm font-bold w-10 text-center bg-transparent border-b border-slate-200 dark:border-slate-700 outline-none dark:text-white"
                      value={item.quantity}
                      onChange={(e) => setItemQuantity(item.id, parseInt(e.target.value) || 0)}
                    />
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Plus size={14} />
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>{t.subtotal}</span>
              <span>{subtotal.toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>{t.vat}</span>
              <span>{vat.toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between text-lg font-bold dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>{t.total}</span>
              <span className="text-indigo-600 dark:text-indigo-400">{total.toFixed(2)} SAR</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <button
              disabled={cart.length === 0 || isProcessing}
              onClick={() => handleCheckout('cash')}
              className="flex flex-col items-center gap-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
            >
              <Banknote size={20} />
              <span className="text-xs font-bold">{t.cash}</span>
            </button>
            <button
              disabled={cart.length === 0 || isProcessing}
              onClick={() => handleCheckout('card')}
              className="flex flex-col items-center gap-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <CreditCard size={20} />
              <span className="text-xs font-bold">{t.card}</span>
            </button>
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
