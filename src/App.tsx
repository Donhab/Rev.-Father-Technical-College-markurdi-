import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSchoolData } from './hooks/useSchoolData';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { StudentsTab } from './components/StudentsTab';
import { StaffTab } from './components/StaffTab';
import { ClassesAndSubjectsTab } from './components/ClassesAndSubjectsTab';
import { ScratchCardsAndResults } from './components/ScratchCardsAndResults';
import { AdminsAndSettings } from './components/AdminsAndSettings';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AdminPanel } from './components/AdminPanel';
import { StaffDashboard } from './components/StaffDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { VisitorPortal } from './components/VisitorPortal';
import { HomePage } from './components/HomePage';
import { SchoolBadge } from './components/SchoolBadge';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AuthModal } from './components/AuthModal';
import { GitHubVercelModal } from './components/GitHubVercelModal';
import { Loader2 } from 'lucide-react';
import { UserRole } from './types/school';

function SchoolAppContent() {
  const { userProfile } = useAuth();
  const currentRole: UserRole | null = userProfile?.role || null;
  const isPrincipalSuperAdmin = Boolean(userProfile?.isPrincipalSuperAdmin);

  // Set default initial active tab based on role:
  // If not logged in, user lands on modern 'home' page with the 5s sliding pictures
  const getDefaultTab = (role?: UserRole | null) => {
    if (!role) return 'home';
    switch (role) {
      case 'super_admin':
        return 'super_admin';
      case 'admin':
        return 'admin_panel';
      case 'staff':
        return 'staff_dashboard';
      case 'student':
        return 'student_dashboard';
      default:
        return 'home';
    }
  };

  const [activeTab, setActiveTab] = useState<string>(getDefaultTab(currentRole));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  // Trigger state for quick actions
  const [triggerStudentRegister, setTriggerStudentRegister] = useState(false);
  const [triggerStaffRegister, setTriggerStaffRegister] = useState(false);

  // Switch tab when role changes
  useEffect(() => {
    setActiveTab(getDefaultTab(currentRole));
  }, [currentRole]);

  const {
    admins,
    students,
    staff,
    classes,
    subjects,
    assignments,
    scratchCards,
    results,
    notice,
    settings,
    news,
    customization,
    loading,
    syncStatus,
    lastSyncTime,
    addAdmin,
    removeAdmin,
    generateBatchScratchCards,
    updateWebsiteCustomization,
    postNews,
    updateNews,
    deleteNews,
    addStaff,
    updateStaff,
    deleteStaff,
    addClass,
    updateClass,
    deleteClass,
    addSubject,
    updateSubject,
    deleteSubject,
    assignAllSubjectsToAllClasses,
    assignSubjectToTeacher,
    deleteAssignment,
    updateSettings,
    updateNotice,
    enrollStudent,
    updateStudent,
    toggleStudentSubjectEnrollment,
    enrollAllClassStudentsInSubject,
    deenrollStudent,
    saveStudentScore,
    saveBatchScores,
    activateScratchCardForStudent
  } = useSchoolData();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f8] flex flex-col items-center justify-center p-4">
        <SchoolBadge size="lg" className="mb-4 animate-bounce" />
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <Loader2 className="w-4 h-4 animate-spin text-[#0b4d2c]" />
          <span>Connecting to MOAUM USTC Makurdi Firestore Live Database...</span>
        </div>
      </div>
    );
  }

  // Find current teacher or student record if available
  const loggedInTeacher = staff.find(
    (s) =>
      (userProfile?.uid && s.id === userProfile.uid) ||
      (userProfile?.staffId && s.staffId?.toLowerCase() === userProfile.staffId.toLowerCase()) ||
      (userProfile?.email && s.email?.toLowerCase() === userProfile.email.toLowerCase()) ||
      (userProfile?.displayName && s.fullName?.toLowerCase() === userProfile.displayName.toLowerCase())
  );

  const goToLoginPage = () => {
    setAuthModalOpen(false);
    setActiveTab('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-stone-800 flex flex-col font-sans selection:bg-[#0b4d2c] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onOpenAuth={goToLoginPage}
        onOpenDeployGuide={() => setDeployModalOpen(true)}
        onOpenChangePassword={() => setChangePasswordModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dedicated Login Page */}
        {activeTab === 'login' && (
          <AuthModal
            isOpen={true}
            asPage={true}
            onClose={() => setActiveTab(currentRole ? getDefaultTab(currentRole) : 'home')}
          />
        )}

        {/* Modern School Homepage with 5s Sliding Pictures & Login Button */}
        {activeTab === 'home' && (
          <HomePage
            customization={customization}
            news={news}
            scratchCards={scratchCards}
            students={students}
            results={results}
            onOpenLogin={goToLoginPage}
            onNavigateToCheckResult={() => {
              if (userProfile?.role === 'student') {
                setActiveTab('student_dashboard');
              } else if (userProfile) {
                setActiveTab('results');
              } else {
                goToLoginPage();
              }
            }}
            onPostNews={postNews}
            onUpdateNews={updateNews}
            canManageNews={currentRole === 'admin' || currentRole === 'super_admin'}
          />
        )}

        {/* 1. Super Admin Dedicated Dashboard & Website Customization */}
        {(activeTab === 'super_admin' || activeTab === 'website_manager') && (
          <SuperAdminDashboard
            admins={admins}
            scratchCards={scratchCards}
            customization={customization}
            syncStatus={syncStatus}
            lastSyncTime={lastSyncTime}
            onAddAdmin={addAdmin}
            onRemoveAdmin={removeAdmin}
            onGenerateScratchCards={async (count) => {
              if (!isPrincipalSuperAdmin) {
                throw new Error('Only the Principal Super Admin can generate scratch cards.');
              }
              return generateBatchScratchCards(count);
            }}
            onUpdateWebsiteCustomization={updateWebsiteCustomization}
          />
        )}

        {/* 2. Admin Dedicated Operations Panel & Post News */}
        {(activeTab === 'admin_panel' || activeTab === 'post_news') && (
          <AdminPanel
            classes={classes}
            subjects={subjects}
            staff={staff}
            students={students}
            assignments={assignments}
            settings={settings}
            news={news}
            initialSubTab={activeTab === 'post_news' ? 'news' : 'teachers'}
            onAddStaff={addStaff}
            onUpdateStaff={updateStaff}
            onDeleteStaff={deleteStaff}
            onAddClass={addClass}
            onUpdateClass={updateClass}
            onDeleteClass={deleteClass}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
            onAddStudent={enrollStudent}
            onUpdateStudent={updateStudent}
            onDeleteStudent={deenrollStudent}
            onAssignAllSubjectsToAllClasses={assignAllSubjectsToAllClasses}
            onAssignSubjectToTeacher={assignSubjectToTeacher}
            onDeleteAssignment={deleteAssignment}
            onUpdateSettings={updateSettings}
            onPostNews={postNews}
            onUpdateNews={updateNews}
            onDeleteNews={deleteNews}
            onNavigateToPublicNews={() => setActiveTab('public_portal')}
          />
        )}

        {/* Public Visitor Portal & Published News */}
        {activeTab === 'public_portal' && (
          <VisitorPortal
            customization={customization}
            news={news}
            onNavigateToCheckResult={() => {
              if (userProfile?.role === 'student') {
                setActiveTab('student_dashboard');
              } else {
                goToLoginPage();
              }
            }}
            onOpenAuth={goToLoginPage}
            onPostNews={postNews}
            onUpdateNews={updateNews}
            canManageNews={currentRole === 'admin' || currentRole === 'super_admin'}
          />
        )}

        {/* 3. Teacher / Staff Dedicated Gradebook */}
        {activeTab === 'staff_dashboard' && (
          <StaffDashboard
            currentStaff={loggedInTeacher}
            allStaff={staff}
            students={students}
            classes={classes}
            subjects={subjects}
            assignments={assignments}
            results={results}
            onEnrollStudent={enrollStudent}
            onUpdateStudent={updateStudent}
            onDeenrollStudent={deenrollStudent}
            onToggleStudentSubjectEnrollment={toggleStudentSubjectEnrollment}
            onEnrollAllClassStudentsInSubject={enrollAllClassStudentsInSubject}
            onSaveBatchScores={saveBatchScores}
            onSaveScore={saveStudentScore}
          />
        )}

        {/* 4. Student Dedicated Terminal Result Dashboard */}
        {activeTab === 'student_dashboard' && (
          <StudentDashboard
            currentStudentAdmissionNo={userProfile?.studentAdmissionNo}
            students={students}
            results={results}
            scratchCards={scratchCards}
            onActivateScratchCard={activateScratchCardForStudent}
          />
        )}

        {/* Common Modules & Direct Tabs */}
        {activeTab === 'overview' && (
          <OverviewTab
            students={students}
            staff={staff}
            classes={classes}
            subjects={subjects}
            assignments={assignments}
            notice={notice}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenRegisterStudent={() => {
              if (currentRole === 'staff') {
                setActiveTab('staff_dashboard');
              } else {
                setActiveTab('students');
                setTriggerStudentRegister(true);
              }
            }}
            onOpenRegisterStaff={() => {
              if (currentRole === 'admin') {
                setActiveTab('admin_panel');
              } else {
                setActiveTab('staff');
                setTriggerStaffRegister(true);
              }
            }}
            onOpenScratchCardGenerator={() => {
              if (isPrincipalSuperAdmin) {
                setActiveTab('scratch_cards');
              }
            }}
            onOpenCheckResult={() => {
              if (currentRole === 'student') {
                setActiveTab('student_dashboard');
              } else {
                setActiveTab('results');
              }
            }}
            onUpdateNotice={updateNotice}
          />
        )}

        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            classes={classes}
            onAddStudent={enrollStudent}
            onDeleteStudent={deenrollStudent}
            onUpdateStudent={updateStudent}
            showRegisterModalDefault={triggerStudentRegister}
          />
        )}

        {activeTab === 'staff' && (
          <StaffTab
            staff={staff}
            onAddStaff={addStaff}
            onUpdateStaff={updateStaff}
            onDeleteStaff={deleteStaff}
            showRegisterModalDefault={triggerStaffRegister}
          />
        )}

        {activeTab === 'classes' && (
          <ClassesAndSubjectsTab
            type="classes"
            classes={classes}
            subjects={subjects}
            staff={staff}
            students={students}
            assignments={assignments}
            onAddClass={addClass}
            onUpdateClass={updateClass}
            onDeleteClass={deleteClass}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
            onAddAssignment={async (a) => {
              await assignSubjectToTeacher(a.teacherId, a.subjectId, a.classId, a.periodsPerWeek);
            }}
            onDeleteAssignment={deleteAssignment}
          />
        )}

        {activeTab === 'subjects' && (
          <ClassesAndSubjectsTab
            type="subjects"
            classes={classes}
            subjects={subjects}
            staff={staff}
            students={students}
            assignments={assignments}
            onAddClass={addClass}
            onUpdateClass={updateClass}
            onDeleteClass={deleteClass}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
            onAddAssignment={async (a) => {
              await assignSubjectToTeacher(a.teacherId, a.subjectId, a.classId, a.periodsPerWeek);
            }}
            onDeleteAssignment={deleteAssignment}
          />
        )}

        {activeTab === 'assignments' && (
          <ClassesAndSubjectsTab
            type="assignments"
            classes={classes}
            subjects={subjects}
            staff={staff}
            assignments={assignments}
            onAddClass={addClass}
            onUpdateClass={updateClass}
            onDeleteClass={deleteClass}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
            onAddAssignment={async (a) => {
              await assignSubjectToTeacher(a.teacherId, a.subjectId, a.classId, a.periodsPerWeek);
            }}
            onDeleteAssignment={deleteAssignment}
          />
        )}

        {activeTab === 'scratch_cards' && isPrincipalSuperAdmin && (
          <ScratchCardsAndResults
            type="cards"
            scratchCards={scratchCards}
            results={results}
            students={students}
            onGenerateBatch={generateBatchScratchCards}
            onSaveResult={async () => ({} as any)}
          />
        )}

        {activeTab === 'results' && (
          <ScratchCardsAndResults
            type="results"
            scratchCards={scratchCards}
            results={results}
            students={students}
            onGenerateBatch={generateBatchScratchCards}
            onSaveResult={async () => ({} as any)}
          />
        )}

        {activeTab === 'settings' && (
          <AdminsAndSettings
            type="settings"
            syncStatus={syncStatus}
            lastSyncTime={lastSyncTime}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <SchoolBadge size="xs" />
            <span className="font-semibold text-stone-700">MOAUM USTC Makurdi</span>
            <span>•</span>
            <span>Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Role: <strong className="uppercase">{currentRole ? currentRole.replace('_', ' ') : 'VISITOR'}</strong>
            </span>
            <span>•</span>
            <button
              onClick={() => setDeployModalOpen(true)}
              className="text-stone-700 hover:text-emerald-700 underline font-medium"
            >
              Export for GitHub & Vercel
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />

      {/* GitHub & Vercel Deployment Modal */}
      <GitHubVercelModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SchoolAppContent />
    </AuthProvider>
  );
}
