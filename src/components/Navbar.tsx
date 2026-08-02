import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { LogIn, LogOut, ChevronDown, Trophy, Keyboard, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  onLogoClick?: () => void;
  activeView?: 'test' | 'leaderboard' | 'account';
  onNavigate?: (view: 'test' | 'leaderboard' | 'account') => void;
  onOpenSettings?: () => void;
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLogoClick,
  activeView = 'test',
  onNavigate,
  onOpenSettings,
  children,
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const { t } = useSettings();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[rgba(232,226,216,0.06)] select-none">
        {/* Top Left Logo & Nav Links */}
        <div className="flex items-center space-x-6">
          <div onClick={onLogoClick} className="cursor-pointer">
            <Logo size="md" showText={true} />
          </div>

          <nav className="flex items-center space-x-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('test')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeView === 'test'
                  ? 'bg-[#1A1917] text-[#E85D3D] font-medium border border-[rgba(232,226,216,0.1)]'
                  : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[rgba(232,226,216,0.04)]'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{t('nav_test')}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('leaderboard')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeView === 'leaderboard'
                  ? 'bg-[#1A1917] text-[#E85D3D] font-medium border border-[rgba(232,226,216,0.1)]'
                  : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[rgba(232,226,216,0.04)]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{t('nav_leaderboard')}</span>
            </button>
          </nav>
        </div>

        {/* Center Controls (ModeSelector inserted here when activeView === 'test') */}
        <div className="flex-1 flex justify-center w-full md:w-auto">
          {activeView === 'test' && children}
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-[#9A9488]">
          {/* Settings Gear Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#1A1917] hover:bg-[#1A1917]/80 border border-[rgba(232,226,216,0.1)] text-[#9A9488] hover:text-[#E85D3D] transition-colors cursor-pointer flex items-center justify-center"
            title={t('settings_title')}
          >
            <Settings className="w-4 h-4" />
          </button>
          {currentUser && userProfile ? (
            /* Logged in User Profile Dropdown */
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center space-x-1">
                {/* Direct Account Button */}
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('account')}
                  className={`flex items-center space-x-2 bg-[#1A1917] hover:bg-[#1A1917]/80 border rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
                    activeView === 'account'
                      ? 'border-[#E85D3D] text-[#E8E2D8]'
                      : 'border-[rgba(232,226,216,0.1)] text-[#9A9488]'
                  }`}
                  title="Go to account page"
                >
                  {userProfile.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.username}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#E85D3D] text-[#0F0E0D] flex items-center justify-center font-mono font-bold text-[10px]">
                      {userProfile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-mono text-xs text-[#E8E2D8]">
                    {userProfile.username}
                  </span>
                </button>

                {/* Dropdown Toggle */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-[#1A1917] hover:bg-[#1A1917]/80 border border-[rgba(232,226,216,0.1)] rounded-lg p-1.5 text-[#9A9488] transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#1A1917] border border-[rgba(232,226,216,0.12)] rounded-xl shadow-xl p-2 z-50 text-xs font-sans">
                  <div
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onNavigate) onNavigate('account');
                    }}
                    className="px-3 py-2 border-b border-[rgba(232,226,216,0.08)] mb-1 cursor-pointer hover:bg-[rgba(232,226,216,0.04)] rounded-lg"
                  >
                    <p className="font-mono font-medium text-[#E8E2D8] truncate">
                      @{userProfile.username}
                    </p>
                    {userProfile.firstName && (
                      <p className="text-[11px] text-[#9A9488] truncate">
                        {userProfile.firstName} {userProfile.lastName}
                      </p>
                    )}
                    <p className="text-[10px] text-[#5C574C] font-mono truncate mt-0.5">
                      {userProfile.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onNavigate) onNavigate('account');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 font-mono transition-colors cursor-pointer mb-1 ${
                      activeView === 'account'
                        ? 'bg-[#0F0E0D] text-[#E85D3D]'
                        : 'text-[#E8E2D8] hover:bg-[rgba(232,226,216,0.04)]'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#E85D3D]" />
                    <span>{t('nav_account_settings')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-[#D64545] hover:bg-[rgba(214,69,69,0.1)] rounded-lg flex items-center space-x-2 font-mono transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav_logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged out Auth Button */
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('nav_login')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

