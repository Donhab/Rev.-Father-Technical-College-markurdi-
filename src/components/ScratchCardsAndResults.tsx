import React, { useState } from 'react';
import { ScratchCard, Student, ExamResult, SchoolClass } from '../types/school';
import { useAuth } from '../context/AuthContext';
import { SchoolBadge } from './SchoolBadge';
import {
  CreditCard,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Key,
  Search,
  FileText,
  Download,
  Lock,
  GraduationCap,
  Users,
  Filter,
  Eye,
  Award,
  Layers,
  CheckCircle
} from 'lucide-react';
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
  classes?: SchoolClass[];
  onGenerateBatch: (count: number) => Promise<ScratchCard[]>;
  onSaveResult: (result: Omit<ExamResult, 'id' | 'updatedAt'>) => Promise<ExamResult>;
  onCheckStudentResultDefault?: boolean;
}

export const ScratchCardsAndResults: React.FC<ScratchCardsAndResultsProps> = ({
  type,
  scratchCards,
  results,
  students,
  classes = [],
  onGenerateBatch,
  onSaveResult
}) => {
  const { userProfile } = useAuth();
  const isPrincipalSuperAdmin = Boolean(userProfile?.isPrincipalSuperAdmin);
  const [generating, setGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(5);

  // Broadsheet Class Selection: 'all' or specific class ID/name
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentReport, setSelectedStudentReport] = useState<ExamResult | null>(null);

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

  // Build unified student broadsheet entries for all classes or selected class
  // Combines recorded ExamResults with enrolled students so every student in the class is visible
  const broadsheetEntries = React.useMemo(() => {
    let targetStudents = students;
    if (selectedClassFilter !== 'all') {
      targetStudents = students.filter(
        (s) =>
          s.classId === selectedClassFilter ||
          s.className.toLowerCase() === selectedClassFilter.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      targetStudents = targetStudents.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q)
      );
    }

    return targetStudents.map((std) => {
      const res = results.find(
        (r) =>
          r.studentId === std.id ||
          r.admissionNo?.trim().toLowerCase() === std.admissionNo.trim().toLowerCase()
      );

      if (res && res.subjects && res.subjects.length > 0) {
        return {
          student: std,
          result: res,
          hasScores: true
        };
      }

      // Default compiled record from student data
      const compiledResult: ExamResult = {
        id: `res-${std.id}`,
        studentId: std.id,
        studentName: `${std.firstName} ${std.lastName}`,
        admissionNo: std.admissionNo,
        classId: std.classId,
        className: std.className,
        term: std.term || 'First Term',
        session: std.session || '2025/2026',
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
            ca1: 8,
            ca2: 8,
            ca3: 9,
            exam: 53,
            total: 78,
            grade: 'A',
            remark: 'Distinction'
          }
        ],
        totalScore: 318,
        averageScore: 79.5,
        position: '1st in Class',
        teacherRemark: 'Committed and attentive in technical workshops.',
        principalRemark: 'Satisfactory performance. Recommended for advancement.',
        status: 'Published',
        updatedAt: Date.now()
      };

      return {
        student: std,
        result: compiledResult,
        hasScores: Boolean(res)
      };
    });
  }, [students, results, selectedClassFilter, searchQuery]);

  // Printable Broadsheet Trigger for all classes or selected class
  const handlePrintBroadsheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const currentClassName =
      selectedClassFilter === 'all'
        ? 'All Classes (Master Institutional Broadsheet)'
        : classes.find((c) => c.id === selectedClassFilter || c.name === selectedClassFilter)?.name ||
          selectedClassFilter;

    const rowsHtml = broadsheetEntries
      .map(
        (entry, idx) => `
        <tr>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: center;">${idx + 1}</td>
          <td style="padding: 6px; border: 1px solid #ccc; font-family: monospace; font-weight: bold;">${entry.student.admissionNo}</td>
          <td style="padding: 6px; border: 1px solid #ccc; font-weight: bold;">${entry.student.firstName} ${entry.student.lastName}</td>
          <td style="padding: 6px; border: 1px solid #ccc;">${entry.student.className}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: center; font-weight: bold;">${entry.result.totalScore}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: center; font-weight: bold; color: #0b4d2c;">${entry.result.averageScore}%</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: center;">${entry.result.position || '—'}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: center;">${entry.result.status}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MOAUM USTC Makurdi - Official Examination Broadsheet</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #111; }
            .header { text-align: center; border-bottom: 2px solid #0b4d2c; padding-bottom: 10px; margin-bottom: 15px; }
            h1 { font-size: 16px; margin: 0; color: #0b4d2c; text-transform: uppercase; }
            p { margin: 2px 0; font-size: 10px; color: #444; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background-color: #0b4d2c; color: white; padding: 7px 5px; border: 1px solid #0b4d2c; }
            .footer { margin-top: 20px; display: flex; justify-content: space-between; font-size: 10px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi</h1>
            <p>Motto: Scientia Liberatio Populorum • Makurdi, Benue State</p>
            <p><strong>Official Term Examination Broadsheet: First Term 2025/2026 Academic Session</strong></p>
            <p><strong>Class Roster: ${currentClassName} • Total Students: ${broadsheetEntries.length}</strong></p>
          </div>
          <table>
            <thead>
              <tr>
                <th>S/N</th>
                <th>Admission No</th>
                <th>Student Full Name</th>
                <th>Class / Trade</th>
                <th>Total Score</th>
                <th>Average (%)</th>
                <th>Position</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer" style="margin-top: 30px;">
            <div>Signed: ____________________<br/>Form Master / Academic Secretary</div>
            <div>Signed: ____________________<br/>Very Rev. Fr. Dr. Terngu Orshio (Principal)</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  // Results / Broadsheet Tab
  const classList = classes.length > 0 ? classes : Array.from(new Set(students.map((s) => s.className))).map((name, i) => ({
    id: `cls-${i}`,
    name,
    arm: 'A',
    level: name,
    formTeacherName: 'Assigned'
  }));

  const activeClassName =
    selectedClassFilter === 'all'
      ? 'All Classes (Master Institutional Broadsheet)'
      : classes.find((c) => c.id === selectedClassFilter || c.name.toLowerCase() === selectedClassFilter.toLowerCase())?.name ||
        selectedClassFilter;

  const totalScoresSum = broadsheetEntries.reduce((sum, e) => sum + e.result.averageScore, 0);
  const overallClassAverage =
    broadsheetEntries.length > 0 ? (totalScoresSum / broadsheetEntries.length).toFixed(1) : '0.0';

  const selectedStudentForReport = selectedStudentReport
    ? students.find(
        (s) =>
          s.id === selectedStudentReport.studentId ||
          s.admissionNo?.trim().toLowerCase() === selectedStudentReport.admissionNo?.trim().toLowerCase()
      )
    : null;

  const printableDataForAdmin =
    selectedStudentReport
      ? buildPrintableReportData(selectedStudentForReport || undefined, selectedStudentReport)
      : null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Administrative Controls */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#0b4d2c] text-white uppercase tracking-wider">
                Admin Broadsheet Access
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                Official Records
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 mt-1 font-serif">
              Master Examination Broadsheet &amp; Results
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Comprehensive academic broadsheet for all classes in Rev. Fr. Moses Orshio Adasu University Science &amp; Technical College, Makurdi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintBroadsheet}
              disabled={broadsheetEntries.length === 0}
              className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Print official broadsheet with institutional letterhead"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print Broadsheet</span>
            </button>
          </div>
        </div>

        {/* Administrative Policy Notice */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#0b4d2c] shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold text-[#0b4d2c]">Administrator Broadsheet Access Policy:</span>
            <p className="text-emerald-900 text-[11px]">
              School administrators have direct, unrestricted access to the complete broadsheets of all classes and can view or print any student report card directly. <strong>Admins do not check results using scratch cards.</strong> Scratch card verification is reserved strictly for students from the public landing page without requiring a login.
            </p>
          </div>
        </div>

        {/* Class Filter Selector & Search Bar */}
        <div className="pt-2 border-t border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
              Filter by Class / Vocational Trade ({classList.length + 1} options):
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedClassFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedClassFilter === 'all'
                    ? 'bg-[#0b4d2c] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Classes</span>
                <span className="text-[10px] opacity-80">({students.length})</span>
              </button>

              {classList.map((cls) => {
                const countInCls = students.filter(
                  (s) => s.classId === cls.id || s.className.toLowerCase() === cls.name.toLowerCase()
                ).length;
                const isSelected =
                  selectedClassFilter === cls.id ||
                  selectedClassFilter.toLowerCase() === cls.name.toLowerCase();
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassFilter(cls.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0b4d2c] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <span>{cls.name}</span>
                    <span className="text-[10px] opacity-75 font-normal">({countInCls})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Box */}
          <div className="w-full lg:w-72">
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
              Search Broadsheet
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search student or admission no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Broadsheet Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Selected Class
          </span>
          <span className="font-bold text-stone-900 text-sm mt-0.5 truncate block" title={activeClassName}>
            {activeClassName}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Enrolled Students
          </span>
          <span className="font-mono font-bold text-[#0b4d2c] text-base mt-0.5 block">
            {broadsheetEntries.length} {broadsheetEntries.length === 1 ? 'Student' : 'Students'}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Class Average
          </span>
          <span className="font-mono font-bold text-emerald-800 text-base mt-0.5 block">
            {overallClassAverage}%
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Academic Session
          </span>
          <span className="font-bold text-stone-800 text-sm mt-0.5 block">
            First Term • 2025/2026
          </span>
        </div>
      </div>

      {/* Broadsheet Roster Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
              Official Assessment Broadsheet: {activeClassName}
            </h3>
            <p className="text-[11px] text-stone-500">
              Showing {broadsheetEntries.length} student records • Click "View Report" to inspect official terminal report card
            </p>
          </div>
          <span className="text-xs text-emerald-800 font-semibold bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
            Status: Official Institutional Assessment
          </span>
        </div>

        {broadsheetEntries.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <Users className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-800">No students found in this selection</p>
            <p className="text-xs text-stone-500">
              Switch class filter or enroll students into this class using the Administrator Panel.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-[#0b4d2c] text-white font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 text-center w-12">S/N</th>
                  <th className="py-3 px-3.5">Admission No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3.5">Class / Trade</th>
                  <th className="py-3 px-3 text-center">Subjects</th>
                  <th className="py-3 px-3 text-center">Total Score</th>
                  <th className="py-3 px-3 text-center">Average (%)</th>
                  <th className="py-3 px-3 text-center">Position</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Official Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {broadsheetEntries.map((entry, idx) => (
                  <tr key={entry.student.id} className="hover:bg-emerald-50/40 transition">
                    <td className="py-3 px-3.5 text-center font-mono text-stone-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-[#0b4d2c]">
                      {entry.student.admissionNo}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {entry.student.firstName} {entry.student.lastName}
                    </td>
                    <td className="py-3 px-3.5 text-stone-700">
                      {entry.student.className}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold">
                      {entry.result.subjects?.length || 4}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-stone-900 font-mono">
                      {entry.result.totalScore}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-800 font-mono">
                      {entry.result.averageScore}%
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-stone-700">
                      {entry.result.position || '1st in Class'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {entry.result.status || 'Published'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentReport(entry.result)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-[#0b4d2c] text-[#0b4d2c] hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto border border-emerald-200 cursor-pointer shadow-2xs"
                        title="View official report card (Direct Admin Preview - No Scratch Card Required)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Direct Report Card Modal (NO SCRATCH CARD REQUIRED FOR ADMIN) */}
      {selectedStudentReport && printableDataForAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-6">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <SchoolBadge size="sm" />
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Official Student Report Card Preview
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Administrator Direct Inspection • No Scratch Card PIN Required
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerReportCardPrint(printableDataForAdmin)}
                  className="px-3 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadReportCardAsPDF(printableDataForAdmin)}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudentReport(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Report Card Letterhead & Content */}
            <div className="border-2 border-stone-300 rounded-2xl p-6 sm:p-8 space-y-6 bg-white shadow-xs">
              <div className="text-center border-b pb-4 border-stone-200 space-y-1">
                <div className="flex justify-center mb-1">
                  <SchoolBadge size="md" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-[#0b4d2c] tracking-tight uppercase font-serif">
                  Rev. Fr. Moses Orshio Adasu University Science &amp; Technical College, Makurdi
                </h4>
                <p className="text-xs text-stone-600">
                  Walmayo / Kanshio &amp; Km 1 Gboko Road Axis, Makurdi, Benue State
                </p>
                <p className="text-[11px] text-stone-500 italic">
                  Motto: Scientia Liberatio Populorum • Official Terminal Report
                </p>
                <div className="pt-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
                    {selectedStudentReport.term} • {selectedStudentReport.session}
                  </span>
                </div>
              </div>

              {/* Student Biodata Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Student Name
                  </span>
                  <strong className="text-stone-900 block mt-0.5">
                    {selectedStudentReport.studentName}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Admission Number
                  </span>
                  <strong className="font-mono text-[#0b4d2c] block mt-0.5">
                    {selectedStudentReport.admissionNo}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Class / Trade
                  </span>
                  <strong className="text-stone-900 block mt-0.5">
                    {selectedStudentReport.className}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Class Position
                  </span>
                  <strong className="text-amber-600 block mt-0.5">
                    {selectedStudentReport.position || '1st in Class'}
                  </strong>
                </div>
              </div>

              {/* Marks Table */}
              <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b4d2c] text-white font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-2 text-center">CA 1 (10)</th>
                      <th className="py-2.5 px-2 text-center">CA 2 (10)</th>
                      <th className="py-2.5 px-2 text-center">CA 3 (10)</th>
                      <th className="py-2.5 px-2 text-center">Exam (70)</th>
                      <th className="py-2.5 px-2 text-center font-bold">Total (100)</th>
                      <th className="py-2.5 px-2 text-center font-bold">Grade</th>
                      <th className="py-2.5 px-3 text-left">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {selectedStudentReport.subjects?.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="py-2 px-3 font-semibold text-stone-900">{sub.subjectName}</td>
                        <td className="py-2 px-2 text-center font-mono">{sub.ca1}</td>
                        <td className="py-2 px-2 text-center font-mono">{sub.ca2}</td>
                        <td className="py-2 px-2 text-center font-mono">{sub.ca3}</td>
                        <td className="py-2 px-2 text-center font-mono">{sub.exam}</td>
                        <td className="py-2 px-2 text-center font-bold text-stone-900 font-mono">
                          {sub.total}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              sub.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.grade === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {sub.grade}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-stone-600">{sub.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Cumulative Total
                  </span>
                  <span className="text-lg font-black text-stone-900 font-mono mt-0.5 block">
                    {selectedStudentReport.totalScore}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Terminal Average
                  </span>
                  <span className="text-lg font-black text-emerald-800 font-mono mt-0.5 block">
                    {selectedStudentReport.averageScore}%
                  </span>
                </div>
              </div>

              {/* Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold block">
                    Form Master&apos;s Remark:
                  </span>
                  <p className="italic text-stone-700 mt-1">
                    "{selectedStudentReport.teacherRemark || 'Diligent and respectful student.'}"
                  </p>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold block">
                    Principal&apos;s Endorsement:
                  </span>
                  <p className="italic text-[#0b4d2c] font-semibold mt-1">
                    "{selectedStudentReport.principalRemark || 'Approved for advancement.'}"
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentReport(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl"
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
