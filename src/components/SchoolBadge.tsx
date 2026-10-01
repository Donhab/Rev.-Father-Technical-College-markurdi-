import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Upload, CheckCircle2, Image as ImageIcon, X, Trash2, ShieldCheck } from 'lucide-react';

export const CURRENT_BADGE_EDITION = 'adasu_ustc_makurdi_2026_v1';
const LOCAL_STORAGE_BADGE_KEY = 'official_school_badge_adasu_v1';
const LEGACY_STORAGE_KEYS = ['gstc_official_school_badge_v1'];

const OFFICIAL_ADASU_BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 620" width="600" height="620">
  <defs>
    <clipPath id="upperSkyClip">
      <path d="M 136,246 A 164,164 0 1,1 464,246 Z" />
    </clipPath>
    <clipPath id="innerEmblemClip">
      <circle cx="300" cy="274" r="183" />
    </clipPath>
    <clipPath id="leftGreenClip">
      <rect x="114" y="292" width="161" height="168" />
    </clipPath>
    <clipPath id="rightGreenClip">
      <rect x="325" y="292" width="161" height="168" />
    </clipPath>
    <g id="sprout">
      <path d="M 0,7.5 L -8.5,-5 L -2.3,-1 L 0,-9 L 2.3,-1 L 8.5,-5 Z" fill="#000000" />
    </g>
    <g id="sproutGrid">
      <use href="#sprout" x="130" y="310" />
      <use href="#sprout" x="153" y="308" />
      <use href="#sprout" x="176" y="311" />
      <use href="#sprout" x="199" y="308" />
      <use href="#sprout" x="222" y="311" />
      <use href="#sprout" x="245" y="308" />
      <use href="#sprout" x="263" y="311" />
      <use href="#sprout" x="125" y="332" />
      <use href="#sprout" x="145" y="330" />
      <use href="#sprout" x="167" y="333" />
      <use href="#sprout" x="190" y="330" />
      <use href="#sprout" x="213" y="333" />
      <use href="#sprout" x="236" y="330" />
      <use href="#sprout" x="259" y="333" />
      <use href="#sprout" x="135" y="354" />
      <use href="#sprout" x="157" y="352" />
      <use href="#sprout" x="179" y="355" />
      <use href="#sprout" x="201" y="352" />
      <use href="#sprout" x="224" y="355" />
      <use href="#sprout" x="247" y="352" />
      <use href="#sprout" x="264" y="355" />
      <use href="#sprout" x="149" y="376" />
      <use href="#sprout" x="171" y="374" />
      <use href="#sprout" x="193" y="377" />
      <use href="#sprout" x="215" y="374" />
      <use href="#sprout" x="238" y="377" />
      <use href="#sprout" x="260" y="374" />
      <use href="#sprout" x="167" y="398" />
      <use href="#sprout" x="189" y="396" />
      <use href="#sprout" x="211" y="399" />
      <use href="#sprout" x="233" y="396" />
      <use href="#sprout" x="256" y="399" />
      <use href="#sprout" x="193" y="420" />
      <use href="#sprout" x="215" y="418" />
      <use href="#sprout" x="237" y="421" />
      <use href="#sprout" x="259" y="418" />
      <use href="#sprout" x="225" y="441" />
      <use href="#sprout" x="247" y="439" />
      <use href="#sprout" x="263" y="441" />
    </g>
    <path id="collegeNameArc" d="M 58.35,244 A 243.5,243.5 0 1,0 541.65,244" />
  </defs>
  <rect width="600" height="620" rx="36" fill="#ffffff" />
  <circle cx="300" cy="274" r="250" fill="#000000" />
  <circle cx="300" cy="274" r="234" fill="#e31b23" />
  <g fill="#ffffff">
    <path d="M 112,254 A 188,188 0 1,1 488,254 L 488,274 L 112,274 Z" />
    <rect x="66" y="206" width="68" height="24" />
    <rect x="466" y="206" width="68" height="24" />
    <g transform="translate(300,274)">
      <rect x="-15" y="-216" width="30" height="34" transform="rotate(-66)" />
      <rect x="-15" y="-216" width="30" height="34" transform="rotate(-44)" />
      <rect x="-15" y="-216" width="30" height="34" transform="rotate(-22)" />
      <rect x="-15" y="-216" width="30" height="34" transform="rotate(0)" />
      <rect x="-15" y="-216" width="30" height="34" transform="rotate(22)" />
      <rect x="-15" y="-216" width="30" height="34" transform="rotate(44)" />
      <rect x="-15" y="-216" width="30" height="34" transform="rotate(66)" />
    </g>
  </g>
  <g clip-path="url(#upperSkyClip)">
    <rect x="120" y="90" width="360" height="170" fill="#000000" />
    <path d="M 250,196 L 210,142 Q 300,114 390,142 L 350,196 Z" fill="#ffffff" />
    <circle cx="300" cy="194" r="52" fill="#000000" />
    <circle cx="300" cy="194" r="47" fill="#ffffff" />
    <circle cx="300" cy="194" r="39" fill="#000000" />
    <circle cx="300" cy="194" r="35" fill="#e31b23" />
    <g>
      <path d="M 222,244 L 233,204 Q 266,199 300,209 Q 334,199 367,204 L 378,244 Q 338,240 300,249 Q 262,240 222,244 Z" fill="#000000" />
      <path d="M 225,242 Q 262,237 300,246 Q 338,237 375,242 L 373,236 Q 338,231 300,240 Q 262,231 227,236 Z" fill="#ffffff" />
      <path d="M 298.5,211 Q 266,202 236,207 L 229,235 Q 264,230 298.5,239 Z" fill="#ffffff" />
      <path d="M 301.5,211 Q 334,202 364,207 L 371,235 Q 336,230 301.5,239 Z" fill="#ffffff" />
      <g stroke="#000000" stroke-width="1.8" fill="none">
        <path d="M 240,212 Q 268,208 294,215" />
        <path d="M 239,216.5 Q 267,212.5 294,219.5" />
        <path d="M 237.5,221 Q 266,217 294,224" />
        <path d="M 236,225.5 Q 265,221.5 294,228.5" />
        <path d="M 234.5,230 Q 264,226 294,233" />
      </g>
      <g stroke="#000000" stroke-width="1.8" fill="none">
        <path d="M 360,212 Q 332,208 306,215" />
        <path d="M 361,216.5 Q 333,212.5 306,219.5" />
        <path d="M 362.5,221 Q 334,217 306,224" />
        <path d="M 364,225.5 Q 335,221.5 306,228.5" />
        <path d="M 365.5,230 Q 336,226 306,233" />
      </g>
    </g>
  </g>
  <path d="M 104,250 A 196,196 0 1,0 496,250" fill="none" stroke="#ffffff" stroke-width="12" />
  <path d="M 115,250 A 185,185 0 1,0 485,250" fill="none" stroke="#000000" stroke-width="5" />
  <g clip-path="url(#innerEmblemClip)">
    <rect x="114" y="288" width="161" height="175" fill="#00923f" />
    <g clip-path="url(#leftGreenClip)">
      <use href="#sproutGrid" />
    </g>
    <rect x="325" y="288" width="161" height="175" fill="#00923f" />
    <g clip-path="url(#rightGreenClip)">
      <use href="#sproutGrid" transform="translate(600,0) scale(-1,1)" />
    </g>
  </g>
  <path d="M 100,242 Q 200,247 293,249 L 300,262 L 307,249 Q 400,247 500,242 L 495,296 Q 410,296 325,291 L 325,457 L 275,457 L 275,291 Q 190,296 105,296 Z" fill="#0095d9" stroke="#000000" stroke-width="5" stroke-linejoin="round" />
  <path d="M 115,294 A 185,185 0 0,0 275,457" fill="none" stroke="#000000" stroke-width="5" />
  <path d="M 325,457 A 185,185 0 0,0 485,294" fill="none" stroke="#000000" stroke-width="5" />
  <path d="M 30,226 L 104,226 A 198,198 0 1,0 496,226 L 570,226 A 272,272 0 1,1 30,226 Z" fill="#000000" />
  <path d="M 37,232 L 98,232 A 204,204 0 1,0 502,232 L 563,232 A 265,265 0 1,1 37,232 Z" fill="#e31b23" />
  <text fill="#ffffff" font-family="'Arial Narrow', Impact, 'Roboto Condensed', Arial, Helvetica, sans-serif" font-weight="900" font-size="25" letter-spacing="0.4">
    <textPath href="#collegeNameArc" startOffset="50%" text-anchor="middle" textLength="794" lengthAdjust="spacingAndGlyphs">REV. FR. MOSES ORSHIO ADASU UNIVERSITY SCIENCE AND TECHNICAL COLLEGE, MAKURDI</textPath>
  </text>
  <polygon points="40,518 112,535 100,582 50,570 66,545" fill="#000000" />
  <polygon points="560,518 488,535 500,582 550,570 534,545" fill="#000000" />
  <line x1="110" y1="533" x2="96" y2="588" stroke="#ffffff" stroke-width="4" />
  <line x1="490" y1="533" x2="504" y2="588" stroke="#ffffff" stroke-width="4" />
  <rect x="96" y="542" width="408" height="48" fill="#000000" />
  <text x="300" y="575" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="26.5" textLength="376" lengthAdjust="spacingAndGlyphs">Scientia Liberatio Populorum</text>
</svg>`;

const defaultBadgeImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(OFFICIAL_ADASU_BADGE_SVG)}`;

if (typeof window !== 'undefined') {
  try {
    LEGACY_STORAGE_KEYS.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Ignore storage errors
  }
}

let currentBadgeUrl: string =
  (typeof window !== 'undefined' && window.localStorage.getItem(LOCAL_STORAGE_BADGE_KEY)) ||
  defaultBadgeImage;

const listeners = new Set<(url: string) => void>();

let preloadedImg: HTMLImageElement | null = null;

function syncFaviconAndPreload(url: string) {
  if (typeof window === 'undefined') return;

  // Preload image for HTML5 Canvas PDF & PNG Report Card Printer
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    preloadedImg = img;
  };
  img.src = url;

  // Sync browser tab favicon
  try {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  } catch {
    // Ignore DOM head errors
  }
}

// Initialize on module load
syncFaviconAndPreload(currentBadgeUrl);

export function getActiveSchoolBadgeUrl(): string {
  return currentBadgeUrl || defaultBadgeImage;
}

export function getDefaultSchoolBadgeUrl(): string {
  return defaultBadgeImage;
}

export function getPreloadedBadgeImage(): HTMLImageElement | null {
  return preloadedImg;
}

export async function setGlobalSchoolBadgeUrl(
  newUrl: string | null,
  persistToFirestore: boolean = true
): Promise<void> {
  const resolved = newUrl && newUrl.trim() ? newUrl.trim() : defaultBadgeImage;
  if (resolved === currentBadgeUrl && !persistToFirestore) return;

  currentBadgeUrl = resolved;

  if (typeof window !== 'undefined') {
    try {
      if (newUrl && newUrl !== defaultBadgeImage) {
        window.localStorage.setItem(LOCAL_STORAGE_BADGE_KEY, resolved);
      } else if (newUrl === null) {
        window.localStorage.removeItem(LOCAL_STORAGE_BADGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }

  syncFaviconAndPreload(resolved);
  listeners.forEach((listener) => listener(resolved));

  if (persistToFirestore) {
    try {
      await Promise.all([
        setDoc(
          doc(db, 'website_customization', 'main'),
          {
            schoolBadgeUrl: resolved,
            badgeEdition: CURRENT_BADGE_EDITION,
            updatedAt: Date.now()
          },
          { merge: true }
        ),
        setDoc(
          doc(db, 'settings', 'global_config'),
          {
            schoolBadgeUrl: resolved,
            badgeEdition: CURRENT_BADGE_EDITION
          },
          { merge: true }
        )
      ]);
    } catch (err) {
      console.error('Failed to sync school badge to Firestore:', err);
    }
  }
}

export function useSchoolBadgeUrl(): string {
  const [url, setUrl] = useState<string>(getActiveSchoolBadgeUrl());

  useEffect(() => {
    setUrl(getActiveSchoolBadgeUrl());
    const handler = (updated: string) => setUrl(updated);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return url;
}

/**
 * Reads and optimizes an uploaded badge/logo image file into a clean high-resolution Data URL
 * suitable for instant real-time Firestore synchronization and report card printing.
 */
export function compressBadgeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        try {
          const maxDim = 600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          // Fill white background for JPEGs or transparent crests
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.92);
          resolve(compressed);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

interface SchoolBadgeProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
  onClick?: () => void;
}

export const SchoolBadge: React.FC<SchoolBadgeProps> = ({
  className = '',
  size = 'md',
  showBorder = true,
  onClick
}) => {
  const badgeUrl = useSchoolBadgeUrl();

  let sizeClass = 'w-11 h-11';
  if (size === 'xs') sizeClass = 'w-7 h-7';
  if (size === 'sm') sizeClass = 'w-9 h-9';
  if (size === 'md') sizeClass = 'w-11 h-11';
  if (size === 'lg') sizeClass = 'w-16 h-16';
  if (size === 'xl') sizeClass = 'w-24 h-24';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl bg-white overflow-hidden shadow-xs ${
        showBorder ? 'border border-stone-200/80 ring-1 ring-black/5' : ''
      } ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 transition' : ''} ${sizeClass} ${className}`}
      title="Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi - Official School Badge"
    >
      <img
        src={badgeUrl}
        alt="Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi Badge"
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== defaultBadgeImage) {
            target.src = defaultBadgeImage;
          }
        }}
        className="w-full h-full object-contain object-center p-0.5"
      />
    </div>
  );
};

interface SchoolBadgeUploaderCardProps {
  compact?: boolean;
}

export const SchoolBadgeUploaderCard: React.FC<SchoolBadgeUploaderCardProps> = ({
  compact = false
}) => {
  const { userProfile } = useAuth();
  const canManageBadge =
    userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const badgeUrl = useSchoolBadgeUrl();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!canManageBadge) {
    return null;
  }

  const handleFileSelection = async (file: File | undefined) => {
    if (!file || !canManageBadge) return;
    setUploading(true);
    setStatusMsg(null);
    try {
      const optimizedDataUrl = await compressBadgeImageFile(file);
      await setGlobalSchoolBadgeUrl(optimizedDataUrl, true);
      setStatusMsg('Official School Badge / Logo updated across the entire portal!');
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error('Error uploading badge:', err);
      setStatusMsg('Could not process image file. Please try another image.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBadge = async () => {
    if (!canManageBadge) return;
    setUploading(true);
    try {
      await setGlobalSchoolBadgeUrl(null, true);
      setStatusMsg('Custom badge removed and official school crest restored.');
      setTimeout(() => setStatusMsg(null), 3500);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (!canManageBadge) return;
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
          handleFileSelection(file);
        }
      }}
      className={`bg-emerald-50/60 border border-emerald-200 rounded-xl ${
        compact ? 'p-3.5' : 'p-4'
      } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
    >
      <div className="flex items-center gap-3.5">
        <SchoolBadge size={compact ? 'md' : 'lg'} className="shadow-sm" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">
              Official School Badge / Logo
            </h4>
            <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Super Admin &amp; Admin Only</span>
            </span>
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5 max-w-xl leading-relaxed">
            Displayed on the navigation bar, landing page, login portal, scratch cards, and official printable PDF report cards. Drag &amp; drop or upload a badge image (e.g. JPEG/PNG) to update immediately.
          </p>
          {statusMsg && (
            <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMsg}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleFileSelection(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5 text-amber-300" />
          <span>{uploading ? 'Updating Badge...' : 'Add / Upload Badge'}</span>
        </button>

        <button
          type="button"
          disabled={uploading}
          onClick={handleRemoveBadge}
          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          title="Remove custom badge and restore default crest"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
          <span>{badgeUrl !== defaultBadgeImage ? 'Remove Custom Badge' : 'Reset Default Badge'}</span>
        </button>
      </div>
    </div>
  );
};

interface SchoolBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolBadgeModal: React.FC<SchoolBadgeModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const canManageBadge =
    userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const badgeUrl = useSchoolBadgeUrl();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !canManageBadge) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setUploading(true);
            try {
              const dataUrl = await compressBadgeImageFile(file);
              await setGlobalSchoolBadgeUrl(dataUrl, true);
              setSavedNotice('School badge/logo updated across the entire portal in real time!');
              setTimeout(() => setSavedNotice(null), 3500);
            } finally {
              setUploading(false);
            }
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, canManageBadge]);

  if (!isOpen || !canManageBadge) return null;

  const handleFile = async (file: File | undefined) => {
    if (!file || !canManageBadge) return;
    setUploading(true);
    setSavedNotice(null);
    try {
      const dataUrl = await compressBadgeImageFile(file);
      await setGlobalSchoolBadgeUrl(dataUrl, true);
      setSavedNotice('School badge/logo updated across the entire portal in real time!');
      setTimeout(() => setSavedNotice(null), 3500);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBadge = async () => {
    if (!canManageBadge) return;
    setUploading(true);
    setSavedNotice(null);
    try {
      await setGlobalSchoolBadgeUrl(null, true);
      setSavedNotice('Custom badge removed and official school crest restored.');
      setTimeout(() => setSavedNotice(null), 3500);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <SchoolBadge size="sm" />
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Official School Badge / Logo Manager
              </h3>
              <p className="text-[11px] text-stone-500">
                Super Admin &amp; Admin Exclusive • Global Identity Crest
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) {
              handleFile(file);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-emerald-300 hover:border-[#0b4d2c] bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer transition space-y-3"
        >
          <div className="flex justify-center">
            <SchoolBadge size="xl" className="shadow-md" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-800">
              Click to add/upload school badge image, drag &amp; drop, or paste (Ctrl+V)
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Supports JPEG, PNG, WebP • Automatically updates Navbar, Homepage, Login, Scratch Cards &amp; Report Cards
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={uploading}
            className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>{uploading ? 'Applying Badge...' : 'Add / Upload Badge Image'}</span>
          </button>
        </div>

        {savedNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            disabled={uploading}
            onClick={handleRemoveBadge}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>{badgeUrl !== defaultBadgeImage ? 'Remove Custom Badge' : 'Reset Default Badge'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
