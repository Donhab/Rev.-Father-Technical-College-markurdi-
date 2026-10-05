import React, { useState, useEffect } from 'react';
import {
  SchoolClass,
  Subject,
  Staff,
  Student,
  TeachingAssignment,
  SchoolSettings,
  SchoolNews
} from '../types/school';
import { isStudentInClass } from '../utils/studentUtils';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { PostSchoolNewsForm } from './PostSchoolNewsForm';
import { SchoolBadge, SchoolBadgeUploaderCard } from './SchoolBadge';
import { HeroSliderManagerCard } from './ModernHeroSlider';
import { getNewsImages, getNewsVideos } from '../utils/newsMediaUtils';
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  UserPlus,
  Users,
  Search,
  Plus,
  Layers,
  Settings,
  Link,
  Trash2,
  Edit2,
  Check,
  Newspaper,
  Calendar,
  Send,
  Eye,
  EyeOff,
  Copy,
  Key,
  Image as ImageIcon,
  Video,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPanelProps {
  classes: SchoolClass[];
  subjects: Subject[];
  staff: Staff[];
  students?: Student[];
  assignments: TeachingAssignment[];
  settings: SchoolSettings | null;
  news?: SchoolNews[];
  initialSubTab?: 'teachers' | 'classes' | 'subjects' | 'students' | 'allocations' | 'news' | 'settings';
  onAddStaff: (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Staff>;
  onUpdateStaff?: (id: string, updates: Partial<Staff>) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  onAddClass: (data: Omit<SchoolClass, 'id'>) => Promise<void>;
  onUpdateClass?: (id: string, updates: Partial<SchoolClass>) => Promise<void>;
  onDeleteClass?: (id: string) => Promise<void>;
  onAddSubject: (data: Omit<Subject, 'id'>) => Promise<void>;
  onUpdateSubject?: (id: string, updates: Partial<Subject>) => Promise<void>;
  onDeleteSubject?: (id: string) => Promise<void>;
  onAddStudent?: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Student>;
  onUpdateStudent?: (id: string, updates: Partial<Student>) => Promise<void>;
  onDeleteStudent?: (id: string) => Promise<void>;
  onAssignAllSubjectsToAllClasses: () => Promise<void>;
  onAssignSubjectToTeacher: (
    teacherId: string,
    subjectId: string,
    classId: string,
    periods: number
  ) => Promise<void>;
  onDeleteAssignment: (id: string) => Promise<void>;
  onUpdateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
  onPostNews?: (data: Omit<SchoolNews, 'id' | 'publishedAt'>) => Promise<SchoolNews>;
  onUpdateNews?: (id: string, updates: Partial<SchoolNews>) => Promise<void>;
  onDeleteNews?: (id: string) => Promise<void>;
  onNavigateToPublicNews?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  classes,
  subjects,
  staff,
  students = [],
  assignments,
  settings,
  news = [],
  initialSubTab = 'teachers',
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAssignAllSubjectsToAllClasses,
  onAssignSubjectToTeacher,
  onDeleteAssignment,
  onUpdateSettings,
  onPostNews,
  onUpdateNews,
  onDeleteNews,
  onNavigateToPublicNews
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'teachers' | 'classes' | 'subjects' | 'students' | 'allocations' | 'news' | 'settings'
  >(initialSubTab);

  // Ensure clicking "Post School News" in Navbar switches sub-tab immediately even when AdminPanel is already mounted
  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // Teacher registration / edit form
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Staff | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('0000');
  const [isFormTeacher, setIsFormTeacher] = useState(false);
  const [formTeacherClassId, setFormTeacherClassId] = useState(classes[0]?.id || '');
  const [submittingTeacher, setSubmittingTeacher] = useState(false);

  // Class creation / edit form
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [className, setClassName] = useState('');
  const [classArm, setClassArm] = useState('Tech');
  const [designatedFormTeacher, setDesignatedFormTeacher] = useState('');

  // Subject creation / edit form
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subCode, setSubCode] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [subCategory, setSubCategory] = useState<Subject['category']>('Technical / Vocational');

  // Student creation / edit form
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [stdFirstName, setStdFirstName] = useState('');
  const [stdLastName, setStdLastName] = useState('');
  const [stdGender, setStdGender] = useState<'Male' | 'Female'>('Male');
  const [stdClassId, setStdClassId] = useState(classes[0]?.id || '');
  const [stdGuardianName, setStdGuardianName] = useState('');
  const [stdGuardianPhone, setStdGuardianPhone] = useState('');
  const [stdPassword, setStdPassword] = useState('0000');
  const [submittingStudent, setSubmittingStudent] = useState(false);
  const [studentClassFilter, setStudentClassFilter] = useState<string>('All');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [viewingClassRoster, setViewingClassRoster] = useState<SchoolClass | null>(null);

  useEffect(() => {
    if (!stdClassId && classes.length > 0) {
      setStdClassId(classes[0].id);
    }
  }, [classes, stdClassId]);

  // Login credentials visibility & copy state
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [showAllTeacherPasswords, setShowAllTeacherPasswords] = useState(false);
  const [showAllStudentPasswords, setShowAllStudentPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Allocation form (Assign subject to teacher)
  const [allocTeacherId, setAllocTeacherId] = useState(staff[0]?.id || '');
  const [allocSubjectId, setAllocSubjectId] = useState(subjects[0]?.id || '');
  const [allocClassId, setAllocClassId] = useState(classes[0]?.id || '');
  const [allocPeriods, setAllocPeriods] = useState(4);
  const [allocating, setAllocating] = useState(false);
  const [bulkAssigning, setBulkAssigning] = useState(false);

  // Settings form
  const [schoolName, setSchoolName] = useState(
    settings?.schoolName && !/garki|gstc/i.test(settings.schoolName)
      ? settings.schoolName
      : 'Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi'
  );
  const [motto, setMotto] = useState(
    settings?.motto && !/knowledge,\s*skill/i.test(settings.motto)
      ? settings.motto
      : 'Scientia Liberatio Populorum'
  );
  const [session, setSession] = useState(settings?.session || '2025/2026');
  const [term, setTerm] = useState(settings?.term || 'First Term');
  const [savedSettings, setSavedSettings] = useState(false);

  // News posting & editing form
  const [editingNewsItem, setEditingNewsItem] = useState<SchoolNews | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<SchoolNews['category']>('General');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsAuthorName, setNewsAuthorName] = useState('Dr. Terhemba Iorpuu (Academic Records)');
  const [newsAuthorRole, setNewsAuthorRole] = useState('School Administration');
  const [postingNews, setPostingNews] = useState(false);
  const [postedSuccess, setPostedSuccess] = useState(false);

  // Pending delete confirmation state
  const [pendingDelete, setPendingDelete] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // --- News / Posts Handlers ---
  const handleStartEditNews = (item: SchoolNews) => {
    setEditingNewsItem(item);
    setNewsTitle(item.title);
    setNewsCategory(item.category);
    setNewsSummary(item.summary || '');
    setNewsContent(item.content);
    setNewsAuthorName(item.authorName);
    setNewsAuthorRole(item.authorRole);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditNews = () => {
    setEditingNewsItem(null);
    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
  };

  const handlePostNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingNews(true);
    try {
      if (editingNewsItem && onUpdateNews) {
        await onUpdateNews(editingNewsItem.id, {
          title: newsTitle,
          category: newsCategory,
          summary: newsSummary,
          content: newsContent,
          authorName: newsAuthorName || 'School Administration',
          authorRole: newsAuthorRole || 'Admin'
        });
        setEditingNewsItem(null);
      } else if (onPostNews) {
        await onPostNews({
          title: newsTitle,
          category: newsCategory,
          summary: newsSummary,
          content: newsContent,
          authorName: newsAuthorName || 'School Administration',
          authorRole: newsAuthorRole || 'Admin'
        });
      }
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setPostedSuccess(true);
      confetti({ particleCount: 35 });
      setTimeout(() => setPostedSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error publishing news:', err);
    } finally {
      setPostingNews(false);
    }
  };

  // --- Teacher Handlers ---
  const openAddTeacherModal = () => {
    setEditingTeacher(null);
    setTeacherName('');
    setTeacherEmail('');
    setTeacherPhone('');
    setTeacherPassword('0000');
    setIsFormTeacher(false);
    setFormTeacherClassId(classes[0]?.id || '');
    setShowTeacherModal(true);
  };

  const openEditTeacherModal = (stf: Staff) => {
    setEditingTeacher(stf);
    setTeacherName(stf.fullName);
    setTeacherEmail(stf.email);
    setTeacherPhone(stf.phone);
    setTeacherPassword(stf.password || '0000');
    setIsFormTeacher(Boolean(stf.isFormTeacher));
    setFormTeacherClassId(stf.formTeacherClassId || classes[0]?.id || '');
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTeacher(true);
    try {
      const selectedClass = classes.find((c) => c.id === formTeacherClassId);

      if (editingTeacher && onUpdateStaff) {
        await onUpdateStaff(editingTeacher.id, {
          fullName: teacherName,
          email: teacherEmail || editingTeacher.email,
          phone: teacherPhone || editingTeacher.phone,
          password: teacherPassword.trim() || '0000',
          role: isFormTeacher ? 'Form Master' : 'Teacher',
          assignedClasses:
            isFormTeacher && selectedClass
              ? Array.from(new Set([...(editingTeacher.assignedClasses || []), selectedClass.name]))
              : editingTeacher.assignedClasses || ['CCS 1'],
          isFormTeacher,
          formTeacherClassId: isFormTeacher ? formTeacherClassId : '',
          formTeacherClassName: isFormTeacher && selectedClass ? selectedClass.name : ''
        });
      } else {
        const staffNum = (staff.length + 1).toString().padStart(3, '0');
        const staffId = `USTC/STF/${staffNum}`;

        await onAddStaff({
          staffId,
          password: teacherPassword.trim() || '0000',
          fullName: teacherName,
          email:
            teacherEmail ||
            `${teacherName.toLowerCase().replace(/\s+/g, '.')}@ustcmakurdi.edu.ng`,
          phone: teacherPhone || '+234 803 000 0000',
          role: isFormTeacher ? 'Form Master' : 'Teacher',
          assignedClasses: isFormTeacher && selectedClass ? [selectedClass.name] : ['CCS 1'],
          subjects: ['Computer Craft Studies'],
          isFormTeacher,
          formTeacherClassId: isFormTeacher ? formTeacherClassId : undefined,
          formTeacherClassName: isFormTeacher && selectedClass ? selectedClass.name : undefined,
          status: 'Active'
        });
      }

      confetti({ particleCount: 40 });
      setEditingTeacher(null);
      setTeacherName('');
      setTeacherEmail('');
      setTeacherPhone('');
      setTeacherPassword('0000');
      setIsFormTeacher(false);
      setShowTeacherModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTeacher(false);
    }
  };

  // --- Class Handlers ---
  const openAddClassModal = () => {
    setEditingClass(null);
    setClassName('');
    setClassArm('Tech');
    setDesignatedFormTeacher('');
    setShowClassModal(true);
  };

  const openEditClassModal = (cls: SchoolClass) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setClassArm(cls.arm);
    setDesignatedFormTeacher(cls.formTeacherName || '');
    setShowClassModal(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass && onUpdateClass) {
      await onUpdateClass(editingClass.id, {
        name: className,
        arm: classArm,
        level: className,
        formTeacherName: designatedFormTeacher || 'Unassigned'
      });
    } else {
      await onAddClass({
        name: className,
        arm: classArm,
        level: className,
        formTeacherName: designatedFormTeacher || 'Unassigned'
      });
    }
    confetti({ particleCount: 30 });
    setEditingClass(null);
    setClassName('');
    setDesignatedFormTeacher('');
    setShowClassModal(false);
  };

  // --- Subject Handlers ---
  const openAddSubjectModal = () => {
    setEditingSubject(null);
    setSubCode('');
    setSubTitle('');
    setSubCategory('Technical / Vocational');
    setShowSubjectModal(true);
  };

  const openEditSubjectModal = (sub: Subject) => {
    setEditingSubject(sub);
    setSubCode(sub.code);
    setSubTitle(sub.name);
    setSubCategory(sub.category);
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject && onUpdateSubject) {
      await onUpdateSubject(editingSubject.id, {
        code: subCode.toUpperCase(),
        name: subTitle,
        category: subCategory
      });
    } else {
      await onAddSubject({
        code: subCode.toUpperCase(),
        name: subTitle,
        category: subCategory,
        classesOffered: classes.map((c) => c.name)
      });
    }
    confetti({ particleCount: 30 });
    setEditingSubject(null);
    setSubCode('');
    setSubTitle('');
    setShowSubjectModal(false);
  };

  // --- Student Handlers ---
  const openAddStudentModal = () => {
    setEditingStudent(null);
    setStdFirstName('');
    setStdLastName('');
    setStdGender('Male');
    const activeClassId =
      studentClassFilter !== 'All'
        ? classes.find((c) => c.id === studentClassFilter || c.name === studentClassFilter)?.id || classes[0]?.id || ''
        : classes[0]?.id || '';
    setStdClassId(activeClassId);
    setStdGuardianName('');
    setStdGuardianPhone('');
    setStdPassword('0000');
    setShowStudentModal(true);
  };

  const openEditStudentModal = (std: Student) => {
    setEditingStudent(std);
    setStdFirstName(std.firstName);
    setStdLastName(std.lastName);
    setStdGender(std.gender);
    setStdClassId(
      std.classId || classes.find((c) => c.name === std.className)?.id || classes[0]?.id || ''
    );
    setStdGuardianName(std.guardianName || '');
    setStdGuardianPhone(std.guardianPhone || '');
    setStdPassword(std.password || '0000');
    setShowStudentModal(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStudent(true);
    try {
      const chosenClass = classes.find((c) => c.id === stdClassId) || classes[0];
      if (editingStudent && onUpdateStudent) {
        await onUpdateStudent(editingStudent.id, {
          firstName: stdFirstName,
          lastName: stdLastName,
          gender: stdGender,
          classId: chosenClass?.id || editingStudent.classId,
          className: chosenClass?.name || editingStudent.className,
          guardianName: stdGuardianName || 'Guardian',
          guardianPhone: stdGuardianPhone || '+234 800 000 0000',
          password: stdPassword.trim() || '0000'
        });
      } else if (onAddStudent) {
        const admissionIndex = (students.length + 1).toString().padStart(3, '0');
        const admissionNo = `USTC/2026/${admissionIndex}`;
        await onAddStudent({
          admissionNo,
          password: stdPassword.trim() || '0000',
          firstName: stdFirstName,
          lastName: stdLastName,
          gender: stdGender,
          classId: chosenClass?.id || 'class-ccs1',
          className: chosenClass?.name || 'CCS 1',
          term: 'First Term',
          session: '2025/2026',
          guardianName: stdGuardianName || 'Guardian',
          guardianPhone: stdGuardianPhone || '+234 800 000 0000',
          status: 'Active'
        });
      }
      confetti({ particleCount: 40 });
      setEditingStudent(null);
      setStdFirstName('');
      setStdLastName('');
      setStdGuardianName('');
      setStdGuardianPhone('');
      setStdPassword('0000');
      setShowStudentModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingStudent(false);
    }
  };

  const handleBulkAssignAllSubjects = async () => {
    setBulkAssigning(true);
    try {
      await onAssignAllSubjectsToAllClasses();
      confetti({ particleCount: 50, spread: 80 });
    } catch (err) {
      console.error(err);
    } finally {
      setBulkAssigning(false);
    }
  };

  const handleAssignSubjectToTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllocating(true);
    try {
      await onAssignSubjectToTeacher(allocTeacherId, allocSubjectId, allocClassId, allocPeriods);
      confetti({ particleCount: 30 });
    } catch (err) {
      console.error(err);
    } finally {
      setAllocating(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      schoolName,
      motto,
      session,
      term,
      ca1Max: 10,
      ca2Max: 10,
      ca3Max: 10,
      examMax: 70
    });
    setSavedSettings(true);
    confetti({ particleCount: 30 });
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel Header Banner */}
      <div className="bg-[#0b4d2c] text-white p-5 rounded-2xl shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SchoolBadge size="md" className="shadow-sm" />
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-stone-900 uppercase tracking-wider">
              Admin Panel
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Academic Operations &amp; Curriculum Control
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              Add, edit, and remove teachers, classes, subjects, students, subject allocations, and published news posts.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setEditingNewsItem(null);
              setActiveSubTab('news');
            }}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#0b4d2c] text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Newspaper className="w-4 h-4 text-[#0b4d2c]" />
            <span>Post School News</span>
          </button>

          <button
            type="button"
            onClick={handleBulkAssignAllSubjects}
            disabled={bulkAssigning}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-stone-900" />
            <span>{bulkAssigning ? 'Linking Subjects...' : 'Assign All Subjects to All Classes'}</span>
          </button>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex border-b border-stone-200 bg-white px-4 rounded-xl border space-x-1 sm:space-x-3 overflow-x-auto text-xs">
        {[
          { id: 'teachers', label: `Teachers (${staff.length})`, icon: UserCheck },
          { id: 'classes', label: `Classes (${classes.length})`, icon: GraduationCap },
          { id: 'subjects', label: `Subjects (${subjects.length})`, icon: BookOpen },
          { id: 'students', label: `Students (${students.length})`, icon: Users },
          { id: 'allocations', label: `Subject Allocations (${assignments.length})`, icon: Link },
          { id: 'news', label: `Posts / News (${news.length})`, icon: Newspaper },
          { id: 'settings', label: 'School Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'border-[#0b4d2c] text-[#0b4d2c] font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TEACHERS MANAGEMENT (Add / Edit / Remove) */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Registered Teaching Faculty &amp; Login Details</h3>
              <p className="text-xs text-stone-500">
                Add, edit, or remove teachers, view/copy their login credentials, and allocate form master roles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllTeacherPasswords((prev) => !prev)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 flex items-center gap-1.5"
              >
                {showAllTeacherPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAllTeacherPasswords ? 'Hide Passwords' : 'Show All Passwords'}</span>
              </button>
              <button
                onClick={openAddTeacherModal}
                className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Teacher
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((stf) => {
              const teacherPass = stf.password || '0000';
              const isPassVisible = showAllTeacherPasswords || visiblePasswords[stf.id];
              return (
              <div
                key={stf.id}
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {stf.staffId}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 mt-1">{stf.fullName}</h4>
                    <span className="text-xs text-stone-500 block">{stf.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditTeacherModal(stf)}
                      className="text-stone-400 hover:text-[#0b4d2c] p-1 transition cursor-pointer"
                      title="Edit teacher account"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingDelete({
                          title: 'Remove Teacher Account',
                          message: `Are you sure you want to permanently remove teacher "${stf.fullName}" (${stf.staffId}) from the school registry?`,
                          confirmLabel: 'Yes, Remove Teacher',
                          onConfirm: async () => {
                            await onDeleteStaff(stf.id);
                            setPendingDelete(null);
                          }
                        })
                      }
                      className="text-stone-400 hover:text-red-600 p-1 transition cursor-pointer"
                      title="Delete teacher account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Teacher Login Details Box */}
                <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                      <Key className="w-3 h-3 text-emerald-700" /> Teacher Login Details
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`Login ID: ${stf.staffId} | Password: ${teacherPass}`, `stf-${stf.id}`)}
                      className="text-[10px] font-semibold text-[#0b4d2c] hover:underline flex items-center gap-1"
                    >
                      {copiedId === `stf-${stf.id}` ? (
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
                    <span className="text-stone-500">Login ID / Staff No:</span>
                    <span className="font-mono font-bold text-stone-900">{stf.staffId}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Password:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#0b4d2c] bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {isPassVisible ? teacherPass : '••••••••'}
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

                <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5 text-xs">
                  {stf.isFormTeacher && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      ★ Form Master: {stf.formTeacherClassName || 'Class'}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700">
                    Classes: {stf.assignedClasses?.join(', ') || 'CCS 1'}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CLASSES MANAGEMENT (Add / Edit / Remove) */}
      {activeSubTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Academic Classes &amp; Arms</h3>
              <p className="text-xs text-stone-500">
                Add, edit, or remove school classes and designated form masters
              </p>
            </div>
            <button
              onClick={openAddClassModal}
              className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Class
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const clsStudents = students.filter((s) => isStudentInClass(s, cls));
              return (
              <div
                key={cls.id}
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0b4d2c] flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 rounded text-stone-600">
                        Arm: {cls.arm}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditClassModal(cls)}
                        className="text-stone-400 hover:text-[#0b4d2c] p-1 transition cursor-pointer"
                        title="Edit class"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteClass && (
                        <button
                          type="button"
                          onClick={() =>
                            setPendingDelete({
                              title: 'Remove Class',
                              message: `Are you sure you want to permanently remove class "${cls.name}" (${cls.arm})?`,
                              confirmLabel: 'Yes, Remove Class',
                              onConfirm: async () => {
                                await onDeleteClass(cls.id);
                                setPendingDelete(null);
                              }
                            })
                          }
                          className="text-stone-400 hover:text-red-600 p-1 transition cursor-pointer"
                          title="Delete class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 mt-2">{cls.name}</h4>
                  <p className="text-xs text-stone-500">
                    Form Teacher:{' '}
                    <strong className="text-stone-800">{cls.formTeacherName || 'Unassigned'}</strong>
                  </p>
                  <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                    Assigned Subjects:{' '}
                    <span className="text-stone-700 font-semibold">
                      {cls.assignedSubjectIds?.length || subjects.length} subjects
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{clsStudents.length} {clsStudents.length === 1 ? 'Student' : 'Students'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingClassRoster(cls)}
                    className="text-xs font-bold text-[#0b4d2c] hover:underline cursor-pointer"
                  >
                    View Roster →
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          {/* Modal: View Class Roster */}
          {viewingClassRoster && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      {viewingClassRoster.name} — Student Roster
                    </h3>
                    <p className="text-xs text-stone-500">
                      Department: {viewingClassRoster.arm} • Form Teacher: {viewingClassRoster.formTeacherName || 'Unassigned'}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingClassRoster(null)}
                    className="p-1 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 max-h-80 overflow-y-auto">
                  {(() => {
                    const roster = students.filter((s) => isStudentInClass(s, viewingClassRoster));
                    if (roster.length === 0) {
                      return (
                        <p className="py-8 text-center text-xs text-stone-400">
                          No students registered in {viewingClassRoster.name} yet. Click &quot;Add Student&quot; to enroll learners.
                        </p>
                      );
                    }
                    return (
                      <table className="w-full text-left text-xs text-stone-600">
                        <thead className="bg-stone-50 text-stone-700 uppercase text-[10px] font-semibold sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Adm No</th>
                            <th className="py-2 px-3">Student Name</th>
                            <th className="py-2 px-3">Gender</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {roster.map((s) => (
                            <tr key={s.id} className="hover:bg-emerald-50/30">
                              <td className="py-2 px-3 font-mono font-bold text-[#0b4d2c]">
                                {s.admissionNo}
                              </td>
                              <td className="py-2 px-3 font-medium text-stone-900">
                                {s.firstName} {s.lastName}
                              </td>
                              <td className="py-2 px-3 text-stone-500">{s.gender}</td>
                              <td className="py-2 px-3">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {s.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setViewingClassRoster(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBJECTS MANAGEMENT (Add / Edit / Remove) */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Curriculum Subjects</h3>
              <p className="text-xs text-stone-500">
                Add, edit, or remove core and vocational subjects
              </p>
            </div>
            <button
              onClick={openAddSubjectModal}
              className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Subject
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0b4d2c] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {sub.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                      {sub.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditSubjectModal(sub)}
                      className="text-stone-400 hover:text-[#0b4d2c] p-1 transition cursor-pointer"
                      title="Edit subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteSubject && (
                      <button
                        type="button"
                        onClick={() =>
                          setPendingDelete({
                            title: 'Remove Subject',
                            message: `Are you sure you want to permanently remove subject "${sub.name}" (${sub.code})?`,
                            confirmLabel: 'Yes, Remove Subject',
                            onConfirm: async () => {
                              await onDeleteSubject(sub.id);
                              setPendingDelete(null);
                            }
                          })
                        }
                        className="text-stone-400 hover:text-red-600 p-1 transition cursor-pointer"
                        title="Delete subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-stone-900">{sub.name}</h4>
                <p className="text-xs text-stone-400">
                  Offered in: {sub.classesOffered?.join(', ') || 'All classes'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENTS MANAGEMENT (Add / Edit / Remove) */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Enrolled Students &amp; Login Details ({students.length})
              </h3>
              <p className="text-xs text-stone-500">
                Add, edit, or remove student records and view/copy student login credentials across school classes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllStudentPasswords((prev) => !prev)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 flex items-center gap-1.5"
              >
                {showAllStudentPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAllStudentPasswords ? 'Hide Passwords' : 'Show All Passwords'}</span>
              </button>
              <button
                onClick={openAddStudentModal}
                className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Add Student
              </button>
            </div>
          </div>

          {/* Filter and Search Bar for Students */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                placeholder="Search students by name or admission number..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>
            <div>
              <select
                value={studentClassFilter}
                onChange={(e) => setStudentClassFilter(e.target.value)}
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

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Login ID (Admission No)</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Login Password</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(() => {
                    const filtered = students.filter((s) => {
                      const matchesSearch =
                        s.firstName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                        s.lastName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                        s.admissionNo.toLowerCase().includes(studentSearchTerm.toLowerCase());
                      const matchesClass =
                        studentClassFilter === 'All' || isStudentInClass(s, studentClassFilter);
                      return matchesSearch && matchesClass;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-stone-400">
                            No students found matching your criteria.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((std) => {
                      const stdPass = std.password || '0000';
                      const isPassVisible = showAllStudentPasswords || visiblePasswords[std.id];
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
                      <td className="py-3 px-4 font-semibold text-stone-900">
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
                        <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 font-medium">
                          {std.className}
                        </span>
                      </td>
                      <td className="py-3 px-4">{std.gender}</td>
                      <td className="py-3 px-4 text-stone-500">
                        <div>{std.guardianName || '—'}</div>
                        <div className="text-[10px] font-mono text-stone-400">{std.guardianPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditStudentModal(std)}
                          className="text-stone-400 hover:text-[#0b4d2c] p-1 transition cursor-pointer"
                          title="Edit student"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        {onDeleteStudent && (
                          <button
                            type="button"
                            onClick={() =>
                              setPendingDelete({
                                title: 'Remove Student Record',
                                message: `Are you sure you want to permanently remove student "${std.firstName} ${std.lastName}" (${std.admissionNo})?`,
                                confirmLabel: 'Yes, Remove Student',
                                onConfirm: async () => {
                                  await onDeleteStudent(std.id);
                                  setPendingDelete(null);
                                }
                              })
                            }
                            className="text-stone-400 hover:text-red-600 p-1 transition cursor-pointer"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                    );
                  });
                })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUBJECT ALLOCATIONS (Assign a subject to a teacher) */}
      {activeSubTab === 'allocations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Form */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-emerald-700" />
                Assign Subject to Teacher
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Allocate a specific subject and class to a faculty member
              </p>
            </div>

            <form onSubmit={handleAssignSubjectToTeacherSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Teacher</label>
                <select
                  value={allocTeacherId}
                  onChange={(e) => setAllocTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.staffId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Subject</label>
                <select
                  value={allocSubjectId}
                  onChange={(e) => setAllocSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Class</label>
                <select
                  value={allocClassId}
                  onChange={(e) => setAllocClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.arm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Weekly Periods</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={allocPeriods}
                  onChange={(e) => setAllocPeriods(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={allocating}
                className="w-full py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
              >
                <Link className="w-3.5 h-3.5" />
                <span>{allocating ? 'Assigning...' : 'Assign to Teacher'}</span>
              </button>
            </form>
          </div>

          {/* Assignments Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-stone-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Active Teaching Allocations ({assignments.length})
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-700 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Teacher</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Periods</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {assignments.map((asg) => (
                    <tr key={asg.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-bold text-stone-900">{asg.subjectName}</td>
                      <td className="py-2.5 px-3 text-emerald-800 font-semibold">{asg.teacherName}</td>
                      <td className="py-2.5 px-3 font-medium text-stone-700">{asg.className}</td>
                      <td className="py-2.5 px-3 text-stone-500">{asg.periodsPerWeek} / wk</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setPendingDelete({
                              title: 'Remove Subject Allocation',
                              message: `Are you sure you want to remove the allocation of "${asg.subjectName}" (${asg.className}) from ${asg.teacherName}?`,
                              confirmLabel: 'Yes, Remove Allocation',
                              onConfirm: async () => {
                                await onDeleteAssignment(asg.id);
                                setPendingDelete(null);
                              }
                            })
                          }
                          className="text-stone-400 hover:text-red-600 cursor-pointer"
                          title="Remove subject allocation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="max-w-2xl bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-700" />
              School Configuration &amp; Grading Parameters
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Enforce CA marks limits (10 max each) and examination limits (70 max).
            </p>
          </div>

          <SchoolBadgeUploaderCard compact />

          <HeroSliderManagerCard compact />

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Official School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Motto</label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Current Academic Session</label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Active Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
            </div>

            {/* Assessment Structure Specifications */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <span className="font-bold text-[#0b4d2c] block text-xs">
                Continuous Assessment Breakdown (Institutional Policy):
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-stone-500 block">First CA</span>
                  <strong className="text-emerald-800 text-sm">10 Marks</strong>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-stone-500 block">Second CA</span>
                  <strong className="text-emerald-800 text-sm">10 Marks</strong>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-stone-500 block">Third CA</span>
                  <strong className="text-emerald-800 text-sm">10 Marks</strong>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-stone-500 block">Exam</span>
                  <strong className="text-emerald-800 text-sm">70 Marks</strong>
                </div>
              </div>
              <p className="text-[11px] text-emerald-900 mt-1">
                Total aggregate score is strictly computed to 100 marks maximum.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSettings && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Settings updated
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold rounded-lg shadow-sm"
              >
                Save School Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 7: POST / EDIT / DELETE NEWS FOR VISITORS */}
      {activeSubTab === 'news' && (
        <div className="space-y-6">
          <PostSchoolNewsForm
            editingItem={editingNewsItem}
            onCancelEdit={() => setEditingNewsItem(null)}
            onPostNews={onPostNews}
            onUpdateNews={onUpdateNews}
            onViewPublishedNews={onNavigateToPublicNews}
          />

          {/* List of Published News */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-bold text-xs text-stone-800 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-emerald-700" />
                <span>Live Published News Articles ({news.length})</span>
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-stone-500">
                  Visible on Landing Page &amp; School News
                </span>
                {onNavigateToPublicNews && (
                  <button
                    type="button"
                    onClick={onNavigateToPublicNews}
                    className="px-2.5 py-1 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-[11px] font-bold rounded-md flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>View School News Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {news.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No news articles published yet. Use the form above to post news with images and videos for visitors to see.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {news.map((item) => {
                  const imgs = getNewsImages(item);
                  const vids = getNewsVideos(item);
                  return (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-stone-50/80 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-3.5 max-w-3xl">
                        {imgs.length > 0 && (
                          <img
                            src={imgs[0].url}
                            alt={item.title}
                            className="w-24 h-16 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-100"
                          />
                        )}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-emerald-800">
                              {item.category}
                            </span>
                            <span aria-hidden="true" className="text-stone-300">·</span>
                            <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-stone-400" />
                              {new Date(item.publishedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            {imgs.length > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                <span>{imgs.length} {imgs.length === 1 ? 'Image' : 'Images'}</span>
                              </span>
                            )}
                            {vids.length > 0 && (
                              <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                <span>{vids.length} {vids.length === 1 ? 'Video' : 'Videos'}</span>
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-sm text-stone-900 leading-snug">{item.title}</h5>
                          <p className="text-stone-600 line-clamp-2 leading-relaxed">
                            {item.summary || item.content}
                          </p>
                          <p className="text-[11px] text-stone-400">
                            Published by <span className="font-medium text-stone-600">{item.authorName}</span> (
                            {item.authorRole})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditNews(item)}
                          className="px-2.5 py-1.5 text-xs text-[#0b4d2c] hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 flex items-center gap-1 transition cursor-pointer"
                          title="Edit news article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Post</span>
                        </button>
                        {onDeleteNews && (
                          <button
                            type="button"
                            onClick={() =>
                              setPendingDelete({
                                title: 'Delete Published News Article',
                                message: `Are you sure you want to permanently delete the news article "${item.title}" from the website?`,
                                confirmLabel: 'Yes, Delete Article',
                                onConfirm: async () => {
                                  await onDeleteNews(item.id);
                                  setPendingDelete(null);
                                }
                              })
                            }
                            className="px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 flex items-center gap-1 transition cursor-pointer"
                            title="Delete news article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete News</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Teacher */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                {editingTeacher ? `Edit Teacher • ${editingTeacher.staffId}` : 'Register Teacher Member'}
              </h3>
              <button
                onClick={() => {
                  setShowTeacherModal(false);
                  setEditingTeacher(null);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3 mt-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name &amp; Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Danjuma Bello"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  placeholder="teacher@ustcmakurdi.edu.ng"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+234 803 000 0000"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Teacher Portal Login Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Default: 0000"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-emerald-50/40"
                />
              </div>

              {/* Designated Form Teacher Switch */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">Designate as Form Master?</span>
                  <input
                    type="checkbox"
                    checked={isFormTeacher}
                    onChange={(e) => setIsFormTeacher(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600"
                  />
                </div>
                {isFormTeacher && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Assigned Form Class
                    </label>
                    <select
                      value={formTeacherClassId}
                      onChange={(e) => setFormTeacherClassId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.arm})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTeacherModal(false);
                    setEditingTeacher(null);
                  }}
                  className="px-3 py-1.5 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTeacher}
                  className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg shadow-sm"
                >
                  {submittingTeacher
                    ? 'Saving...'
                    : editingTeacher
                    ? 'Update Teacher'
                    : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Class */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-sm text-stone-900 mb-3">
              {editingClass ? 'Edit Class' : 'Create Class'}
            </h3>
            <form onSubmit={handleSaveClass} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical 1, SS 1 Tech"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Arm / Stream</label>
                <input
                  type="text"
                  placeholder="Vocational, Technical, Commercial"
                  value={classArm}
                  onChange={(e) => setClassArm(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Form Master</label>
                <input
                  type="text"
                  placeholder="e.g. Engr. Danjuma Bello"
                  value={designatedFormTeacher}
                  onChange={(e) => setDesignatedFormTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowClassModal(false);
                    setEditingClass(null);
                  }}
                  className="px-3 py-1.5 text-stone-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg">
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Subject */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-sm text-stone-900 mb-3">
              {editingSubject ? 'Edit Subject' : 'Create Subject'}
            </h3>
            <form onSubmit={handleSaveSubject} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ELE101"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Installation"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={subCategory}
                  onChange={(e: any) => setSubCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                >
                  <option value="Technical / Vocational">Technical / Vocational</option>
                  <option value="Core">Core Academic</option>
                  <option value="Elective">Elective</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubjectModal(false);
                    setEditingSubject(null);
                  }}
                  className="px-3 py-1.5 text-stone-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg">
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Student */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-sm text-stone-900 mb-3">
              {editingStudent ? `Edit Student • ${editingStudent.admissionNo}` : 'Enroll New Student'}
            </h3>
            <form onSubmit={handleSaveStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima"
                    value={stdFirstName}
                    onChange={(e) => setStdFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Surname</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abubakar"
                    value={stdLastName}
                    onChange={(e) => setStdLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Class</label>
                  <select
                    value={stdClassId}
                    onChange={(e) => setStdClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.arm})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Gender</label>
                  <select
                    value={stdGender}
                    onChange={(e: any) => setStdGender(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alh. Abubakar"
                    value={stdGuardianName}
                    onChange={(e) => setStdGuardianName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={stdGuardianPhone}
                    onChange={(e) => setStdGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
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
                  value={stdPassword}
                  onChange={(e) => setStdPassword(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] bg-emerald-50/40"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-3 py-1.5 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStudent}
                  className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg"
                >
                  {submittingStudent
                    ? 'Saving...'
                    : editingStudent
                    ? 'Update Student'
                    : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Actions */}
      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        title={pendingDelete?.title || 'Confirm Deletion'}
        message={pendingDelete?.message || ''}
        confirmLabel={pendingDelete?.confirmLabel}
        onConfirm={async () => {
          if (pendingDelete) {
            await pendingDelete.onConfirm();
          }
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
