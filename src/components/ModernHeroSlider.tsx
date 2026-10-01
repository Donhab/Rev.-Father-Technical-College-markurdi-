import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  LogIn,
  Sparkles,
  ArrowRight,
  BookOpen,
  Play,
  Pause,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  X,
  ShieldCheck
} from 'lucide-react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

import slideLaptopAward from '../assets/images/gstc_laptop_award_1790463723075.jpg';
import slideStageDebate from '../assets/images/gstc_stage_debate_1790463734940.jpg';
import slideStemAward from '../assets/images/gstc_stem_award_1790463747357.jpg';
import slideStudentsHall from '../assets/images/gstc_students_hall_1790463760283.jpg';
import { SchoolBadge } from './SchoolBadge';

export interface SlideItem {
  id: string;
  image: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  highlight: string;
  isDefault?: boolean;
  createdAt?: number;
}

export const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: 'default-slide-1',
    image: slideLaptopAward,
    badge: 'NBTE & NABTEB Accredited • Makurdi',
    badgeColor: 'bg-amber-400 text-stone-950',
    title: 'Premier Science, Technical & Vocational Excellence in Benue State',
    subtitle:
      'Located at Walmayo, Kanshio / Km 1 Gboko Road, Makurdi — rooted in the historic Government Technical Training School (GTTS) premises embraced when Rev. Fr. Moses Orshio Adasu founded the University in 1992.',
    highlight: 'Walmayo-Kanshio & Gboko Road Campus • Makurdi',
    isDefault: true,
    createdAt: 1
  },
  {
    id: 'default-slide-2',
    image: slideStageDebate,
    badge: '10 NBTE/NABTEB Technical Trades',
    badgeColor: 'bg-blue-400 text-stone-950',
    title: 'Hands-On Engineering, Agro-Mechanics & Digital Mastery',
    subtitle:
      'Equipping Benue youth with National Technical Certificate (NTC) and NBC qualifications across Automobile, Electrical & Solar PV, Building Construction, Welding, RAC, Woodworking, and Agricultural Mechanics.',
    highlight: 'MOAUM Vocational & Technical Education Synergy',
    isDefault: true,
    createdAt: 2
  },
  {
    id: 'default-slide-3',
    image: slideStemAward,
    badge: 'Campus Rehabilitation & Solar Power',
    badgeColor: 'bg-emerald-400 text-stone-950',
    title: 'Modernized Workshops & Solar-Lit Campus in Makurdi',
    subtitle:
      'Featuring newly rehabilitated classroom blocks, solar-powered campus street lighting, and industrial-grade laboratories supporting uninterrupted STEM and TVET practicals in Makurdi.',
    highlight: '1st Place Benue STEM & Agro-Tech Innovation',
    isDefault: true,
    createdAt: 3
  },
  {
    id: 'default-slide-4',
    image: slideStudentsHall,
    badge: 'Scientia Liberatio Populorum',
    badgeColor: 'bg-amber-300 text-stone-950',
    title: 'Training Future Technicians, Engineers & Industrial Leaders',
    subtitle:
      'Inside the Makurdi technical college auditorium as National Technical Certificate (NTC) and Science scholars assemble for workshop safety and continuous assessment briefings.',
    highlight: 'Knowledge for the Liberation of the People • Makurdi',
    isDefault: true,
    createdAt: 4
  }
];

const LOCAL_CUSTOM_SLIDES_KEY = 'gstc_custom_hero_slides_v1';
const LOCAL_REMOVED_DEFAULTS_KEY = 'gstc_removed_default_slides_v1';

let cachedCustomSlides: SlideItem[] = [];
let cachedRemovedDefaultIds: string[] = [];

if (typeof window !== 'undefined') {
  try {
    const rawCustom = window.localStorage.getItem(LOCAL_CUSTOM_SLIDES_KEY);
    if (rawCustom) cachedCustomSlides = JSON.parse(rawCustom);
    const rawRemoved = window.localStorage.getItem(LOCAL_REMOVED_DEFAULTS_KEY);
    if (rawRemoved) cachedRemovedDefaultIds = JSON.parse(rawRemoved);
  } catch {
    // Ignore storage errors
  }
}

const slideListeners = new Set<() => void>();
let firestoreSlideSyncInitialized = false;

function computeActiveSlides(): SlideItem[] {
  const keptDefaults = DEFAULT_SLIDES.filter(
    (s) => !cachedRemovedDefaultIds.includes(s.id)
  );
  const sortedCustom = [...cachedCustomSlides].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );
  return [...sortedCustom, ...keptDefaults];
}

function notifySlideListeners() {
  slideListeners.forEach((cb) => cb());
}

function initFirestoreSlidesSync() {
  if (firestoreSlideSyncInitialized || typeof window === 'undefined') return;
  firestoreSlideSyncInitialized = true;

  onSnapshot(
    collection(db, 'hero_slides'),
    (snap) => {
      const list: SlideItem[] = [];
      snap.forEach((d) => {
        const data = d.data() as SlideItem;
        if (data && data.image) {
          list.push({
            ...data,
            id: d.id,
            isDefault: false
          });
        }
      });
      cachedCustomSlides = list;
      try {
        window.localStorage.setItem(LOCAL_CUSTOM_SLIDES_KEY, JSON.stringify(list));
      } catch {
        // Ignore quota errors
      }
      notifySlideListeners();
    },
    (err) => console.warn('Hero slides sync notice:', err.message)
  );

  onSnapshot(
    doc(db, 'website_customization', 'slider_config'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as { removedDefaultIds?: string[] };
        cachedRemovedDefaultIds = Array.isArray(data?.removedDefaultIds)
          ? data.removedDefaultIds
          : [];
        try {
          window.localStorage.setItem(
            LOCAL_REMOVED_DEFAULTS_KEY,
            JSON.stringify(cachedRemovedDefaultIds)
          );
        } catch {
          // Ignore quota errors
        }
        notifySlideListeners();
      }
    },
    (err) => console.warn('Slider config sync notice:', err.message)
  );
}

export function useHeroSlides() {
  const [slides, setSlides] = useState<SlideItem[]>(computeActiveSlides());
  const [removedDefaultCount, setRemovedDefaultCount] = useState<number>(
    cachedRemovedDefaultIds.length
  );

  useEffect(() => {
    initFirestoreSlidesSync();
    const update = () => {
      setSlides(computeActiveSlides());
      setRemovedDefaultCount(cachedRemovedDefaultIds.length);
    };
    update();
    slideListeners.add(update);
    return () => {
      slideListeners.delete(update);
    };
  }, []);

  return { slides, removedDefaultCount };
}

/**
 * Compresses an uploaded slider image file into a clean widescreen JPEG Data URL
 * optimized for fast loading and Firestore document limits.
 */
export function compressSliderImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read slider image file.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        try {
          const maxWidth = 1280;
          const maxHeight = 800;
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.fillStyle = '#0c0a09';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.84);
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

export async function addHeroSlideItem(input: {
  image: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  highlight?: string;
  badgeColor?: string;
}): Promise<SlideItem> {
  const newDocRef = doc(collection(db, 'hero_slides'));
  const newSlide: SlideItem = {
    id: newDocRef.id,
    image: input.image,
    title: input.title?.trim() || 'MOAUM USTC Makurdi Excellence in Action',
    subtitle:
      input.subtitle?.trim() ||
      'Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi — Empowering future engineers, technicians, and innovators.',
    badge: input.badge?.trim() || 'Official Campus Highlight',
    badgeColor: input.badgeColor || 'bg-amber-400 text-stone-950',
    highlight: input.highlight?.trim() || 'Makurdi, Benue State • Scientia Liberatio Populorum',
    isDefault: false,
    createdAt: Date.now()
  };

  cachedCustomSlides = [newSlide, ...cachedCustomSlides];
  notifySlideListeners();

  await setDoc(newDocRef, newSlide);
  return newSlide;
}

export async function removeHeroSlideItem(slide: SlideItem): Promise<void> {
  if (slide.isDefault || slide.id.startsWith('default-slide-')) {
    const updatedRemoved = Array.from(new Set([...cachedRemovedDefaultIds, slide.id]));
    cachedRemovedDefaultIds = updatedRemoved;
    notifySlideListeners();
    await setDoc(
      doc(db, 'website_customization', 'slider_config'),
      {
        removedDefaultIds: updatedRemoved,
        updatedAt: Date.now()
      },
      { merge: true }
    );
  } else {
    cachedCustomSlides = cachedCustomSlides.filter((s) => s.id !== slide.id);
    notifySlideListeners();
    await deleteDoc(doc(db, 'hero_slides', slide.id));
  }
}

export async function restoreDefaultHeroSlides(): Promise<void> {
  cachedRemovedDefaultIds = [];
  notifySlideListeners();
  await setDoc(
    doc(db, 'website_customization', 'slider_config'),
    {
      removedDefaultIds: [],
      updatedAt: Date.now()
    },
    { merge: true }
  );
}

interface HeroSliderManagerCardProps {
  compact?: boolean;
}

/**
 * Dedicated Card for Super Admin & Admin to Add or Remove Homepage Slider Images.
 * Strictly hidden from Staff, Students, and Visitors.
 */
export const HeroSliderManagerCard: React.FC<HeroSliderManagerCardProps> = ({
  compact = false
}) => {
  const { userProfile } = useAuth();
  const canManageSlides =
    userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const { slides, removedDefaultCount } = useHeroSlides();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!canManageSlides) {
    return null;
  }

  const handleQuickFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !canManageSlides) return;
    setUploading(true);
    setStatusMsg(null);
    try {
      let addedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await compressSliderImageFile(file);
        await addHeroSlideItem({
          image: dataUrl
        });
        addedCount++;
      }
      if (addedCount > 0) {
        setStatusMsg(
          `Added ${addedCount} new ${addedCount === 1 ? 'image' : 'images'} to the homepage 5-second slider!`
        );
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error uploading slider image:', err);
      setStatusMsg('Could not upload slider image. Please try another image file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!canManageSlides) return;
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleQuickFilesUpload(e.dataTransfer.files);
          }
        }}
        className={`bg-stone-50 border border-stone-200 rounded-xl ${
          compact ? 'p-3.5' : 'p-4'
        } space-y-3`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#0b4d2c]" />
                <span>Homepage 5-Second Slider Images ({slides.length} Active)</span>
              </h4>
              <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Super Admin &amp; Admin Only</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5 max-w-xl leading-relaxed">
              Add new sliding banner photos or remove existing slider images displayed on the public landing page.
            </p>
            {statusMsg && (
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{statusMsg}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleQuickFilesUpload(e.target.files);
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
              <span>{uploading ? 'Adding Slide...' : 'Add Slider Image'}</span>
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-[#0b4d2c]" />
              <span>Manage / Remove Slides ({slides.length})</span>
            </button>

            {removedDefaultCount > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await restoreDefaultHeroSlides();
                  setStatusMsg('Default college slider images restored.');
                  setTimeout(() => setStatusMsg(null), 3500);
                }}
                className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg border border-amber-300 transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Restore removed default slides"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Defaults</span>
              </button>
            )}
          </div>
        </div>

        {/* Thumbnail Strip with Quick Remove Buttons */}
        {slides.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2 border-t border-stone-200/80">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className="relative group rounded-lg overflow-hidden border border-stone-200 bg-stone-900 aspect-video"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!canManageSlides) return;
                        await removeHeroSlideItem(slide);
                        setStatusMsg('Slider image removed from homepage.');
                        setTimeout(() => setStatusMsg(null), 3000);
                      }}
                      className="p-1 rounded bg-red-600/90 hover:bg-red-600 text-white shadow-xs transition cursor-pointer"
                      title="Remove this slider image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] font-semibold text-white truncate">
                    {slide.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HeroSliderManagerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

interface HeroSliderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full Modal for Super Admin & Admin to Add Slider Images (with optional caption/title)
 * and Remove any existing Slider Image.
 */
export const HeroSliderManagerModal: React.FC<HeroSliderManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { userProfile } = useAuth();
  const canManageSlides =
    userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const { slides, removedDefaultCount } = useHeroSlides();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('Official Campus Highlight');
  const [subtitle, setSubtitle] = useState('');
  const [highlight, setHighlight] = useState('Makurdi, Benue State • Scientia Liberatio Populorum');
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen || !canManageSlides) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !canManageSlides) return;
    setUploading(true);
    setNotice(null);
    try {
      let added = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressSliderImageFile(file);
        await addHeroSlideItem({
          image: compressed,
          title: title.trim() || undefined,
          badge: badge.trim() || undefined,
          subtitle: subtitle.trim() || undefined,
          highlight: highlight.trim() || undefined
        });
        added++;
      }
      if (added > 0) {
        setTitle('');
        setSubtitle('');
        setNotice(
          `Successfully added ${added} slider ${added === 1 ? 'image' : 'images'} to the homepage!`
        );
        setTimeout(() => setNotice(null), 4000);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0b4d2c]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Homepage Slider Images Manager
              </h3>
              <p className="text-[11px] text-stone-500">
                Super Admin &amp; Admin Exclusive • Add or Remove 5-Second Sliding Pictures
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Slide Caption Fields */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3 text-xs">
          <p className="font-bold text-stone-800">
            1. Add New Slider Image (Optional Headline &amp; Caption)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Slide Headline Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MOAUM USTC Makurdi Robotics & STEM Exhibition"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Top Badge Label (Optional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Official Campus Highlight"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Slide Description / Subtitle (Optional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Short description displayed at the bottom of the slide..."
              className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
            />
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 hover:border-[#0b4d2c] bg-emerald-50/50 rounded-xl p-5 text-center cursor-pointer transition space-y-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <p className="text-xs font-bold text-stone-800">
              Click to select slider image(s) from your device, or drag &amp; drop here
            </p>
            <p className="text-[11px] text-stone-500">
              Supports JPEG, PNG, WebP • Immediately added to the 5-second homepage slider
            </p>
            <button
              type="button"
              disabled={uploading}
              className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>{uploading ? 'Uploading Slider Image...' : 'Choose & Add Slider Image(s)'}</span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Active Slides List with Remove Buttons */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-800">
              2. Active Homepage Slider Images ({slides.length})
            </h4>
            {removedDefaultCount > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await restoreDefaultHeroSlides();
                  setNotice('Restored all default college slider images.');
                  setTimeout(() => setNotice(null), 3500);
                }}
                className="text-xs font-semibold text-[#0b4d2c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Removed Default Slides ({removedDefaultCount})</span>
              </button>
            )}
          </div>

          {slides.length === 0 ? (
            <div className="p-6 text-center bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500 space-y-2">
              <p>All slides have been removed. Upload a new image above or restore default slides.</p>
              <button
                type="button"
                onClick={() => restoreDefaultHeroSlides()}
                className="px-3 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg text-xs"
              >
                Restore Default Slides
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-68 overflow-y-auto pr-1">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-stone-200 bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-16 h-12 rounded-lg object-cover shrink-0 border border-stone-200 bg-stone-900"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-emerald-800 font-bold block">
                        Slide #{idx + 1} {slide.isDefault ? '• Default' : '• Custom'}
                      </span>
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {slide.title}
                      </p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {slide.badge}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!canManageSlides) return;
                      await removeHeroSlideItem(slide);
                      setNotice(`Removed "${slide.title}" from the homepage slider.`);
                      setTimeout(() => setNotice(null), 3000);
                    }}
                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition cursor-pointer"
                    title="Remove this slider image"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-stone-200">
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

interface ModernHeroSliderProps {
  onOpenLogin: () => void;
  onNavigateToCheckResult?: () => void;
  onExplorePrograms?: () => void;
}

export const ModernHeroSlider: React.FC<ModernHeroSliderProps> = ({
  onOpenLogin,
  onExplorePrograms
}) => {
  const { userProfile } = useAuth();
  const canManageSlides =
    userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const { slides } = useHeroSlides();
  const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const [sliderModalOpen, setSliderModalOpen] = useState(false);

  // Keep currentSlide index in bounds when slides are added or removed
  useEffect(() => {
    if (currentSlide >= activeSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  // Slide down automatically after every 5 seconds (5000ms)
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;

    const timer = setInterval(() => {
      setDirection('down');
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  const handleNext = () => {
    setDirection('down');
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setDirection('up');
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const currentSlideItem = activeSlides[currentSlide] || activeSlides[0];

  return (
    <div className="space-y-4">
      {/* 1. Super part of the homepage: Full-width modern slider sliding down every 5 seconds */}
      <div
        className="relative h-[420px] sm:h-[480px] lg:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 bg-stone-950 group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Super Admin & Admin Exclusive: Quick Add / Remove Slider Images Controls */}
        {canManageSlides && (
          <div className="absolute top-4 left-4 sm:left-6 z-30 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSliderModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-stone-950/80 hover:bg-[#0b4d2c] text-amber-300 hover:text-white border border-amber-400/40 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 shadow-lg transition cursor-pointer"
              title="Add or remove homepage slider images (Super Admin & Admin only)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add / Manage Slider Images</span>
            </button>

            {currentSlideItem && (
              <button
                type="button"
                onClick={async () => {
                  if (!canManageSlides) return;
                  await removeHeroSlideItem(currentSlideItem);
                }}
                className="px-2.5 py-1.5 rounded-full bg-red-950/85 hover:bg-red-700 text-red-200 hover:text-white border border-red-400/40 backdrop-blur-md text-xs font-semibold flex items-center gap-1 shadow-lg transition cursor-pointer"
                title="Remove current slide image from slider"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove Slide</span>
              </button>
            )}
          </div>
        )}

        {/* Sliding Images Container (Slide down vertical motion) */}
        {activeSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          const isPrev =
            index === (currentSlide - 1 + activeSlides.length) % activeSlides.length;

          // Slide down animation classes
          let translateClass = 'translate-y-full opacity-0 pointer-events-none';
          if (isActive) {
            translateClass = 'translate-y-0 opacity-100 z-10';
          } else if (isPrev && direction === 'down') {
            translateClass = '-translate-y-full opacity-0 pointer-events-none';
          }

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${translateClass}`}
            >
              {/* Background Picture */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform scale-105 group-hover:scale-100 transition-transform duration-1000"
              />

              {/* Rich dark gradient overlays for maximum legibility and modern school feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/40 to-transparent" />

              {/* Slide Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white max-w-3xl space-y-3 z-20">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${slide.badgeColor}`}
                  >
                    {slide.badge}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-200 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                    {slide.highlight}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight leading-tight text-white drop-shadow-md">
                  {slide.title}
                </h2>

                <p className="text-xs sm:text-sm lg:text-base text-stone-200 leading-relaxed font-normal max-w-2xl drop-shadow-sm">
                  {slide.subtitle}
                </p>

                {/* 5-second slide countdown visual pulse */}
                <div className="pt-2 flex items-center gap-2 text-[11px] text-stone-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    Auto-sliding down every 5 seconds (Slide {currentSlide + 1} of {activeSlides.length})
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Up / Down Slider Controls (Vertical sliding buttons) */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-stone-900/80 hover:bg-[#0b4d2c] text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition shadow-lg hover:scale-105 active:scale-95"
            title="Previous slide (Slide Up)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-stone-900/80 hover:bg-[#0b4d2c] text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition shadow-lg hover:scale-105 active:scale-95"
            title="Next slide (Slide Down)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Dot indicators and pause toggle */}
        <div className="absolute top-4 right-4 sm:right-6 z-30 flex items-center gap-2 bg-stone-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-white hover:text-amber-300 transition mr-1"
            title={isPaused ? 'Resume auto-sliding' : 'Pause auto-sliding'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentSlide ? 'down' : 'up');
                setCurrentSlide(i);
              }}
              className={`transition-all duration-300 rounded-full ${
                i === currentSlide
                  ? 'w-6 h-2 bg-amber-400'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. THE LOGIN BUTTON JUST BELOW THE SLIDES IN THE LANDING PAGE */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#0b4d2c] to-[#06331c] text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-emerald-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SchoolBadge size="md" className="shadow-md" />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Official College Portal Access</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif">
              Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi
            </h3>
          </div>
        </div>

        {/* Primary Action Buttons Just Below the Slides */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenLogin}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 shrink-0 group border border-amber-300"
          >
            <LogIn className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
            <span>Login to Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {onExplorePrograms && (
            <button
              onClick={onExplorePrograms}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-xs transition inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>9 Vocational Trades</span>
            </button>
          )}
        </div>
      </div>

      {/* Super Admin & Admin Modal for Adding/Removing Slider Images */}
      <HeroSliderManagerModal
        isOpen={sliderModalOpen}
        onClose={() => setSliderModalOpen(false)}
      />
    </div>
  );
};
