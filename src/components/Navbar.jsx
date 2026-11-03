import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogOut, User, ShieldCheck, Flame, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout, isFirebaseConfigured } = useAuth();
  const { info, error } = useToast();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      info('Signed out successfully.');
      navigate('/login');
    } catch (err) {
      error('Failed to log out: ' + err.message);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0F]/90 backdrop-blur-md border-b border-[#2A2A35]/60 transition-all">
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="text-2xl filter drop-shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
            🍆💦
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
              freakinDEX
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#92929E] -mt-1">
              VIP Directory
            </span>
          </div>
        </Link>

        {/* User Status / Account Dropdown */}
        {currentUser && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-3 pr-2 rounded-full bg-[#17171F] border border-[#2A2A35] hover:border-purple-500/50 transition-all text-xs text-white"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-[11px]">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'A'}
              </div>
              <span className="max-w-[90px] truncate hidden sm:inline font-medium text-white/90">
                {currentUser.displayName || currentUser.email}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#92929E]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#17171F] border border-[#2A2A35] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2.5 border-b border-[#2A2A35]">
                  <p className="text-xs text-[#92929E]">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      {currentUser.role || 'Admin'}
                    </span>
                    {isFirebaseConfigured ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Firebase Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Local Demo
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
