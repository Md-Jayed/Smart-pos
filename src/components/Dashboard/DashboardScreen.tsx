import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Package,
  CheckCircle2
} from 'lucide-react';
import { DashboardStats, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { storageService } from '../../services/storageService';
import { motion } from 'motion/react';

interface DashboardScreenProps {
  language: Language;
}

export default function DashboardScreen({ language }: DashboardScreenProps) {
  const [stats, setStats] = useState<DashboardStats>({ todaySales: 0, totalOrders: 0, lowStock: 0 });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setStats(storageService.getStats());
    setRecentSales(storageService.getSales().slice(0, 5));
  };

  const statCards = [
    { 
      label: t.todaySales, 
      value: `${stats.todaySales.toFixed(2)} SAR`, 
      icon: TrendingUp, 
      color: 'bg-emerald-500',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: t.totalOrders, 
      value: stats.totalOrders.toString(), 
      icon: ShoppingBag, 
      color: 'bg-indigo-500',
      trend: '+5.2%',
      trendUp: true
    },
    { 
      label: t.lowStock, 
      value: stats.lowStock.toString(), 
      icon: AlertCircle, 
      color: 'bg-amber-500',
      trend: '-2',
      trendUp: false
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.color} opacity-[0.03] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} bg-opacity-10 rounded-2xl flex items-center justify-center`}>
                <card.icon className={card.color.replace('bg-', 'text-')} size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
            <h3 className="text-2xl font-bold dark:text-white">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              {isRTL ? 'المبيعات الأخيرة' : 'Recent Sales'}
            </h3>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
              {isRTL ? 'عرض الكل' : 'View All'}
            </button>
          </div>
          <div className="space-y-4">
            {recentSales.map((sale, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-white">{sale.invoice_number}</p>
                    <p className="text-xs text-slate-500">{new Date(sale.date).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{sale.total.toFixed(2)} SAR</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{sale.payment_method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Low Stock */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
              <Package size={20} className="text-amber-500" />
              {t.lowStock}
            </h3>
          </div>
          <div className="space-y-4">
            {/* This would be a real list in a full app */}
            <div className="p-8 flex flex-col items-center justify-center text-center gap-4 opacity-50">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                <Package size={32} />
              </div>
              <p className="text-sm text-slate-500">
                {isRTL ? 'جميع المنتجات متوفرة بشكل جيد' : 'All products are well stocked'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
