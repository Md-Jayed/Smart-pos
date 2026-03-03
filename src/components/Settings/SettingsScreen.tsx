import React, { useState, useEffect } from 'react';
import { Save, Store } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { storageService } from '../../services/storageService';

interface SettingsScreenProps {
  language: Language;
}

export default function SettingsScreen({ language }: SettingsScreenProps) {
  const [storeInfo, setStoreInfo] = useState(storageService.getStoreInfo());
  const [isSaved, setIsSaved] = useState(false);
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveStoreInfo(storeInfo);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-4xl mx-auto w-full">
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
      </div>

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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={storeInfo.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.addressEn}</label>
                  <input
                    type="text"
                    name="address"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={storeInfo.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.thankYouEn}</label>
                  <input
                    type="text"
                    name="thankYou"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={storeInfo.nameAr}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.addressAr}</label>
                  <input
                    type="text"
                    name="addressAr"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={storeInfo.addressAr}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.thankYouAr}</label>
                  <input
                    type="text"
                    name="thankYouAr"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={storeInfo.thankYouAr}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Common Details */}
          <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white pb-2">Common Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.crNumber}</label>
                <input
                  type="text"
                  name="crNumber"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  value={storeInfo.crNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.vatNumber}</label>
                <input
                  type="text"
                  name="vatNumber"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  value={storeInfo.vatNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.phone}</label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
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
                Settings saved successfully!
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
    </div>
  );
}
