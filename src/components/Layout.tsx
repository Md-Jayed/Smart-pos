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
  X
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
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard, roles: ['admin', 'cashier'] },
    { id: 'pos', icon: ShoppingCart, label: t.pos, roles: ['admin', 'cashier'] },
    { id: 'inventory', icon: Package, label: t.inventory, roles: ['admin'] },
    { id: 'reports', icon: BarChart3, label: t.reports, roles: ['admin'] },
    { id: 'settings', icon: Settings, label: t.settings, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''} ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside 
        className={`bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 transition-all duration-300 z-30 fixed lg:relative h-full
          ${isSidebarOpen ? 'w-64' : 'w-20'} ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'lg:hidden'}`}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="font-bold text-xl whitespace-nowrap dark:text-white">SmartPOS</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <item.icon size={22} className={`${activeTab === item.id ? 'text-white' : 'group-hover:text-indigo-600'}`} />
              <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${!isSidebarOpen && 'lg:opacity-0'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            <LogOut size={22} />
            <span className={`font-medium whitespace-nowrap ${!isSidebarOpen && 'lg:opacity-0'}`}>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu size={20} className="dark:text-white" />
            </button>
            <h1 className="text-xl font-bold dark:text-white capitalize">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 text-slate-600 dark:text-slate-400"
            >
              <Languages size={20} />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50 dark:bg-slate-950">
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
