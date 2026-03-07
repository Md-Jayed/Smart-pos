import React, { useState, useEffect } from 'react';
import { Language, Sale } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { BarChart3, FileText, TrendingUp, Download, Calendar, Trash2, List } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { storageService } from '../../services/storageService';
import { motion, AnimatePresence } from 'motion/react';

interface ReportsScreenProps {
  language: Language;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function ReportsScreen({ language }: ReportsScreenProps) {
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';
  const [period, setPeriod] = useState<Period>('weekly');
  const [chartData, setChartData] = useState<{ name: string, sales: number }[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, netProfit: 0, totalTransactions: 0 });
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = () => {
    const data = storageService.getSalesChartData(period);
    setChartData(data);
    
    const sales = storageService.getSales();
    setAllSales(sales);
    
    // Simple profit calculation (revenue - cost)
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalCost = sales.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => {
        const product = storageService.getProducts().find(p => p.id === item.id);
        return itemSum + (product?.cost_price || 0) * item.quantity;
      }, 0);
    }, 0);

    setStats({
      totalRevenue,
      netProfit: totalRevenue - totalCost,
      totalTransactions: sales.length
    });
  };

  const handleClearReports = () => {
    storageService.clearSales();
    fetchData();
    setShowClearConfirm(false);
  };

  const exportToCSV = () => {
    const headers = ["Invoice", "Date", "Items Count", "Total Amount", "Payment Method"];
    const rows = allSales.map(sale => [
      sale.invoice_number,
      new Date(sale.date).toLocaleString(),
      sale.items.length,
      sale.total.toFixed(2),
      sale.payment_method
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const periods: { value: Period, label: string }[] = [
    { value: 'daily', label: t.daily },
    { value: 'weekly', label: t.weekly },
    { value: 'monthly', label: t.monthly },
    { value: 'yearly', label: t.yearly },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = allSales.filter(s => s.date.startsWith(todayStr));

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">{t.reports}</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-bold shadow-sm hover:bg-red-100 transition-all"
          >
            <Trash2 size={18} />
            {t.clearReports}
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold dark:text-white shadow-sm hover:bg-slate-50 transition-all"
          >
            <Download size={18} />
            {t.exportSales}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
            {t.totalRevenue}
          </h3>
          <p className="text-2xl font-black dark:text-white">{stats.totalRevenue.toFixed(2)} SAR</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 size={24} />
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
            {t.netProfit}
          </h3>
          <p className="text-2xl font-black dark:text-white text-emerald-500">{stats.netProfit.toFixed(2)} SAR</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
            {t.totalTransactions}
          </h3>
          <p className="text-2xl font-black dark:text-white">{stats.totalTransactions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold dark:text-white">
                {t.salesAnalysis}
              </h2>
            </div>
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    period === p.value 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  radius={[6, 6, 0, 0]}
                  barSize={30}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.sales > 0 ? '#4f46e5' : '#e2e8f0'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Sales List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col p-6">
          <div className="flex items-center gap-2 mb-6">
            <List size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold dark:text-white">
              {t.dailySalesList}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2 custom-scrollbar">
            {todaySales.length > 0 ? (
              todaySales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold dark:text-white">{sale.invoice_number}</p>
                    <p className="text-[10px] text-slate-500">{new Date(sale.date).toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{sale.total.toFixed(2)} SAR</p>
                    <p className="text-[9px] uppercase font-bold text-slate-400">{sale.payment_method}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 py-10">
                <FileText size={48} className="mb-2" />
                <p className="text-xs font-bold">{isRTL ? 'لا توجد مبيعات اليوم' : 'No sales today'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-center dark:text-white mb-2">{t.clearReports}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8">
                {t.clearReportsConfirm}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handleClearReports}
                  className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                >
                  {t.clearReports}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
