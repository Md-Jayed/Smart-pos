import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Languages,
  Menu,
  X,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Layout({ 
  children, 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab,
  language,
  setLanguage,
  darkMode,
  setDarkMode
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  const menuItems = [
    { id: 'pos', icon: LayoutDashboard, label: t.dashboard, roles: ['admin', 'cashier'] },
    { id: 'inventory', icon: Package, label: t.inventory, roles: ['admin'] },
    { id: 'reports', icon: BarChart3, label: t.reports, roles: ['admin'] },
    { id: 'settings', icon: Settings, label: t.settings, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className={`min-h-screen flex bg-slate-50 ${darkMode ? 'dark' : ''} ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside 
        className={`bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 transition-all duration-300 z-30 fixed md:relative h-full w-20 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">R</div>
        </div>

        <nav className="flex-1 p-2 space-y-4 mt-4">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex flex-col items-center justify-center gap-2 py-4 px-1 rounded-xl transition-all duration-200 group
                ${activeTab === item.id 
                  ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <item.icon size={24} className={`${activeTab === item.id ? 'text-orange-600' : 'group-hover:text-orange-500'}`} />
              <span className="text-[9px] font-bold uppercase tracking-tighter text-center leading-none">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex flex-col items-center justify-center gap-2 py-4 px-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            <LogOut size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter text-center leading-none">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-black dark:text-white tracking-tight">
              Restro <span className="text-orange-500">POS</span>
            </h1>
            
            <div className="relative max-w-md w-full hidden md:block ml-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
                <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                  <LayoutDashboard size={20} />
                </motion.div>
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
                <Sun size={20} />
              </button>
            </div>
            
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 transition-all">
              Select Table
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=f97316&color=fff`} alt={user.name} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
