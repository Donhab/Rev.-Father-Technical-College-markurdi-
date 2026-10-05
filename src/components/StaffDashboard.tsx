import React, { useState, useEffect } from 'react';
import {
  Student,
  Staff,
  SchoolClass,
  Subject,
  TeachingAssignment,
  ExamResult,
  SubjectScore
} from '../types/school';
import { isStudentInClass, isStudentOfferingSubject } from '../utils/studentUtils';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { SchoolBadge } from './SchoolBadge';
import {
  GraduationCap,
  UserCheck,
  UserPlus,
  UserMinus,
  Edit3,
  Save,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen,
  Award,
  Eye,
  EyeOff,
  Copy,
  Check,
  Key,
  CheckSquare,
  Square,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StaffDashboardProps {
  currentStaff: Staff | undefined;
  allStaff: Staff[];
  students: Student[];
  classes: SchoolClass[];
  subjects: Subject[];
  assignments: TeachingAssignment[];
  results: ExamResult[];
  onEnrollStudent: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Student>;
  onUpdateStudent?: (studentId: string, updates: Partial<Student>) => Promise<void>;
  onDeenrollStudent: (studentId: string) => Promise<void>;
  onToggleStudentSubjectEnrollment?: (
    studentId: string,
    subjectId: string,
    shouldEnroll: boolean
  ) => Promise<void>;
  onEnrollAllClassStudentsInSubject?: (classId: string, subjectId: string) => Promise<void>;
  onSaveBatchScores?: (
    scores: Array<{
      studentId: string;
      subjectId: string;
      subjectName: string;
      ca1: number;
      ca2: number;
      ca3: number;
      exam: number;
      teacherId: string;
      teacherName: string;
    }>
  ) => Promise<void>;
  onSaveScore: (
    studentId: string,
    subjectId: string,
    subjectName: string,
    ca1: number,
    ca2: number,
    ca3: number,
    exam: number,
    teacherId: string,
    teacherName: string
  ) => Promise<void>;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  currentStaff,
  allStaff,
  students,
  classes,
  subjects,
  assignments,
  results,
  onEnrollStudent,
  onUpdateStudent,
  onDeenrollStudent,
  onToggleStudentSubjectEnrollment,
  onEnrollAllClassStudentsInSubject,
  onSaveBatchScores,
  onSaveScore
}) => {
  // Use either the logged in teacher or default to first staff
  const teacher = currentStaff || allStaff[0];

  // Determine classes where this teacher is the Form Teacher
  const formTeacherClasses = classes.filter(
    (c) =>
      (teacher?.isFormTeacher &&
        (teacher.formTeacherClassId === c.id ||
          teacher.formTeacherClassName?.toLowerCase() === c.name.toLowerCase())) ||
      c.formTeacherId === teacher?.id ||
      (teacher?.fullName && c.formTeacherName?.toLowerCase() === teacher.fullName.toLowerCase())
  );

  // Determine classes assigned to this teacher
  const teacherClasses = classes.filter(
    (c) =>
      formTeacherClasses.some((fc) => fc.id === c.id) ||
      teacher?.assignedClasses?.includes(c.name) ||
      assignments.some((a) => a.teacherId === teacher?.id && a.classId === c.id)
  );

  // Fallback to all classes if none assigned yet
  const availableClasses = teacherClasses.length > 0 ? teacherClasses : classes;

  const [selectedClassId, setSelectedClassId] = useState<string>(
    formTeacherClasses[0]?.id || availableClasses[0]?.id || ''
  );
  const selectedClass = classes.find((c) => c.id === selectedClassId) || availableClasses[0];

  // Determine subjects taught by this teacher in this class
  const teacherAssignments = assignments.filter((a) => a.teacherId === teacher?.id);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    teacherAssignments[0]?.subjectId || subjects[0]?.id || ''
  );
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Ensure default selections stay synced if classes/subjects list loads asynchronously
  useEffect(() => {
    if ((!selectedClassId || !classes.some((c) => c.id === selectedClassId)) && availableClasses.length > 0) {
      setSelectedClassId(formTeacherClasses[0]?.id || availableClasses[0]?.id);
    }
  }, [classes, availableClasses, formTeacherClasses, selectedClassId]);

  useEffect(() => {
    if ((!selectedSubjectId || !subjects.some((s) => s.id === selectedSubjectId)) && subjects.length > 0) {
      setSelectedSubjectId(teacherAssignments[0]?.subjectId || subjects[0]?.id);
    }
  }, [subjects, teacherAssignments, selectedSubjectId]);

  // Enrollment form state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [studentToDeenroll, setStudentToDeenroll] = useState<Student | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [studentPassword, setStudentPassword] = useState('0000');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollingAll, setEnrollingAll] = useState(false);
  const [savingAllScores, setSavingAllScores] = useState(false);

  // Subject enrollment local override state { [studentId]: boolean }
  const [subjectEnrollments, setSubjectEnrollments] = useState<{ [studentId: string]: boolean }>({});

  // Password visibility & copy state for Form Teacher viewing student credentials
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPasswordStudent, setEditingPasswordStudent] = useState<Student | null>(null);
  const [newStudentPassInput, setNewStudentPassInput] = useState('');
  const [savingStudentPass, setSavingStudentPass] = useState(false);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Score input editing state { [studentId]: { ca1, ca2, ca3, exam, saving, saved } }
  const [scoresState, setScoresState] = useState<{
    [studentId: string]: {
      ca1: number;
      ca2: number;
      ca3: number;
      exam: number;
      saving?: boolean;
      saved?: boolean;
    };
  }>({});

  // Filter all students registered in this class (including any newly registered students)
  const classStudents = students.filter((s) => isStudentInClass(s, selectedClass));

  // Determine if a student is enrolled in the currently selected subject
  const isStudentEnrolledInCurrentSubject = (std: Student): boolean => {
    if (typeof subjectEnrollments[std.id] === 'boolean') {
      return subjectEnrollments[std.id];
    }
    return isStudentOfferingSubject(std, selectedSubject?.id, results);
  };

  const enrolledInSubjectCount = classStudents.filter((s) =>
    isStudentEnrolledInCurrentSubject(s)
  ).length;
  const allClassStudentsEnrolled =
    classStudents.length > 0 && enrolledInSubjectCount === classStudents.length;

  const handleToggleStudentEnrollment = async (std: Student) => {
    if (!selectedSubject?.id) return;
    const current = isStudentEnrolledInCurrentSubject(std);
    const nextVal = !current;
    setSubjectEnrollments((prev) => ({ ...prev, [std.id]: nextVal }));

    try {
      if (onToggleStudentSubjectEnrollment) {
        await onToggleStudentSubjectEnrollment(std.id, selectedSubject.id, nextVal);
      } else if (onUpdateStudent) {
        const cur = Array.isArray(std.enrolledSubjectIds) ? std.enrolledSubjectIds : [];
        const nextList = nextVal
          ? Array.from(new Set([...cur, selectedSubject.id]))
          : cur.filter((id) => id !== selectedSubject.id);
        await onUpdateStudent(std.id, { enrolledSubjectIds: nextList });
      }
    } catch (err) {
      console.error('Failed to toggle student subject enrollment:', err);
    }
  };

  const handleEnrollAllStudentsAtOnce = async () => {
    if (!selectedSubject?.id || !selectedClass || classStudents.length === 0) return;
    setEnrollingAll(true);
    try {
      const updatedMap: { [id: string]: boolean } = {};
      classStudents.forEach((s) => {
        updatedMap[s.id] = true;
      });
      setSubjectEnrollments((prev) => ({ ...prev, ...updatedMap }));

      if (onEnrollAllClassStudentsInSubject) {
        await onEnrollAllClassStudentsInSubject(selectedClass.id, selectedSubject.id);
      } else if (onToggleStudentSubjectEnrollment) {
        for (const s of classStudents) {
          await onToggleStudentSubjectEnrollment(s.id, selectedSubject.id, true);
        }
      }
      confetti({ particleCount: 50, spread: 70 });
    } catch (err) {
      console.error('Failed to enroll all students in subject:', err);
    } finally {
      setEnrollingAll(false);
    }
  };

  // Initialize scores state from existing results
  const getExistingScore = (studentId: string) => {
    if (scoresState[studentId]) {
      return scoresState[studentId];
    }
    const res = results.find((r) => r.studentId === studentId);
    const subScore = res?.subjects?.find((s) => s.subjectId === selectedSubject?.id);
    return {
      ca1: subScore?.ca1 ?? 0,
      ca2: subScore?.ca2 ?? 0,
      ca3: subScore?.ca3 ?? 0,
      exam: subScore?.exam ?? 0
    };
  };

  const handleScoreChange = (
    studentId: string,
    field: 'ca1' | 'ca2' | 'ca3' | 'exam',
    value: string
  ) => {
    const num = Number(value);
    const maxVal = field === 'exam' ? 70 : 10;
    // Strictly clamp marks: CAs <= 10, Exam <= 70
    const clamped = Math.max(0, Math.min(maxVal, isNaN(num) ? 0 : num));

    const current = getExistingScore(studentId);
    setScoresState((prev) => ({
      ...prev,
      [studentId]: {
        ...current,
        [field]: clamped,
        saved: false
      }
    }));
  };

  const handleSaveStudentScore = async (student: Student) => {
    const studentScore = getExistingScore(student.id);
    setScoresState((prev) => ({
      ...prev,
      [student.id]: { ...studentScore, saving: true }
    }));

    try {
      await onSaveScore(
        student.id,
        selectedSubject.id,
        selectedSubject.name,
        studentScore.ca1,
        studentScore.ca2,
        studentScore.ca3,
        studentScore.exam,
        teacher?.id || 'staff-01',
        teacher?.fullName || 'Teacher'
      );

      confetti({ particleCount: 20 });
      setScoresState((prev) => ({
        ...prev,
        [student.id]: { ...studentScore, saving: false, saved: true }
      }));
      setTimeout(() => {
        setScoresState((prev) => ({
          ...prev,
          [student.id]: { ...studentScore, saved: false }
        }));
      }, 3000);
    } catch (err) {
      console.error(err);
      setScoresState((prev) => ({
        ...prev,
        [student.id]: { ...studentScore, saving: false }
      }));
    }
  };

  const handleSaveAllScores = async () => {
    const enrolledStudents = classStudents.filter((s) => isStudentEnrolledInCurrentSubject(s));
    if (enrolledStudents.length === 0) return;
    setSavingAllScores(true);
    try {
      if (onSaveBatchScores) {
        const batchPayload = enrolledStudents.map((std) => {
          const sc = getExistingScore(std.id);
          return {
            studentId: std.id,
            subjectId: selectedSubject.id,
            subjectName: selectedSubject.name,
            ca1: sc.ca1,
            ca2: sc.ca2,
            ca3: sc.ca3,
            exam: sc.exam,
            teacherId: teacher?.id || 'staff-01',
            teacherName: teacher?.fullName || 'Teacher'
          };
        });
        await onSaveBatchScores(batchPayload);
      } else {
        for (const std of enrolledStudents) {
          const sc = getExistingScore(std.id);
          await onSaveScore(
            std.id,
            selectedSubject.id,
            selectedSubject.name,
            sc.ca1,
            sc.ca2,
            sc.ca3,
            sc.exam,
            teacher?.id || 'staff-01',
            teacher?.fullName || 'Teacher'
          );
        }
      }
      confetti({ particleCount: 40 });
    } catch (err) {
      console.error('Error saving all scores:', err);
    } finally {
      setSavingAllScores(false);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const count = students.length + 1;
      const admissionNo = `USTC/2026/${count.toString().padStart(3, '0')}`;

      const newStudent = await onEnrollStudent({
        admissionNo,
        password: studentPassword.trim() || '0000',
        firstName,
        lastName,
        gender,
        classId: selectedClass.id,
        className: selectedClass.name,
        term: 'First Term',
        session: '2025/2026',
        guardianName,
        guardianPhone,
        status: 'Active',
        enrolledByTeacherId: teacher?.id,
        enrolledSubjectIds: selectedSubject?.id ? [selectedSubject.id] : []
      });

      if (newStudent?.id && selectedSubject?.id) {
        setSubjectEnrollments((prev) => ({ ...prev, [newStudent.id]: true }));
      }

      confetti({ particleCount: 40 });
      setFirstName('');
      setLastName('');
      setGuardianName('');
      setGuardianPhone('');
      setStudentPassword('0000');
      setShowEnrollModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUpdateStudentPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasswordStudent || !onUpdateStudent) return;
    setSavingStudentPass(true);
    try {
      await onUpdateStudent(editingPasswordStudent.id, {
        password: newStudentPassInput.trim() || '0000'
      });
      confetti({ particleCount: 30 });
      setEditingPasswordStudent(null);
      setNewStudentPassInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStudentPass(false);
    }
  };

  const isFormTeacherOfCurrentClass = Boolean(
    formTeacherClasses.some((fc) => fc.id === selectedClass?.id || fc.name === selectedClass?.name) ||
      (teacher?.isFormTeacher &&
        (teacher.formTeacherClassId === selectedClass?.id ||
          teacher.formTeacherClassName?.toLowerCase() === selectedClass?.name?.toLowerCase())) ||
      selectedClass?.formTeacherId === teacher?.id ||
      (teacher?.fullName &&
        selectedClass?.formTeacherName?.toLowerCase() === teacher.fullName.toLowerCase())
  );

  // All students belonging to any class where this teacher is the Form Teacher
  const myFormClassStudents = students.filter((s) =>
    formTeacherClasses.some((fc) => fc.id === s.classId || fc.name.toLowerCase() === s.className.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-[#0b4d2c] text-white p-5 rounded-2xl shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SchoolBadge size="md" className="shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-stone-900 uppercase">
                Staff Portal
              </span>
              {isFormTeacherOfCurrentClass && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white border border-emerald-500">
                  ★ Form Master: {selectedClass?.name}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Teacher Gradebook & Class Roster
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              Logged in as <strong className="text-white">{teacher?.fullName}</strong> ({teacher?.staffId}) • Manage enrolled students and record CA1 (10 max), CA2 (10 max), CA3 (10 max), and Exam (70 max).
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start md:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4 text-stone-950" />
          <span>Enroll Student to {selectedClass?.name}</span>
        </button>
      </div>

      {/* Class & Subject Selector Controls */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            1. Select Assigned Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white font-medium"
          >
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.arm}) — Form Master: {cls.formTeacherName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            2. Select Subject for Mark Entry
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white font-medium"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guidelines Note on Mark Boundaries */}
      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex items-center justify-between gap-3 text-amber-900">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Assessment Rules:</strong> First CA (10 max), Second CA (10 max), Third CA (10 max), and Exam (70 max). Total score is automatically calculated out of 100 max.
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-amber-800 shrink-0">
          Max Total: 100
        </span>
      </div>

      {/* Form Teacher Exclusive: Student Login Details (Admission No & Password) Directory */}
      {(isFormTeacherOfCurrentClass || formTeacherClasses.length > 0) && (
        <div className="bg-white rounded-xl border border-emerald-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0b4d2c] text-white uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-300" /> Form Teacher Access
                </span>
                <span className="text-xs font-bold text-emerald-950">
                  Class: {isFormTeacherOfCurrentClass ? selectedClass?.name : formTeacherClasses.map((c) => c.name).join(', ')}
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 mt-1">
                My Form Class Students — Login Details &amp; Passwords
              </h3>
              <p className="text-xs text-stone-600">
                As the designated Form Teacher, you can view, copy, and manage your students&apos; portal login credentials (Admission Number &amp; Password).
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowAllPasswords((prev) => !prev)}
                className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-2xs"
              >
                {showAllPasswords ? <EyeOff className="w-3.5 h-3.5 text-[#0b4d2c]" /> : <Eye className="w-3.5 h-3.5 text-[#0b4d2c]" />}
                <span>{showAllPasswords ? 'Hide All Passwords' : 'Show All Passwords'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Login Username (Admission No)</th>
                  <th className="py-2.5 px-4">Login Password</th>
                  <th className="py-2.5 px-4 text-right">Credentials Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(isFormTeacherOfCurrentClass ? classStudents : myFormClassStudents).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      No students enrolled in your form class yet.
                    </td>
                  </tr>
                ) : (
                  (isFormTeacherOfCurrentClass ? classStudents : myFormClassStudents).map((std) => {
                    const stdPass = std.password || '0000';
                    const isPassVisible = showAllPasswords || visiblePasswords[std.id];
                    return (
                      <tr key={`cred-${std.id}`} className="hover:bg-emerald-50/30 transition">
                        <td className="py-2.5 px-4 font-semibold text-stone-900">
                          {std.firstName} {std.lastName}
                          <span className="ml-2 text-[10px] text-stone-400 font-normal">({std.gender})</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 font-medium">
                            {std.className}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0b4d2c]">{std.admissionNo}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(std.admissionNo, `ft-adm-${std.id}`)}
                              className="text-stone-400 hover:text-stone-700 p-0.5"
                              title="Copy Admission No"
                            >
                              {copiedId === `ft-adm-${std.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0b4d2c] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
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
                              onClick={() => handleCopy(stdPass, `ft-pass-${std.id}`)}
                              className="text-stone-400 hover:text-stone-700 p-1"
                              title="Copy Password"
                            >
                              {copiedId === `ft-pass-${std.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                `Student: ${std.firstName} ${std.lastName} | Login ID: ${std.admissionNo} | Password: ${stdPass}`,
                                `ft-full-${std.id}`
                              )
                            }
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-300 text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            {copiedId === `ft-full-${std.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Login
                              </>
                            )}
                          </button>
                          {onUpdateStudent && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPasswordStudent(std);
                                setNewStudentPassInput(std.password || '0000');
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0b4d2c] rounded border border-emerald-200 text-[11px] font-semibold inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Set Password
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject Offering & Enrollment Control Card */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-700 shrink-0" />
            <h3 className="text-sm font-bold text-stone-900">
              Subject Offering &amp; Student Enrollment: <span className="text-[#0b4d2c]">{selectedSubject?.name} ({selectedSubject?.code})</span>
            </h3>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            All students registered in <strong>{selectedClass?.name}</strong> appear below with an enrollment box beside their name. Tick students who offer this subject to enroll them and enter scores, or click <strong>Enroll All Students at Once</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white text-emerald-900 border border-emerald-300">
              {enrolledInSubjectCount} of {classStudents.length} Students Enrolled in {selectedSubject?.code}
            </span>
            {classStudents.length - enrolledInSubjectCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                {classStudents.length - enrolledInSubjectCount} Not Offering / Pending
              </span>
            ) : classStudents.length > 0 ? (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> All Class Students Enrolled
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleEnrollAllStudentsAtOnce}
            disabled={enrollingAll || classStudents.length === 0 || allClassStudentsEnrolled}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 ${
              allClassStudentsEnrolled && classStudents.length > 0
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                : 'bg-[#0b4d2c] hover:bg-[#083a21] text-white cursor-pointer active:scale-95'
            }`}
            title="Enroll all students in this class to offer this subject at once"
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {enrollingAll
                ? 'Enrolling All...'
                : allClassStudentsEnrolled && classStudents.length > 0
                ? 'All Students Enrolled ✓'
                : 'Enroll All Students at Once'}
            </span>
          </button>

          {enrolledInSubjectCount > 0 && (
            <button
              type="button"
              onClick={handleSaveAllScores}
              disabled={savingAllScores}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition flex items-center gap-1.5 cursor-pointer"
              title="Save marks for all enrolled students at once"
            >
              <Save className="w-3.5 h-3.5 text-stone-700" />
              <span>{savingAllScores ? 'Saving All...' : 'Save All Entered Scores'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Enrolled Students & Marks Entry Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              {selectedClass?.name} Class Roster • {selectedSubject?.name} Gradebook
            </h3>
            <p className="text-xs text-stone-500">
              {classStudents.length} students registered in this class ({enrolledInSubjectCount} enrolled in {selectedSubject?.code})
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isFormTeacherOfCurrentClass && (
              <button
                type="button"
                onClick={() => setShowAllPasswords((prev) => !prev)}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0b4d2c] text-xs font-semibold rounded-md border border-emerald-200 flex items-center gap-1"
              >
                {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAllPasswords ? 'Hide Passwords' : 'Show Student Passwords'}</span>
              </button>
            )}
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-3 py-1 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New Student to {selectedClass?.name}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3 w-36">
                  <div
                    onClick={handleEnrollAllStudentsAtOnce}
                    className="flex items-center gap-1.5 cursor-pointer hover:text-[#0b4d2c] transition select-none"
                    title="Click to enroll all students in this class at once"
                  >
                    <input
                      type="checkbox"
                      checked={allClassStudentsEnrolled}
                      onChange={handleEnrollAllStudentsAtOnce}
                      className="w-4 h-4 text-[#0b4d2c] border-stone-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Offers Subject</span>
                  </div>
                </th>
                <th className="py-3 px-3">Login ID (Adm No)</th>
                <th className="py-3 px-3">Student Name</th>
                {isFormTeacherOfCurrentClass && (
                  <th className="py-3 px-3">Password (Form Master)</th>
                )}
                <th className="py-3 px-2 text-center w-20">CA 1 (10)</th>
                <th className="py-3 px-2 text-center w-20">CA 2 (10)</th>
                <th className="py-3 px-2 text-center w-20">CA 3 (10)</th>
                <th className="py-3 px-2 text-center w-24">Exam (70)</th>
                <th className="py-3 px-2 text-center w-20">Total (100)</th>
                <th className="py-3 px-2 text-center">Grade</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={isFormTeacherOfCurrentClass ? 11 : 10} className="py-8 text-center text-stone-400">
                    No students registered in {selectedClass?.name} yet. Click &quot;Register New Student to {selectedClass?.name}&quot; above to add learners.
                  </td>
                </tr>
              ) : (
                classStudents.map((std) => {
                  const isEnrolled = isStudentEnrolledInCurrentSubject(std);
                  const score = getExistingScore(std.id);
                  const total = score.ca1 + score.ca2 + score.ca3 + score.exam;
                  const stdPass = std.password || '0000';
                  const isPassVisible = showAllPasswords || visiblePasswords[std.id];

                  let grade = 'F';
                  if (total >= 75) grade = 'A';
                  else if (total >= 65) grade = 'B';
                  else if (total >= 50) grade = 'C';
                  else if (total >= 45) grade = 'D';
                  else if (total >= 40) grade = 'E';

                  return (
                    <tr
                      key={std.id}
                      className={`transition ${
                        isEnrolled
                          ? 'hover:bg-emerald-50/30'
                          : 'bg-stone-50/40 opacity-80 hover:opacity-100 hover:bg-stone-100/50'
                      }`}
                    >
                      {/* Checkbox box beside student to tick/enroll in this subject */}
                      <td className="py-3 px-3">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnrolled}
                            onChange={() => handleToggleStudentEnrollment(std)}
                            className="w-4 h-4 text-[#0b4d2c] border-stone-300 rounded focus:ring-emerald-500 cursor-pointer"
                          />
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition ${
                              isEnrolled
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-stone-100 text-stone-500 border-stone-200'
                            }`}
                          >
                            {isEnrolled ? 'Enrolled ✓' : 'Not Enrolled'}
                          </span>
                        </label>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-[#0b4d2c]">
                        {std.admissionNo}
                      </td>
                      <td className="py-3 px-3 font-medium text-stone-900">
                        {std.firstName} {std.lastName}
                        <span className="block text-[10px] text-stone-400">{std.gender}</span>
                      </td>
                      {isFormTeacherOfCurrentClass && (
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-[#0b4d2c] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {isPassVisible ? stdPass : '••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(std.id)}
                              className="text-stone-400 hover:text-stone-700 p-0.5"
                              title={isPassVisible ? 'Hide Password' : 'Show Password'}
                            >
                              {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(stdPass, `tbl-pass-${std.id}`)}
                              className="text-stone-400 hover:text-stone-700 p-0.5"
                              title="Copy Password"
                            >
                              {copiedId === `tbl-pass-${std.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                      )}

                      {/* If enrolled: editable score fields. If not enrolled: prompt to tick box to enroll */}
                      {isEnrolled ? (
                        <>
                          {/* CA 1 (Max 10) */}
                          <td className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={score.ca1}
                              onChange={(e) => handleScoreChange(std.id, 'ca1', e.target.value)}
                              className="w-14 text-center px-1 py-1 font-mono font-semibold border border-stone-300 rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                            />
                          </td>

                          {/* CA 2 (Max 10) */}
                          <td className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={score.ca2}
                              onChange={(e) => handleScoreChange(std.id, 'ca2', e.target.value)}
                              className="w-14 text-center px-1 py-1 font-mono font-semibold border border-stone-300 rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                            />
                          </td>

                          {/* CA 3 (Max 10) */}
                          <td className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={score.ca3}
                              onChange={(e) => handleScoreChange(std.id, 'ca3', e.target.value)}
                              className="w-14 text-center px-1 py-1 font-mono font-semibold border border-stone-300 rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                            />
                          </td>

                          {/* Exam (Max 70) */}
                          <td className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="70"
                              value={score.exam}
                              onChange={(e) => handleScoreChange(std.id, 'exam', e.target.value)}
                              className="w-16 text-center px-1 py-1 font-mono font-bold text-stone-900 border border-stone-300 rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-stone-50"
                            />
                          </td>

                          {/* Total (Max 100) */}
                          <td className="py-3 px-2 text-center font-bold text-sm text-[#0b4d2c]">
                            {total}
                          </td>

                          {/* Grade */}
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                grade === 'A'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : grade === 'B'
                                  ? 'bg-blue-100 text-blue-800'
                                  : grade === 'C'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {grade}
                            </span>
                          </td>

                          {/* Actions: Save Score & De-enroll */}
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => handleSaveStudentScore(std)}
                              disabled={score.saving}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md shadow-2xs transition ${
                                score.saved
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#0b4d2c] hover:bg-[#083a21] text-white cursor-pointer'
                              }`}
                            >
                              {score.saving ? 'Saving...' : score.saved ? 'Saved ✓' : 'Save Score'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentToDeenroll(std)}
                              className="px-2 py-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                              title="De-enroll student from class"
                            >
                              <UserMinus className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td colSpan={6} className="py-3 px-3 text-stone-400 italic">
                            <div className="flex items-center gap-2">
                              <span>Not enrolled in {selectedSubject?.code} —</span>
                              <button
                                type="button"
                                onClick={() => handleToggleStudentEnrollment(std)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0b4d2c] font-semibold rounded border border-emerald-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>Tick to Enroll in Subject</span>
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setStudentToDeenroll(std)}
                              className="px-2 py-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                              title="De-enroll student from class"
                            >
                              <UserMinus className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Enroll Student by Teacher */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-700" />
                Enroll Student into {selectedClass?.name}
              </h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Last / Surname</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bello"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alh. Bello"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Student Portal Login Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Default: 0000"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-emerald-50/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowEnrollModal(false)} className="px-3 py-1.5 text-stone-600">Cancel</button>
                <button
                  type="submit"
                  disabled={enrolling}
                  className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg shadow-sm"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Form Teacher Set/Update Student Password */}
      {editingPasswordStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#0b4d2c]" />
                Student Login Credentials
              </h3>
              <button
                onClick={() => setEditingPasswordStudent(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateStudentPasswordSubmit} className="space-y-3 mt-4">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                <div className="text-stone-500">Student Name:</div>
                <div className="font-bold text-stone-900">
                  {editingPasswordStudent.firstName} {editingPasswordStudent.lastName}
                </div>
                <div className="text-stone-500 pt-1">Login ID (Admission No):</div>
                <div className="font-mono font-bold text-[#0b4d2c]">
                  {editingPasswordStudent.admissionNo}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Student Portal Password
                </label>
                <input
                  type="text"
                  required
                  value={newStudentPassInput}
                  onChange={(e) => setNewStudentPassInput(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPasswordStudent(null)}
                  className="px-3 py-1.5 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudentPass}
                  className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg shadow-sm"
                >
                  {savingStudentPass ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(studentToDeenroll)}
        title="De-enroll & Remove Student"
        message={
          studentToDeenroll
            ? `Are you sure you want to de-enroll and remove "${studentToDeenroll.firstName} ${studentToDeenroll.lastName}" (${studentToDeenroll.admissionNo}) from ${selectedClass?.name || 'this class'}?`
            : ''
        }
        confirmLabel="Yes, De-enroll Student"
        onConfirm={async () => {
          if (studentToDeenroll) {
            await onDeenrollStudent(studentToDeenroll.id);
            setStudentToDeenroll(null);
          }
        }}
        onCancel={() => setStudentToDeenroll(null)}
      />
    </div>
  );
};
