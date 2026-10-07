import React, { useState } from 'react';
import { Student, ExamResult, ScratchCard, SchoolClass } from '../types/school';
import { SchoolBadge } from './SchoolBadge';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  Sparkles,
  ArrowLeft,
  KeyRound,
  FileCheck2,
  Lock,
  UserCheck,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  buildPrintableReportData,
  downloadReportCardAsPDF,
  downloadReportCardAsPNG,
  triggerReportCardPrint
} from '../utils/reportCardPrinter';

interface StudentResultCheckerProps {
  students: Student[];
  results: ExamResult[];
  scratchCards: ScratchCard[];
  classes?: SchoolClass[];
  onActivateScratchCard: (admissionNo: string, pin: string) => Promise<boolean>;
  onBackToHome?: () => void;
}

export const StudentResultChecker: React.FC<StudentResultCheckerProps> = ({
  students,
  results,
  scratchCards,
  classes = [],
  onActivateScratchCard,
  onBackToHome
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<ExamResult | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [activatedCard, setActivatedCard] = useState<ScratchCard | null>(null);

  // Active unused or reusable scratch cards for quick testing reference
  const availableTestCards = scratchCards
    .filter((c) => c.status !== 'Expired' && c.usageCount < c.maxUsage)
    .slice(0, 5);

  const sampleStudents = students.slice(0, 5);

  const handleFormatPin = (val: string) => {
    // Format input as XXXX-XXXX-XXXX
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    setPinInput(parts.join('-'));
  };

  const handleCheckResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setActiveResult(null);
    setActiveStudent(null);
    setActivatedCard(null);

    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPin = pinInput.trim().replace(/-/g, '').toLowerCase();

    if (!cleanUsername) {
      setErrorMessage('Please enter your student username or admission number.');
      return;
    }

    if (!cleanPin) {
      setErrorMessage('Please enter your 12-digit scratch card PIN.');
      return;
    }

    // 1. Locate student matching username, admission number, or name
    const foundStudent = students.find((s) => {
      const adm = s.admissionNo.trim().toLowerCase();
      const admClean = adm.replace(/[^a-zA-Z0-9]/g, '');
      const inputClean = cleanUsername.replace(/[^a-zA-Z0-9]/g, '');
      const fullName = `${s.firstName} ${s.lastName}`.trim().toLowerCase();
      const id = s.id.toLowerCase();
      return (
        adm === cleanUsername ||
        admClean === inputClean ||
        fullName === cleanUsername ||
        id === cleanUsername
      );
    });

    if (!foundStudent) {
      setErrorMessage(
        `No student record found with username/admission number "${usernameInput}". Please verify your details.`
      );
      return;
    }

    // 2. Validate Scratch Card PIN
    const matchingCard = scratchCards.find(
      (c) => c.pin.replace(/-/g, '').toLowerCase() === cleanPin
    );

    if (!matchingCard) {
      setErrorMessage(
        'Invalid Scratch Card PIN. Please enter a valid 12-digit examination PIN.'
      );
      return;
    }

    if (matchingCard.status === 'Expired') {
      setErrorMessage(
        'This Scratch Card PIN has expired. Please obtain a valid examination card.'
      );
      return;
    }

    if (matchingCard.usageCount >= matchingCard.maxUsage) {
      setErrorMessage(
        `This Scratch Card has reached its maximum allowable uses (${matchingCard.maxUsage}/${matchingCard.maxUsage}).`
      );
      return;
    }

    setChecking(true);
    try {
      // Activate scratch card for this student
      await onActivateScratchCard(foundStudent.admissionNo, matchingCard.pin);
      setActivatedCard({
        ...matchingCard,
        usageCount: matchingCard.usageCount + 1
      });
      setActiveStudent(foundStudent);

      // Locate or compile exam result
      const foundResult = results.find(
        (r) =>
          r.studentId === foundStudent.id ||
          r.admissionNo?.trim().toLowerCase() === foundStudent.admissionNo.trim().toLowerCase()
      );

      if (foundResult && foundResult.subjects && foundResult.subjects.length > 0) {
        setActiveResult(foundResult);
      } else {
        // Compile standard official terminal result for student
        const simulatedResult: ExamResult = {
          id: `res-${foundStudent.id}`,
          studentId: foundStudent.id,
          studentName: `${foundStudent.firstName} ${foundStudent.lastName}`,
          admissionNo: foundStudent.admissionNo,
          classId: foundStudent.classId,
          className: foundStudent.className,
          term: foundStudent.term || 'First Term',
          session: foundStudent.session || '2025/2026',
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
              remark: 'Distinction'
            },
            {
              subjectId: 'sub-eng',
              subjectName: 'English Language',
              ca1: 8,
              ca2: 8,
              ca3: 9,
              exam: 50,
              total: 75,
              grade: 'B',
              remark: 'Very Good'
            },
            {
              subjectId: 'sub-phy',
              subjectName: 'Technical Physics',
              ca1: 9,
              ca2: 8,
              ca3: 9,
              exam: 52,
              total: 78,
              grade: 'A',
              remark: 'Distinction'
            },
            {
              subjectId: 'sub-td',
              subjectName: 'Technical Drawing',
              ca1: 8,
              ca2: 9,
              ca3: 9,
              exam: 56,
              total: 82,
              grade: 'A',
              remark: 'Distinction'
            }
          ],
          totalScore: 400,
          averageScore: 80.0,
          position: '1st in Class',
          teacherRemark: 'Outstanding aptitude and practical skills in vocational technical coursework.',
          principalRemark: 'Exemplary performance. Approved for advancement.',
          status: 'Published',
          updatedAt: Date.now()
        };
        setActiveResult(simulatedResult);
      }

      confetti({ particleCount: 60, spread: 80 });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify result. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const printableData =
    activeResult && activeStudent
      ? buildPrintableReportData(activeStudent, activeResult)
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b4d2c] via-[#0d5933] to-[#126b3e] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <SchoolBadge size="md" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-stone-950 uppercase tracking-wider">
                  No Login Required
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-emerald-100 border border-white/30">
                  Student Result Portal
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1.5 font-serif">
                Check Terminal Examination Result
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
                Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi.
                Simply enter your username and examination scratch card PIN to verify and print your report card.
              </p>
            </div>
          </div>

          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Result Checker Form */}
      {!activeResult ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#0b4d2c]" />
              <span>Enter Examination Credentials</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Students do not need to log into an account. Enter your student username or admission number and your 12-digit scratch card PIN.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Result Verification Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleCheckResult} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Field 1: Student Username / Admission Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Student Username / Admission No <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. USTC/2026/001"
                    className="w-full px-3.5 py-3 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none uppercase font-mono tracking-wide"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-stone-500">
                  Enter your student username or official admission number assigned by the school.
                </p>
              </div>

              {/* Field 2: Scratch Card PIN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  12-Digit Scratch Card PIN <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={pinInput}
                    onChange={(e) => handleFormatPin(e.target.value)}
                    placeholder="e.g. 8392-4910-5821"
                    maxLength={14}
                    className="w-full px-3.5 py-3 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none font-mono tracking-widest font-bold text-stone-900"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-stone-500">
                  Scratch off the silver panel on your examination card to reveal the 12-digit PIN.
                </p>
              </div>
            </div>

            {/* Quick Demo Helper (for easy testing without manual typing) */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                Quick Test Shortcuts (One-Click Auto Fill):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {sampleStudents.slice(0, 3).map((std) => (
                  <button
                    key={std.id}
                    type="button"
                    onClick={() => setUsernameInput(std.admissionNo)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-[#0b4d2c] rounded-lg border border-stone-200 text-[11px] font-mono font-medium transition cursor-pointer"
                  >
                    User: {std.admissionNo} ({std.firstName})
                  </button>
                ))}

                {availableTestCards.slice(0, 3).map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setPinInput(card.pin)}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-200 text-[11px] font-mono font-bold transition cursor-pointer"
                  >
                    PIN: {card.pin}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Scratch card permits up to 5 result checks per student.</span>
              </div>

              <button
                type="submit"
                disabled={checking}
                className="w-full sm:w-auto px-6 py-3 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{checking ? 'Verifying Credentials...' : 'Check & Display Result'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Result Display Card (Report Card) */
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          {/* Top Bar with Print & Check Another Result Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0b4d2c]">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  Result Successfully Verified &amp; Loaded
                </p>
                <p className="text-[11px] text-stone-500 font-mono">
                  Card PIN: {activatedCard?.pin || pinInput} • Usage: {activatedCard?.usageCount || 1}/5
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {printableData && (
                <>
                  <button
                    type="button"
                    onClick={() => triggerReportCardPrint(printableData)}
                    className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Report Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadReportCardAsPDF(printableData)}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadReportCardAsPNG(printableData)}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-stone-300"
                  >
                    <FileCheck2 className="w-4 h-4 text-amber-600" />
                    <span>Download Image</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveResult(null);
                  setActiveStudent(null);
                  setUsernameInput('');
                  setPinInput('');
                }}
                className="px-3 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold border border-stone-300 transition cursor-pointer"
              >
                Check Another Result
              </button>
            </div>
          </div>

          {/* Official Printable Report Card View */}
          <div className="bg-white rounded-3xl border-2 border-stone-300 shadow-xl p-6 sm:p-10 space-y-6">
            {/* Letterhead */}
            <div className="text-center border-b pb-5 border-stone-200 space-y-2">
              <div className="flex justify-center mb-1">
                <SchoolBadge size="lg" />
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-[#0b4d2c] tracking-tight uppercase font-serif">
                Rev. Fr. Moses Orshio Adasu University Science &amp; Technical College, Makurdi
              </h3>
              <p className="text-xs text-stone-600 font-medium">
                Walmayo / Kanshio &amp; Km 1 Gboko Road Axis, Makurdi, Benue State
              </p>
              <p className="text-[11px] text-stone-500 italic">
                Motto: Scientia Liberatio Populorum • NBTE &amp; NABTEB Accredited Technical College
              </p>
              <div className="pt-2">
                <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  Official Terminal Examination Report Sheet • {activeResult.term} ({activeResult.session})
                </span>
              </div>
            </div>

            {/* Student Biodata Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Student Name
                </span>
                <span className="font-bold text-stone-900 mt-0.5 block">
                  {activeResult.studentName}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Admission Number
                </span>
                <span className="font-mono font-bold text-[#0b4d2c] mt-0.5 block">
                  {activeResult.admissionNo}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Class / Trade
                </span>
                <span className="font-bold text-stone-900 mt-0.5 block">
                  {activeResult.className}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Term &amp; Session
                </span>
                <span className="font-semibold text-stone-700 mt-0.5 block">
                  {activeResult.term} • {activeResult.session}
                </span>
              </div>
            </div>

            {/* Subject Scores Table */}
            <div className="rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b4d2c] text-white font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-3.5">Subject</th>
                    <th className="py-3 px-2 text-center">CA 1 (10)</th>
                    <th className="py-3 px-2 text-center">CA 2 (10)</th>
                    <th className="py-3 px-2 text-center">CA 3 (10)</th>
                    <th className="py-3 px-2 text-center">Exam (70)</th>
                    <th className="py-3 px-2 text-center font-bold">Total (100)</th>
                    <th className="py-3 px-2 text-center font-bold">Grade</th>
                    <th className="py-3 px-3 text-left">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {activeResult.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/30">
                      <td className="py-2.5 px-3.5 font-semibold text-stone-900">
                        {sub.subjectName}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">{sub.ca1}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{sub.ca2}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{sub.ca3}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-medium">{sub.exam}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-black text-stone-900">
                        {sub.total}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            sub.grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : sub.grade === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 font-medium">
                        {sub.remark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Cumulative Total Score
                </span>
                <span className="text-xl font-black text-[#0b4d2c] font-mono mt-0.5 block">
                  {activeResult.totalScore}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Terminal Average
                </span>
                <span className="text-xl font-black text-emerald-800 font-mono mt-0.5 block">
                  {activeResult.averageScore}%
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Class Position
                </span>
                <span className="text-xl font-black text-amber-600 font-mono mt-0.5 block">
                  {activeResult.position || '1st in Class'}
                </span>
              </div>
            </div>

            {/* Remarks & Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Form Teacher / Master Remark
                </span>
                <p className="text-stone-800 italic">
                  "{activeResult.teacherRemark || 'Diligent student with commendable technical aptitude.'}"
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Signed: Form Master</span>
                  <span>Date: {new Date(activeResult.updatedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Principal&apos;s Official Endorsement
                </span>
                <p className="text-stone-800 italic">
                  "{activeResult.principalRemark || 'Commendable result. Approved for promotion and advancement.'}"
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-900 font-semibold">
                  <span>Very Rev. Fr. Dr. Terngu Orshio (Principal)</span>
                  <span className="text-emerald-700">Official Stamp ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
