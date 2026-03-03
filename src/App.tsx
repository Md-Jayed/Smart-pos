import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardScreen from './components/Dashboard/DashboardScreen';
import POSScreen from './components/POS/POSScreen';
import InventoryScreen from './components/Inventory/InventoryScreen';
import SettingsScreen from './components/Settings/SettingsScreen';
import { User, Language } from './types';
import { storageService } from './services/storageService';

const DEFAULT_USER: User = {
  id: 1,
  name: 'Admin',
  email: 'admin@smartpos.com',
  role: 'admin'
};

export default function App() {
  const [user] = useState<User>(DEFAULT_USER);
  const [activeTab, setActiveTab] = useState('pos');
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    storageService.init();
    
    const savedLang = localStorage.getItem('pos_lang') as Language;
    if (savedLang) setLanguage(savedLang);
    
    const savedDark = localStorage.getItem('pos_dark') === 'true';
    setDarkMode(savedDark);
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pos_lang', language);
      localStorage.setItem('pos_dark', darkMode.toString());
    }
  }, [language, darkMode, isInitialized]);

  const handleLogout = () => {
    // Since login is removed, logout just refreshes or does nothing
    window.location.reload();
  };

  if (!isInitialized) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen language={language} />;
      case 'pos':
        return <POSScreen language={language} />;
      case 'inventory':
        return <InventoryScreen language={language} />;
      case 'settings':
        return <SettingsScreen language={language} />;
      default:
        return <DashboardScreen language={language} />;
    }
  };

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      language={language}
      setLanguage={setLanguage}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      {renderContent()}
    </Layout>
  );
}
