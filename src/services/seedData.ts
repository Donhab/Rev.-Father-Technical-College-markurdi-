import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  SchoolClass,
  Subject,
  Staff,
  Student,
  TeachingAssignment,
  ScratchCard,
  ExamResult,
  Notice,
  AdminAccount,
  SchoolSettings,
  SchoolNews,
  WebsiteCustomization
} from '../types/school';

export const DEFAULT_ADMINS: AdminAccount[] = [
  {
    id: 'admin-super-2',
    username: 'SuperAdmin2',
    fullName: 'Executive Super Admin',
    email: 'superadmin2@ustcmakurdi.edu.ng',
    password: '0000',
    role: 'super_admin',
    isPrincipalSuperAdmin: false,
    assignedOffice: 'Executive Portal Administration',
    createdAt: Date.now() - 12000000
  },
  {
    id: 'admin-01',
    username: 'admin_terkaa',
    fullName: 'Mr. Terkaa Iorlumun',
    email: 'admin.terkaa@ustcmakurdi.edu.ng',
    password: 'MakurdiAdmin#2026',
    role: 'admin',
    assignedOffice: 'Academic Affairs & NBTE/NABTEB Records',
    createdAt: Date.now() - 10000000
  },
  {
    id: 'admin-02',
    username: 'admin_dooshima',
    fullName: 'Mrs. Dooshima Agber',
    email: 'dooshima.agber@ustcmakurdi.edu.ng',
    password: 'SecureSchoolPass24',
    role: 'admin',
    assignedOffice: 'Examination, Admissions & TVET Registry',
    createdAt: Date.now() - 8000000
  }
];

export const DEFAULT_CLASSES: SchoolClass[] = [
  {
    id: 'class-ccs1',
    name: 'CCS 1',
    arm: 'Tech (ICT & Electronics)',
    level: 'NTC 1',
    formTeacherName: 'Engr. Terver Aondohemba',
    formTeacherId: 'stf-001',
    assignedSubjectIds: ['sub-comp', 'sub-ect', 'sub-math', 'sub-eng', 'sub-td', 'sub-phy']
  },
  {
    id: 'class-elec1',
    name: 'Tech 1 Electrical',
    arm: 'Electrical & Solar PV',
    level: 'NTC 1',
    formTeacherName: 'Engr. Sesugh Ortese',
    formTeacherId: 'stf-005',
    assignedSubjectIds: ['sub-eim', 'sub-rac', 'sub-math', 'sub-eng', 'sub-td', 'sub-phy']
  },
  {
    id: 'class-auto1',
    name: 'Tech 1 Auto & Agro-Mech',
    arm: 'Mechanical & Agricultural Tech',
    level: 'NTC 1',
    formTeacherName: 'Engr. Iorwuese Gernah',
    formTeacherId: 'stf-003',
    assignedSubjectIds: ['sub-amt', 'sub-agm', 'sub-wft', 'sub-math', 'sub-eng', 'sub-td']
  },
  {
    id: 'class-bldg2',
    name: 'Tech 2 Building & Woodwork',
    arm: 'Construction & Joinery',
    level: 'NTC 2',
    formTeacherName: 'Bldr. Aondona Chia',
    formTeacherId: 'stf-004',
    assignedSubjectIds: ['sub-bct', 'sub-wwt', 'sub-math', 'sub-eng', 'sub-td', 'sub-chm']
  },
  {
    id: 'class-garment1',
    name: 'Garment 1',
    arm: 'Vocational & Catering Craft',
    level: 'NBC 1',
    formTeacherName: 'Mrs. Mimidoo Orkaa',
    formTeacherId: 'stf-002',
    assignedSubjectIds: ['sub-garment', 'sub-math', 'sub-eng', 'sub-chm']
  }
];

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-comp',
    code: 'CST101',
    name: 'Computer Craft Studies & GSM Maintenance',
    category: 'Technical / Vocational',
    classesOffered: ['CCS 1', 'Tech 1 Electrical']
  },
  {
    id: 'sub-eim',
    code: 'EIM102',
    name: 'Electrical Installation & Solar PV Works',
    category: 'Technical / Vocational',
    classesOffered: ['Tech 1 Electrical', 'CCS 1']
  },
  {
    id: 'sub-amt',
    code: 'AMT103',
    name: 'Automobile Mechanics & Motor Vehicle Tech',
    category: 'Technical / Vocational',
    classesOffered: ['Tech 1 Auto & Agro-Mech']
  },
  {
    id: 'sub-bct',
    code: 'BCT104',
    name: 'Building Construction, Bricklaying & Concreting',
    category: 'Technical / Vocational',
    classesOffered: ['Tech 2 Building & Woodwork']
  },
  {
    id: 'sub-wft',
    code: 'WFT105',
    name: 'Welding, Metal Fabrication & Lathe Craft',
    category: 'Technical / Vocational',
    classesOffered: ['Tech 1 Auto & Agro-Mech']
  },
  {
    id: 'sub-rac',
    code: 'RAC106',
    name: 'Refrigeration & Air-Conditioning (RAC)',
    category: 'Technical / Vocational',
    classesOffered: ['Tech 1 Electrical']
  },
  {
    id: 'sub-wwt',
    code: 'WWT107',
    name: 'Woodworking, Carpentry & Joinery Technology',
    category: 'Technical / Vocational',
    classesOffered: ['Tech 2 Building & Woodwork']
  },
  {
    id: 'sub-agm',
    code: 'AGM108',
    name: 'Agricultural Mechanics & Smart Farm Machinery',
    category: 'Technical / Vocational',
    classesOffered: ['Tech 1 Auto & Agro-Mech']
  },
  {
    id: 'sub-ect',
    code: 'ECT109',
    name: 'Electronics & Radio/TV Communication Systems',
    category: 'Technical / Vocational',
    classesOffered: ['CCS 1', 'Tech 1 Electrical']
  },
  {
    id: 'sub-garment',
    code: 'GMC110',
    name: 'Garment Making & Catering Craft Practice',
    category: 'Technical / Vocational',
    classesOffered: ['Garment 1']
  },
  {
    id: 'sub-td',
    code: 'TDR101',
    name: 'Technical Drawing & Engineering Drafting',
    category: 'Technical / Vocational',
    classesOffered: ['CCS 1', 'Tech 1 Electrical', 'Tech 1 Auto & Agro-Mech', 'Tech 2 Building & Woodwork']
  },
  {
    id: 'sub-math',
    code: 'MTH101',
    name: 'General Mathematics',
    category: 'Core',
    classesOffered: ['CCS 1', 'Tech 1 Electrical', 'Tech 1 Auto & Agro-Mech', 'Tech 2 Building & Woodwork', 'Garment 1']
  },
  {
    id: 'sub-eng',
    code: 'ENG101',
    name: 'English Language & Technical Communication',
    category: 'Core',
    classesOffered: ['CCS 1', 'Tech 1 Electrical', 'Tech 1 Auto & Agro-Mech', 'Tech 2 Building & Woodwork', 'Garment 1']
  },
  {
    id: 'sub-phy',
    code: 'PHY102',
    name: 'Engineering Physics',
    category: 'Core',
    classesOffered: ['CCS 1', 'Tech 1 Electrical', 'Tech 1 Auto & Agro-Mech']
  },
  {
    id: 'sub-chm',
    code: 'CHM103',
    name: 'Industrial & Applied Chemistry',
    category: 'Core',
    classesOffered: ['Tech 2 Building & Woodwork', 'Garment 1']
  }
];

export const DEFAULT_STAFF: Staff[] = [
  {
    id: 'stf-001',
    staffId: 'USTC/STF/001',
    password: '0000',
    fullName: 'Engr. Terver Aondohemba',
    email: 'terver.aondohemba@ustcmakurdi.edu.ng',
    phone: '+234 803 123 4567',
    role: 'Teacher',
    assignedClasses: ['CCS 1', 'Tech 1 Electrical'],
    subjects: ['Computer Craft Studies & GSM Maintenance', 'Technical Drawing & Engineering Drafting'],
    isFormTeacher: true,
    formTeacherClassId: 'class-ccs1',
    formTeacherClassName: 'CCS 1',
    status: 'Active',
    createdAt: Date.now() - 10000000,
    updatedAt: Date.now()
  },
  {
    id: 'stf-002',
    staffId: 'USTC/STF/002',
    password: '0000',
    fullName: 'Mrs. Mimidoo Orkaa',
    email: 'mimidoo.orkaa@ustcmakurdi.edu.ng',
    phone: '+234 802 234 5678',
    role: 'Teacher',
    assignedClasses: ['Garment 1'],
    subjects: ['Garment Making & Catering Craft Practice', 'English Language & Technical Communication'],
    isFormTeacher: true,
    formTeacherClassId: 'class-garment1',
    formTeacherClassName: 'Garment 1',
    status: 'Active',
    createdAt: Date.now() - 9000000,
    updatedAt: Date.now()
  },
  {
    id: 'stf-003',
    staffId: 'USTC/STF/003',
    password: '0000',
    fullName: 'Engr. Iorwuese Gernah',
    email: 'iorwuese.gernah@ustcmakurdi.edu.ng',
    phone: '+234 806 412 8890',
    role: 'Teacher',
    assignedClasses: ['Tech 1 Auto & Agro-Mech'],
    subjects: ['Automobile Mechanics & Motor Vehicle Tech', 'Agricultural Mechanics & Smart Farm Machinery', 'Welding, Metal Fabrication & Lathe Craft'],
    isFormTeacher: true,
    formTeacherClassId: 'class-auto1',
    formTeacherClassName: 'Tech 1 Auto & Agro-Mech',
    status: 'Active',
    createdAt: Date.now() - 8500000,
    updatedAt: Date.now()
  },
  {
    id: 'stf-004',
    staffId: 'USTC/STF/004',
    password: '0000',
    fullName: 'Bldr. Aondona Chia',
    email: 'aondona.chia@ustcmakurdi.edu.ng',
    phone: '+234 805 531 7742',
    role: 'Teacher',
    assignedClasses: ['Tech 2 Building & Woodwork'],
    subjects: ['Building Construction, Bricklaying & Concreting', 'Woodworking, Carpentry & Joinery Technology'],
    isFormTeacher: true,
    formTeacherClassId: 'class-bldg2',
    formTeacherClassName: 'Tech 2 Building & Woodwork',
    status: 'Active',
    createdAt: Date.now() - 8000000,
    updatedAt: Date.now()
  },
  {
    id: 'stf-005',
    staffId: 'USTC/STF/005',
    password: '0000',
    fullName: 'Engr. Sesugh Ortese',
    email: 'sesugh.ortese@ustcmakurdi.edu.ng',
    phone: '+234 803 889 1120',
    role: 'Teacher',
    assignedClasses: ['Tech 1 Electrical', 'CCS 1'],
    subjects: ['Electrical Installation & Solar PV Works', 'Refrigeration & Air-Conditioning (RAC)', 'Electronics & Radio/TV Communication Systems'],
    isFormTeacher: true,
    formTeacherClassId: 'class-elec1',
    formTeacherClassName: 'Tech 1 Electrical',
    status: 'Active',
    createdAt: Date.now() - 7500000,
    updatedAt: Date.now()
  }
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std-001',
    admissionNo: 'USTC/2025/001',
    password: '0000',
    firstName: 'Tersoo',
    lastName: 'Chia',
    gender: 'Male',
    classId: 'class-ccs1',
    className: 'CCS 1',
    term: 'First Term',
    session: '2025/2026',
    guardianName: 'Mr. Chia Aondona (Kanshio, Makurdi)',
    guardianPhone: '+234 802 987 6543',
    status: 'Active',
    hasActivatedScratchCard: true,
    activatedScratchCardPin: '8392-4910-5821',
    enrolledSubjectIds: ['sub-comp', 'sub-ect', 'sub-math', 'sub-eng', 'sub-td'],
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now()
  },
  {
    id: 'std-002',
    admissionNo: 'USTC/2025/002',
    password: '0000',
    firstName: 'Mlumun',
    lastName: 'Tyoor',
    gender: 'Female',
    classId: 'class-garment1',
    className: 'Garment 1',
    term: 'First Term',
    session: '2025/2026',
    guardianName: 'Chief Tyoor Ugbaa (High Level, Makurdi)',
    guardianPhone: '+234 803 765 4321',
    status: 'Active',
    hasActivatedScratchCard: false,
    enrolledSubjectIds: ['sub-garment', 'sub-math', 'sub-eng', 'sub-chm'],
    createdAt: Date.now() - 4000000,
    updatedAt: Date.now()
  },
  {
    id: 'std-003',
    admissionNo: 'USTC/2025/003',
    password: '0000',
    firstName: 'Torkuma',
    lastName: 'Agba',
    gender: 'Male',
    classId: 'class-elec1',
    className: 'Tech 1 Electrical',
    term: 'First Term',
    session: '2025/2026',
    guardianName: 'Engr. Agba Nyior (Gboko Road, Makurdi)',
    guardianPhone: '+234 806 334 1920',
    status: 'Active',
    hasActivatedScratchCard: false,
    enrolledSubjectIds: ['sub-eim', 'sub-rac', 'sub-ect', 'sub-math', 'sub-eng', 'sub-td'],
    createdAt: Date.now() - 3500000,
    updatedAt: Date.now()
  },
  {
    id: 'std-004',
    admissionNo: 'USTC/2025/004',
    password: '0000',
    firstName: 'Doowuese',
    lastName: 'Kwagh',
    gender: 'Female',
    classId: 'class-auto1',
    className: 'Tech 1 Auto & Agro-Mech',
    term: 'First Term',
    session: '2025/2026',
    guardianName: 'Mrs. Kwagh Nguemo (Wurukum, Makurdi)',
    guardianPhone: '+234 805 219 4480',
    status: 'Active',
    hasActivatedScratchCard: false,
    enrolledSubjectIds: ['sub-amt', 'sub-agm', 'sub-wft', 'sub-math', 'sub-eng', 'sub-td'],
    createdAt: Date.now() - 3000000,
    updatedAt: Date.now()
  },
  {
    id: 'std-005',
    admissionNo: 'USTC/2025/005',
    password: '0000',
    firstName: 'Aondoaseer',
    lastName: 'Tarka',
    gender: 'Male',
    classId: 'class-bldg2',
    className: 'Tech 2 Building & Woodwork',
    term: 'First Term',
    session: '2025/2026',
    guardianName: 'Mr. Tarka Shima (North Bank, Makurdi)',
    guardianPhone: '+234 803 901 6732',
    status: 'Active',
    hasActivatedScratchCard: false,
    enrolledSubjectIds: ['sub-bct', 'sub-wwt', 'sub-math', 'sub-eng', 'sub-td', 'sub-chm'],
    createdAt: Date.now() - 2500000,
    updatedAt: Date.now()
  }
];

export const DEFAULT_ASSIGNMENTS: TeachingAssignment[] = [
  {
    id: 'asg-001',
    teacherId: 'stf-001',
    teacherName: 'Engr. Terver Aondohemba',
    subjectId: 'sub-comp',
    subjectName: 'Computer Craft Studies & GSM Maintenance',
    classId: 'class-ccs1',
    className: 'CCS 1',
    periodsPerWeek: 4
  },
  {
    id: 'asg-002',
    teacherId: 'stf-005',
    teacherName: 'Engr. Sesugh Ortese',
    subjectId: 'sub-eim',
    subjectName: 'Electrical Installation & Solar PV Works',
    classId: 'class-elec1',
    className: 'Tech 1 Electrical',
    periodsPerWeek: 5
  },
  {
    id: 'asg-003',
    teacherId: 'stf-003',
    teacherName: 'Engr. Iorwuese Gernah',
    subjectId: 'sub-amt',
    subjectName: 'Automobile Mechanics & Motor Vehicle Tech',
    classId: 'class-auto1',
    className: 'Tech 1 Auto & Agro-Mech',
    periodsPerWeek: 5
  },
  {
    id: 'asg-004',
    teacherId: 'stf-004',
    teacherName: 'Bldr. Aondona Chia',
    subjectId: 'sub-bct',
    subjectName: 'Building Construction, Bricklaying & Concreting',
    classId: 'class-bldg2',
    className: 'Tech 2 Building & Woodwork',
    periodsPerWeek: 4
  }
];

export const DEFAULT_CARDS: ScratchCard[] = [
  {
    id: 'card-001',
    pin: '8392-4910-5821',
    serialNumber: 'USTC-SCR-829101',
    usageCount: 1,
    maxUsage: 5,
    status: 'Active',
    generatedAt: Date.now() - 200000,
    usedByStudentId: 'std-001',
    usedByStudentName: 'Tersoo Chia',
    usedByAdmissionNo: 'USTC/2025/001'
  },
  {
    id: 'card-002',
    pin: '1092-3847-9201',
    serialNumber: 'USTC-SCR-829102',
    usageCount: 0,
    maxUsage: 5,
    status: 'Active',
    generatedAt: Date.now() - 100000
  },
  {
    id: 'card-003',
    pin: '5542-8819-3012',
    serialNumber: 'USTC-SCR-829103',
    usageCount: 0,
    maxUsage: 5,
    status: 'Active',
    generatedAt: Date.now() - 50000
  }
];

export const DEFAULT_RESULTS: ExamResult[] = [
  {
    id: 'res-001',
    studentId: 'std-001',
    studentName: 'Tersoo Chia',
    admissionNo: 'USTC/2025/001',
    classId: 'class-ccs1',
    className: 'CCS 1',
    term: 'First Term',
    session: '2025/2026',
    subjects: [
      { subjectId: 'sub-comp', subjectName: 'Computer Craft Studies & GSM Maintenance', ca1: 9, ca2: 8, ca3: 9, exam: 58, total: 84, grade: 'A', remark: 'Excellent' },
      { subjectId: 'sub-ect', subjectName: 'Electronics & Radio/TV Communication Systems', ca1: 8, ca2: 8, ca3: 9, exam: 56, total: 81, grade: 'A', remark: 'Distinction' },
      { subjectId: 'sub-math', subjectName: 'General Mathematics', ca1: 8, ca2: 9, ca3: 8, exam: 52, total: 77, grade: 'A', remark: 'Very Good' },
      { subjectId: 'sub-eng', subjectName: 'English Language & Technical Communication', ca1: 7, ca2: 8, ca3: 7, exam: 48, total: 70, grade: 'B', remark: 'Good' },
      { subjectId: 'sub-td', subjectName: 'Technical Drawing & Engineering Drafting', ca1: 9, ca2: 9, ca3: 10, exam: 60, total: 88, grade: 'A', remark: 'Distinction' }
    ],
    totalScore: 400,
    averageScore: 80.0,
    position: '1st of 28',
    teacherRemark: 'Outstanding technical diligence in the Makurdi ICT & Electronics workshop. Exemplary practical performance.',
    principalRemark: 'Exemplary NBTE/NABTEB technical scholar. Keep upholding Scientia Liberatio Populorum.',
    status: 'Published',
    updatedAt: Date.now()
  }
];

export const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi',
  motto: 'Scientia Liberatio Populorum',
  address: 'Walmayo, Kanshio / Km 1 Gboko Road, Makurdi, Benue State, Nigeria',
  session: '2025/2026',
  term: 'First Term',
  ca1Max: 10,
  ca2Max: 10,
  ca3Max: 10,
  examMax: 70,
  gradingSystem: {
    A: 75,
    B: 65,
    C: 50,
    D: 45,
    E: 40,
    F: 0
  }
};

export const DEFAULT_CUSTOMIZATION: WebsiteCustomization = {
  heroTagline: 'Scientia Liberatio Populorum — NBTE & NABTEB Accredited Science, Technical & Vocational Excellence in Makurdi',
  heroAnnouncement: 'Admissions for the 2026/2027 Academic Session are open at Rev. Fr. Moses Orshio Adasu University Science and Technical College (formerly Government Technical Training School / BSU Technical College), Walmayo-Kanshio & Gboko Road Campus, Makurdi across 10 NBTE/NABTEB-Accredited Technical Trades.',
  principalWelcomeMessage: 'Welcome to Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi, Benue State. Rooted in the historic Government Technical Training School (GTTS) premises embraced when Executive Governor Rev. Fr. Moses Orshio Adasu founded the University in 1992, and fully accredited by NBTE and NABTEB, we equip Benue youth with hands-on industrial engineering, agricultural mechanics, solar PV, and digital technology mastery.',
  schoolContactEmail: 'info@ustcmakurdi.edu.ng',
  schoolPhone: '+234 803 712 4500',
  schoolAddress: 'Walmayo, Kanshio / Km 1 Gboko Road, Rev. Fr. Moses Orshio Adasu University Campus, Makurdi, Benue State, Nigeria',
  bannerNoticeText: 'Official Bulletin: 2025/2026 First Term Continuous Assessment & NBTE/NABTEB Practical Workshop Evaluations are active across all Makurdi Technical Departments.',
  bannerNoticeActive: true,
  primaryAccentColor: '#0b4d2c',
  updatedAt: Date.now(),
  updatedBy: 'Principal Super Admin'
};

export const DEFAULT_NOTICE: Notice = {
  id: 'current-advisory',
  title: 'MOAUM USTC Makurdi — NBTE/NABTEB Practical Workshop & CA Advisory',
  content: 'All Trade Heads and Form Masters across the Walmayo-Kanshio / Gboko Road Campus, Makurdi are reminded to upload 1st, 2nd, and 3rd Continuous Assessment (CA) scores and NABTEB practical workshop evaluations before the terminal portal lock.',
  type: 'Advisory',
  session: '2025/2026',
  term: 'First Term',
  active: true,
  actionText: 'Enter Marks'
};

export const DEFAULT_NEWS: SchoolNews[] = [
  {
    id: 'news-01',
    title: 'Classroom Rehabilitation & Solar-Powered Street Lighting Commissioned at Technical College Campus, Makurdi',
    summary: 'Newly renovated classroom blocks, upgraded mechanical bays, and solar-powered street lighting have been commissioned at the Makurdi technical college campus.',
    content: 'In a landmark infrastructure boost for technical education in Benue State, classroom blocks and practical workshop bays at the Technical College in Makurdi have undergone comprehensive rehabilitation alongside the installation of solar-powered street lights across the campus. Supported through civil-military cooperation with the Nigerian Army and the Benue State Government TVET revitalization initiative, the upgrades ensure safe, well-lit evening study sessions and uninterrupted practical training for over 467+ technical trainees.',
    category: 'Technical Workshop',
    authorName: 'Mr. Terkaa Iorlumun',
    authorRole: 'Admin (Academic Affairs & NBTE Records)',
    publishedAt: Date.now() - 86400000 * 1,
    pinned: true
  },
  {
    id: 'news-02',
    title: 'Full NBTE & NABTEB Accreditation Reaffirmed for 10 Technical & Vocational Trades in Walmayo-Kanshio, Makurdi',
    summary: 'The National Board for Technical Education (NBTE) and NABTEB have reaffirmed full accreditation for National Technical Certificate (NTC) programmes in Makurdi.',
    content: 'Located in the Walmayo, Kanshio and Km 1 Gboko Road axis of Makurdi, Rev. Fr. Moses Orshio Adasu University Science and Technical College (historically Government Technical Training School / BSU Technical College) continues to serve as Benue State’s premier NBTE-registered TVET institution. Accredited specializations include Automobile Mechanics, Building Construction & Concreting, Electrical Installation & Solar PV, Electronics/Communication Technology, Welding & Fabrication, Refrigeration & Air-Conditioning (RAC), Woodworking & Joinery, Agricultural Mechanics, Computer Craft & GSM Maintenance, and Garment/Catering Craft.',
    category: 'Admissions',
    authorName: 'Mrs. Dooshima Agber',
    authorRole: 'Admin (Examination & TVET Registry)',
    publishedAt: Date.now() - 86400000 * 3,
    pinned: true
  },
  {
    id: 'news-03',
    title: 'MOAUM Department of Vocational & Technical Education Hosts Joint Agro-Mechanics & Solar Innovation Showcase',
    summary: 'Technical College trainees partnered with the pioneer 1992/1993 University Department of Vocational & Technical Education to showcase Benue farm mechanization prototypes.',
    content: 'Honoring the historic 1992 legacy of Executive Governor Rev. Fr. Moses Orshio Adasu—when the university campus embraced the premises of the Government Technical Training School (GTTS) in Makurdi—students of the Technical College and the Department of Vocational & Technical Education exhibited locally fabricated cassava graters, solar PV irrigation controllers, and automotive diagnostic rigs designed to support Benue State as the Food Basket of the Nation.',
    category: 'Technical Workshop',
    authorName: 'Engr. Terver Aondohemba',
    authorRole: 'Head of ICT & Technical Workshops',
    publishedAt: Date.now() - 86400000 * 5,
    pinned: false
  },
  {
    id: 'news-04',
    title: '2025/2026 First Term Continuous Assessment & NABTEB/WAEC Practical Schedule Released',
    summary: 'All NTC 1–3, NBC, and Science students in Makurdi are advised to verify their practical workshop schedules and portal scratch card activation status.',
    content: 'Academic and Trade instructors at Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi are actively compiling First, Second, and Third Continuous Assessment (CA) scores (30%) alongside terminal practical and theory examinations (70%). Students can check and print their official A4 report sheets online using a valid 12-digit USTC Makurdi Scratch Card PIN.',
    category: 'Examination',
    authorName: 'Mrs. Dooshima Agber',
    authorRole: 'Admin (Examination & Admissions)',
    publishedAt: Date.now() - 86400000 * 7,
    pinned: false
  }
];

export async function seedInitialSchoolDataIfNeeded(): Promise<void> {
  try {
    const metaDocRef = doc(db, 'system_meta', 'init_seed_makurdi_gstc_sourced_v2');
    const metaSnap = await getDoc(metaDocRef);
    if (metaSnap.exists()) {
      return;
    }

    // Ensure Second Super Admin exists in 'admins' collection
    await setDoc(doc(db, 'admins', 'admin-super-2'), DEFAULT_ADMINS[0], { merge: true });

    // Seed or migrate default Admins
    for (const adm of DEFAULT_ADMINS) {
      await setDoc(doc(db, 'admins', adm.id), adm, { merge: true });
    }

    // Seed or migrate default Classes
    for (const item of DEFAULT_CLASSES) {
      await setDoc(doc(db, 'classes', item.id), item, { merge: true });
    }

    // Seed or migrate default Subjects
    for (const item of DEFAULT_SUBJECTS) {
      await setDoc(doc(db, 'subjects', item.id), item, { merge: true });
    }

    // Seed or migrate default Staff
    for (const item of DEFAULT_STAFF) {
      await setDoc(doc(db, 'staff', item.id), item, { merge: true });
    }

    // Seed or migrate default Students
    for (const item of DEFAULT_STUDENTS) {
      await setDoc(doc(db, 'students', item.id), item, { merge: true });
    }

    // Seed or migrate default Assignments
    for (const item of DEFAULT_ASSIGNMENTS) {
      await setDoc(doc(db, 'assignments', item.id), item, { merge: true });
    }

    // Seed or migrate default Scratch cards
    for (const card of DEFAULT_CARDS) {
      await setDoc(doc(db, 'scratch_cards', card.id), card, { merge: true });
    }

    // Seed or migrate default Results
    for (const res of DEFAULT_RESULTS) {
      await setDoc(doc(db, 'results', res.id), res, { merge: true });
    }

    // System Auth - Principal Super Admin & Second Super Admin
    const superAdminRef = doc(db, 'system_auth', 'super_admin');
    const superAdminSnap = await getDoc(superAdminRef);
    if (!superAdminSnap.exists()) {
      await setDoc(superAdminRef, {
        username: 'Admin',
        password: '0000',
        role: 'super_admin',
        fullName: 'Principal Super Admin',
        email: 'admin@ustcmakurdi.edu.ng',
        updatedAt: Date.now()
      });
    }

    const secondSuperRef = doc(db, 'system_auth', 'second_super_admin');
    const secondSuperSnap = await getDoc(secondSuperRef);
    if (!secondSuperSnap.exists()) {
      await setDoc(secondSuperRef, {
        username: 'SuperAdmin2',
        password: '0000',
        role: 'super_admin',
        fullName: 'Executive Super Admin',
        email: 'superadmin2@ustcmakurdi.edu.ng',
        updatedAt: Date.now()
      });
    }

    // Website Customization doc
    await setDoc(doc(db, 'website_customization', 'main'), DEFAULT_CUSTOMIZATION, { merge: true });

    // Official Notice doc
    await setDoc(doc(db, 'notices', 'current-advisory'), DEFAULT_NOTICE, { merge: true });

    // News
    for (const post of DEFAULT_NEWS) {
      await setDoc(doc(db, 'school_news', post.id), post, { merge: true });
    }

    // Settings
    await setDoc(doc(db, 'settings', 'global_config'), DEFAULT_SETTINGS, { merge: true });

    await setDoc(metaDocRef, {
      seededAt: serverTimestamp(),
      initialized: true
    });
  } catch (err) {
    console.warn('Initial seeding notice (non-fatal):', err);
  }
}
