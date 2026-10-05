import { Student, SchoolClass, ExamResult } from '../types/school';

/**
 * Robustly checks if a student belongs to a given class,
 * matching by classId or className case-insensitively and trimmed.
 */
export function isStudentInClass(
  student: Student,
  targetClassOrIdOrName?: SchoolClass | string | null
): boolean {
  if (!student || !targetClassOrIdOrName) return false;

  const targetId = typeof targetClassOrIdOrName === 'string' ? targetClassOrIdOrName : targetClassOrIdOrName.id;
  const targetName = typeof targetClassOrIdOrName === 'string' ? targetClassOrIdOrName : targetClassOrIdOrName.name;

  // Direct ID check
  if (targetId && student.classId && student.classId.trim() === targetId.trim()) {
    return true;
  }

  // Name check (normalized: lowercase and whitespace-trimmed)
  const sName = (student.className || '').trim().toLowerCase();
  const tName = (targetName || '').trim().toLowerCase();
  if (sName && tName) {
    if (sName === tName) return true;
    if (sName.replace(/\s+/g, '') === tName.replace(/\s+/g, '')) return true;
  }

  // Secondary ID check (normalized)
  const sId = (student.classId || '').trim().toLowerCase();
  const tId = (targetId || '').trim().toLowerCase();
  if (sId && tId && (sId === tId || sId.replace(/[-_\s]/g, '') === tId.replace(/[-_\s]/g, ''))) {
    return true;
  }

  return false;
}

/**
 * Checks if a student is offering / enrolled in a specific subject.
 * - If student.enrolledSubjectIds contains the subjectId
 * - Or if the student already has recorded CA/exam scores for this subject in results
 */
export function isStudentOfferingSubject(
  student: Student,
  subjectId: string,
  results?: ExamResult[]
): boolean {
  if (!student || !subjectId) return false;

  // Explicit enrollment array on the student record
  if (Array.isArray(student.enrolledSubjectIds)) {
    return student.enrolledSubjectIds.includes(subjectId);
  }

  // Fallback: check if an exam result already exists for this student & subject
  if (results && results.length > 0) {
    const res = results.find((r) => r.studentId === student.id);
    if (res?.subjects?.some((s) => s.subjectId === subjectId)) {
      return true;
    }
  }

  return false;
}
