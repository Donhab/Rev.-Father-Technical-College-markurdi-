import React, { useState } from 'react';
import { Staff } from '../types/school';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { UserCheck, Search, Trash2, Edit2, Mail, Phone, Briefcase, Eye, EyeOff, Copy, Check, Key } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StaffTabProps {
  staff: Staff[];
  onAddStaff: (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Staff>;
  onUpdateStaff?: (id: string, updates: Partial<Staff>) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  showRegisterModalDefault?: boolean;
}

export const StaffTab: React.FC<StaffTabProps> = ({
  staff,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  showRegisterModalDefault = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(showRegisterModalDefault);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('0000');
  const [role, setRole] = useState<Staff['role']>('Teacher');
  const [assignedClasses, setAssignedClasses] = useState('CCS 1');
  const [subjects, setSubjects] = useState('Computer Craft Studies');
  const [submitting, setSubmitting] = useState(false);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStaff = staff.filter((s) => {
    return (
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const openAddModal = () => {
    setEditingStaff(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('0000');
    setRole('Teacher');
    setAssignedClasses('CCS 1');
    setSubjects('Computer Craft Studies');
    setIsModalOpen(true);
  };

  const openEditModal = (stf: Staff) => {
    setEditingStaff(stf);
    setFullName(stf.fullName);
    setEmail(stf.email);
    setPhone(stf.phone);
    setPassword(stf.password || '0000');
    setRole(stf.role);
    setAssignedClasses(stf.assignedClasses?.join(', ') || '');
    setSubjects(stf.subjects?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStaff && onUpdateStaff) {
        await onUpdateStaff(editingStaff.id, {
          fullName,
          email: email || editingStaff.email,
          phone: phone || editingStaff.phone,
          password: password.trim() || '0000',
          role,
          assignedClasses: assignedClasses
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          subjects: subjects
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        });
      } else {
        const staffNum = (staff.length + 1).toString().padStart(3, '0');
        const staffId = `USTC/STF/${staffNum}`;

        await onAddStaff({
          staffId,
          password: password.trim() || '0000',
          fullName,
          email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@ustcmakurdi.edu.ng`,
          phone: phone || '+234 803 000 0000',
          role,
          assignedClasses: assignedClasses
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          subjects: subjects
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          status: 'Active'
        });
      }

      confetti({ particleCount: 40, spread: 60 });
      setEditingStaff(null);
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('0000');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div>
          <h2 className="text-base font-bold text-stone-900">Academic & Non-Academic Staff ({staff.length})</h2>
          <p className="text-xs text-stone-500">
            Add, edit, or remove teaching staff, form masters and department heads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAllPasswords((prev) => !prev)}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 transition flex items-center gap-1.5"
          >
            {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAllPasswords ? 'Hide Passwords' : 'Show All Passwords'}</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Register Staff Member</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by staff name, ID, or email..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
        />
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((stf) => {
          const staffPass = stf.password || '0000';
          const isPassVisible = showAllPasswords || visiblePasswords[stf.id];
          return (
          <div
            key={stf.id}
            className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs hover:shadow-md transition space-y-3 relative group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {stf.staffId}
                </span>
                <h3 className="text-sm font-bold text-stone-900 mt-1.5">{stf.fullName}</h3>
                <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" /> {stf.role}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(stf)}
                  className="text-stone-400 hover:text-[#0b4d2c] transition p-1 cursor-pointer"
                  title="Edit staff"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStaffToDelete(stf)}
                  className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                  title="Delete staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs text-stone-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{stf.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{stf.phone}</span>
              </div>
            </div>

            {/* Teacher Login Credentials Box */}
            <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                  <Key className="w-3 h-3 text-emerald-700" /> Teacher Login Details
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(`Login ID: ${stf.staffId} | Password: ${staffPass}`, `all-${stf.id}`)}
                  className="text-[10px] font-semibold text-[#0b4d2c] hover:underline flex items-center gap-1"
                >
                  {copiedId === `all-${stf.id}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Login
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">Login ID:</span>
                <span className="font-mono font-bold text-stone-900">{stf.staffId}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">Password:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#0b4d2c] bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {isPassVisible ? staffPass : '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(stf.id)}
                    className="text-stone-500 hover:text-stone-800 p-0.5"
                    title={isPassVisible ? 'Hide Password' : 'Show Password'}
                  >
                    {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1">
              {stf.subjects?.map((sub, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-medium rounded"
                >
                  {sub}
                </span>
              ))}
              {stf.assignedClasses?.map((cls, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded border border-emerald-100"
                >
                  Class: {cls}
                </span>
              ))}
            </div>
          </div>
          );
        })}
      </div>

      {/* Staff Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0b4d2c]" />
                {editingStaff ? `Edit Staff • ${editingStaff.staffId}` : 'Register Staff • Auto-assign USTC/STF ID'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStaff(null);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Fatima Aliyu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="mrs.dooshima.agber@ustcmakurdi.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Designation Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                  >
                    <option value="Teacher">Subject Teacher</option>
                    <option value="Form Master">Form Master / Mistress</option>
                    <option value="Head of Dept">Head of Department</option>
                    <option value="Admin">Admin</option>
                    <option value="Principal">Principal / VP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Assigned Class(es)</label>
                  <input
                    type="text"
                    placeholder="e.g. CCS 1, Garment 1"
                    value={assignedClasses}
                    onChange={(e) => setAssignedClasses(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Subject(s) Taught</label>
                <input
                  type="text"
                  placeholder="e.g. Garment Making & Design"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Teacher Portal Login Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Default: 0000"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-emerald-50/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {submitting ? 'Saving...' : editingStaff ? 'Update Staff Record' : 'Register Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(staffToDelete)}
        title="Delete Staff Account"
        message={
          staffToDelete
            ? `Are you sure you want to permanently remove staff member "${staffToDelete.fullName}" (${staffToDelete.staffId}) from the system?`
            : ''
        }
        confirmLabel="Yes, Remove Staff"
        onConfirm={async () => {
          if (staffToDelete) {
            await onDeleteStaff(staffToDelete.id);
            setStaffToDelete(null);
          }
        }}
        onCancel={() => setStaffToDelete(null)}
      />
    </div>
  );
};
