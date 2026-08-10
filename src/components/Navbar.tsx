import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { LogIn, LogOut, ChevronDown, Trophy, Keyboard, GraduationCap, User as UserIcon, Settings, Info, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  onLogoClick?: () => void;
  activeView?: 'test' | 'academy' | 'leaderboard' | 'account' | 'about' | 'blog';
  onNavigate?: (view: 'test' | 'academy' | 'leaderboard' | 'account' | 'about' | 'blog') => void;
  onOpenSettings?: () => void;
  showWordmark?: boolean;
  isIntroDone?: boolean;
  children?: React.ReactNode;
}

const NAV_ITEMS = [
  { id: 'test', labelKey: 'nav_test', icon: Keyboard, requiresAuth: false },
  { id: 'academy', labelKey: 'nav_academy', icon: GraduationCap, requiresAuth: true },
  { id: 'leaderboard', labelKey: 'nav_leaderboard', icon: Trophy, requiresAuth: false },
  { id: 'blog', labelKey: 'nav_blog', icon: BookOpen, requiresAuth: false },
] as const;

export const Navbar: React.FC<NavbarProps> = ({
  onLogoClick,
  activeView = 'test',
  onNavigate,
  onOpenSettings,
  showWordmark = true,
  isIntroDone = true,
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
      <header className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col items-center gap-3 sm:gap-4 border-b border-[rgba(232,226,216,0.06)] select-none">
        {/* ROW 1: Logo + Desktop Nav Links + Right Actions (Settings & Auth) */}
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Logo */}
          <div onClick={onLogoClick} className="cursor-pointer shrink-0">
            <Logo
              size="md"
              showText={true}
              showWordmark={showWordmark}
              isIntroDone={isIntroDone}
            />
          </div>

          {/* Desktop Nav Links (>= md) - Always renders all 5 links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-[11px] lg:text-xs min-w-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.requiresAuth && !currentUser) {
                      setAuthModalOpen(true);
                    }
                    if (onNavigate) {
                      onNavigate(item.id as any);
                    }
                  }}
                  className={`px-2 lg:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#1A1917] text-[#E85D3D] font-medium border border-[rgba(232,226,216,0.1)]'
                      : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[rgba(232,226,216,0.04)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t(item.labelKey as any)}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Settings & Account / Auth */}
          <div className="flex items-center gap-2 sm:gap-3 text-[#9A9488] shrink-0">
            {/* Settings Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-lg bg-[#1A1917] hover:bg-[#1A1917]/80 border border-[rgba(232,226,216,0.1)] text-[#9A9488] hover:text-[#E85D3D] transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={t('settings_title')}
            >
              <Settings className="w-4 h-4" />
            </button>

            {currentUser && userProfile ? (
              /* Logged in User Profile Dropdown */
              <div className="relative shrink-0" ref={dropdownRef}>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('account')}
                    className={`flex items-center space-x-1.5 sm:space-x-2 bg-[#1A1917] hover:bg-[#1A1917]/80 border rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 transition-colors cursor-pointer max-w-[120px] sm:max-w-[160px] min-w-0 shrink-0 ${
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
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#E85D3D] text-[#0F0E0D] flex items-center justify-center font-mono font-bold text-[9px] sm:text-[10px] shrink-0">
                        {userProfile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-mono text-xs text-[#E8E2D8] max-w-[65px] sm:max-w-[110px] overflow-hidden text-ellipsis whitespace-nowrap block shrink">
                      {userProfile.username}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="bg-[#1A1917] hover:bg-[#1A1917]/80 border border-[rgba(232,226,216,0.1)] rounded-lg p-1 sm:p-1.5 text-[#9A9488] transition-colors cursor-pointer shrink-0"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

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
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold transition-colors flex items-center space-x-1.5 sm:space-x-2 cursor-pointer shadow-sm shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('nav_login')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav Links Row (< md) - Always renders all 5 links */}
        <nav className="flex md:hidden items-center justify-center gap-1 font-mono text-xs w-full overflow-x-auto no-scrollbar py-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.requiresAuth && !currentUser) {
                    setAuthModalOpen(true);
                  }
                  if (onNavigate) {
                    onNavigate(item.id as any);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#1A1917] text-[#E85D3D] font-medium border border-[rgba(232,226,216,0.1)]'
                    : 'text-[#9A9488] hover:text-[#E8E2D8]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(item.labelKey as any)}</span>
              </button>
            );
          })}
        </nav>

        {/* ROW 2: ModeSelector (completely separate static block, full width, centered) */}
        {activeView === 'test' && children && (
          <div className="w-full flex justify-center items-center">
            {children}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};


