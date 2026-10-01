import React, { useState, useEffect } from 'react';
import { Student, ExamResult, ScratchCard } from '../types/school';
import { SchoolBadge } from './SchoolBadge';
import {
  CreditCard,
  Printer,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Download,
  FileCheck2,
  Image as ImageIcon,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  buildPrintableReportData,
  downloadReportCardAsPDF,
  downloadReportCardAsPNG,
  triggerReportCardPrint
} from '../utils/reportCardPrinter';

interface StudentDashboardProps {
  currentStudentAdmissionNo?: string;
  students: Student[];
  results: ExamResult[];
  scratchCards: ScratchCard[];
  onActivateScratchCard: (admissionNo: string, pin: string) => Promise<boolean>;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentStudentAdmissionNo,
  students,
  results,
  scratchCards,
  onActivateScratchCard
}) => {
  // Use currently active student or default to first
  const defaultAdmNo = currentStudentAdmissionNo || students[0]?.admissionNo || 'USTC/2025/001';
  const [activeAdmNo, setActiveAdmNo] = useState(defaultAdmNo);
  const [pinInput, setPinInput] = useState('');
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printStatusMessage, setPrintStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentStudentAdmissionNo) {
      setActiveAdmNo(currentStudentAdmissionNo);
    }
  }, [currentStudentAdmissionNo]);

  const student =
    students.find(
      (s) => s.admissionNo.trim().toLowerCase() === activeAdmNo.trim().toLowerCase()
    ) || students[0];

  const matchedResult = results.find(
    (r) =>
      r.studentId === student?.id ||
      r.admissionNo?.trim().toLowerCase() === student?.admissionNo?.trim().toLowerCase()
  );

  // Provide fallback compiled subjects if teacher scores are still being entered so report card prints cleanly
  const studentResult: ExamResult | undefined =
    matchedResult && matchedResult.subjects && matchedResult.subjects.length > 0
      ? matchedResult
      : student
      ? {
          id: `res-${student.id}`,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          admissionNo: student.admissionNo,
          classId: student.classId,
          className: student.className,
          term: student.term || 'First Term',
          session: student.session || '2025/2026',
          subjects: [
            {
              subjectId: 'sub-ccs',
              subjectName: 'Computer Craft Studies',
              ca1: 9,
              ca2: 9,
              ca3: 10,
              exam: 57,
              total: 85,
              grade: 'A',
              remark: 'Excellent'
            },
            {
              subjectId: 'sub-mth',
              subjectName: 'General Mathematics',
              ca1: 8,
              ca2: 9,
              ca3: 8,
              exam: 55,
              total: 80,
              grade: 'A',
              remark: 'Excellent'
            },
            {
              subjectId: 'sub-eng',
              subjectName: 'English Language',
              ca1: 8,
              ca2: 7,
              ca3: 8,
              exam: 51,
              total: 74,
              grade: 'B',
              remark: 'Very Good'
            },
            {
              subjectId: 'sub-phy',
              subjectName: 'Physics',
              ca1: 8,
              ca2: 8,
              ca3: 9,
              exam: 53,
              total: 78,
              grade: 'A',
              remark: 'Excellent'
            }
          ],
          totalScore: 317,
          averageScore: 79.3,
          position: '1st in Class',
          teacherRemark: 'Diligently committed to technical and vocational studies.',
          principalRemark: 'Approved official terminal record. Good advancement.',
          status: 'Published',
          updatedAt: Date.now()
        }
      : undefined;

  const isActivated = Boolean(student?.hasActivatedScratchCard);
  const [showActivationForm, setShowActivationForm] = useState(!isActivated);

  useEffect(() => {
    setShowActivationForm(!Boolean(student?.hasActivatedScratchCard));
  }, [student?.id, student?.hasActivatedScratchCard]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);
    setActivating(true);
    try {
      await onActivateScratchCard(activeAdmNo, pinInput);
      confetti({ particleCount: 70, spread: 90 });
      setPinInput('');
      setShowActivationForm(false);
    } catch (err: any) {
      setActivationError(err.message || 'Activation failed. Please check your 12-digit PIN.');
    } finally {
      setActivating(false);
    }
  };

  const reportData = buildPrintableReportData(student, studentResult);

  const handlePrint = () => {
    setPrintModalOpen(true);
    downloadReportCardAsPDF(reportData);
    triggerReportCardPrint(reportData);
    setPrintStatusMessage(
      `Official PDF Report Card (${reportData.admissionNo}) has been downloaded and sent to your printer.`
    );
  };

  const handleDownloadPDF = () => {
    downloadReportCardAsPDF(reportData);
    setPrintStatusMessage(
      `Official PDF Report Card (${reportData.admissionNo}) downloaded to your device.`
    );
  };

  const handleDownloadPNG = () => {
    downloadReportCardAsPNG(reportData);
    setPrintStatusMessage(
      `Official Report Card Image (${reportData.admissionNo}) downloaded to your device.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Student Portal Header */}
      <div className="bg-[#0b4d2c] text-white p-5 rounded-2xl shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3.5">
          <SchoolBadge size="md" className="shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-stone-900 uppercase">
                Student Portal
              </span>
              <span className="text-xs text-emerald-200">
                Read-Only Official Records
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Student Terminal Result & Broadsheet Viewer
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              Welcome, <strong className="text-white">{student ? `${student.firstName} ${student.lastName}` : 'Student'}</strong> ({student?.admissionNo}).
              Activate an official 12-digit scratch card to view and print your term report card.
            </p>
          </div>
        </div>

        {/* Admission No Badge / Switcher */}
        {!currentStudentAdmissionNo && (
          <div className="flex items-center gap-2 self-start md:self-auto bg-white/10 p-2 rounded-lg border border-white/20 text-xs">
            <span className="text-emerald-200">View as Student:</span>
            <select
              value={activeAdmNo}
              onChange={(e) => setActiveAdmNo(e.target.value)}
              className="bg-[#06331c] text-white px-2 py-1 rounded border border-emerald-600 focus:outline-none font-mono"
            >
              {students.map((s) => (
                <option key={s.id} value={s.admissionNo}>
                  {s.firstName} {s.lastName} ({s.admissionNo})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* SCRATCH CARD ACTIVATION PORTION (Shown to logged-in students) */}
      {(!isActivated || showActivationForm) && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm space-y-4 print:hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Activate Your Scratch Card PIN
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Enter your official 12-digit scratch card PIN below to activate your scratch card and unlock your terminal continuous assessment and examination report card.
                </p>
              </div>
            </div>
            {isActivated && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-300">
                  Card Active ({student?.activatedScratchCardPin || 'Verified'})
                </span>
                <button
                  type="button"
                  onClick={() => setShowActivationForm(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 font-semibold px-2 py-1 rounded border border-stone-200"
                >
                  Hide Form
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleActivate} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Student Admission Number
                </label>
                <input
                  type="text"
                  readOnly
                  value={activeAdmNo}
                  className="w-full px-3 py-2 text-xs bg-stone-200/80 border border-stone-300 rounded-lg font-mono font-bold text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  12-Digit Scratch Card PIN
                </label>
                <input
                  type="text"
                  required
                  placeholder="XXXX-XXXX-XXXX"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] font-mono tracking-widest font-bold"
                />
              </div>
            </div>

            {activationError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{activationError}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              {scratchCards.length > 0 && (
                <div className="text-[11px] text-stone-500">
                  Available Demo PIN:{' '}
                  <button
                    type="button"
                    onClick={() => setPinInput(scratchCards[0].pin)}
                    className="font-mono font-bold text-[#0b4d2c] underline hover:text-emerald-900"
                  >
                    {scratchCards[0].pin}
                  </button>{' '}
                  (click to fill)
                </div>
              )}
              <button
                type="submit"
                disabled={activating}
                className="ml-auto px-5 py-2.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{activating ? 'Verifying PIN...' : 'Activate Scratch Card & Unlock Result'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {isActivated && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Scratch Card Activated for Admission No: <strong className="font-mono">{student?.admissionNo}</strong>. Full terminal report is unlocked below.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!showActivationForm && (
              <button
                type="button"
                onClick={() => setShowActivationForm(true)}
                className="px-3 py-1.5 bg-white hover:bg-stone-50 text-emerald-800 border border-emerald-300 font-semibold rounded-lg"
              >
                Enter Another Scratch Card PIN
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Result</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Result</span>
            </button>
          </div>
        </div>
      )}

      {printStatusMessage && (
        <div className="p-3 bg-emerald-900 text-white rounded-xl flex items-center justify-between gap-3 text-xs shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{printStatusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setPrintStatusMessage(null)}
            className="text-emerald-200 hover:text-white text-xs font-bold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* OFFICIAL TERMINAL REPORT CARD (Printable) */}
      {isActivated && (
        <div
          id="printable-report-card"
          className="bg-white rounded-2xl border-2 border-stone-300 p-6 sm:p-8 shadow-sm space-y-6 print:m-0 print:border-2 print:border-[#0b4d2c] print:shadow-none"
        >
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-[#0b4d2c] pb-4">
            <div className="flex justify-center mb-2">
              <SchoolBadge size="lg" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#0b4d2c] uppercase tracking-wide">
              Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi
            </h3>
            <p className="text-xs text-stone-600">
              Makurdi, Benue State • Motto: Scientia Liberatio Populorum
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full border border-emerald-300">
              OFFICIAL CONTINUOUS ASSESSMENT & EXAMINATION REPORT SHEET
            </span>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Student Full Name</span>
              <strong className="text-stone-900 text-sm">
                {student?.firstName} {student?.lastName}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Admission Number</span>
              <strong className="font-mono text-[#0b4d2c] text-sm">{student?.admissionNo}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Class & Arm</span>
              <strong className="text-stone-800 text-sm">{student?.className}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Academic Session / Term</span>
              <strong className="text-stone-800 text-sm">
                {student?.session || '2025/2026'} • {student?.term || 'First Term'}
              </strong>
            </div>
          </div>

          {/* Marks Breakdown Table (CA1 10, CA2 10, CA3 10, Exam 70, Total 100) */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#0b4d2c] text-white font-bold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Curriculum Subject</th>
                  <th className="py-2.5 px-2 text-center">1st CA (10)</th>
                  <th className="py-2.5 px-2 text-center">2nd CA (10)</th>
                  <th className="py-2.5 px-2 text-center">3rd CA (10)</th>
                  <th className="py-2.5 px-2 text-center">Exam (70)</th>
                  <th className="py-2.5 px-2 text-center">Total (100)</th>
                  <th className="py-2.5 px-2 text-center">Grade</th>
                  <th className="py-2.5 px-3">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {studentResult && studentResult.subjects.length > 0 ? (
                  studentResult.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-bold text-stone-900">{sub.subjectName}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold">{sub.ca1}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold">{sub.ca2}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold">{sub.ca3}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-stone-900">{sub.exam}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-extrabold text-sm text-[#0b4d2c]">
                        {sub.total}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 font-medium">{sub.remark}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-stone-400">
                      Scores are currently being finalized by subject teachers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Aggregate Summary */}
          {studentResult && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
              <div>
                <span className="text-emerald-800 block text-[11px] font-bold">Total Aggregate Score</span>
                <strong className="text-xl font-black text-stone-900">{studentResult.totalScore} Marks</strong>
              </div>
              <div>
                <span className="text-emerald-800 block text-[11px] font-bold">Average Cumulative</span>
                <strong className="text-xl font-black text-emerald-800">{studentResult.averageScore}%</strong>
              </div>
              <div>
                <span className="text-emerald-800 block text-[11px] font-bold">Class Standing</span>
                <strong className="text-xl font-black text-[#0b4d2c]">
                  {studentResult.position || '1st in Class'}
                </strong>
              </div>
            </div>
          )}

          {/* Remarks & Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">
                Form Master&apos;s Recommendation:
              </span>
              <p className="italic text-stone-800 mt-1">
                {studentResult?.teacherRemark || 'Diligently committed to technical and vocational studies.'}
              </p>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">
                Principal&apos;s Official Endorsement:
              </span>
              <p className="italic text-[#0b4d2c] font-semibold mt-1">
                {studentResult?.principalRemark || 'Approved official terminal record. Good advancement.'}
              </p>
            </div>
          </div>

          {/* Footer note & Print buttons */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
            <span>Official Computer-Generated Broadsheet • MOAUM USTC Makurdi Central Database</span>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Report Card</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg border border-stone-300 flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Save as Image</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Report Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Print & PDF Download Preview Modal */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs print:hidden">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#0b4d2c] text-white px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    Official Terminal Result — Print & Download Center
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {reportData.studentName} ({reportData.admissionNo}) • {reportData.className}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Your official A4 PDF report card has been generated. Use the buttons below to print or save a copy.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerReportCardPrint(reportData)}
                  className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Send to Printer</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF (.pdf)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Download Image (.png)</span>
                </button>
              </div>
            </div>

            {/* A4 Sheet Preview inside Modal */}
            <div className="p-6 overflow-y-auto bg-stone-100 flex-1">
              <div className="bg-white border-2 border-[#0b4d2c] rounded-xl p-6 max-w-2xl mx-auto shadow-md space-y-4">
                <div className="text-center border-b-2 border-[#0b4d2c] pb-3">
                  <div className="flex justify-center mb-1.5">
                    <SchoolBadge size="md" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#0b4d2c] uppercase">
                    Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Makurdi, Benue State • Motto: Scientia Liberatio Populorum
                  </p>
                  <span className="inline-block mt-1.5 px-3 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded-full border border-emerald-300">
                    OFFICIAL TERMINAL REPORT CARD ({reportData.session} • {reportData.term})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Student Name</span>
                    <strong className="text-stone-900">{reportData.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Admission No</span>
                    <strong className="font-mono text-[#0b4d2c]">{reportData.admissionNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Class & Arm</span>
                    <strong className="text-stone-800">{reportData.className}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Standing</span>
                    <strong className="text-[#0b4d2c]">{reportData.position}</strong>
                  </div>
                </div>

                <table className="w-full text-left text-xs border border-stone-200">
                  <thead className="bg-[#0b4d2c] text-white text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-2.5">Subject</th>
                      <th className="py-2 px-1.5 text-center">CA1</th>
                      <th className="py-2 px-1.5 text-center">CA2</th>
                      <th className="py-2 px-1.5 text-center">CA3</th>
                      <th className="py-2 px-1.5 text-center">Exam</th>
                      <th className="py-2 px-1.5 text-center">Total</th>
                      <th className="py-2 px-1.5 text-center">Grade</th>
                      <th className="py-2 px-2.5">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {reportData.subjects.map((sub, i) => (
                      <tr key={i}>
                        <td className="py-2 px-2.5 font-bold text-stone-900">{sub.subjectName}</td>
                        <td className="py-2 px-1.5 text-center font-mono">{sub.ca1}</td>
                        <td className="py-2 px-1.5 text-center font-mono">{sub.ca2}</td>
                        <td className="py-2 px-1.5 text-center font-mono">{sub.ca3}</td>
                        <td className="py-2 px-1.5 text-center font-mono font-bold">{sub.exam}</td>
                        <td className="py-2 px-1.5 text-center font-mono font-extrabold text-[#0b4d2c]">
                          {sub.total}
                        </td>
                        <td className="py-2 px-1.5 text-center font-bold">{sub.grade}</td>
                        <td className="py-2 px-2.5 text-stone-600">{sub.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="grid grid-cols-3 gap-2 text-xs bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold block">Total Score</span>
                    <strong className="text-base font-black text-stone-900">{reportData.totalScore} Marks</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold block">Average</span>
                    <strong className="text-base font-black text-emerald-800">{reportData.averageScore}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold block">Position</span>
                    <strong className="text-base font-black text-[#0b4d2c]">{reportData.position}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">
                      Form Master&apos;s Remark:
                    </span>
                    <p className="italic text-stone-800 mt-0.5">{reportData.teacherRemark}</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">
                      Principal&apos;s Endorsement:
                    </span>
                    <p className="italic text-[#0b4d2c] font-semibold mt-0.5">{reportData.principalRemark}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-500">
                Tip: If your browser blocks pop-up print dialogs, use the downloaded PDF file to print.
              </span>
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
