import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardScreen from './components/Dashboard/DashboardScreen';
import POSScreen from './components/POS/POSScreen';
import InventoryScreen from './components/Inventory/InventoryScreen';
import LoginScreen from './components/Auth/LoginScreen';
import { User, Language } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check local storage for session
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
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

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('pos_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
  };

  if (!isInitialized) return null;

  if (!user) {
    return <LoginScreen onLogin={handleLogin} language={language} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen language={language} />;
      case 'pos':
        return <POSScreen language={language} />;
      case 'inventory':
        return <InventoryScreen language={language} />;
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
