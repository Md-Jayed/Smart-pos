import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  Upload
} from 'lucide-react';
import { Product, Language, Category } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { storageService } from '../../services/storageService';

interface InventoryScreenProps {
  language: Language;
}

export default function InventoryScreen({ language }: InventoryScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = () => {
    const data = storageService.getProducts();
    setProducts(data);
  };

  const fetchCategories = () => {
    const data = storageService.getCategories();
    setCategories(data);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveProduct(editingProduct!);
    setIsModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDelete = (id: number) => {
    storageService.deleteProduct(id);
    setDeleteConfirmId(null);
    fetchProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku?.includes(searchQuery) || 
    p.barcode?.includes(searchQuery)
  );

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={t.searchProducts}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            const firstCategory = categories.length > 0 ? categories[0].name : 'Grocery';
            setEditingProduct({ name: '', price: 0, stock: 0, category: firstCategory });
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all"
        >
          <Plus size={20} />
          {t.addProduct}
        </button>
      </div>

      {/* Product Table */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="px-4 py-3 font-bold">{t.name}</th>
                <th className="px-4 py-3 font-bold">{t.category}</th>
                <th className="px-4 py-3 font-bold">{t.price}</th>
                <th className="px-4 py-3 font-bold">{t.stock}</th>
                <th className="px-4 py-3 font-bold">{t.sku}</th>
                <th className="px-4 py-3 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-2">
                    <div>
                      <p className="font-bold text-xs dark:text-white">{product.name}</p>
                      <p className="text-[10px] text-slate-500">{product.barcode || t.noBarcode}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-bold text-xs dark:text-white">
                    {product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-xs ${product.stock < 10 ? 'text-red-500' : 'dark:text-white'}`}>
                        {product.stock}
                      </span>
                      {product.stock < 10 && <AlertTriangle size={12} className="text-red-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-[10px] text-slate-500">
                    {product.sku || '-'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">{t.deleteProductConfirm}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{t.deleteProductDesc}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-3 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl font-bold"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold dark:text-white">
                {editingProduct?.id ? t.editProduct : t.addProduct}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X size={20} className="dark:text-white" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.name}</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.category}</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={editingProduct?.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{isRTL ? cat.nameAr : cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.price} (Incl. VAT)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                    value={editingProduct?.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.stock}</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                    value={editingProduct?.stock || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, stock: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.sku}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                    value={editingProduct?.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.barcode}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                    value={editingProduct?.barcode || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct!, barcode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
