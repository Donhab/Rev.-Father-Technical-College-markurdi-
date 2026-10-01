import { ExamResult, Student } from '../types/school';
import { getActiveSchoolBadgeUrl, getPreloadedBadgeImage } from '../components/SchoolBadge';

export interface PrintableReportData {
  studentName: string;
  admissionNo: string;
  className: string;
  session: string;
  term: string;
  pin?: string;
  subjects: {
    subjectName: string;
    ca1: number;
    ca2: number;
    ca3: number;
    exam: number;
    total: number;
    grade: string;
    remark: string;
  }[];
  totalScore: number;
  averageScore: number;
  position: string;
  teacherRemark: string;
  principalRemark: string;
}

export function buildPrintableReportData(
  student?: Student,
  result?: ExamResult | null
): PrintableReportData {
  const studentName =
    result?.studentName ||
    (student ? `${student.firstName} ${student.lastName}` : 'Student Scholar');
  const admissionNo = result?.admissionNo || student?.admissionNo || 'USTC/2025/001';
  const className = result?.className || student?.className || 'Tech 1';
  const session = result?.session || student?.session || '2025/2026';
  const term = result?.term || student?.term || 'First Term';

  const subjects =
    result && result.subjects && result.subjects.length > 0
      ? result.subjects.map((s) => ({
          subjectName: s.subjectName,
          ca1: Number(s.ca1 ?? 0),
          ca2: Number(s.ca2 ?? 0),
          ca3: Number(s.ca3 ?? 0),
          exam: Number(s.exam ?? 0),
          total: Number(s.total ?? 0),
          grade: s.grade || 'A',
          remark: s.remark || 'Good'
        }))
      : [];

  const totalScore =
    result?.totalScore ?? subjects.reduce((sum, item) => sum + item.total, 0);
  const averageScore =
    result?.averageScore ??
    (subjects.length > 0 ? Math.round((totalScore / subjects.length) * 10) / 10 : 0);

  return {
    studentName,
    admissionNo,
    className,
    session,
    term,
    pin: student?.activatedScratchCardPin || 'VERIFIED',
    subjects,
    totalScore,
    averageScore,
    position: result?.position || '1st in Class',
    teacherRemark:
      result?.teacherRemark || 'Diligently committed to technical and vocational studies.',
    principalRemark:
      result?.principalRemark || 'Approved official terminal record. Good advancement.'
  };
}

/**
 * Renders the Official Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi Report Card onto an A4-proportioned HTML5 Canvas (1240 x 1754 px).
 */
export function renderReportCardToCanvas(data: PrintableReportData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 1240;
  const height = 1754;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // White page background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Outer decorative border
  ctx.strokeStyle = '#0b4d2c';
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.strokeRect(46, 46, width - 92, height - 92);

  // Header Crest / Official School Badge
  const centerX = width / 2;
  const badgeImg = getPreloadedBadgeImage();
  if (badgeImg && badgeImg.complete && badgeImg.naturalWidth > 0) {
    ctx.save();
    ctx.drawImage(badgeImg, centerX - 48, 66, 96, 99);
    ctx.restore();
  } else {
    ctx.fillStyle = '#0b4d2c';
    ctx.beginPath();
    ctx.arc(centerX, 118, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, 118, 38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('USTC', centerX, 116);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('MAKURDI', centerX, 132);
  }

  // School Name & Address
  ctx.fillStyle = '#0b4d2c';
  ctx.font = '900 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('REV. FR. MOSES ORSHIO ADASU UNIVERSITY SCIENCE & TECHNICAL COLLEGE, MAKURDI', centerX, 196);

  ctx.fillStyle = '#44403c';
  ctx.font = '600 15px sans-serif';
  ctx.fillText(
    'Walmayo, Kanshio / Km 1 Gboko Road, Makurdi, Benue State  •  Motto: Scientia Liberatio Populorum',
    centerX,
    224
  );

  // Subtitle pill
  const pillWidth = 680;
  const pillHeight = 34;
  const pillX = centerX - pillWidth / 2;
  const pillY = 242;
  ctx.fillStyle = '#d1fae5';
  ctx.fillRect(pillX, pillY, pillWidth, pillHeight);
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pillX, pillY, pillWidth, pillHeight);

  ctx.fillStyle = '#064e3b';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(
    'OFFICIAL CONTINUOUS ASSESSMENT & EXAMINATION REPORT SHEET',
    centerX,
    pillY + 22
  );

  // Horizontal divider
  ctx.strokeStyle = '#0b4d2c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 294);
  ctx.lineTo(width - 70, 294);
  ctx.stroke();

  // Student Profile Box
  const infoY = 314;
  const infoH = 110;
  ctx.fillStyle = '#f5f5f4';
  ctx.fillRect(70, infoY, width - 140, infoH);
  ctx.strokeStyle = '#d6d3d1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(70, infoY, width - 140, infoH);

  ctx.textAlign = 'left';
  const col1 = 94;
  const col2 = 430;
  const col3 = 730;
  const col4 = 980;

  // Row 1 labels
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('STUDENT FULL NAME', col1, infoY + 30);
  ctx.fillText('ADMISSION NUMBER', col2, infoY + 30);
  ctx.fillText('CLASS & ARM', col3, infoY + 30);
  ctx.fillText('SESSION / TERM', col4, infoY + 30);

  // Row 1 values
  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(data.studentName.slice(0, 26), col1, infoY + 58);

  ctx.fillStyle = '#0b4d2c';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(data.admissionNo, col2, infoY + 58);

  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(data.className.slice(0, 20), col3, infoY + 58);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`${data.session} • ${data.term}`, col4, infoY + 58);

  // Verification sub-row
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(
    `Scratch Card Verification Status: ACTIVE (${data.pin || 'VERIFIED'})   •   NBTE & NABTEB Accredited Technical College, Makurdi`,
    col1,
    infoY + 92
  );

  // Marks Breakdown Table
  const tableTop = 448;
  const tableLeft = 70;
  const tableWidth = width - 140;
  const headerH = 44;

  // Table Header
  ctx.fillStyle = '#0b4d2c';
  ctx.fillRect(tableLeft, tableTop, tableWidth, headerH);

  const cols = [
    { label: 'CURRICULUM SUBJECT', x: tableLeft + 18, align: 'left' as const },
    { label: '1ST CA (10)', x: tableLeft + 440, align: 'center' as const },
    { label: '2ND CA (10)', x: tableLeft + 545, align: 'center' as const },
    { label: '3RD CA (10)', x: tableLeft + 650, align: 'center' as const },
    { label: 'EXAM (70)', x: tableLeft + 750, align: 'center' as const },
    { label: 'TOTAL (100)', x: tableLeft + 855, align: 'center' as const },
    { label: 'GRADE', x: tableLeft + 950, align: 'center' as const },
    { label: 'REMARK', x: tableLeft + 1010, align: 'left' as const }
  ];

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  cols.forEach((c) => {
    ctx.textAlign = c.align;
    ctx.fillText(c.label, c.x, tableTop + 27);
  });

  const rowH = 46;
  const maxRows = Math.max(data.subjects.length, 1);
  let currentY = tableTop + headerH;

  if (data.subjects.length === 0) {
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(tableLeft, currentY, tableWidth, 80);
    ctx.strokeStyle = '#e7e5e4';
    ctx.strokeRect(tableLeft, currentY, tableWidth, 80);
    ctx.fillStyle = '#78716c';
    ctx.font = 'italic 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Scores are currently being finalized by subject teachers.',
      centerX,
      currentY + 46
    );
    currentY += 80;
  } else {
    data.subjects.slice(0, 14).forEach((sub, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(tableLeft, currentY, tableWidth, rowH);

      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 1;
      ctx.strokeRect(tableLeft, currentY, tableWidth, rowH);

      const textY = currentY + 29;

      // Subject Name
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(sub.subjectName.slice(0, 38), cols[0].x, textY);

      // CA1, CA2, CA3, Exam
      ctx.textAlign = 'center';
      ctx.fillStyle = '#44403c';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(String(sub.ca1), cols[1].x, textY);
      ctx.fillText(String(sub.ca2), cols[2].x, textY);
      ctx.fillText(String(sub.ca3), cols[3].x, textY);

      ctx.fillStyle = '#1c1917';
      ctx.fillText(String(sub.exam), cols[4].x, textY);

      // Total
      ctx.fillStyle = '#0b4d2c';
      ctx.font = '900 17px monospace';
      ctx.fillText(String(sub.total), cols[5].x, textY);

      // Grade pill
      ctx.fillStyle =
        sub.grade === 'A'
          ? '#d1fae5'
          : sub.grade === 'B'
          ? '#dbeafe'
          : '#fef3c7';
      ctx.fillRect(cols[6].x - 20, currentY + 10, 40, 26);
      ctx.fillStyle =
        sub.grade === 'A'
          ? '#065f46'
          : sub.grade === 'B'
          ? '#1e40af'
          : '#92400e';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(sub.grade, cols[6].x, textY);

      // Remark
      ctx.textAlign = 'left';
      ctx.fillStyle = '#57534e';
      ctx.font = '600 14px sans-serif';
      ctx.fillText((sub.remark || '').slice(0, 14), cols[7].x, textY);

      currentY += rowH;
    });
  }

  // Outer border around table
  ctx.strokeStyle = '#a8a29e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tableLeft, tableTop, tableWidth, currentY - tableTop);

  // Aggregate Summary Section
  const summaryY = Math.max(currentY + 28, 1140);
  const summaryH = 92;
  ctx.fillStyle = '#ecfdf5';
  ctx.fillRect(70, summaryY, width - 140, summaryH);
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 2;
  ctx.strokeRect(70, summaryY, width - 140, summaryH);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('TOTAL AGGREGATE SCORE', 100, summaryY + 32);
  ctx.fillText('AVERAGE CUMULATIVE PERCENTAGE', 490, summaryY + 32);
  ctx.fillText('OFFICIAL CLASS STANDING', 900, summaryY + 32);

  ctx.fillStyle = '#1c1917';
  ctx.font = '900 28px sans-serif';
  ctx.fillText(`${data.totalScore} Marks`, 100, summaryY + 68);

  ctx.fillStyle = '#065f46';
  ctx.fillText(`${data.averageScore}%`, 490, summaryY + 68);

  ctx.fillStyle = '#0b4d2c';
  ctx.fillText(data.position, 900, summaryY + 68);

  // Remarks & Endorsements
  const remarksY = summaryY + 118;
  const boxW = (width - 164) / 2;
  const boxH = 130;

  // Form Master Remark Box
  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(70, remarksY, boxW, boxH);
  ctx.strokeStyle = '#d6d3d1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(70, remarksY, boxW, boxH);

  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText("FORM MASTER'S RECOMMENDATION:", 92, remarksY + 32);

  ctx.fillStyle = '#292524';
  ctx.font = 'italic 15px sans-serif';
  wrapCanvasText(ctx, data.teacherRemark, 92, remarksY + 62, boxW - 40, 22);

  // Principal Endorsement Box
  const rightBoxX = 70 + boxW + 24;
  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(rightBoxX, remarksY, boxW, boxH);
  ctx.strokeStyle = '#d6d3d1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rightBoxX, remarksY, boxW, boxH);

  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText("PRINCIPAL'S OFFICIAL ENDORSEMENT:", rightBoxX + 22, remarksY + 32);

  ctx.fillStyle = '#0b4d2c';
  ctx.font = 'bold italic 15px sans-serif';
  wrapCanvasText(ctx, data.principalRemark, rightBoxX + 22, remarksY + 62, boxW - 40, 22);

  ctx.fillStyle = '#44403c';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Signed: Office of the Principal (USTC Makurdi)', rightBoxX + 22, remarksY + 112);

  // Official Stamp Badge
  const stampY = remarksY + 175;
  ctx.strokeStyle = '#0b4d2c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, stampY);
  ctx.lineTo(width - 70, stampY);
  ctx.stroke();

  ctx.fillStyle = '#78716c';
  ctx.font = '600 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(
    'Official Computer-Generated Broadsheet • Rev. Fr. Moses Orshio Adasu USTC Makurdi Portal',
    70,
    stampY + 34
  );

  ctx.textAlign = 'right';
  ctx.fillText(
    `Printed on: ${new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })}`,
    width - 70,
    stampY + 34
  );

  return canvas;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currY);
      line = words[n] + ' ';
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currY);
}

/**
 * Converts a high-resolution Canvas JPEG into a valid single-page A4 PDF binary Blob
 * and triggers an immediate file download (`GSTC_Official_Result_<AdmissionNo>.pdf`).
 */
export function downloadReportCardAsPDF(data: PrintableReportData): void {
  const canvas = renderReportCardToCanvas(data);
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const base64 = jpegDataUrl.split(',')[1];
  const binaryStr = atob(base64);
  const imgBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    imgBytes[i] = binaryStr.charCodeAt(i);
  }

  // Standard A4 dimensions in PDF points (72 pt/inch): 595.28 x 841.89
  const pageW = 595;
  const pageH = 842;
  const imgW = canvas.width;
  const imgH = canvas.height;

  const contentStream = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;
  const encoder = new TextEncoder();

  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let byteLength = 0;

  const pushStr = (str: string) => {
    const arr = encoder.encode(str);
    chunks.push(arr);
    byteLength += arr.byteLength;
  };

  const pushBytes = (arr: Uint8Array) => {
    chunks.push(arr);
    byteLength += arr.byteLength;
  };

  const startObj = (id: number) => {
    offsets[id] = byteLength;
    pushStr(`${id} 0 obj\n`);
  };

  pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  // 1: Catalog
  startObj(1);
  pushStr('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2: Pages
  startObj(2);
  pushStr('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // 3: Page
  startObj(3);
  pushStr(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // 4: Image XObject
  startObj(4);
  pushStr(
    `<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.byteLength} >>\nstream\n`
  );
  pushBytes(imgBytes);
  pushStr('\nendstream\nendobj\n');

  // 5: Content Stream
  const contentBytes = encoder.encode(contentStream);
  startObj(5);
  pushStr(`<< /Length ${contentBytes.byteLength} >>\nstream\n`);
  pushBytes(contentBytes);
  pushStr('endstream\nendobj\n');

  // Xref
  const xrefOffset = byteLength;
  pushStr('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    const padded = String(offsets[i]).padStart(10, '0');
    pushStr(`${padded} 00000 n \n`);
  }

  pushStr(
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  const pdfBlob = new Blob(chunks as unknown as BlobPart[], { type: 'application/pdf' });
  const safeAdm = data.admissionNo.replace(/[^a-zA-Z0-9_-]/g, '_');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `USTC_Makurdi_Official_Result_${safeAdm}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Downloads the Official Report Card as a high-resolution PNG image.
 */
export function downloadReportCardAsPNG(data: PrintableReportData): void {
  const canvas = renderReportCardToCanvas(data);
  const pngUrl = canvas.toDataURL('image/png');
  const safeAdm = data.admissionNo.replace(/[^a-zA-Z0-9_-]/g, '_');
  const link = document.createElement('a');
  link.href = pngUrl;
  link.download = `USTC_Makurdi_Official_Result_${safeAdm}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Prints the Official Report Card using an isolated hidden iframe + window.print() fallback.
 */
export function triggerReportCardPrint(data: PrintableReportData): void {
  const rowsHtml =
    data.subjects.length > 0
      ? data.subjects
          .map(
            (sub, idx) => `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom:1px solid #e7e5e4;">
          <td style="padding:8px 10px; font-weight:700; color:#1c1917;">${sub.subjectName}</td>
          <td style="padding:8px 6px; text-align:center; font-family:monospace; font-weight:600;">${sub.ca1}</td>
          <td style="padding:8px 6px; text-align:center; font-family:monospace; font-weight:600;">${sub.ca2}</td>
          <td style="padding:8px 6px; text-align:center; font-family:monospace; font-weight:600;">${sub.ca3}</td>
          <td style="padding:8px 6px; text-align:center; font-family:monospace; font-weight:700;">${sub.exam}</td>
          <td style="padding:8px 6px; text-align:center; font-family:monospace; font-weight:800; color:#0b4d2c;">${sub.total}</td>
          <td style="padding:8px 6px; text-align:center; font-weight:700;">${sub.grade}</td>
          <td style="padding:8px 10px; color:#57534e;">${sub.remark}</td>
        </tr>`
          )
          .join('')
      : `<tr><td colspan="8" style="padding:20px; text-align:center; color:#78716c;">Scores are currently being finalized by subject teachers.</td></tr>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official Report Card - ${data.studentName} (${data.admissionNo})</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #1c1917; margin: 0; padding: 16px; background: #fff; }
    .sheet { border: 3px solid #0b4d2c; padding: 24px; border-radius: 12px; }
    .header { text-align: center; border-bottom: 2px solid #0b4d2c; padding-bottom: 14px; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 900; color: #0b4d2c; text-transform: uppercase; margin: 4px 0; }
    .subtitle { font-size: 12px; color: #57534e; margin: 2px 0; }
    .badge { display: inline-block; margin-top: 8px; padding: 4px 14px; background: #d1fae5; color: #065f46; font-weight: 700; font-size: 11px; border-radius: 999px; border: 1px solid #6ee7b7; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f5f5f4; padding: 12px; border-radius: 8px; border: 1px solid #d6d3d1; margin-bottom: 16px; font-size: 12px; }
    .label { font-size: 10px; color: #78716c; text-transform: uppercase; font-weight: 700; display: block; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; border: 1px solid #d6d3d1; }
    th { background: #0b4d2c; color: #fff; text-transform: uppercase; font-size: 10px; padding: 9px 8px; text-align: left; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #ecfdf5; padding: 12px; border-radius: 8px; border: 1px solid #6ee7b7; margin-bottom: 16px; }
    .remarks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 12px; margin-bottom: 16px; }
    .remark-box { background: #fafaf9; padding: 12px; border-radius: 8px; border: 1px solid #d6d3d1; }
    .footer { border-top: 1px solid #d6d3d1; padding-top: 10px; display: flex; justify-content: space-between; font-size: 11px; color: #78716c; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <img src="${getActiveSchoolBadgeUrl()}" alt="Official School Badge" referrerPolicy="no-referrer" style="width:76px;height:78px;object-fit:contain;background:#fff;padding:2px;margin:0 auto 6px;display:block;" />
      <div class="title">Rev. Fr. Moses Orshio Adasu University Science &amp; Technical College, Makurdi</div>
      <div class="subtitle">Walmayo, Kanshio / Km 1 Gboko Road, Makurdi, Benue State • Motto: Scientia Liberatio Populorum</div>
      <span class="badge">OFFICIAL CONTINUOUS ASSESSMENT &amp; EXAMINATION REPORT SHEET</span>
    </div>
    <div class="grid">
      <div><span class="label">Student Full Name</span><strong>${data.studentName}</strong></div>
      <div><span class="label">Admission Number</span><strong style="color:#0b4d2c; font-family:monospace;">${data.admissionNo}</strong></div>
      <div><span class="label">Class &amp; Arm</span><strong>${data.className}</strong></div>
      <div><span class="label">Academic Session / Term</span><strong>${data.session} • ${data.term}</strong></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Curriculum Subject</th>
          <th style="text-align:center;">1st CA (10)</th>
          <th style="text-align:center;">2nd CA (10)</th>
          <th style="text-align:center;">3rd CA (10)</th>
          <th style="text-align:center;">Exam (70)</th>
          <th style="text-align:center;">Total (100)</th>
          <th style="text-align:center;">Grade</th>
          <th>Remark</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div class="summary">
      <div><span class="label" style="color:#065f46;">Total Aggregate Score</span><strong style="font-size:18px;">${data.totalScore} Marks</strong></div>
      <div><span class="label" style="color:#065f46;">Average Cumulative</span><strong style="font-size:18px; color:#065f46;">${data.averageScore}%</strong></div>
      <div><span class="label" style="color:#065f46;">Class Standing</span><strong style="font-size:18px; color:#0b4d2c;">${data.position}</strong></div>
    </div>
    <div class="remarks">
      <div class="remark-box">
        <span class="label">Form Master's Recommendation:</span>
        <p style="margin:6px 0 0; font-style:italic;">${data.teacherRemark}</p>
      </div>
      <div class="remark-box">
        <span class="label">Principal's Official Endorsement:</span>
        <p style="margin:6px 0 0; font-style:italic; color:#0b4d2c; font-weight:700;">${data.principalRemark}</p>
      </div>
    </div>
    <div class="footer">
      <span>Official Computer-Generated Broadsheet • Rev. Fr. Moses Orshio Adasu USTC Makurdi Database</span>
      <span>Signed: Office of the Principal (USTC Makurdi)</span>
    </div>
  </div>
</body>
</html>`;

  try {
    const existingFrame = document.getElementById('gstc-print-iframe') as HTMLIFrameElement | null;
    if (existingFrame) {
      existingFrame.remove();
    }
    const iframe = document.createElement('iframe');
    iframe.id = 'gstc-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        }
      }, 250);
    } else {
      window.print();
    }
  } catch {
    try {
      window.print();
    } catch {
      // Ignored in restricted sandboxes; PDF download handles it
    }
  }
}
