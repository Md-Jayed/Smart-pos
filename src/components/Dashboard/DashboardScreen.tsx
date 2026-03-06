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
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.color} opacity-[0.03] rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110`} />
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                <card.icon className={card.color.replace('bg-', 'text-')} size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${card.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {card.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {card.trend}
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{card.label}</p>
            <h3 className="text-xl font-bold dark:text-white">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" />
              {t.recentSales}
            </h3>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              {t.viewAll}
            </button>
          </div>
          <div className="space-y-3">
            {recentSales.map((sale, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold dark:text-white">{sale.invoice_number}</p>
                    <p className="text-[10px] text-slate-500">{new Date(sale.date).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{sale.total.toFixed(2)}</p>
                  <p className="text-[9px] uppercase font-bold text-slate-400">{sale.payment_method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Low Stock */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base dark:text-white flex items-center gap-2">
              <Package size={18} className="text-amber-500" />
              {t.lowStock}
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-6 flex flex-col items-center justify-center text-center gap-3 opacity-50">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                <Package size={24} />
              </div>
              <p className="text-xs text-slate-500">
                {t.allStocked}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
