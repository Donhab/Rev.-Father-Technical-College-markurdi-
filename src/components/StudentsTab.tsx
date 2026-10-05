import React, { useState, useEffect } from 'react';
import { Student, SchoolClass } from '../types/school';
import { isStudentInClass } from '../utils/studentUtils';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { UserPlus, Search, Trash2, Edit2, Eye, EyeOff, Copy, Check, Key } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentsTabProps {
  students: Student[];
  classes: SchoolClass[];
  onAddStudent: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Student>;
  onDeleteStudent: (id: string) => Promise<void>;
  onUpdateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  showRegisterModalDefault?: boolean;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  classes,
  onAddStudent,
  onDeleteStudent,
  onUpdateStudent,
  showRegisterModalDefault = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(showRegisterModalDefault);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [classId, setClassId] = useState(classes[0]?.id || 'class-ccs1');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [password, setPassword] = useState('0000');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!classId && classes.length > 0) {
      setClassId(classes[0].id);
    }
  }, [classes, classId]);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === 'All' || isStudentInClass(s, selectedClass);
    return matchesSearch && matchesClass;
  });

  const openAddModal = () => {
    setEditingStudent(null);
    setFirstName('');
    setLastName('');
    setGender('Male');
    // Pre-select currently filtered class if one is chosen
    const activeClassId =
      selectedClass !== 'All'
        ? classes.find((c) => c.id === selectedClass || c.name === selectedClass)?.id || classes[0]?.id || ''
        : classes[0]?.id || '';
    setClassId(activeClassId);
    setGuardianName('');
    setGuardianPhone('');
    setPassword('0000');
    setIsModalOpen(true);
  };

  const openEditModal = (std: Student) => {
    setEditingStudent(std);
    setFirstName(std.firstName);
    setLastName(std.lastName);
    setGender(std.gender);
    setClassId(std.classId || classes.find((c) => c.name === std.className)?.id || classes[0]?.id || '');
    setGuardianName(std.guardianName || '');
    setGuardianPhone(std.guardianPhone || '');
    setPassword(std.password || '0000');
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const chosenClass = classes.find((c) => c.id === classId) || classes[0];

      if (editingStudent) {
        await onUpdateStudent(editingStudent.id, {
          firstName,
          lastName,
          gender,
          classId: chosenClass?.id || editingStudent.classId,
          className: chosenClass?.name || editingStudent.className,
          guardianName: guardianName || 'Guardian',
          guardianPhone: guardianPhone || '+234 800 000 0000',
          password: password.trim() || '0000'
        });
      } else {
        const admissionIndex = (students.length + 1).toString().padStart(3, '0');
        const admissionNo = `USTC/2026/${admissionIndex}`;

        await onAddStudent({
          admissionNo,
          password: password.trim() || '0000',
          firstName,
          lastName,
          gender,
          classId: chosenClass.id,
          className: chosenClass.name,
          term: 'First Term',
          session: '2025/2026',
          guardianName: guardianName || 'Guardian',
          guardianPhone: guardianPhone || '+234 800 000 0000',
          status: 'Active'
        });
      }

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setEditingStudent(null);
      setFirstName('');
      setLastName('');
      setGuardianName('');
      setGuardianPhone('');
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
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div>
          <h2 className="text-base font-bold text-stone-900">Student Directory ({students.length})</h2>
          <p className="text-xs text-stone-500">
            Add, edit, or remove student enrollment records
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
            <UserPlus className="w-4 h-4" />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or admission number..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
          />
        </div>
        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
          >
            <option value="All">All Classes ({students.length} students)</option>
            {classes.map((cls) => {
              const count = students.filter((s) => isStudentInClass(s, cls)).length;
              return (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.arm}) — {count} {count === 1 ? 'student' : 'students'}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Login ID (Adm No)</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Login Password</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const stdPass = std.password || '0000';
                  const isPassVisible = showAllPasswords || visiblePasswords[std.id];
                  return (
                  <tr key={std.id} className="hover:bg-emerald-50/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#0b4d2c]">{std.admissionNo}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(std.admissionNo, `adm-${std.id}`)}
                          className="text-stone-400 hover:text-stone-700 p-0.5"
                          title="Copy Login ID"
                        >
                          {copiedId === `adm-${std.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-900">
                      {std.firstName} {std.lastName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#0b4d2c] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {isPassVisible ? stdPass : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(std.id)}
                          className="text-stone-400 hover:text-stone-700 p-1"
                          title={isPassVisible ? 'Hide Password' : 'Show Password'}
                        >
                          {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(stdPass, `pass-${std.id}`)}
                          className="text-stone-400 hover:text-stone-700 p-1"
                          title="Copy Password"
                        >
                          {copiedId === `pass-${std.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 font-medium text-stone-700">
                        {std.className}
                      </span>
                    </td>
                    <td className="py-3 px-4">{std.gender}</td>
                    <td className="py-3 px-4 text-stone-500">
                      <div>{std.guardianName || '—'}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{std.guardianPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(std)}
                        className="text-stone-400 hover:text-[#0b4d2c] transition p-1 cursor-pointer"
                        title="Edit student record"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentToDelete(std)}
                        className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4 inline" />
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0b4d2c]" />
                {editingStudent ? `Edit Student • ${editingStudent.admissionNo}` : 'Register Student • MOAUM USTC Makurdi'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStudent(null);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Last / Surname</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abubakar"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Class</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.arm})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alh. Abubakar Garba"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Student Portal Login Password
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
                    setEditingStudent(null);
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
                  {submitting ? 'Saving...' : editingStudent ? 'Update Student Record' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(studentToDelete)}
        title="Delete Student Account & Record"
        message={
          studentToDelete
            ? `Are you sure you want to permanently remove student "${studentToDelete.firstName} ${studentToDelete.lastName}" (${studentToDelete.admissionNo}) from the school registry?`
            : ''
        }
        confirmLabel="Yes, Remove Student"
        onConfirm={async () => {
          if (studentToDelete) {
            await onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};
