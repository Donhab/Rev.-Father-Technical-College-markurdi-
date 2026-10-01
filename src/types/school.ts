export type UserRole = 'super_admin' | 'admin' | 'staff' | 'student';

export interface AdminAccount {
  id: string;
  username: string; // e.g. "admin_usman"
  fullName: string;
  email: string;
  password: string; // stored for Super Admin management as requested
  role: 'admin' | 'super_admin';
  isPrincipalSuperAdmin?: boolean;
  assignedOffice?: string;
  createdAt: number;
}

export interface Student {
  id: string;
  admissionNo: string; // e.g. "USTC/2026/014"
  password?: string; // Student portal login password (default: "0000")
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  classId: string;
  className: string;
  term: string;
  session: string;
  guardianName?: string;
  guardianPhone?: string;
  status: 'Active' | 'Transferred' | 'Graduated';
  enrolledByTeacherId?: string;
  activatedScratchCardPin?: string;
  hasActivatedScratchCard?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Staff {
  id: string;
  staffId: string; // e.g. "USTC/STF/008"
  password?: string; // Teacher/Staff portal login password (default: "0000")
  fullName: string;
  email: string;
  phone: string;
  role: 'Teacher' | 'Form Master' | 'Head of Dept' | 'Admin' | 'Principal';
  assignedClasses: string[]; // class IDs or names
  subjects: string[]; // subject names or codes
  isFormTeacher?: boolean;
  formTeacherClassId?: string; // Class for which they are the designated form master
  formTeacherClassName?: string;
  status: 'Active' | 'On Leave';
  createdAt: number;
  updatedAt: number;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "CCS 1", "Garment 1", "SS 1 Tech", "JS 2 Science"
  arm: string; // "A", "B", "Commercial", "Technical"
  level: string; // "JS 1", "JS 2", "JS 3", "SS 1", "SS 2", "SS 3", "CCS 1"
  formTeacherName: string;
  formTeacherId?: string;
  studentCount?: number;
  assignedSubjectIds?: string[]; // IDs of subjects assigned to this class
}

export interface Subject {
  id: string;
  code: string; // e.g. "ENG101", "GMC102", "PHY201"
  name: string; // e.g. "English Language", "Garment Making & Craft", "Physics"
  category: 'Core' | 'Technical / Vocational' | 'Elective';
  classesOffered: string[]; // class names or IDs
}

export interface TeachingAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  periodsPerWeek: number;
}

export interface ScratchCard {
  id: string;
  pin: string; // 12-digit PIN formatted "XXXX-XXXX-XXXX"
  serialNumber: string; // e.g. "USTC-SCR-829103"
  usageCount: number;
  maxUsage: number;
  status: 'Active' | 'Used' | 'Expired';
  generatedAt: number;
  usedByStudentId?: string;
  usedByStudentName?: string;
  usedByAdmissionNo?: string;
}

export interface SubjectScore {
  subjectId: string;
  subjectName: string;
  ca1: number; // max 10
  ca2: number; // max 10
  ca3: number; // max 10
  exam: number; // max 70
  total: number; // ca1 + ca2 + ca3 + exam (max 100)
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  remark: string;
  teacherId?: string;
  teacherName?: string;
  updatedAt?: number;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  classId: string;
  className: string;
  term: string; // e.g. "First Term"
  session: string; // e.g. "2025/2026"
  subjects: SubjectScore[];
  totalScore: number;
  averageScore: number;
  position?: string;
  teacherRemark: string;
  principalRemark: string;
  status: 'Draft' | 'Published';
  updatedAt: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'Advisory' | 'Urgent' | 'General';
  session: string;
  term: string;
  active: boolean;
  actionText?: string;
}

export interface SchoolNewsMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  mimeType?: string;
  chunkedMediaId?: string;
}

export interface SchoolNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'General' | 'Admissions' | 'Examination' | 'Sports & Culture' | 'Technical Workshop';
  authorName: string;
  authorRole: string;
  publishedAt: number;
  imageUrl?: string;
  videoUrl?: string;
  videoChunkedId?: string;
  mediaItems?: SchoolNewsMediaItem[];
  pinned?: boolean;
}

export interface WebsiteCustomization {
  heroTagline: string;
  heroAnnouncement: string;
  principalWelcomeMessage: string;
  schoolContactEmail: string;
  schoolPhone: string;
  schoolAddress: string;
  bannerNoticeText: string;
  bannerNoticeActive: boolean;
  primaryAccentColor: string;
  schoolBadgeUrl?: string;
  badgeEdition?: string;
  updatedAt: number;
  updatedBy: string;
}

export interface SchoolSettings {
  schoolName: string;
  motto: string;
  address: string;
  session: string;
  term: string;
  schoolBadgeUrl?: string;
  badgeEdition?: string;
  ca1Max: number; // 10
  ca2Max: number; // 10
  ca3Max: number; // 10
  examMax: number; // 70
  gradingSystem: {
    A: number; // 75+
    B: number; // 65-74
    C: number; // 50-64
    D: number; // 45-49
    E: number; // 40-44
    F: number; // 0-39
  };
}
