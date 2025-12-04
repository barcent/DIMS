
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, View, DirectoryUser } from './types';
import { VIEWS, MOCK_USER, MOCK_DIRECTORY_USERS } from './constants';
import { DashboardIcon, DirectoryIcon, DocsIcon, MemosIcon, TicketIcon, MenuIcon, CloseIcon } from './components/icons';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import Documents from './components/Documents';
import Circulars from './components/Circulars';
import Tickets from './components/Tickets';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginPage, setShowLoginPage] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [currentView, setCurrentView] = useState<View>(VIEWS.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>(MOCK_DIRECTORY_USERS);
  
  // Profile Dropdown State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    if(window.innerWidth < 768) { // md breakpoint
        setSidebarOpen(false);
    }
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowLoginPage(false);
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
      setShowLoginPage(false); // Reset to landing page
      setCurrentView(VIEWS.DASHBOARD);
      setIsProfileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // DCN Principle Simulation: Presence/Online Indicators
  const simulatePresenceUpdates = useCallback(() => {
    setDirectoryUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === currentUser.id
          ? user
          : { ...user, isOnline: Math.random() > 0.3 } // More likely to be online
      )
    );
  }, [currentUser.id]);

  useEffect(() => {
    const presenceInterval = setInterval(simulatePresenceUpdates, 5000); // Update presence every 5 seconds
    return () => clearInterval(presenceInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigationItems = [
    { view: VIEWS.DASHBOARD, label: 'Dashboard', icon: <DashboardIcon /> },
    { view: VIEWS.DIRECTORY, label: 'Directory', icon: <DirectoryIcon /> },
    { view: VIEWS.DOCUMENTS, label: 'Documents', icon: <DocsIcon /> },
    { view: VIEWS.CIRCULARS, label: 'Communications', icon: <MemosIcon /> },
    { view: VIEWS.TICKETS, label: 'Tickets', icon: <TicketIcon /> },
  ];

  const renderView = () => {
    switch (currentView) {
      case VIEWS.DASHBOARD:
        return <Dashboard currentUser={currentUser} />;
      case VIEWS.DIRECTORY:
        return <Directory users={directoryUsers} />;
      case VIEWS.DOCUMENTS:
        return <Documents currentUser={currentUser} />;
      case VIEWS.CIRCULARS:
        return <Circulars currentUser={currentUser} />;
      case VIEWS.TICKETS:
        return <Tickets currentUser={currentUser} />;
      default:
        return <Dashboard currentUser={currentUser} />;
    }
  };

  const Sidebar = () => (
    <aside className={`bg-gradient-to-b from-brand-secondary to-[#052e16] text-white w-64 fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-out z-30 flex flex-col shadow-2xl`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-brand-accent font-bold border border-white/20">D</div>
                 <h1 className="text-xl font-bold tracking-wide">DIMS</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-300 hover:text-white transition-colors">
              <CloseIcon />
            </button>
        </div>
        <nav className="flex-grow p-4 space-y-1">
            <ul>
                {navigationItems.map(item => (
                    <li key={item.view}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleViewChange(item.view); }}
                            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                                currentView === item.view 
                                ? 'bg-gradient-to-r from-brand-primary to-brand-primary-light text-white shadow-lg shadow-brand-primary/30' 
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <span className={`mr-3 transition-colors ${currentView === item.view ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
        <div className="p-4 bg-black/20 text-xs text-gray-400">
            <p>DCN Simulation v1.0</p>
            <p className="mt-1">Connected: <span className="text-green-400 font-bold">Secure</span></p>
        </div>
    </aside>
  );

  if (!isLoggedIn) {
      if (showLoginPage) {
          return <LoginPage onLogin={handleLogin} onBack={() => setShowLoginPage(false)} />;
      }
      return <LandingPage onLogin={() => setShowLoginPage(true)} />;
  }

  return (
    <div className="flex h-screen bg-brand-light font-sans text-brand-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
            <div className="px-6 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 md:hidden mr-4 hover:text-brand-primary transition-colors">
                        <MenuIcon />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{currentView}</h2>
                </div>
                <div className="flex items-center">
                    <div className="relative group cursor-pointer">
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                        <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                    </div>
                    
                    {/* Profile Dropdown */}
                    <div className="relative ml-4" ref={profileMenuRef}>
                        <button 
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center focus:outline-none hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                        >
                            <img src={currentUser.avatar} alt="User Avatar" className="w-9 h-9 rounded-full border-2 border-brand-light shadow-sm" />
                            <div className="ml-3 hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-700 leading-tight">{currentUser.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                            </div>
                            <svg className={`ml-2 h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl py-2 z-50 ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-200 origin-top-right border border-gray-100">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Signed in as</p>
                                    <p className="text-sm font-bold text-brand-dark truncate mt-0.5">{currentUser.email}</p>
                                </div>
                                
                                <div className="py-2">
                                    <a href="#" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-primary transition-colors" onClick={(e) => { e.preventDefault(); setIsProfileMenuOpen(false); }}>
                                        <div className="flex items-center">
                                            <svg className="mr-3 h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Edit Profile
                                        </div>
                                    </a>
                                </div>

                                <div className="border-t border-gray-100 mt-1 py-2">
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                        }}
                                        className="block w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                    >
                                        <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
             {/* Subtle background decoration */}
             <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none -z-10"></div>
            {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
