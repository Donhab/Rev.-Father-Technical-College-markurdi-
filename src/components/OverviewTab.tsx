import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Sparkles,
  ArrowRight,
  UserPlus,
  CreditCard,
  FileCheck2,
  Bell,
  RefreshCw,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { SchoolClass, Subject, Staff, Student, TeachingAssignment, Notice } from '../types/school';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface OverviewTabProps {
  students: Student[];
  staff: Staff[];
  classes: SchoolClass[];
  subjects: Subject[];
  assignments: TeachingAssignment[];
  notice: Notice | null;
  onNavigate: (tab: string) => void;
  onOpenRegisterStudent: () => void;
  onOpenRegisterStaff: () => void;
  onOpenScratchCardGenerator: () => void;
  onOpenCheckResult: () => void;
  onUpdateNotice: (updates: Partial<Notice>) => Promise<void>;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  students,
  staff,
  classes,
  subjects,
  assignments,
  notice,
  onNavigate,
  onOpenRegisterStudent,
  onOpenRegisterStaff,
  onOpenScratchCardGenerator,
  onOpenCheckResult,
  onUpdateNotice
}) => {
  const { userProfile } = useAuth();
  const isPrincipalSuperAdmin = Boolean(userProfile?.isPrincipalSuperAdmin);
  const [editingNotice, setEditingNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState(
    notice?.title || 'MOAUM USTC Makurdi Academic Advisory Notice'
  );
  const [noticeContent, setNoticeContent] = useState(
    notice?.content ||
      'Academic Session 2025/2026 First Term is ongoing. Continuous assessment marks submission deadline is approaching.'
  );

  const stats = [
    {
      id: 'students',
      label: 'Students',
      count: students.length,
      icon: Users,
      action: () => onNavigate('students'),
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'staff',
      label: 'Staff',
      count: staff.length,
      icon: Users,
      action: () => onNavigate('staff'),
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'classes',
      label: 'Classes',
      count: classes.length,
      icon: GraduationCap,
      action: () => onNavigate('classes'),
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'subjects',
      label: 'Subjects',
      count: subjects.length,
      icon: BookOpen,
      action: () => onNavigate('subjects'),
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'assignments',
      label: 'Teaching assignments',
      count: assignments.length,
      icon: ClipboardList,
      action: () => onNavigate('assignments'),
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50'
    },
  ];

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateNotice({
      title: noticeTitle,
      content: noticeContent
    });
    setEditingNotice(false);
    confetti({ particleCount: 30, spread: 60 });
  };

  return (
    <div className="space-y-6">
      {/* Subheader Description */}
      <div>
        <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-500">
          A snapshot of the school right now
        </h2>
      </div>

      {/* 5 Main Metric Cards matching the exact layout in user's image */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              onClick={stat.action}
              className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                    {stat.count}
                  </span>
                  <p className="text-xs font-semibold text-stone-600 mt-2 group-hover:text-emerald-700 transition">
                    {stat.label}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GSTC Academic Advisory Notice Bar matching image */}
      <div className="bg-[#06331c] text-white rounded-xl p-4 sm:p-5 shadow-sm border border-emerald-900/60 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-800/80 border border-emerald-700/60 flex items-center justify-center shrink-0 text-emerald-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base tracking-tight text-white">
                  {notice?.title || 'MOAUM USTC Makurdi Academic Advisory Notice'}
                </h3>
                <button
                  onClick={() => setEditingNotice(!editingNotice)}
                  className="text-[10px] text-emerald-300 underline hover:text-white"
                >
                  {editingNotice ? 'Cancel' : 'Edit broadcast'}
                </button>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5 leading-relaxed max-w-3xl">
                {notice?.content ||
                  'Academic Session 2025/2026 First Term is ongoing. Continuous assessment marks submission deadline is approaching.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#0e5c35] text-white text-xs font-semibold rounded-lg border border-emerald-600/50 shadow-xs transition-all flex items-center gap-1.5 shrink-0 hover:translate-x-0.5"
          >
            <span>{notice?.actionText || 'View Broadsheet →'}</span>
          </button>
        </div>

        {/* Live edit form for broadcast announcement */}
        {editingNotice && (
          <form onSubmit={handleSaveNotice} className="mt-4 pt-4 border-t border-emerald-800/60 space-y-3">
            <div className="text-xs text-emerald-200 font-semibold">
              Broadcast Real-Time Update to All School Terminals:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="px-3 py-1.5 text-xs rounded bg-white text-stone-900 border border-stone-300 focus:outline-none"
                placeholder="Title..."
                required
              />
              <input
                type="text"
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                className="sm:col-span-2 px-3 py-1.5 text-xs rounded bg-white text-stone-900 border border-stone-300 focus:outline-none"
                placeholder="Notice description text..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-3 py-1 bg-amber-400 text-stone-900 text-xs font-bold rounded shadow-xs hover:bg-amber-300 transition"
              >
                Publish Live Broadcast
              </button>
            </div>
          </form>
        )}
      </div>

      {/* QUICK ACTIONS SECTION matching the exact cards shown in image */}
      <div>
        <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Action 1: Register Staff */}
          <div
            onClick={onOpenRegisterStaff}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-stone-800 group-hover:text-emerald-700">
                Register Staff
              </h4>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                Auto-assign USTC/STF ID
              </p>
            </div>
          </div>

          {/* Action 2: Register Student */}
          <div
            onClick={onOpenRegisterStudent}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-stone-800 group-hover:text-emerald-700">
                Register Student
              </h4>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                Admit into CCS 1 or Garment
              </p>
            </div>
          </div>

          {/* Action 3: Generate Scratch Cards (Principal Super Admin Only) */}
          {isPrincipalSuperAdmin && (
            <div
              onClick={onOpenScratchCardGenerator}
              className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-stone-800 group-hover:text-emerald-700">
                  Generate Scratch Cards
                </h4>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  Batch generate 12-digit PINs
                </p>
              </div>
            </div>
          )}

          {/* Action 4: Check Student Result */}
          <div
            onClick={onOpenCheckResult}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-stone-800 group-hover:text-emerald-700">
                Check Student Result
              </h4>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                Official term report cards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Multi-Device Sync Demonstration Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-lg">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <p className="font-bold text-emerald-950">
              Live Real-Time Firestore Sync Active
            </p>
            <p className="text-emerald-800 text-[11px]">
              Open this URL in another tab, phone, or laptop: register a student or enter marks here, and observe instant updates on all connected screens without refreshing.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('students')}
            className="px-3 py-1.5 bg-white border border-emerald-300 font-semibold text-emerald-800 rounded-md hover:bg-emerald-100 transition"
          >
            View Live Students ({students.length})
          </button>
        </div>
      </div>
    </div>
  );
};
