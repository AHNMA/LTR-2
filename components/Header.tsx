
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, ChevronDown, User, Twitter, Instagram, Youtube, Facebook, Menu, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { goToHome, goToTeamsDrivers, goToCalendar, goToStandings, goToLogin, goToProfile, goToPrediction } = useNavigation();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, itemLabel: string) => {
    e.preventDefault();
    if (itemLabel === 'HOME') {
        goToHome();
    } else if (itemLabel === 'TEAMS & FAHRER') {
        goToTeamsDrivers();
    } else if (itemLabel === 'RENNKALENDER') {
        goToCalendar();
    } else if (itemLabel === 'WM-STAND') {
        goToStandings();
    } else if (itemLabel === 'TIPPSPIEL') {
        goToPrediction();
    }
  };

  return (
    <>
      {/* Top Bar - Static, scrolls away naturally */}
      <div className="bg-f1-dark w-full text-gray-400 text-[11px] py-1.5 px-4 flex justify-between items-center border-b border-gray-800 h-8 relative z-50 font-sans">
        <div className="container mx-auto flex justify-between">
            <div className="flex items-center space-x-6">
            <span className="font-medium tracking-wide">11.02.2026</span>
            <div className="flex items-center space-x-3">
                <Instagram size={13} className="hover:text-f1-pink cursor-pointer transition-colors" />
                <Facebook size={13} className="hover:text-f1-pink cursor-pointer transition-colors" />
                <Twitter size={13} className="hover:text-f1-pink cursor-pointer transition-colors" />
                <Youtube size={13} className="hover:text-f1-pink cursor-pointer transition-colors" />
            </div>
            </div>
            
            <div className="flex items-center space-x-4">
                {currentUser ? (
                    <div className="flex items-center space-x-3">
                        <div onClick={goToProfile} className="flex items-center space-x-2 cursor-pointer hover:text-white group">
                            <span className="font-bold uppercase tracking-wider">{currentUser.username}</span>
                             <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-600 group-hover:border-f1-pink">
                                 <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.username}`} alt="" className="w-full h-full object-cover" />
                             </div>
                        </div>
                        <div className="w-px h-3 bg-gray-700"></div>
                        <button onClick={logout} className="hover:text-f1-pink" title="Logout">
                            <LogOut size={12} />
                        </button>
                    </div>
                ) : (
                    <div onClick={goToLogin} className="flex items-center space-x-2 hover:text-white cursor-pointer group">
                        <User size={12} className="group-hover:text-f1-pink" />
                        <span className="font-bold uppercase tracking-wider group-hover:text-f1-pink transition-colors">Login</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Main Nav - Sticky */}
      <header className={`w-full bg-f1-dark/95 backdrop-blur-md text-white px-4 border-b border-white/10 sticky top-0 z-50 transition-all duration-300 font-sans ${scrolled ? 'py-2 shadow-xl' : 'py-3'}`}>
        <div className="container mx-auto flex justify-between items-center">
            
            {/* Left: Logo & Menu */}
            <div className="flex items-center">
                {/* Mobile Menu Trigger */}
                <button className="md:hidden mr-4 text-white">
                    <Menu size={24} />
                </button>

                {/* Logo */}
                <div 
                    onClick={goToHome}
                    className="mr-12 italic font-black text-3xl tracking-tighter flex items-center cursor-pointer select-none"
                >
                    <span className="text-white">LT</span>
                    <span className="text-f1-pink drop-shadow-[0_0_8px_rgba(225,0,89,0.5)]">RACE</span>
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center space-x-8">
                    {NAV_ITEMS.map((item) => (
                        <div key={item.label} className="group relative py-2 cursor-pointer">
                            <a 
                                href={item.href} 
                                onClick={(e) => handleNavClick(e, item.label)}
                                className="text-sm font-bold uppercase tracking-wider text-gray-300 hover:text-white flex items-center transition-colors"
                            >
                                {item.label}
                                {item.hasDropdown && <ChevronDown size={14} className="ml-1 opacity-70 group-hover:translate-y-0.5 transition-transform" />}
                            </a>
                            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-f1-pink transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Right: Search & Countdown */}
            <div className="flex items-center space-x-4">
                <div className="hidden lg:flex items-center bg-white/5 rounded-lg border border-white/10 p-1 pr-3">
                     {/* Countdown */}
                    <div className="flex items-center">
                        <div className="bg-f1-pink text-white px-2 py-1 rounded-md flex flex-col justify-center items-center mr-2 shadow-glow">
                            <span className="text-[9px] font-bold leading-none uppercase tracking-wider">Live</span>
                        </div>
                        <span className="text-sm font-display font-medium tracking-widest tabular-nums text-gray-200">
                            22<span className="text-gray-500 text-xs mx-0.5">d</span> 06<span className="text-gray-500 text-xs mx-0.5">h</span> 37<span className="text-gray-500 text-xs mx-0.5">m</span>
                        </span>
                    </div>
                </div>

                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    <Search size={20} />
                </button>
            </div>
        </div>
      </header>
    </>
  );
};

export default Header;
