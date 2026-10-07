import React, { useState, useEffect } from 'react';
import {
  Student,
  Staff,
  SchoolClass,
  Subject,
  TeachingAssignment,
  ExamResult
} from '../types/school';
import { isStudentInClass, isStudentOfferingSubject } from '../utils/studentUtils';
import { SchoolBadge } from './SchoolBadge';
import {
  GraduationCap,
  UserCheck,
  Edit3,
  Save,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Award,
  Eye,
  EyeOff,
  Copy,
  Check,
  Key,
  CheckSquare,
  Users,
  ShieldCheck,
  UserX,
  FileSpreadsheet,
  Info,
  Lock
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
  onEnrollStudent?: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Student>;
  onUpdateStudent?: (studentId: string, updates: Partial<Student>) => Promise<void>;
  onDeenrollStudent?: (studentId: string) => Promise<void>;
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
  onUpdateStudent,
  onToggleStudentSubjectEnrollment,
  onEnrollAllClassStudentsInSubject,
  onSaveBatchScores,
  onSaveScore
}) => {
  // Use either the logged in teacher or default to first staff
  const teacher = currentStaff || allStaff[0];

  // Two Main Views: Teacher's Dashboard or Form Teacher Dashboard
  const [activeDashboard, setActiveDashboard] = useState<'teacher' | 'form_teacher'>('teacher');

  // Determine classes where this teacher is the designated Form Teacher / Master
  const formTeacherClasses = classes.filter(
    (c) =>
      (teacher?.isFormTeacher &&
        (teacher.formTeacherClassId === c.id ||
          teacher.formTeacherClassName?.toLowerCase() === c.name.toLowerCase())) ||
      c.formTeacherId === teacher?.id ||
      (teacher?.fullName && c.formTeacherName?.toLowerCase() === teacher.fullName.toLowerCase())
  );
  const isFormMaster =
    formTeacherClasses.length > 0 ||
    Boolean(teacher?.isFormTeacher) ||
    teacher?.role === 'Form Master';

  // Strict Access Guard: If teacher is not a Form Master, block access to form teacher dashboard
  useEffect(() => {
    if (!isFormMaster && activeDashboard === 'form_teacher') {
      setActiveDashboard('teacher');
    }
  }, [isFormMaster, activeDashboard]);

  // Determine classes taught by this teacher
  const classesHeTeaches = classes.filter(
    (c) =>
      teacher?.assignedClasses?.some(
        (ac) => ac.toLowerCase() === c.name.toLowerCase() || ac === c.id
      ) ||
      assignments.some(
        (a) =>
          a.teacherId === teacher?.id &&
          (a.classId === c.id || a.className?.toLowerCase() === c.name.toLowerCase())
      ) ||
      formTeacherClasses.some((fc) => fc.id === c.id)
  );

  // Available classes for teacher (fallback to all school classes if none assigned yet)
  const availableClasses = classesHeTeaches.length > 0 ? classesHeTeaches : classes;

  const [selectedClassId, setSelectedClassId] = useState<string>(
    availableClasses[0]?.id || classes[0]?.id || ''
  );
  const selectedClass = classes.find((c) => c.id === selectedClassId) || availableClasses[0] || classes[0];

  // Determine subjects taught by this teacher
  const teacherSubjects = subjects.filter(
    (s) =>
      assignments.some((a) => a.teacherId === teacher?.id && a.subjectId === s.id) ||
      teacher?.subjects?.some(
        (ts) => ts.toLowerCase() === s.name.toLowerCase() || ts.toLowerCase() === s.code.toLowerCase()
      )
  );

  // Subjects taught by this teacher in the selected class
  const subjectsInSelectedClass = subjects.filter((s) => {
    const isAssignedInThisClass = assignments.some(
      (a) => a.teacherId === teacher?.id && a.subjectId === s.id && (a.classId === selectedClass?.id || !selectedClass)
    );
    const isTeacherGeneralSubject = teacher?.subjects?.some(
      (ts) => ts.toLowerCase() === s.name.toLowerCase() || ts.toLowerCase() === s.code.toLowerCase()
    );
    const isClassOffering = selectedClass ? s.classesOffered?.includes(selectedClass.name) : true;
    return (isAssignedInThisClass || isTeacherGeneralSubject) && (isClassOffering || isAssignedInThisClass);
  });
  const availableSubjects = subjectsInSelectedClass.length > 0 ? subjectsInSelectedClass : (teacherSubjects.length > 0 ? teacherSubjects : subjects);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    availableSubjects[0]?.id || subjects[0]?.id || ''
  );
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || availableSubjects[0] || subjects[0];

  // Sync default selection if asynchronous data updates
  useEffect(() => {
    if ((!selectedClassId || !classes.some((c) => c.id === selectedClassId)) && availableClasses.length > 0) {
      setSelectedClassId(availableClasses[0].id);
    }
  }, [classes, availableClasses, selectedClassId]);

  useEffect(() => {
    if ((!selectedSubjectId || !availableSubjects.some((s) => s.id === selectedSubjectId)) && availableSubjects.length > 0) {
      setSelectedSubjectId(availableSubjects[0].id);
    }
  }, [availableSubjects, selectedSubjectId]);

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

  // All students in the currently selected class
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

  // Toggle single student subject offering
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

  // Option to select all students at once in a case where all students offer the subject
  const handleSelectAllStudentsAtOnce = async () => {
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
      console.error('Failed to select all students in subject:', err);
    } finally {
      setEnrollingAll(false);
    }
  };

  // Option to deselect all students if needed
  const handleDeselectAllStudentsAtOnce = async () => {
    if (!selectedSubject?.id || !selectedClass || classStudents.length === 0) return;
    setEnrollingAll(true);
    try {
      const updatedMap: { [id: string]: boolean } = {};
      classStudents.forEach((s) => {
        updatedMap[s.id] = false;
      });
      setSubjectEnrollments((prev) => ({ ...prev, ...updatedMap }));

      if (onToggleStudentSubjectEnrollment) {
        for (const s of classStudents) {
          await onToggleStudentSubjectEnrollment(s.id, selectedSubject.id, false);
        }
      } else if (onUpdateStudent) {
        for (const s of classStudents) {
          const cur = Array.isArray(s.enrolledSubjectIds) ? s.enrolledSubjectIds : [];
          const nextList = cur.filter((id) => id !== selectedSubject.id);
          await onUpdateStudent(s.id, { enrolledSubjectIds: nextList });
        }
      }
    } catch (err) {
      console.error('Failed to deselect all students in subject:', err);
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

  // All students belonging to any class where this teacher is the Form Teacher
  const myFormClassStudents = students.filter((s) =>
    formTeacherClasses.some(
      (fc) => fc.id === s.classId || fc.name.toLowerCase() === s.className.toLowerCase()
    )
  );

  return (
    <div className="space-y-6">
      {/* 1. TEACHER PROFILE CARD */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Banner with Teacher Name & Badges */}
        <div className="bg-gradient-to-r from-[#0b4d2c] via-[#0d5933] to-[#126b3e] text-white p-5 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
                <SchoolBadge size="md" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-stone-950 uppercase tracking-wider">
                    Staff Portal
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white border border-white/30 font-mono">
                    ID: {teacher?.staffId || 'USTC/STF/001'}
                  </span>
                  {isFormMaster ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white border border-emerald-400 flex items-center gap-1">
                      ★ Form Master: {formTeacherClasses.map((c) => c.name).join(', ')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-emerald-100">
                      Subject Teacher
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {teacher?.fullName}
                </h2>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Rev. Fr. Moses Orshio Adasu University Science &amp; Technical College, Makurdi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-emerald-950/70 border border-emerald-700/80 px-3.5 py-2.5 rounded-xl text-xs text-emerald-100 self-start md:self-auto shadow-inner">
              <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <div className="font-bold text-white text-xs">
                  Academic Session: 2025/2026
                </div>
                <div className="text-[11px] text-emerald-200">
                  First Term Assessment &amp; Roster Management
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Quick Attributes */}
        <div className="p-4 sm:p-5 bg-stone-50/70 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-stone-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Staff / Portal ID</span>
            <span className="font-mono font-bold text-[#0b4d2c] text-sm mt-0.5 block">{teacher?.staffId || 'USTC/STF/001'}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-stone-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Email &amp; Phone Contact</span>
            <span className="font-semibold text-stone-800 truncate block mt-0.5">{teacher?.email || 'N/A'}</span>
            <span className="text-[11px] text-stone-500 block">{teacher?.phone || '+234 800 000 0000'}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-stone-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Classes You Teach</span>
            <span className="font-bold text-stone-800 block mt-0.5 truncate" title={availableClasses.map((c) => c.name).join(', ')}>
              {availableClasses.map((c) => c.name).join(', ') || 'Assigned by Admin'}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-stone-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Form Master Class</span>
            <span className={`block mt-0.5 font-bold ${isFormMaster ? 'text-emerald-800' : 'text-stone-500'}`}>
              {formTeacherClasses.length > 0 ? formTeacherClasses.map((c) => c.name).join(', ') : 'Not Assigned (Subject Teacher)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. THE TWO DASHBOARD BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Button 1: Teacher's Dashboard */}
        <button
          type="button"
          onClick={() => setActiveDashboard('teacher')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group shadow-xs ${
            activeDashboard === 'teacher'
              ? 'bg-[#0b4d2c] text-white border-[#083a21] ring-2 ring-emerald-500 shadow-md'
              : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition ${
                  activeDashboard === 'teacher'
                    ? 'bg-white/20 text-amber-300'
                    : 'bg-emerald-50 text-[#0b4d2c] group-hover:bg-emerald-100'
                }`}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      activeDashboard === 'teacher'
                        ? 'bg-amber-400 text-stone-950'
                        : 'bg-emerald-100 text-[#0b4d2c]'
                    }`}
                  >
                    Subject Teacher
                  </span>
                  {activeDashboard === 'teacher' && (
                    <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active View
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight mt-1">
                  Teacher&apos;s Dashboard
                </h3>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                activeDashboard === 'teacher'
                  ? 'bg-emerald-800 text-emerald-100 border border-emerald-700'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {availableClasses.length} {availableClasses.length === 1 ? 'Class' : 'Classes'} Taught
            </span>
          </div>

          <p
            className={`text-xs mt-3 leading-relaxed ${
              activeDashboard === 'teacher' ? 'text-emerald-100' : 'text-stone-500'
            }`}
          >
            Contains the list of students in each class that you teach. Select the students who offer your subject with individual checkboxes, select all students at once, and record continuous assessment marks.
          </p>
        </button>

        {/* Button 2: Form Teacher Dashboard */}
        <button
          type="button"
          onClick={() => {
            if (!isFormMaster) return;
            setActiveDashboard('form_teacher');
          }}
          disabled={!isFormMaster}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group shadow-xs ${
            !isFormMaster
              ? 'bg-stone-50 border-stone-200 cursor-not-allowed opacity-80 select-none'
              : activeDashboard === 'form_teacher'
              ? 'bg-[#0b4d2c] text-white border-[#083a21] ring-2 ring-emerald-500 shadow-md cursor-pointer'
              : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200 cursor-pointer'
          }`}
          title={
            !isFormMaster
              ? 'Access Restricted: You are not assigned as a Form Master for any class.'
              : 'Form Teacher Dashboard'
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition ${
                  !isFormMaster
                    ? 'bg-stone-200/70 text-stone-400'
                    : activeDashboard === 'form_teacher'
                    ? 'bg-white/20 text-amber-300'
                    : 'bg-emerald-50 text-[#0b4d2c] group-hover:bg-emerald-100'
                }`}
              >
                {!isFormMaster ? <Lock className="w-6 h-6" /> : <Users className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                      !isFormMaster
                        ? 'bg-stone-200 text-stone-600'
                        : activeDashboard === 'form_teacher'
                        ? 'bg-amber-400 text-stone-950'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {!isFormMaster && <Lock className="w-3 h-3 text-stone-500" />}
                    {!isFormMaster ? 'Restricted' : 'Form Master'}
                  </span>
                  {isFormMaster && activeDashboard === 'form_teacher' && (
                    <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active View
                    </span>
                  )}
                  {!isFormMaster && (
                    <span className="text-[10px] font-semibold text-stone-400">
                      Form Masters Only
                    </span>
                  )}
                </div>
                <h3
                  className={`text-base sm:text-lg font-black tracking-tight mt-1 ${
                    !isFormMaster ? 'text-stone-500' : ''
                  }`}
                >
                  Form Teacher Dashboard
                </h3>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                !isFormMaster
                  ? 'bg-stone-200 text-stone-500 border border-stone-300'
                  : activeDashboard === 'form_teacher'
                  ? 'bg-emerald-800 text-emerald-100 border border-emerald-700'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {!isFormMaster
                ? 'Locked'
                : formTeacherClasses.length > 0
                ? formTeacherClasses.map((c) => c.name).join(', ')
                : 'Not Assigned'}
            </span>
          </div>

          <p
            className={`text-xs mt-3 leading-relaxed ${
              !isFormMaster
                ? 'text-stone-400'
                : activeDashboard === 'form_teacher'
                ? 'text-emerald-100'
                : 'text-stone-500'
            }`}
          >
            {!isFormMaster
              ? 'Access Restricted: You are not assigned as a Form Master. Only designated Form Masters can access this dashboard to manage form class rosters, view student portal credentials, and monitor class broadsheets.'
              : 'Manage your designated form class student roster, view and copy student portal login credentials (Admission Number & Password), and review the form class academic broadsheet.'}
          </p>
        </button>
      </div>

      {/* 3. ACTIVE DASHBOARD CONTENT */}

      {/* === VIEW A: TEACHER'S DASHBOARD === */}
      {activeDashboard === 'teacher' && (
        <div className="space-y-6">
          {/* Class Switcher: List of Each Class That He Teaches */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#0b4d2c]" />
                    Classes That You Teach
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Click any class you teach below to load its full student roster for subject offering selection and score entry:
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hidden sm:inline-block">
                  Active Class: {selectedClass?.name}
                </span>
              </div>

              {/* Class Pills */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                {availableClasses.map((cls) => {
                  const countInClass = students.filter((s) => isStudentInClass(s, cls)).length;
                  const isSelected = cls.id === selectedClassId;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'bg-[#0b4d2c] text-white shadow-sm ring-2 ring-emerald-500'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      <span>{cls.name}</span>
                      <span className="text-[10px] font-normal opacity-75">({cls.arm})</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {countInClass} {countInClass === 1 ? 'student' : 'students'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Selector for Active Class */}
            <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Select Subject Taught in {selectedClass?.name}
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white font-medium"
                >
                  {availableSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Switch Class (Dropdown Fallback)
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white font-medium"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.arm}) — Form Master: {c.formTeacherName || 'Unassigned'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Assessment Guidelines Note */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex items-center justify-between gap-3 text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Assessment Structure:</strong> First CA (10 max), Second CA (10 max), Third CA (10 max), and Exam (70 max). Total score is automatically calculated out of 100 max.
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-amber-800 shrink-0">
              Max Total: 100
            </span>
          </div>

          {/* Subject Offering & Student Selection Control Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-700 shrink-0" />
                <h3 className="text-sm font-bold text-stone-900">
                  Subject Offering &amp; Student Selection:{' '}
                  <span className="text-[#0b4d2c]">
                    {selectedSubject?.name} ({selectedSubject?.code})
                  </span>
                </h3>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Below is the list of all students registered in <strong>{selectedClass?.name}</strong>. Tick the box beside any student who offers your subject, or click <strong>Select All Students at Once</strong> if all students in this class offer the subject.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white text-emerald-900 border border-emerald-300">
                  {enrolledInSubjectCount} of {classStudents.length} Students Offering {selectedSubject?.code}
                </span>
                {classStudents.length - enrolledInSubjectCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                    {classStudents.length - enrolledInSubjectCount} Not Offering
                  </span>
                ) : classStudents.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> All Students Offer This Subject
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
              {/* Option to select all students at once */}
              <button
                type="button"
                onClick={handleSelectAllStudentsAtOnce}
                disabled={enrollingAll || classStudents.length === 0 || allClassStudentsEnrolled}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 ${
                  allClassStudentsEnrolled && classStudents.length > 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-[#0b4d2c] hover:bg-[#083a21] text-white cursor-pointer active:scale-95'
                }`}
                title="Select all students in this class as offering this subject"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {enrollingAll
                    ? 'Selecting All...'
                    : allClassStudentsEnrolled && classStudents.length > 0
                    ? 'All Students Selected ✓'
                    : 'Select All Students at Once'}
                </span>
              </button>

              {/* Option to deselect all students */}
              {enrolledInSubjectCount > 0 && (
                <button
                  type="button"
                  onClick={handleDeselectAllStudentsAtOnce}
                  disabled={enrollingAll}
                  className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 transition flex items-center gap-1 cursor-pointer"
                  title="Deselect all students in this class for this subject"
                >
                  <UserX className="w-3.5 h-3.5 text-stone-500" />
                  <span>Deselect All</span>
                </button>
              )}

              {/* Batch Save Scores */}
              {enrolledInSubjectCount > 0 && (
                <button
                  type="button"
                  onClick={handleSaveAllScores}
                  disabled={savingAllScores}
                  className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Save marks for all selected students at once"
                >
                  <Save className="w-3.5 h-3.5" />
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
                  {classStudents.length} students in this class ({enrolledInSubjectCount} offering {selectedSubject?.code})
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200 self-start sm:self-auto">
                Admin-Enrolled Class Roster
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-3 w-40">
                      <div
                        onClick={allClassStudentsEnrolled ? handleDeselectAllStudentsAtOnce : handleSelectAllStudentsAtOnce}
                        className="flex items-center gap-1.5 cursor-pointer hover:text-[#0b4d2c] transition select-none"
                        title="Click to select/deselect all students in this class"
                      >
                        <input
                          type="checkbox"
                          checked={allClassStudentsEnrolled}
                          onChange={allClassStudentsEnrolled ? handleDeselectAllStudentsAtOnce : handleSelectAllStudentsAtOnce}
                          className="w-4 h-4 text-[#0b4d2c] border-stone-300 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Offers Subject</span>
                      </div>
                    </th>
                    <th className="py-3 px-3">Login ID (Adm No)</th>
                    <th className="py-3 px-3">Student Name</th>
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
                      <td colSpan={10} className="py-8 text-center text-stone-400">
                        No students registered in {selectedClass?.name} yet. New students are registered into classes by the School Administrator.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((std) => {
                      const isEnrolled = isStudentEnrolledInCurrentSubject(std);
                      const score = getExistingScore(std.id);
                      const total = score.ca1 + score.ca2 + score.ca3 + score.exam;

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
                          {/* Box beside student to tick and select who offers his subject */}
                          <td className="py-3 px-3">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isEnrolled}
                                onChange={() => handleToggleStudentEnrollment(std)}
                                className="w-4 h-4 text-[#0b4d2c] border-stone-300 rounded focus:ring-emerald-500 cursor-pointer"
                              />
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                                  isEnrolled
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-stone-100 text-stone-500 border-stone-200'
                                }`}
                              >
                                {isEnrolled ? 'Offers Subject ✓' : 'Not Selected'}
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

                          {/* If student offers subject: editable score fields */}
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

                              {/* Actions: Save Score */}
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleSaveStudentScore(std)}
                                  disabled={score.saving}
                                  className={`px-3 py-1 text-xs font-semibold rounded-md shadow-2xs transition ${
                                    score.saved
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-[#0b4d2c] hover:bg-[#083a21] text-white cursor-pointer'
                                  }`}
                                >
                                  {score.saving ? 'Saving...' : score.saved ? 'Saved ✓' : 'Save Score'}
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td colSpan={7} className="py-3 px-3 text-stone-400 italic">
                                <div className="flex items-center gap-2">
                                  <span>Does not offer {selectedSubject?.code} in this class —</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStudentEnrollment(std)}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0b4d2c] font-semibold rounded border border-emerald-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                    <span>Tick box to select student</span>
                                  </button>
                                </div>
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
        </div>
      )}

      {/* === VIEW B: FORM TEACHER DASHBOARD === */}
      {activeDashboard === 'form_teacher' && (
        <div className="space-y-6">
          {isFormMaster ? (
            <>
              {/* Form Class Overview Banner */}
              <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xs overflow-hidden">
                <div className="p-5 bg-emerald-50/70 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#0b4d2c] text-white uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-300" /> Form Master Privileges
                      </span>
                      <span className="text-xs font-bold text-emerald-950">
                        Designated Form Class: {formTeacherClasses.map((c) => c.name).join(', ')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mt-1.5">
                      My Form Class Student Directory &amp; Portal Credentials
                    </h3>
                    <p className="text-xs text-stone-600">
                      As the official Form Master for <strong>{formTeacherClasses.map((c) => c.name).join(', ')}</strong>, you can inspect student login credentials (Admission Number &amp; Password) and generate class broadsheet summaries.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setShowAllPasswords((prev) => !prev)}
                      className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      {showAllPasswords ? <EyeOff className="w-4 h-4 text-[#0b4d2c]" /> : <Eye className="w-4 h-4 text-[#0b4d2c]" />}
                      <span>{showAllPasswords ? 'Hide All Passwords' : 'Show All Passwords'}</span>
                    </button>
                  </div>
                </div>

                {/* Form Class Student Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-600">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Form Class</th>
                        <th className="py-3 px-4">Login Username (Admission No)</th>
                        <th className="py-3 px-4">Portal Password</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {myFormClassStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-stone-400">
                            No students registered in your form class yet. Students are added to this class by the School Administrator.
                          </td>
                        </tr>
                      ) : (
                        myFormClassStudents.map((std) => {
                          const stdPass = std.password || '0000';
                          const isPassVisible = showAllPasswords || visiblePasswords[std.id];
                          return (
                            <tr key={`form-${std.id}`} className="hover:bg-emerald-50/30 transition">
                              <td className="py-3 px-4 font-semibold text-stone-900">
                                {std.firstName} {std.lastName}
                                <span className="ml-2 text-[10px] text-stone-400 font-normal">({std.gender})</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 font-medium">
                                  {std.className}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-[#0b4d2c]">{std.admissionNo}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(std.admissionNo, `ft-adm-${std.id}`)}
                                    className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                                    title="Copy Admission Number"
                                  >
                                    {copiedId === `ft-adm-${std.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-[#0b4d2c] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                                    {isPassVisible ? stdPass : '••••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(std.id)}
                                    className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                                    title={isPassVisible ? 'Hide Password' : 'Show Password'}
                                  >
                                    {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(
                                      `Student: ${std.firstName} ${std.lastName} | Login ID: ${std.admissionNo} | Password: ${stdPass}`,
                                      `ft-full-${std.id}`
                                    )
                                  }
                                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-300 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
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
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0b4d2c] rounded border border-emerald-200 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
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

              {/* Form Class Academic Broadsheet Overview */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#0b4d2c]" />
                      Form Class Broadsheet &amp; Academic Overview
                    </h3>
                    <p className="text-xs text-stone-500">
                      Overall cumulative scores recorded for students in your form class across all subjects.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                    {myFormClassStudents.length} Students Total
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-600">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Admission No</th>
                        <th className="py-2.5 px-4">Student Name</th>
                        <th className="py-2.5 px-3 text-center">Subjects Taken</th>
                        <th className="py-2.5 px-3 text-center">Total Marks</th>
                        <th className="py-2.5 px-3 text-center">Average (%)</th>
                        <th className="py-2.5 px-4 text-center">Academic Standing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {myFormClassStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-stone-400">
                            No students in this form class.
                          </td>
                        </tr>
                      ) : (
                        myFormClassStudents.map((std) => {
                          const stdResult = results.find((r) => r.studentId === std.id);
                          const subjectList = stdResult?.subjects || [];
                          const totalMarks = subjectList.reduce(
                            (acc, s) => acc + (s.ca1 || 0) + (s.ca2 || 0) + (s.ca3 || 0) + (s.exam || 0),
                            0
                          );
                          const avg = subjectList.length > 0 ? Math.round(totalMarks / subjectList.length) : 0;
                          let standing = 'Pending Marks';
                          let standingColor = 'bg-stone-100 text-stone-600';
                          if (subjectList.length > 0) {
                            if (avg >= 75) {
                              standing = 'Distinction (A)';
                              standingColor = 'bg-emerald-100 text-emerald-800';
                            } else if (avg >= 65) {
                              standing = 'Upper Credit (B)';
                              standingColor = 'bg-blue-100 text-blue-800';
                            } else if (avg >= 50) {
                              standing = 'Credit (C)';
                              standingColor = 'bg-amber-100 text-amber-800';
                            } else {
                              standing = 'Pass / Needs Support';
                              standingColor = 'bg-red-100 text-red-800';
                            }
                          }

                          return (
                            <tr key={`bs-${std.id}`} className="hover:bg-stone-50">
                              <td className="py-2.5 px-4 font-mono font-bold text-[#0b4d2c]">
                                {std.admissionNo}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-stone-800">
                                {std.firstName} {std.lastName}
                              </td>
                              <td className="py-2.5 px-3 text-center font-medium">
                                {subjectList.length}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-stone-900">
                                {totalMarks}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-[#0b4d2c]">
                                {subjectList.length > 0 ? `${avg}%` : '—'}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${standingColor}`}>
                                  {standing}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Strict Access Denied Screen */
            <div className="bg-white rounded-3xl border border-red-200 p-8 sm:p-10 shadow-sm text-center max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800">
                  Access Restricted
                </span>
                <h3 className="text-xl font-bold text-stone-900">
                  Access Denied: Form Teacher Dashboard
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
                  You are currently logged in as a <strong>Subject Teacher</strong>. Since you are not a designated Form Teacher, you are not authorized to access the Form Teacher Dashboard.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 text-left space-y-2">
                <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0b4d2c]" />
                  <span>Administrative Role Restriction</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Only teachers designated as official Form Masters by the School Administrator in the Admin Operations panel can view student portal passwords and class broadsheet directories.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveDashboard('teacher')}
                className="px-6 py-2.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
              >
                Return to Teacher&apos;s Dashboard
              </button>
            </div>
          )}
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
                type="button"
                onClick={() => setEditingPasswordStudent(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
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
                  className="px-3 py-1.5 text-stone-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudentPass}
                  className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {savingStudentPass ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
