import React, { useState } from 'react';
import { AdminAccount, ScratchCard, WebsiteCustomization } from '../types/school';
import { useAuth } from '../context/AuthContext';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { SchoolBadge, SchoolBadgeUploaderCard } from './SchoolBadge';
import { HeroSliderManagerCard } from './ModernHeroSlider';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  CreditCard,
  Lock,
  Key,
  Users,
  Copy,
  Check,
  Globe,
  Sliders,
  AlertCircle,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuperAdminDashboardProps {
  admins: AdminAccount[];
  scratchCards: ScratchCard[];
  customization: WebsiteCustomization | null;
  syncStatus?: 'connected' | 'syncing' | 'error';
  lastSyncTime?: Date;
  onAddAdmin: (data: Omit<AdminAccount, 'id' | 'createdAt'>) => Promise<AdminAccount>;
  onRemoveAdmin: (id: string) => Promise<void>;
  onGenerateScratchCards: (count: number) => Promise<ScratchCard[]>;
  onUpdateWebsiteCustomization: (updates: Partial<WebsiteCustomization>) => Promise<void>;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  admins,
  scratchCards,
  customization,
  syncStatus = 'connected',
  lastSyncTime,
  onAddAdmin,
  onRemoveAdmin,
  onGenerateScratchCards,
  onUpdateWebsiteCustomization
}) => {
  const { userProfile } = useAuth();
  const isPrincipalSuperAdmin = Boolean(userProfile?.isPrincipalSuperAdmin);

  // Second Super Admin only sees regular admins and never sees Principal Super Admin or other Super Admins
  const visibleAdmins = isPrincipalSuperAdmin
    ? admins.filter((a) => !a.isPrincipalSuperAdmin && a.username?.toLowerCase() !== 'admin')
    : admins.filter(
        (a) =>
          !a.isPrincipalSuperAdmin &&
          a.role !== 'super_admin' &&
          a.username?.toLowerCase() !== 'admin'
      );

  const [showAddModal, setShowAddModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminAccount | null>(null);
  const [adminStatusMsg, setAdminStatusMsg] = useState<string | null>(null);

  // Form state for creating new Admin
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');
  const [assignedOffice, setAssignedOffice] = useState('Academic Records & Admissions');
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  // Scratch card batch state with direct numeric input
  const [cardCountInput, setCardCountInput] = useState<string>('10');
  const [generatingCards, setGeneratingCards] = useState(false);

  // Website customization state
  const [heroTagline, setHeroTagline] = useState(
    customization?.heroTagline ||
      'Scientia Liberatio Populorum — Empowering Future Innovators & Technical Leaders'
  );
  const [heroAnnouncement, setHeroAnnouncement] = useState(
    customization?.heroAnnouncement ||
      'Admissions for 2026/2027 Academic Session at Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi are now open.'
  );
  const [principalWelcome, setPrincipalWelcome] = useState(
    customization?.principalWelcomeMessage && !/garki|gstc/i.test(customization.principalWelcomeMessage)
      ? customization.principalWelcomeMessage
      : 'Welcome to Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi. Guided by our motto Scientia Liberatio Populorum, and working alongside our dedicated team of high-performing administrative and academic staff, we are committed to scientific excellence, technological innovation, and self-reliance across all 9 NABTEB-accredited trades.'
  );
  const [schoolEmail, setSchoolEmail] = useState(
    customization?.schoolContactEmail && !/gstc|garki/i.test(customization.schoolContactEmail)
      ? customization.schoolContactEmail
      : 'info@ustcmakurdi.edu.ng'
  );
  const [schoolPhone, setSchoolPhone] = useState(
    customization?.schoolPhone || '+234 803 712 4500'
  );
  const [schoolAddress, setSchoolAddress] = useState(
    customization?.schoolAddress && !/garki|abuja/i.test(customization.schoolAddress)
      ? customization.schoolAddress
      : 'Walmayo, Kanshio / Km 1 Gboko Road, Rev. Fr. Moses Orshio Adasu University Campus, Makurdi, Benue State, Nigeria'
  );
  const [bannerNoticeText, setBannerNoticeText] = useState(
    customization?.bannerNoticeText ||
      'Academic Session 2025/2026 First Term continuous assessment marks submission deadline is approaching.'
  );
  const [bannerNoticeActive, setBannerNoticeActive] = useState(
    customization?.bannerNoticeActive ?? true
  );
  const [savingWebsite, setSavingWebsite] = useState(false);
  const [savedWebsiteNotice, setSavedWebsiteNotice] = useState(false);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdmin(true);
    try {
      await onAddAdmin({
        username: username.toLowerCase().replace(/\s+/g, '_'),
        fullName,
        email: email || `${username.toLowerCase()}@ustcmakurdi.edu.ng`,
        password: password || 'AdasuAdmin#2026',
        role: isPrincipalSuperAdmin ? newAdminRole : 'admin',
        isPrincipalSuperAdmin: false,
        assignedOffice
      });
      confetti({ particleCount: 40, spread: 60 });
      setUsername('');
      setFullName('');
      setEmail('');
      setPassword('');
      setNewAdminRole('admin');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleConfirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setAdminStatusMsg(null);
    try {
      await onRemoveAdmin(adminToDelete.id);
      setAdminStatusMsg(`Administrator "${adminToDelete.fullName}" (@${adminToDelete.username}) has been removed.`);
      setAdminToDelete(null);
      setTimeout(() => setAdminStatusMsg(null), 4000);
    } catch (err) {
      console.error('Failed to delete admin:', err);
      setAdminStatusMsg('Failed to delete administrator. Please try again.');
    }
  };

  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrincipalSuperAdmin) return;
    const count = parseInt(cardCountInput, 10);
    if (isNaN(count) || count <= 0) {
      return;
    }
    setGeneratingCards(true);
    try {
      await onGenerateScratchCards(count);
      confetti({ particleCount: 50, spread: 70 });
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCards(false);
    }
  };

  const handleSaveWebsiteCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWebsite(true);
    try {
      await onUpdateWebsiteCustomization({
        heroTagline,
        heroAnnouncement,
        principalWelcomeMessage: principalWelcome,
        schoolContactEmail: schoolEmail,
        schoolPhone,
        schoolAddress,
        bannerNoticeText,
        bannerNoticeActive
      });
      confetti({ particleCount: 30 });
      setSavedWebsiteNotice(true);
      setTimeout(() => setSavedWebsiteNotice(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingWebsite(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-[#06331c] via-[#0b4d2c] to-[#145a32] text-white p-6 rounded-2xl shadow-sm border border-emerald-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SchoolBadge size="lg" className="shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-stone-950 uppercase tracking-widest">
                  {isPrincipalSuperAdmin ? 'Principal Super Admin' : 'Super Admin'}
                </span>
                <span className="text-xs text-emerald-200">MOAUM USTC Makurdi Central Management</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                {isPrincipalSuperAdmin ? 'Principal Super Admin Command Dashboard' : 'Super Admin Command Dashboard'}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
                {isPrincipalSuperAdmin
                  ? 'Executive authority: Create and manage administrators, view and copy their credentials, generate customized numbers of scratch cards, and edit public website contents.'
                  : 'Executive authority: Create and manage administrators, view and copy their credentials, and edit public website contents.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add New Admin
            </button>
          </div>
        </div>
      </div>

      {/* Super Admin Metrics Grid */}
      <div className={`grid grid-cols-1 ${isPrincipalSuperAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-1'} gap-4`}>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Provisioned Admins
            </span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-extrabold text-stone-900 mt-2">{visibleAdmins.length}</div>
          <p className="text-[11px] text-stone-400 mt-1">Authorized personnel with portal access</p>
        </div>

        {isPrincipalSuperAdmin && (
          <>
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Total Scratch Cards
                </span>
                <CreditCard className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">{scratchCards.length}</div>
              <p className="text-[11px] text-stone-400 mt-1">Generated 12-digit result access PINs</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Active Cards In Circulation
                </span>
                <Key className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">
                {scratchCards.filter((c) => c.status === 'Active').length}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Valid for student terminal report cards</p>
            </div>
          </>
        )}
      </div>

      {/* Super Admin Exclusive: Cloud Firestore Real-Time Engine Status */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-xs font-bold text-stone-900">Cloud Firestore Real-Time Engine</h3>
              <p className="text-[11px] text-stone-500">
                Super Admin exclusive • Live document listener connection status
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {syncStatus === 'connected' ? 'Connected Live' : 'Syncing...'}
          </span>
        </div>
        <div className="text-xs text-stone-600 pt-2 border-t border-stone-100 flex justify-between">
          <span>Last live snapshot sync:</span>
          <span className="font-mono text-stone-800">
            {lastSyncTime ? lastSyncTime.toLocaleTimeString() : new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* SECTION 1: MANAGE & DELETE ADMINS */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              School Administrators Registry (Credentials & Delete Controls)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Super Admin exclusive: Inspect active usernames, credentials, and delete admins from the system.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {adminStatusMsg && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                {adminStatusMsg}
              </span>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Admin Account</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Password (Super Admin View)</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4 text-right">Delete Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {visibleAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No administrators registered yet. Click &quot;Add New Admin&quot; above.
                  </td>
                </tr>
              ) : (
                visibleAdmins.map((adm) => {
                  const isVisible = visiblePasswords[adm.id];
                  return (
                    <tr key={adm.id} className="hover:bg-emerald-50/30 transition">
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        <div className="flex items-center gap-2">
                          <span>{adm.fullName}</span>
                          {isPrincipalSuperAdmin && adm.role === 'super_admin' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Second Super Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-800 font-semibold border border-stone-200">
                          {adm.username}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-500">
                        {adm.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#0b4d2c] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                            {isVisible ? adm.password : '••••••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(adm.id)}
                            className="text-stone-400 hover:text-stone-700 p-1"
                            title={isVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopy(adm.password, adm.id)}
                            className="text-stone-400 hover:text-stone-700 p-1"
                            title="Copy Password"
                          >
                            {copiedId === adm.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {adm.assignedOffice || 'School Administration'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setAdminToDelete(adm)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md font-semibold text-xs transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Delete Admin</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: CREATE SCRATCH CARDS (Principal Super Admin Exclusive) */}
      {isPrincipalSuperAdmin && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                Principal Super Admin Scratch Card Generation Unit
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Specify the exact number of 12-digit scratch cards you wish to generate into the Firestore database.
              </p>
            </div>

            {/* Form with SPACE TO INPUT NUMBER OF CARDS */}
            <form onSubmit={handleGenerateCards} className="flex items-center gap-2 self-start md:self-auto">
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1">
                <label htmlFor="cardCountInput" className="text-xs font-semibold text-stone-600 whitespace-nowrap">
                  Number of Cards:
                </label>
                <input
                  id="cardCountInput"
                  type="number"
                  min="1"
                  max="200"
                  value={cardCountInput}
                  onChange={(e) => setCardCountInput(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-16 px-1.5 py-0.5 text-xs font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#0b4d2c] focus:outline-none text-center"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={generatingCards}
                className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{generatingCards ? 'Generating...' : `Generate ${cardCountInput || 0} Cards`}</span>
              </button>
            </form>
          </div>

          {/* Scratch Cards Grid Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-1">
            {scratchCards.slice(0, 8).map((card) => (
              <div
                key={card.id}
                className="bg-stone-900 text-white p-4 rounded-xl border-t-4 border-amber-400 shadow-sm relative group overflow-hidden"
              >
                <div className="flex justify-between items-center text-[10px] text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <SchoolBadge size="xs" />
                    <span className="font-mono">{card.serialNumber}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      card.status === 'Active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {card.status}
                  </span>
                </div>
                <div className="my-2.5 text-center">
                  <span className="text-[10px] text-amber-300 uppercase tracking-widest font-bold block">
                    12-Digit Security PIN
                  </span>
                  <div className="text-sm font-mono font-extrabold tracking-wider text-white mt-1 bg-stone-800 py-1 px-2 rounded border border-stone-700 select-all">
                    {card.pin}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone-400 pt-2 border-t border-stone-800">
                  <span>Usage: {card.usageCount}/{card.maxUsage}</span>
                  {card.usedByAdmissionNo ? (
                    <span className="text-emerald-400 truncate max-w-[110px]">
                      {card.usedByAdmissionNo}
                    </span>
                  ) : (
                    <span className="text-amber-400/80">Unused</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {scratchCards.length > 8 && (
            <p className="text-center text-xs text-stone-400 pt-1">
              + {scratchCards.length - 8} more cards stored in Firestore
            </p>
          )}
        </div>
      )}

      {/* SECTION 3: SUPER ADMIN WEBSITE CUSTOMIZATION (Make changes to the website) */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-700" />
              Website Customization & Public Portal Controls
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Super Admin power to edit public website headlines, welcome addresses, notices, and contact information for visitors.
            </p>
          </div>
          {savedWebsiteNotice && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Website updated in real time!
            </span>
          )}
        </div>

        <SchoolBadgeUploaderCard />

        <HeroSliderManagerCard />

        <form onSubmit={handleSaveWebsiteCustomization} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Homepage Hero Tagline
              </label>
              <input
                type="text"
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                placeholder="e.g. Empowering Future Innovators & Technical Leaders"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Hero Announcement Pill
              </label>
              <input
                type="text"
                value={heroAnnouncement}
                onChange={(e) => setHeroAnnouncement(e.target.value)}
                placeholder="e.g. Admissions for 2026/2027 Academic Session are now open."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Principal&apos;s Welcome Address (Public Visitor Message)
            </label>
            <textarea
              rows={3}
              value={principalWelcome}
              onChange={(e) => setPrincipalWelcome(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              placeholder="Enter welcoming message displayed to prospective parents, visitors, and students..."
            />
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0b4d2c]">Public Website Announcement Ticker Banner:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerNoticeActive}
                  onChange={(e) => setBannerNoticeActive(e.target.checked)}
                  className="rounded text-emerald-700"
                />
                <span className="font-semibold text-stone-700">Display to Visitors</span>
              </label>
            </div>
            <input
              type="text"
              value={bannerNoticeText}
              onChange={(e) => setBannerNoticeText(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
              placeholder="Announcement text shown on top of the website..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Official School Email</label>
              <input
                type="email"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Official Phone Number</label>
              <input
                type="text"
                value={schoolPhone}
                onChange={(e) => setSchoolPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Campus Physical Address</label>
              <input
                type="text"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingWebsite}
              className="px-5 py-2.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition"
            >
              <Sliders className="w-4 h-4" />
              <span>{savingWebsite ? 'Publishing Changes...' : 'Save & Publish Website Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal: Add New Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                Add School Administrator
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Terhemba Iorpuu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Login Username (unique)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin_terhemba"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin.terhemba@ustcmakurdi.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Assigned Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AdasuAdmin#2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none font-mono"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Visible to and manageable by the Super Admin at any time.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Office / Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Academic Affairs & Admissions"
                  value={assignedOffice}
                  onChange={(e) => setAssignedOffice(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              {isPrincipalSuperAdmin && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Platform Access Level
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e: any) => setNewAdminRole(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                  >
                    <option value="admin">Administrator (Operations, Classes, Teachers, Students & News)</option>
                    <option value="super_admin">Second Super Admin (Can Create Other Admins & Manage Website)</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdmin}
                  className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold rounded-lg shadow-sm"
                >
                  {submittingAdmin ? 'Creating Admin...' : 'Save Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting an Admin Account */}
      <ConfirmDeleteModal
        isOpen={Boolean(adminToDelete)}
        title="Delete Administrator Account"
        message={
          adminToDelete
            ? `Are you sure you want to permanently remove administrator "${adminToDelete.fullName}" (@${adminToDelete.username})? Their login access will be revoked immediately.`
            : ''
        }
        confirmLabel="Yes, Remove Admin"
        onConfirm={handleConfirmDeleteAdmin}
        onCancel={() => setAdminToDelete(null)}
      />
    </div>
  );
};
