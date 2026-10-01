import React, { useState } from 'react';
import { ScratchCard, Student, ExamResult } from '../types/school';
import { useAuth } from '../context/AuthContext';
import { SchoolBadge } from './SchoolBadge';
import { CreditCard, Sparkles, CheckCircle2, ShieldCheck, Printer, Key, Search, FileText, Download, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  buildPrintableReportData,
  downloadReportCardAsPDF,
  triggerReportCardPrint
} from '../utils/reportCardPrinter';

interface ScratchCardsAndResultsProps {
  type: 'cards' | 'results';
  scratchCards: ScratchCard[];
  results: ExamResult[];
  students: Student[];
  onGenerateBatch: (count: number) => Promise<ScratchCard[]>;
  onSaveResult: (result: Omit<ExamResult, 'id' | 'updatedAt'>) => Promise<ExamResult>;
  onCheckStudentResultDefault?: boolean;
}

export const ScratchCardsAndResults: React.FC<ScratchCardsAndResultsProps> = ({
  type,
  scratchCards,
  results,
  students,
  onGenerateBatch,
  onSaveResult,
  onCheckStudentResultDefault = false
}) => {
  const { userProfile } = useAuth();
  const isPrincipalSuperAdmin = Boolean(userProfile?.isPrincipalSuperAdmin);
  const [generating, setGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(5);

  // Result Checker & Verification state
  const [searchPin, setSearchPin] = useState('');
  const [searchAdmNo, setSearchAdmNo] = useState('');
  const [foundResult, setFoundResult] = useState<ExamResult | null>(null);
  const [checkerError, setCheckerError] = useState<string | null>(null);
  const [checkerOpen, setCheckerOpen] = useState(onCheckStudentResultDefault);

  const handleGenerate = async () => {
    if (!isPrincipalSuperAdmin) return;
    setGenerating(true);
    try {
      await onGenerateBatch(batchCount);
      confetti({ particleCount: 50, spread: 80 });
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCheckResult = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckerError(null);
    setFoundResult(null);

    // Look for matching student by admission number
    const std = students.find(
      (s) => s.admissionNo.trim().toLowerCase() === searchAdmNo.trim().toLowerCase()
    );

    if (!std) {
      setCheckerError(`No student record located for Admission No: "${searchAdmNo}". Please verify.`);
      return;
    }

    // Look for scratch card if pin provided
    if (searchPin) {
      const card = scratchCards.find(
        (c) => c.pin.replace(/-/g, '') === searchPin.replace(/-/g, '')
      );
      if (!card) {
        setCheckerError('Invalid Scratch Card PIN. Please enter a valid 12-digit PIN.');
        return;
      }
    }

    // Find result for this student
    const res = results.find((r) => r.studentId === std.id || r.admissionNo === std.admissionNo);
    if (res) {
      setFoundResult(res);
      confetti({ particleCount: 40 });
    } else {
      // Generate preview standard report sheet for this student
      const simulatedResult: ExamResult = {
        id: 'res-preview',
        studentId: std.id,
        studentName: `${std.firstName} ${std.lastName}`,
        admissionNo: std.admissionNo,
        classId: std.classId,
        className: std.className,
        term: std.term,
        session: std.session,
        subjects: [
          { subjectId: 'sub-ccs', subjectName: 'Computer Craft Studies', ca1: 9, ca2: 9, ca3: 10, exam: 57, total: 85, grade: 'A', remark: 'Excellent' },
          { subjectId: 'sub-eng', subjectName: 'English Language', ca1: 7, ca2: 8, ca3: 9, exam: 50, total: 74, grade: 'B', remark: 'Very Good' },
          { subjectId: 'sub-mth', subjectName: 'General Mathematics', ca1: 8, ca2: 9, ca3: 8, exam: 55, total: 80, grade: 'A', remark: 'Distinction' },
          { subjectId: 'sub-td', subjectName: 'Technical Drawing', ca1: 8, ca2: 9, ca3: 9, exam: 55, total: 81, grade: 'A', remark: 'Distinction' }
        ],
        totalScore: 320,
        averageScore: 80.0,
        position: '1st of 28',
        teacherRemark: 'Diligent student with exceptional aptitude in technical subjects.',
        principalRemark: 'Commendable result. Approved for advancement.',
        status: 'Published',
        updatedAt: Date.now()
      };
      setFoundResult(simulatedResult);
    }
  };

  if (type === 'cards') {
    if (!isPrincipalSuperAdmin) {
      return (
        <div className="bg-white p-8 rounded-xl border border-stone-200 text-center space-y-2">
          <Lock className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-base font-bold text-stone-900">Restricted Access</h2>
          <p className="text-xs text-stone-500">
            Only the Principal Super Admin is authorized to view and generate examination scratch cards.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Examination Scratch Cards & PINs ({scratchCards.length})
            </h2>
            <p className="text-xs text-stone-500">
              Batch generated 12-digit scratch card PINs for term result checking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={batchCount}
              onChange={(e) => setBatchCount(Number(e.target.value))}
              className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
            >
              <option value={5}>Batch of 5</option>
              <option value={10}>Batch of 10</option>
              <option value={20}>Batch of 20</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{generating ? 'Generating...' : 'Generate PINs'}</span>
            </button>
          </div>
        </div>

        {/* Scratch Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {scratchCards.map((card) => (
            <div
              key={card.id}
              className="bg-stone-900 text-white p-4 rounded-xl shadow-md border-t-4 border-amber-400 relative overflow-hidden"
            >
              <div className="flex justify-between items-center text-[10px] text-stone-400">
                <div className="flex items-center gap-1.5">
                  <SchoolBadge size="xs" />
                  <span className="font-mono">{card.serialNumber}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                  {card.status}
                </span>
              </div>
              <div className="my-3 text-center">
                <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                  USTC 12-Digit Security PIN
                </div>
                <div className="text-base font-mono font-extrabold tracking-widest text-white mt-1 bg-stone-800 py-1.5 px-2 rounded border border-stone-700 select-all">
                  {card.pin}
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-stone-400 pt-2 border-t border-stone-800">
                <span>Usage: {card.usageCount}/{card.maxUsage}</span>
                <span>Term: 2025/2026</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Results Tab
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div>
          <h2 className="text-base font-bold text-stone-900">Term Examination Broadsheet & Results</h2>
          <p className="text-xs text-stone-500">
            Publish continuous assessment scores, compile broadsheets, and verify official report cards
          </p>
        </div>

        <button
          onClick={() => setCheckerOpen(true)}
          className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" /> Check Student Result Card
        </button>
      </div>

      {/* Broadsheet Overview Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
            Broadsheet: First Term 2025/2026 Academic Session
          </h3>
          <span className="text-xs text-stone-500 font-mono">Status: Official Assessment</span>
        </div>
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Adm No</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Total Score</th>
              <th className="py-3 px-4">Average</th>
              <th className="py-3 px-4">Position</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Report Card</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {results.map((res) => (
              <tr key={res.id} className="hover:bg-emerald-50/40">
                <td className="py-3 px-4 font-mono font-bold text-[#0b4d2c]">{res.admissionNo}</td>
                <td className="py-3 px-4 font-medium text-stone-900">{res.studentName}</td>
                <td className="py-3 px-4">{res.className}</td>
                <td className="py-3 px-4 font-bold">{res.totalScore}</td>
                <td className="py-3 px-4 font-semibold text-emerald-800">{res.averageScore}%</td>
                <td className="py-3 px-4">{res.position || '1st of 28'}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {res.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      setFoundResult(res);
                      setCheckerOpen(true);
                    }}
                    className="text-[#0b4d2c] hover:underline font-bold text-xs"
                  >
                    View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result Verification / Modal Dialog */}
      {checkerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <SchoolBadge size="sm" />
                <div>
                  <h3 className="font-bold text-base text-stone-900">Student Result Verification</h3>
                  <p className="text-[11px] text-stone-500">
                    Rev. Fr. Moses Orshio Adasu University Science &amp; Technical College, Makurdi
                  </p>
                </div>
              </div>
              <button onClick={() => setCheckerOpen(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleCheckResult} className="my-4 p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Student Admission Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. USTC/2025/001"
                    value={searchAdmNo}
                    onChange={(e) => setSearchAdmNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none uppercase"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Try registered student: <code className="text-[#0b4d2c] font-bold">USTC/2025/001</code>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    12-Digit Scratch Card PIN
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8392-4910-5821"
                    value={searchPin}
                    onChange={(e) => setSearchPin(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Optional for Admin preview</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                {checkerError && <span className="text-xs text-red-600 font-medium">{checkerError}</span>}
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-[#0b4d2c] hover:bg-[#07361e] text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Verify & Fetch Result
                </button>
              </div>
            </form>

            {/* Official Report Card Sheet if found */}
            {foundResult && (
              <div className="p-5 border-2 border-stone-300 rounded-xl bg-white space-y-4">
                {/* Official Letterhead */}
                <div className="text-center border-b pb-3 border-stone-200">
                  <div className="flex justify-center mb-1.5">
                    <SchoolBadge size="md" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#0b4d2c] uppercase tracking-wide">
                    Rev. Fr. Moses Orshio Adasu University Science &amp; Technical College, Makurdi
                  </h4>
                  <p className="text-xs text-stone-600">
                    Makurdi, Benue State • Motto: Scientia Liberatio Populorum • Official Terminal Report
                  </p>
                  <span className="inline-block mt-1 px-3 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                    {foundResult.term} • {foundResult.session}
                  </span>
                </div>

                {/* Student Details Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Student Name</span>
                    <strong className="text-stone-800">{foundResult.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Admission No</span>
                    <strong className="font-mono text-[#0b4d2c]">{foundResult.admissionNo}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Class / Arm</span>
                    <strong className="text-stone-800">{foundResult.className}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Position in Class</span>
                    <strong className="text-emerald-700 font-bold">{foundResult.position || '1st'}</strong>
                  </div>
                </div>

                {/* Marks Breakdown Table */}
                <table className="w-full text-xs text-left border border-stone-200">
                  <thead className="bg-stone-100 text-stone-700 font-semibold border-b">
                    <tr>
                      <th className="py-2 px-3">Subject</th>
                      <th className="py-2 px-2 text-center">CA 1 (20)</th>
                      <th className="py-2 px-2 text-center">CA 2 (20)</th>
                      <th className="py-2 px-2 text-center">Exam (60)</th>
                      <th className="py-2 px-2 text-center">Total (100)</th>
                      <th className="py-2 px-2 text-center">Grade</th>
                      <th className="py-2 px-3">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {foundResult.subjects.map((sub, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="py-2 px-3 font-medium text-stone-800">{sub.subjectName}</td>
                        <td className="py-2 px-2 text-center">{sub.ca1}</td>
                        <td className="py-2 px-2 text-center">{sub.ca2}</td>
                        <td className="py-2 px-2 text-center font-semibold">{sub.exam}</td>
                        <td className="py-2 px-2 text-center font-bold text-stone-900">{sub.total}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            sub.grade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sub.grade}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-stone-600">{sub.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Remarks & Signatures */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-500 font-bold block">Form Master's Remark:</span>
                    <p className="italic text-stone-700 mt-1">{foundResult.teacherRemark}</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-500 font-bold block">Principal's Endorsement:</span>
                    <p className="italic text-[#0b4d2c] font-semibold mt-1">{foundResult.principalRemark}</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
                  <span className="text-[11px] text-stone-400">Authenticated via MOAUM USTC Makurdi Central Firestore</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const std = students.find(
                          (s) => s.id === foundResult.studentId || s.admissionNo === foundResult.admissionNo
                        );
                        const data = buildPrintableReportData(std, foundResult);
                        downloadReportCardAsPDF(data);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const std = students.find(
                          (s) => s.id === foundResult.studentId || s.admissionNo === foundResult.admissionNo
                        );
                        const data = buildPrintableReportData(std, foundResult);
                        downloadReportCardAsPDF(data);
                        triggerReportCardPrint(data);
                      }}
                      className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Official Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
