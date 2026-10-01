import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Student,
  Staff,
  SchoolClass,
  Subject,
  TeachingAssignment,
  ScratchCard,
  ExamResult,
  Notice,
  AdminAccount,
  SchoolSettings,
  SubjectScore,
  SchoolNews,
  WebsiteCustomization
} from '../types/school';
import {
  seedInitialSchoolDataIfNeeded,
  DEFAULT_ADMINS,
  DEFAULT_STUDENTS,
  DEFAULT_STAFF,
  DEFAULT_CLASSES,
  DEFAULT_SUBJECTS,
  DEFAULT_ASSIGNMENTS,
  DEFAULT_CARDS,
  DEFAULT_RESULTS,
  DEFAULT_NOTICE,
  DEFAULT_SETTINGS,
  DEFAULT_NEWS,
  DEFAULT_CUSTOMIZATION
} from '../services/seedData';
import { setGlobalSchoolBadgeUrl, CURRENT_BADGE_EDITION } from '../components/SchoolBadge';

export function useSchoolData() {
  const [admins, setAdmins] = useState<AdminAccount[]>(DEFAULT_ADMINS);
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  const [staff, setStaff] = useState<Staff[]>(DEFAULT_STAFF);
  const [classes, setClasses] = useState<SchoolClass[]>(DEFAULT_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [assignments, setAssignments] = useState<TeachingAssignment[]>(DEFAULT_ASSIGNMENTS);
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>(DEFAULT_CARDS);
  const [results, setResults] = useState<ExamResult[]>(DEFAULT_RESULTS);
  const [notice, setNotice] = useState<Notice | null>(DEFAULT_NOTICE);
  const [settings, setSettings] = useState<SchoolSettings | null>(DEFAULT_SETTINGS);
  const [news, setNews] = useState<SchoolNews[]>(DEFAULT_NEWS);
  const [customization, setCustomization] = useState<WebsiteCustomization | null>(DEFAULT_CUSTOMIZATION);

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  useEffect(() => {
    seedInitialSchoolDataIfNeeded();
  }, []);

  useEffect(() => {
    setSyncStatus('syncing');

    // 0. Admins listener
    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        const list: AdminAccount[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as AdminAccount));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (list.length > 0) setAdmins(list);
        setSyncStatus('connected');
        setLastSyncTime(new Date());
      },
      (err) => console.warn('Admins sync notice:', err.message)
    );

    // 1. Students listener
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        const list: Student[] = [];
        snap.forEach((d) => {
          const data = d.data() as Student;
          list.push({
            ...data,
            id: d.id,
            password: data.password || '0000'
          });
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (list.length > 0) setStudents(list);
        setSyncStatus('connected');
        setLastSyncTime(new Date());
      },
      (err) => console.warn('Students sync notice:', err.message)
    );

    // 2. Staff listener
    const unsubStaff = onSnapshot(
      collection(db, 'staff'),
      (snap) => {
        const list: Staff[] = [];
        snap.forEach((d) => {
          const data = d.data() as Staff;
          list.push({
            ...data,
            id: d.id,
            password: data.password || '0000'
          });
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (list.length > 0) setStaff(list);
        setSyncStatus('connected');
      },
      (err) => console.warn('Staff sync notice:', err.message)
    );

    // 3. Classes listener
    const unsubClasses = onSnapshot(
      collection(db, 'classes'),
      (snap) => {
        const list: SchoolClass[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as SchoolClass));
        if (list.length > 0) setClasses(list);
      },
      (err) => console.warn('Classes sync notice:', err.message)
    );

    // 4. Subjects listener
    const unsubSubjects = onSnapshot(
      collection(db, 'subjects'),
      (snap) => {
        const list: Subject[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Subject));
        if (list.length > 0) setSubjects(list);
      },
      (err) => console.warn('Subjects sync notice:', err.message)
    );

    // 5. Assignments listener
    const unsubAssignments = onSnapshot(
      collection(db, 'assignments'),
      (snap) => {
        const list: TeachingAssignment[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as TeachingAssignment));
        if (list.length > 0) setAssignments(list);
      },
      (err) => console.warn('Assignments sync notice:', err.message)
    );

    // 6. Scratch Cards listener
    const unsubCards = onSnapshot(
      collection(db, 'scratch_cards'),
      (snap) => {
        const list: ScratchCard[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as ScratchCard));
        list.sort((a, b) => (b.generatedAt || 0) - (a.generatedAt || 0));
        if (list.length > 0) setScratchCards(list);
      },
      (err) => console.warn('Cards sync notice:', err.message)
    );

    // 7. Results listener
    const unsubResults = onSnapshot(
      collection(db, 'results'),
      (snap) => {
        const list: ExamResult[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as ExamResult));
        if (list.length > 0) setResults(list);
      },
      (err) => console.warn('Results sync notice:', err.message)
    );

    // 8. Notice listener
    const unsubNotice = onSnapshot(
      doc(db, 'notices', 'current-advisory'),
      (snap) => {
        if (snap.exists()) {
          setNotice(snap.data() as Notice);
        }
      },
      (err) => console.warn('Notice sync notice:', err.message)
    );

    // 9. Settings listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global_config'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SchoolSettings;
          if (data.badgeEdition === CURRENT_BADGE_EDITION && data.schoolBadgeUrl) {
            setGlobalSchoolBadgeUrl(data.schoolBadgeUrl, false);
          } else if (data.badgeEdition !== CURRENT_BADGE_EDITION) {
            setGlobalSchoolBadgeUrl(null, false);
          }
          setSettings({
            ...data,
            schoolName:
              !data.schoolName || /garki|gstc/i.test(data.schoolName)
                ? 'Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi'
                : data.schoolName,
            motto:
              !data.motto || /knowledge,\s*skill/i.test(data.motto)
                ? 'Scientia Liberatio Populorum'
                : data.motto,
            address:
              !data.address || /garki|abuja|area\s*\d+/i.test(data.address)
                ? 'Walmayo, Kanshio / Km 1 Gboko Road, Makurdi, Benue State, Nigeria'
                : data.address
          });
        }
      },
      (err) => console.warn('Settings sync notice:', err.message)
    );

    // 10. News & Announcements listener (for visitors & public) + Chunked Media reassembly
    let rawNewsList: SchoolNews[] = [];
    const mediaChunksMap = new Map<string, { index: number; data: string }[]>();

    const resolveNewsWithMedia = () => {
      if (rawNewsList.length === 0) return;
      const resolved = rawNewsList.map((item) => {
        let resolvedVideoUrl = item.videoUrl;
        if (resolvedVideoUrl && resolvedVideoUrl.startsWith('__CHUNKED_MEDIA__:')) {
          const mediaId = resolvedVideoUrl.replace('__CHUNKED_MEDIA__:', '');
          const chunks = mediaChunksMap.get(mediaId);
          if (chunks && chunks.length > 0) {
            const sorted = [...chunks].sort((a, b) => a.index - b.index);
            resolvedVideoUrl = sorted.map((c) => c.data).join('');
          }
        }
        const resolvedMediaItems = item.mediaItems?.map((m) => {
          if (m.url && m.url.startsWith('__CHUNKED_MEDIA__:')) {
            const mediaId = m.url.replace('__CHUNKED_MEDIA__:', '');
            const chunks = mediaChunksMap.get(mediaId);
            if (chunks && chunks.length > 0) {
              const sorted = [...chunks].sort((a, b) => a.index - b.index);
              return { ...m, url: sorted.map((c) => c.data).join('') };
            }
          }
          return m;
        });
        return {
          ...item,
          videoUrl: resolvedVideoUrl,
          mediaItems: resolvedMediaItems
        };
      });
      resolved.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
      setNews(resolved);
    };

    const unsubNews = onSnapshot(
      collection(db, 'school_news'),
      (snap) => {
        const list: SchoolNews[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as SchoolNews));
        rawNewsList = list;
        resolveNewsWithMedia();
      },
      (err) => console.warn('News sync notice:', err.message)
    );

    const unsubNewsMedia = onSnapshot(
      collection(db, 'school_news_media'),
      (snap) => {
        mediaChunksMap.clear();
        snap.forEach((d) => {
          const data = d.data() as { mediaId: string; chunkIndex: number; data: string };
          if (data.mediaId && typeof data.data === 'string') {
            const arr = mediaChunksMap.get(data.mediaId) || [];
            arr.push({ index: data.chunkIndex || 0, data: data.data });
            mediaChunksMap.set(data.mediaId, arr);
          }
        });
        if (rawNewsList.length > 0) {
          resolveNewsWithMedia();
        }
      },
      (err) => console.warn('News media sync notice:', err.message)
    );

    // 11. Website Customization listener (Super Admin controls website changes)
    const unsubCustom = onSnapshot(
      doc(db, 'website_customization', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as WebsiteCustomization;
          if (data.badgeEdition === CURRENT_BADGE_EDITION && data.schoolBadgeUrl) {
            setGlobalSchoolBadgeUrl(data.schoolBadgeUrl, false);
          } else if (data.badgeEdition !== CURRENT_BADGE_EDITION) {
            setGlobalSchoolBadgeUrl(null, false);
          }
          setCustomization({
            ...data,
            schoolContactEmail:
              !data.schoolContactEmail || /gstcgarki/i.test(data.schoolContactEmail)
                ? 'info@ustcmakurdi.edu.ng'
                : data.schoolContactEmail,
            schoolAddress:
              !data.schoolAddress || /garki|abuja|area\s*\d+/i.test(data.schoolAddress)
                ? 'Walmayo, Kanshio / Km 1 Gboko Road, Rev. Fr. Moses Orshio Adasu University Campus, Makurdi, Benue State, Nigeria'
                : data.schoolAddress,
            principalWelcomeMessage:
              !data.principalWelcomeMessage || /garki|abuja/i.test(data.principalWelcomeMessage)
                ? 'Welcome to Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi, Benue State. Rooted in the historic Government Technical Training School (GTTS) premises embraced when Executive Governor Rev. Fr. Moses Orshio Adasu founded the University in 1992, and fully accredited by NBTE and NABTEB, we equip Benue youth with hands-on industrial engineering, agricultural mechanics, solar PV, and digital technology mastery.'
                : data.principalWelcomeMessage
          });
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Customization sync notice:', err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubAdmins();
      unsubStudents();
      unsubStaff();
      unsubClasses();
      unsubSubjects();
      unsubAssignments();
      unsubCards();
      unsubResults();
      unsubNotice();
      unsubSettings();
      unsubNews();
      unsubNewsMedia();
      unsubCustom();
    };
  }, []);

  // --- Super Admin Actions ---
  const addAdmin = async (adminData: Omit<AdminAccount, 'id' | 'createdAt'>) => {
    const newDocRef = doc(collection(db, 'admins'));
    const newAdmin: AdminAccount = {
      ...adminData,
      id: newDocRef.id,
      createdAt: Date.now()
    };
    setAdmins((prev) => [newAdmin, ...prev.filter((a) => a.id !== newAdmin.id)]);
    await setDoc(newDocRef, newAdmin);
    return newAdmin;
  };

  const removeAdmin = async (adminId: string) => {
    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    await deleteDoc(doc(db, 'admins', adminId));
  };

  const updateWebsiteCustomization = async (updates: Partial<WebsiteCustomization>) => {
    await setDoc(
      doc(db, 'website_customization', 'main'),
      {
        ...updates,
        updatedAt: Date.now(),
        updatedBy: 'Super Admin'
      },
      { merge: true }
    );
  };

  // Generate arbitrary user-specified number of scratch cards
  const generateBatchScratchCards = async (count: number) => {
    const safeCount = Math.max(1, Math.min(200, Number(count) || 5));
    const batchList: ScratchCard[] = [];
    const batch = writeBatch(db);

    for (let i = 0; i < safeCount; i++) {
      const pin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const serialNumber = `USTC-SCR-${Math.floor(100000 + Math.random() * 900000)}`;
      const cardRef = doc(collection(db, 'scratch_cards'));
      const cardItem: ScratchCard = {
        id: cardRef.id,
        pin,
        serialNumber,
        usageCount: 0,
        maxUsage: 5,
        status: 'Active',
        generatedAt: Date.now() + i
      };
      batch.set(cardRef, cardItem);
      batchList.push(cardItem);
    }
    await batch.commit();
    return batchList;
  };

  // Helper to store large data URLs (>350KB) in chunks in school_news_media
  const persistMediaStringIfLarge = async (rawStr: string | undefined, newsId: string, prefix: string): Promise<string | undefined> => {
    if (!rawStr) return rawStr;
    const CHUNK_SIZE = 350000;
    if (rawStr.length <= CHUNK_SIZE) {
      return rawStr;
    }
    const mediaId = `${newsId}_${prefix}_${Date.now()}`;
    const totalChunks = Math.ceil(rawStr.length / CHUNK_SIZE);
    for (let i = 0; i < totalChunks; i++) {
      const slice = rawStr.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await setDoc(doc(db, 'school_news_media', `${mediaId}_${i}`), {
        mediaId,
        newsId,
        chunkIndex: i,
        totalChunks,
        data: slice,
        createdAt: Date.now()
      });
    }
    return `__CHUNKED_MEDIA__:${mediaId}`;
  };

  // --- Admin Actions ---
  const postNews = async (newsData: Omit<SchoolNews, 'id' | 'publishedAt'>) => {
    const newDocRef = doc(collection(db, 'school_news'));
    const fullNewsItem: SchoolNews = {
      ...newsData,
      id: newDocRef.id,
      publishedAt: Date.now()
    };

    // Optimistically update local state with full media immediately
    setNews((prev) => [fullNewsItem, ...prev.filter((n) => n.id !== fullNewsItem.id)]);

    // Prepare Firestore-safe payload (chunking any oversized video/media items)
    const firestoreVideoUrl = await persistMediaStringIfLarge(
      newsData.videoUrl,
      newDocRef.id,
      'vid'
    );
    const firestoreMediaItems = newsData.mediaItems
      ? await Promise.all(
          newsData.mediaItems.map(async (m, idx) => {
            const safeUrl = await persistMediaStringIfLarge(m.url, newDocRef.id, `m${idx}`);
            return { ...m, url: safeUrl || m.url };
          })
        )
      : undefined;

    const firestorePayload: Record<string, any> = {
      ...fullNewsItem
    };
    if (firestoreVideoUrl !== undefined) {
      firestorePayload.videoUrl = firestoreVideoUrl;
    }
    if (firestoreMediaItems !== undefined) {
      firestorePayload.mediaItems = firestoreMediaItems;
    }
    Object.keys(firestorePayload).forEach((k) => {
      if (firestorePayload[k] === undefined) {
        delete firestorePayload[k];
      }
    });

    await setDoc(newDocRef, firestorePayload);
    return fullNewsItem;
  };

  const updateNews = async (id: string, updates: Partial<SchoolNews>) => {
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));

    const firestoreUpdates: Record<string, any> = { ...updates };
    if (updates.videoUrl !== undefined) {
      firestoreUpdates.videoUrl = await persistMediaStringIfLarge(updates.videoUrl, id, 'vid');
    }
    if (updates.mediaItems !== undefined) {
      firestoreUpdates.mediaItems = await Promise.all(
        updates.mediaItems.map(async (m, idx) => {
          const safeUrl = await persistMediaStringIfLarge(m.url, id, `m${idx}`);
          return { ...m, url: safeUrl || m.url };
        })
      );
    }
    Object.keys(firestoreUpdates).forEach((k) => {
      if (firestoreUpdates[k] === undefined) {
        delete firestoreUpdates[k];
      }
    });

    await updateDoc(doc(db, 'school_news', id), firestoreUpdates);
  };

  const deleteNews = async (id: string) => {
    setNews((prev) => prev.filter((n) => n.id !== id));
    await deleteDoc(doc(db, 'school_news', id));
  };

  const addStaff = async (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDocRef = doc(collection(db, 'staff'));
    const newStaff: Staff = {
      ...staffData,
      password: staffData.password || '0000',
      id: newDocRef.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setStaff((prev) => [newStaff, ...prev.filter((s) => s.id !== newStaff.id)]);
    await setDoc(newDocRef, newStaff);

    if (staffData.isFormTeacher && staffData.formTeacherClassId) {
      await updateDoc(doc(db, 'classes', staffData.formTeacherClassId), {
        formTeacherId: newDocRef.id,
        formTeacherName: staffData.fullName
      });
    }
    return newStaff;
  };

  const updateStaff = async (id: string, updates: Partial<Staff>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s)));
    await updateDoc(doc(db, 'staff', id), {
      ...updates,
      updatedAt: Date.now()
    });
    if (updates.isFormTeacher && updates.formTeacherClassId) {
      await updateDoc(doc(db, 'classes', updates.formTeacherClassId), {
        formTeacherId: id,
        formTeacherName: updates.fullName
      });
    }
  };

  const deleteStaff = async (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    await deleteDoc(doc(db, 'staff', id));
  };

  const addClass = async (classData: Omit<SchoolClass, 'id'>) => {
    const newDocRef = doc(collection(db, 'classes'));
    const matchedTeacher = staff.find(
      (s) =>
        s.id === classData.formTeacherId ||
        s.fullName.toLowerCase() === (classData.formTeacherName || '').trim().toLowerCase()
    );
    const payload: SchoolClass = {
      ...classData,
      id: newDocRef.id,
      formTeacherId: matchedTeacher?.id || classData.formTeacherId,
      formTeacherName: matchedTeacher?.fullName || classData.formTeacherName
    };
    await setDoc(newDocRef, payload);
    if (matchedTeacher) {
      await updateDoc(doc(db, 'staff', matchedTeacher.id), {
        isFormTeacher: true,
        formTeacherClassId: newDocRef.id,
        formTeacherClassName: classData.name
      });
    }
  };

  const updateClass = async (id: string, updates: Partial<SchoolClass>) => {
    const matchedTeacher = staff.find(
      (s) =>
        (updates.formTeacherId && s.id === updates.formTeacherId) ||
        (updates.formTeacherName &&
          s.fullName.toLowerCase() === updates.formTeacherName.trim().toLowerCase())
    );
    const enrichedUpdates: Partial<SchoolClass> = {
      ...updates,
      ...(matchedTeacher
        ? { formTeacherId: matchedTeacher.id, formTeacherName: matchedTeacher.fullName }
        : {})
    };
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...enrichedUpdates } : c)));
    await updateDoc(doc(db, 'classes', id), enrichedUpdates);
    if (matchedTeacher) {
      await updateDoc(doc(db, 'staff', matchedTeacher.id), {
        isFormTeacher: true,
        formTeacherClassId: id,
        formTeacherClassName: updates.name || classes.find((c) => c.id === id)?.name || ''
      });
    }
  };

  const deleteClass = async (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    await deleteDoc(doc(db, 'classes', id));
  };

  const addSubject = async (subjectData: Omit<Subject, 'id'>) => {
    const newDocRef = doc(collection(db, 'subjects'));
    await setDoc(newDocRef, { ...subjectData, id: newDocRef.id });
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    await updateDoc(doc(db, 'subjects', id), updates);
  };

  const deleteSubject = async (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    await deleteDoc(doc(db, 'subjects', id));
  };

  const assignAllSubjectsToAllClasses = async () => {
    const allSubjectIds = subjects.map((s) => s.id);
    const batch = writeBatch(db);

    for (const cls of classes) {
      const classRef = doc(db, 'classes', cls.id);
      batch.update(classRef, {
        assignedSubjectIds: allSubjectIds
      });
    }

    const allClassNames = classes.map((c) => c.name);
    for (const sub of subjects) {
      const subRef = doc(db, 'subjects', sub.id);
      batch.update(subRef, {
        classesOffered: allClassNames
      });
    }

    await batch.commit();
  };

  const assignSubjectToTeacher = async (
    teacherId: string,
    subjectId: string,
    classId: string,
    periods: number = 4
  ) => {
    const teacher = staff.find((s) => s.id === teacherId);
    const subject = subjects.find((s) => s.id === subjectId);
    const schoolClass = classes.find((c) => c.id === classId);

    if (!teacher || !subject || !schoolClass) return;

    const newDocRef = doc(collection(db, 'assignments'));
    const assignment: TeachingAssignment = {
      id: newDocRef.id,
      teacherId,
      teacherName: teacher.fullName,
      subjectId,
      subjectName: subject.name,
      classId,
      className: schoolClass.name,
      periodsPerWeek: periods
    };
    await setDoc(newDocRef, assignment);

    const currentSubjects = teacher.subjects || [];
    const currentClasses = teacher.assignedClasses || [];
    if (!currentSubjects.includes(subject.name)) currentSubjects.push(subject.name);
    if (!currentClasses.includes(schoolClass.name)) currentClasses.push(schoolClass.name);

    await updateDoc(doc(db, 'staff', teacherId), {
      subjects: currentSubjects,
      assignedClasses: currentClasses
    });
  };

  const deleteAssignment = async (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    await deleteDoc(doc(db, 'assignments', id));
  };

  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    await setDoc(doc(db, 'settings', 'global_config'), newSettings, { merge: true });
  };

  const updateNotice = async (updates: Partial<Notice>) => {
    await setDoc(doc(db, 'notices', 'current-advisory'), updates, { merge: true });
  };

  // --- Teacher Actions ---
  const enrollStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDocRef = doc(collection(db, 'students'));
    const student: Student = {
      ...studentData,
      password: studentData.password || '0000',
      id: newDocRef.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setStudents((prev) => [student, ...prev.filter((s) => s.id !== student.id)]);
    await setDoc(newDocRef, student);
    return student;
  };

  const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...updates, updatedAt: Date.now() } : s))
    );
    await updateDoc(doc(db, 'students', studentId), {
      ...updates,
      updatedAt: Date.now()
    });
  };

  const deenrollStudent = async (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    await deleteDoc(doc(db, 'students', studentId));
  };

  const saveStudentScore = async (
    studentId: string,
    subjectId: string,
    subjectName: string,
    ca1Input: number,
    ca2Input: number,
    ca3Input: number,
    examInput: number,
    teacherId: string,
    teacherName: string
  ) => {
    const ca1 = Math.min(10, Math.max(0, Number(ca1Input) || 0));
    const ca2 = Math.min(10, Math.max(0, Number(ca2Input) || 0));
    const ca3 = Math.min(10, Math.max(0, Number(ca3Input) || 0));
    const exam = Math.min(70, Math.max(0, Number(examInput) || 0));
    const total = Math.min(100, ca1 + ca2 + ca3 + exam);

    let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F';
    let remark = 'Needs Improvement';
    if (total >= 75) {
      grade = 'A';
      remark = 'Excellent';
    } else if (total >= 65) {
      grade = 'B';
      remark = 'Very Good';
    } else if (total >= 50) {
      grade = 'C';
      remark = 'Good Credit';
    } else if (total >= 45) {
      grade = 'D';
      remark = 'Pass';
    } else if (total >= 40) {
      grade = 'E';
      remark = 'Fair';
    }

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const existingResult = results.find((r) => r.studentId === studentId);
    const scoreItem: SubjectScore = {
      subjectId,
      subjectName,
      ca1,
      ca2,
      ca3,
      exam,
      total,
      grade,
      remark,
      teacherId,
      teacherName,
      updatedAt: Date.now()
    };

    if (existingResult) {
      const otherSubjects = existingResult.subjects.filter((s) => s.subjectId !== subjectId);
      const updatedSubjects = [...otherSubjects, scoreItem];
      const totalScore = updatedSubjects.reduce((acc, s) => acc + s.total, 0);
      const averageScore = Math.round((totalScore / updatedSubjects.length) * 10) / 10;

      await updateDoc(doc(db, 'results', existingResult.id), {
        subjects: updatedSubjects,
        totalScore,
        averageScore,
        updatedAt: Date.now()
      });
    } else {
      const newDocRef = doc(collection(db, 'results'));
      const newResult: ExamResult = {
        id: newDocRef.id,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNo,
        classId: student.classId,
        className: student.className,
        term: student.term || 'First Term',
        session: student.session || '2025/2026',
        subjects: [scoreItem],
        totalScore: total,
        averageScore: total,
        teacherRemark: 'Progressing steadily with active class participation.',
        principalRemark: 'Approved terminal continuous assessment.',
        status: 'Published',
        updatedAt: Date.now()
      };
      await setDoc(newDocRef, newResult);
    }
  };

  // --- Student Actions ---
  const activateScratchCardForStudent = async (studentAdmissionNo: string, rawPin: string) => {
    const formattedPin = rawPin.trim();
    const card = scratchCards.find(
      (c) => c.pin.replace(/-/g, '') === formattedPin.replace(/-/g, '')
    );
    if (!card) {
      throw new Error('Invalid Scratch Card PIN. Please check the 12-digit number.');
    }
    if (card.status === 'Expired') {
      throw new Error('This Scratch Card PIN has expired.');
    }
    if (card.usageCount >= card.maxUsage) {
      throw new Error('This Scratch Card has reached its maximum allowable uses (5).');
    }

    const student = students.find(
      (s) => s.admissionNo.toLowerCase() === studentAdmissionNo.toLowerCase()
    );
    if (!student) {
      throw new Error(`Student with admission number "${studentAdmissionNo}" was not found.`);
    }

    const newUsage = card.usageCount + 1;
    const newStatus = newUsage >= card.maxUsage ? 'Used' : 'Active';

    setScratchCards((prev) =>
      prev.map((c) =>
        c.id === card.id
          ? {
              ...c,
              usageCount: newUsage,
              status: newStatus,
              usedByStudentId: student.id,
              usedByStudentName: `${student.firstName} ${student.lastName}`,
              usedByAdmissionNo: student.admissionNo
            }
          : c
      )
    );

    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? {
              ...s,
              hasActivatedScratchCard: true,
              activatedScratchCardPin: card.pin
            }
          : s
      )
    );

    await updateDoc(doc(db, 'scratch_cards', card.id), {
      usageCount: newUsage,
      status: newStatus,
      usedByStudentId: student.id,
      usedByStudentName: `${student.firstName} ${student.lastName}`,
      usedByAdmissionNo: student.admissionNo
    });

    await updateDoc(doc(db, 'students', student.id), {
      hasActivatedScratchCard: true,
      activatedScratchCardPin: card.pin
    });

    return true;
  };

  return {
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
    // Super Admin
    addAdmin,
    removeAdmin,
    generateBatchScratchCards,
    updateWebsiteCustomization,
    // Admin
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
    // Teacher & Student Management
    enrollStudent,
    updateStudent,
    deenrollStudent,
    saveStudentScore,
    // Student
    activateScratchCardForStudent
  };
}
