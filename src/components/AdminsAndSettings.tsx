import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Settings, Server, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SchoolBadge, SchoolBadgeUploaderCard } from './SchoolBadge';
import { HeroSliderManagerCard } from './ModernHeroSlider';
import confetti from 'canvas-confetti';

interface AdminsAndSettingsProps {
  type: 'admins' | 'settings';
  syncStatus: 'connected' | 'syncing' | 'error';
  lastSyncTime: Date;
}

export const AdminsAndSettings: React.FC<AdminsAndSettingsProps> = ({
  type,
  syncStatus,
  lastSyncTime
}) => {
  const { userProfile } = useAuth();
  const [schoolName, setSchoolName] = useState(
    'Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi'
  );
  const [academicSession, setAcademicSession] = useState('2025/2026');
  const [currentTerm, setCurrentTerm] = useState('First Term');
  const [saved, setSaved] = useState(false);

  const adminsList = [
    ...(userProfile?.isPrincipalSuperAdmin
      ? [
          {
            name: 'Principal Admin (MOAUM USTC)',
            email: 'principal@ustcmakurdi.edu.ng',
            role: 'Super Admin',
            status: 'Online Active',
            avatar: 'PA'
          }
        ]
      : []),
    {
      name: 'Examination Officer',
      email: 'exam.officer@ustcmakurdi.edu.ng',
      role: 'Broadsheet & PIN Manager',
      status: 'Active',
      avatar: 'EO'
    },
    {
      name: 'Vice Principal (Academics)',
      email: 'vp.academics@ustcmakurdi.edu.ng',
      role: 'Academic Director',
      status: 'Active',
      avatar: 'VP'
    }
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    confetti({ particleCount: 30 });
    setTimeout(() => setSaved(false), 3000);
  };

  if (type === 'admins') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
          <div>
            <h2 className="text-base font-bold text-stone-900">System Administrators & Roles</h2>
            <p className="text-xs text-stone-500">
              Authorized personnel with access to continuous assessments, PIN generation, and student records
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-md border border-emerald-200">
            Active Session: {userProfile?.role || 'Administrator'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adminsList.map((adm, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0b4d2c] text-white flex items-center justify-center font-bold text-xs">
                  {adm.avatar}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900">{adm.name}</h3>
                  <p className="text-[11px] text-stone-500">{adm.email}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">{adm.role}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  {adm.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-3">
        <SchoolBadge size="sm" />
        <div>
          <h2 className="text-base font-bold text-stone-900">School & System Configuration</h2>
          <p className="text-xs text-stone-500">
            Global academic session settings and term parameters
          </p>
        </div>
      </div>

      <SchoolBadgeUploaderCard compact />

      <HeroSliderManagerCard compact />

      {/* Cloud Firestore Status card - Restricted to Super Admin only */}
      {userProfile?.role === 'super_admin' && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-xs font-bold text-stone-900">Cloud Firestore Real-Time Engine</h3>
                <p className="text-[11px] text-stone-500">
                  Live document listener connection status
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected Live
            </span>
          </div>
          <div className="text-xs text-stone-600 pt-2 border-t border-stone-100 flex justify-between">
            <span>Last live snapshot sync:</span>
            <span className="font-mono text-stone-800">{lastSyncTime.toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* General Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-xl border border-stone-200 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            School Official Name
          </label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Academic Session
            </label>
            <input
              type="text"
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Active Term
            </label>
            <select
              value={currentTerm}
              onChange={(e) => setCurrentTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
            >
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Configuration saved successfully
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Update Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
