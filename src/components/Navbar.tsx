import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/school';
import {
  LogOut,
  Github,
  Newspaper,
  Layout,
  Globe,
  KeyRound,
  Home,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  Award
} from 'lucide-react';
import { SchoolBadge, SchoolBadgeModal } from './SchoolBadge';
import { HeroSliderManagerModal } from './ModernHeroSlider';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  syncStatus: 'connected' | 'syncing' | 'error';
  lastSyncTime: Date;
  onOpenAuth: () => void;
  onOpenDeployGuide: () => void;
  onOpenChangePassword?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  syncStatus,
  lastSyncTime,
  onOpenAuth,
  onOpenDeployGuide,
  onOpenChangePassword
}) => {
  const { userProfile, logout } = useAuth();
  const currentRole: UserRole | null = userProfile?.role || null;
  const canManageSiteImages = currentRole === 'super_admin' || currentRole === 'admin';
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [sliderModalOpen, setSliderModalOpen] = useState(false);

  // Tabs strictly based on authenticated role
  const getTabs = () => {
    if (!userProfile) {
      return [
        { id: 'home', label: 'Home Page', icon: Home },
        { id: 'check_result', label: 'Check Results', icon: Award },
        { id: 'public_portal', label: 'School News', icon: Newspaper },
        { id: 'login', label: 'Portal Login', icon: KeyRound }
      ];
    }
    if (currentRole === 'super_admin') {
      const isPrincipalSuperAdmin = Boolean(userProfile?.isPrincipalSuperAdmin);
      return [
        { id: 'home', label: 'Home Page', icon: Home },
        { id: 'public_portal', label: 'School News', icon: Newspaper },
        { id: 'super_admin', label: 'Super Admin Dashboard' },
        { id: 'admin_panel', label: 'Admin Operations' },
        { id: 'post_news', label: 'Post School News' },
        { id: 'website_manager', label: 'Website Customization' },
        ...(isPrincipalSuperAdmin ? [{ id: 'scratch_cards', label: 'Scratch Cards' }] : []),
        { id: 'students', label: 'Students' },
        { id: 'results', label: 'Broadsheet' }
      ];
    }
    if (currentRole === 'admin') {
      return [
        { id: 'home', label: 'Home Page', icon: Home },
        { id: 'public_portal', label: 'School News', icon: Newspaper },
        { id: 'admin_panel', label: 'Admin Operations' },
        { id: 'post_news', label: 'Post School News' },
        { id: 'results', label: 'Broadsheet' },
        { id: 'classes', label: 'Classes' },
        { id: 'subjects', label: 'Subjects' },
        { id: 'staff', label: 'Teachers' },
        { id: 'students', label: 'Students' },
        { id: 'assignments', label: 'Assignments' },
        { id: 'settings', label: 'Settings' }
      ];
    }
    if (currentRole === 'staff') {
      return [
        { id: 'staff_dashboard', label: "Teacher's Portal", icon: GraduationCap }
      ];
    }
    // student role
    return [
      { id: 'home', label: 'Home Page', icon: Home },
      { id: 'public_portal', label: 'School News', icon: Newspaper },
      { id: 'student_dashboard', label: 'My Terminal Result' }
    ];
  };

  const tabs = getTabs();

  const getRoleBadge = (role: UserRole | null) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-amber-400 text-stone-950 font-black' };
      case 'admin':
        return { label: 'Admin', bg: 'bg-emerald-300 text-emerald-950 font-bold' };
      case 'staff':
        return { label: 'Staff / Teacher', bg: 'bg-blue-300 text-blue-950 font-bold' };
      case 'student':
        return { label: 'Student', bg: 'bg-purple-300 text-purple-950 font-bold' };
      default:
        return { label: 'Visitor', bg: 'bg-stone-200 text-stone-800 font-semibold' };
    }
  };

  const badge = getRoleBadge(currentRole);

  return (
    <header className="bg-[#0b4d2c] text-white shadow-md select-none sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#0f5c35]">
        {/* Brand & Crest */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            if (currentRole === 'staff') {
              setActiveTab('staff_dashboard');
            } else if (currentRole === 'student') {
              setActiveTab('student_dashboard');
            } else {
              setActiveTab('home');
            }
          }}
        >
          <SchoolBadge size="md" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight leading-snug text-white">
                Rev. Fr. Moses Orshio Adasu University Science &amp; Technical College, Makurdi
              </h1>
              <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${badge.bg}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-[11px] sm:text-[12px] text-emerald-200 mt-0.5 font-normal tracking-wide">
              Motto: Scientia Liberatio Populorum • Makurdi, Benue State
            </p>
          </div>
        </div>

        {/* Live sync badge & controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
          {/* Real-time sync indicator (Restricted to Super Admin only) */}
          {currentRole === 'super_admin' && (
            <div
              title={`Connected to Firestore. Last sync: ${lastSyncTime.toLocaleTimeString()}`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full border border-white/15 text-[11px] text-emerald-100"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-red-400'
                }`}
              />
              <span>{syncStatus === 'connected' ? 'Firestore Live Sync' : 'Connecting...'}</span>
            </div>
          )}

          {/* School Badge & Slider Images Quick Uploader Buttons (Strictly Super Admin & Admin Only) */}
          {canManageSiteImages && (
            <>
              <button
                type="button"
                onClick={() => setBadgeModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white font-semibold rounded-md border border-amber-300/30 transition-colors text-xs cursor-pointer"
                title="Add or remove the official school badge/logo (Super Admin & Admin only)"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">School Badge</span>
              </button>

              <button
                type="button"
                onClick={() => setSliderModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white font-semibold rounded-md border border-white/20 transition-colors text-xs cursor-pointer"
                title="Add or remove homepage 5-second slider images (Super Admin & Admin only)"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">Slider Images</span>
              </button>
            </>
          )}

          {/* GitHub / Vercel Readiness Button */}
          <button
            onClick={onOpenDeployGuide}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md border border-white/15 transition-colors text-xs"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub & Vercel</span>
          </button>

          {/* User profile / session */}
          {userProfile ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold leading-tight text-white flex items-center gap-1.5 justify-end">
                  {userProfile.displayName}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </p>
                <p className="text-[10px] text-emerald-200 font-mono">
                  {badge.label} • @{userProfile.username || userProfile.studentAdmissionNo || 'user'}
                </p>
              </div>

              {/* Change Password Button for Any Logged-in User */}
              {onOpenChangePassword && (
                <button
                  onClick={onOpenChangePassword}
                  className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md border border-amber-300/30 transition"
                  title="Change your account password"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline font-semibold">Change Password</span>
                </button>
              )}

              <button
                onClick={async () => {
                  await logout();
                  setActiveTab('home');
                }}
                className="flex items-center gap-1 text-xs text-emerald-200 hover:text-white px-2 py-1 hover:bg-white/10 rounded transition"
                title="Log out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="underline decoration-emerald-400/50">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-amber-400 text-stone-950 font-bold text-xs rounded-md shadow-sm hover:bg-amber-300 transition flex items-center gap-1.5"
            >
              <span>Login to Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Role-Aware Navigation Tabs (Clean and direct) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 sm:space-x-2 py-1 text-xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#06331c] text-white shadow-inner font-semibold border-b-2 border-amber-400'
                    : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {canManageSiteImages && (
        <>
          <SchoolBadgeModal
            isOpen={badgeModalOpen}
            onClose={() => setBadgeModalOpen(false)}
          />
          <HeroSliderManagerModal
            isOpen={sliderModalOpen}
            onClose={() => setSliderModalOpen(false)}
          />
        </>
      )}
    </header>
  );
};
