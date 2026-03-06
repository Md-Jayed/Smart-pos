import React, { useState, useEffect } from 'react';
import { Save, Store, Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { Language, Category } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { storageService } from '../../services/storageService';

interface SettingsScreenProps {
  language: Language;
}

export default function SettingsScreen({ language }: SettingsScreenProps) {
  const [storeInfo, setStoreInfo] = useState(storageService.getStoreInfo());
  const [categories, setCategories] = useState<Category[]>(storageService.getCategories());
  const [isSaved, setIsSaved] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    storageService.saveStoreInfo(storeInfo);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && editingCategory.name && editingCategory.nameAr) {
      storageService.saveCategory(editingCategory);
      setCategories(storageService.getCategories());
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm(t.deleteCategoryConfirm)) {
      storageService.deleteCategory(id);
      setCategories(storageService.getCategories());
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 max-w-4xl mx-auto w-full pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">{t.storeSettings}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your shop details and invoice header</p>
          </div>
        </div>

        <button
          onClick={() => handleSave()}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all"
        >
          <Save size={18} />
          {t.save}
        </button>
      </div>

      <div className="space-y-8">
        {/* Store Info Form */}
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* English Details */}
              <div className="space-y-6">
                <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">English Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.shopNameEn}</label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                      value={storeInfo.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.addressEn}</label>
                    <input
                      type="text"
                      name="address"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                      value={storeInfo.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.thankYouEn}</label>
                    <input
                      type="text"
                      name="thankYou"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                      value={storeInfo.thankYou}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Arabic Details */}
              <div className="space-y-6" dir="rtl">
                <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">التفاصيل العربية</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.shopNameAr}</label>
                    <input
                      type="text"
                      name="nameAr"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                      value={storeInfo.nameAr}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.addressAr}</label>
                    <input
                      type="text"
                      name="addressAr"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                      value={storeInfo.addressAr}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.thankYouAr}</label>
                    <input
                      type="text"
                      name="thankYouAr"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                      value={storeInfo.thankYouAr}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Branding Details */}
            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white pb-2">{t.brandingInfo}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.logoText}</label>
                  <input
                    type="text"
                    name="logoText"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                    value={storeInfo.logoText || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.logoUrl}</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      name="logoUrl"
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                      value={storeInfo.logoUrl || ''}
                      onChange={handleChange}
                    />
                    {storeInfo.logoUrl && (
                      <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white flex items-center justify-center">
                        <img src={storeInfo.logoUrl} alt={t.logoPreview} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.crNumber}</label>
                  <input
                    type="text"
                    name="crNumber"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                    value={storeInfo.crNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.vatNumber}</label>
                  <input
                    type="text"
                    name="vatNumber"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                    value={storeInfo.vatNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.phone}</label>
                  <input
                    type="text"
                    name="phone"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
                    value={storeInfo.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSaved && (
              <span className="text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                <Save size={16} />
                {t.settingsSaved}
              </span>
            )}
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all"
            >
              <Save size={20} />
              {t.save}
            </button>
          </div>
        </form>

        {/* Category Management Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t.manageCategories}</h3>
              </div>
              <button
                onClick={() => setEditingCategory({ name: '', nameAr: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all"
              >
                <Plus size={16} />
                {t.addCategory}
              </button>
            </div>

            {editingCategory && (
              <form onSubmit={handleSaveCategory} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {editingCategory.id ? t.editCategory : t.addCategory}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.categoryNameEn}</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      value={editingCategory.name || ''}
                      onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2" dir="rtl">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.categoryNameAr}</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      value={editingCategory.nameAr || ''}
                      onChange={e => setEditingCategory({ ...editingCategory, nameAr: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{category.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400" dir="rtl">{category.nameAr}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
