import React from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { BarChart3, FileText, TrendingUp, Download } from 'lucide-react';

interface ReportsScreenProps {
  language: Language;
}

export default function ReportsScreen({ language }: ReportsScreenProps) {
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">{t.reports}</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold dark:text-white shadow-sm hover:bg-slate-50 transition-all">
          <Download size={18} />
          {isRTL ? 'تصدير التقرير' : 'Export Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
            {isRTL ? 'إجمالي المبيعات' : 'Total Revenue'}
          </h3>
          <p className="text-2xl font-black dark:text-white">$12,450.00</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 size={24} />
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
            {isRTL ? 'صافي الربح' : 'Net Profit'}
          </h3>
          <p className="text-2xl font-black dark:text-white">$4,280.00</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
            {isRTL ? 'عدد المعاملات' : 'Total Transactions'}
          </h3>
          <p className="text-2xl font-black dark:text-white">156</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
        <BarChart3 size={64} />
        <p className="font-bold">
          {isRTL ? 'الرسوم البيانية للتقارير ستظهر هنا' : 'Report charts will appear here'}
        </p>
      </div>
    </div>
  );
}
