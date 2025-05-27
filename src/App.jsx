import React, { useState, useEffect } from 'react'; 
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Feed from './components/Feed';
import Profile from './components/Profile'; 
import { Sun, Moon, LogOut, Zap, User } from 'lucide-react';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false); 
  const [currentProfileData, setCurrentProfileData] = useState(null); 

  
  const fetchProfileData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. Please log in.');
      setIsLoggedIn(false); 
      return;
    }

    try {
      const res = await axios.get('https://boom-app-backend-production.up.railway.app/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCurrentProfileData(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err.response?.data?.error || err.message);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setCurrentProfileData(null);
      setShowProfile(false); 
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfileData();
    }
  }, [isLoggedIn]); 

  const handleLogin = () => {
    setIsLoggedIn(true);
    fetchProfileData(); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowProfile(false); 
    setCurrentProfileData(null); 
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleProfileClick = () => {
    setShowProfile(true);
    fetchProfileData(); 
  };

  const handleBackFromProfile = () => {
    setShowProfile(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${
        isDarkMode
          ? 'bg-gray-800/95 backdrop-blur-sm border-gray-700'
          : 'bg-white/95 backdrop-blur-sm border-gray-200'
      } border-b transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                BOOM
              </h1>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Profile Button */}
              {isLoggedIn && !showProfile && ( // Show profile button only when not on profile page
                <button
                  onClick={handleProfileClick}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
              )}

              {/* Logout Button */}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16">
        {!isLoggedIn ? (
          showRegister ? (
            <Register
              onSwitch={() => setShowRegister(false)}
              onLogin={handleLogin}
              isDarkMode={isDarkMode}
            />
          ) : (
            <Login
              onSwitch={() => setShowRegister(true)}
              onLogin={handleLogin}
              isDarkMode={isDarkMode}
            />
          )
        ) : ( 
          showProfile ? (
            <Profile
              profileData={currentProfileData} 
              onBack={handleBackFromProfile}
              isDarkMode={isDarkMode}
              onProfileUpdate={fetchProfileData} 
            />
          ) : (
            <Feed isDarkMode={isDarkMode} />
          )
        )}
      </div>
    </div>
  );
}

export default App;