import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import TrendDetails from './pages/TrendDetails';
import MarketNews from './pages/MarketNews';
import Comparisons from './pages/Comparisons';
import Settings from './pages/Settings';
import History from './pages/History';

import DatasetUpload from './components/dashboard/DatasetUpload';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { getAuthToken } from './utils/api';
import { AlertCircle, X } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Last 90 Days');
  const [refreshKey, setRefreshKey] = useState(0);
  const [apiErrorMsg, setApiErrorMsg] = useState(null);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse user from local storage");
        }
    }

    const handleAuthExpired = () => {
        setUser(null);
    };

    const handleUserUpdated = () => {
        const updated = localStorage.getItem('user');
        if (updated) setUser(JSON.parse(updated));
    };

    const handleApiKeyError = (e) => {
        setApiErrorMsg(e.detail || "API Key Error: Please check your Groq API Key.");
        setCurrentView('settings');
        // Auto-hide after 8 seconds
        setTimeout(() => setApiErrorMsg(null), 8000);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    window.addEventListener('user-updated', handleUserUpdated);
    window.addEventListener('api-key-error', handleApiKeyError);
    return () => {
        window.removeEventListener('auth-expired', handleAuthExpired);
        window.removeEventListener('user-updated', handleUserUpdated);
        window.removeEventListener('api-key-error', handleApiKeyError);
    };
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setCurrentView('dashboard');
  };

  if (!user) {
      if (authView === 'login') {
          return <Login onLogin={setUser} onGoToRegister={() => setAuthView('register')} />;
      }
      return <Register onRegister={setUser} onGoToLogin={() => setAuthView('login')} />;
  }

  const goToUpload = () => setCurrentView('upload');
  
  const goToDetails = (techName) => {
    setSelectedTech(typeof techName === 'string' ? techName : null);
    setCurrentView('details');
  };

  const handleUploadSuccess = () => {
    setRefreshKey(k => k + 1);
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard selectedFilter={selectedFilter} key={refreshKey} onViewDetails={goToDetails} onUploadClick={goToUpload} onRefresh={() => setRefreshKey(k => k + 1)} />;
      case 'details':
        return <TrendDetails selectedFilter={selectedFilter} techName={selectedTech} onBack={() => setCurrentView('dashboard')} onUploadClick={goToUpload} />;
      case 'market_news':
        return <MarketNews onBack={() => setCurrentView('dashboard')} />;
      case 'comparisons':
        return <Comparisons onBack={() => setCurrentView('dashboard')} />;
      case 'upload':
        return <DatasetUpload onBack={() => setCurrentView('dashboard')} onUploadSuccess={handleUploadSuccess} />;
      case 'settings':
        return <Settings onBack={() => setCurrentView('dashboard')} />;
      case 'history':
        return <History onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard key={refreshKey} onViewDetails={goToDetails} onUploadClick={goToUpload} onRefresh={() => setRefreshKey(k => k + 1)} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-display antialiased selection:bg-primary selection:text-white relative">
      {apiErrorMsg && (
        <div className="fixed top-6 right-6 z-50 bg-red-500/10 border border-red-500/50 text-red-400 p-4 pr-12 rounded-xl shadow-2xl flex flex-col gap-1 max-w-md animate-in slide-in-from-top-4 fade-in duration-300 backdrop-blur-md">
            <div className="flex items-center gap-2 font-bold text-red-400/90">
                <AlertCircle className="size-5" />
                <span>API Connection Failed</span>
            </div>
            <p className="text-sm text-red-400/80 leading-relaxed">{apiErrorMsg}</p>
            <button onClick={() => setApiErrorMsg(null)} className="absolute top-3 right-3 p-1 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
               <X className="size-4" />
            </button>
        </div>
      )}
      <Sidebar user={user} currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {currentView === 'dashboard' && <Header onUploadClick={goToUpload} onReset={() => setRefreshKey(k => k + 1)} selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
