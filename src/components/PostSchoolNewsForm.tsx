import React, { useState, useEffect, useRef } from 'react';
import { SchoolNews, SchoolNewsMediaItem } from '../types/school';
import {
  compressImageFileToDataUrl,
  readVideoFileToDataUrl,
  getNewsImages,
  getNewsVideos
} from '../utils/newsMediaUtils';
import { NewsVideoPlayer } from './NewsCardAndModal';
import {
  Newspaper,
  Image as ImageIcon,
  Video,
  Upload,
  Plus,
  Trash2,
  Send,
  Check,
  Loader2,
  ExternalLink,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostSchoolNewsFormProps {
  editingItem?: SchoolNews | null;
  onCancelEdit?: () => void;
  onPostNews?: (data: Omit<SchoolNews, 'id' | 'publishedAt'>) => Promise<SchoolNews>;
  onUpdateNews?: (id: string, updates: Partial<SchoolNews>) => Promise<void>;
  onViewPublishedNews?: () => void;
  defaultAuthorName?: string;
  defaultAuthorRole?: string;
}

export const PostSchoolNewsForm: React.FC<PostSchoolNewsFormProps> = ({
  editingItem = null,
  onCancelEdit,
  onPostNews,
  onUpdateNews,
  onViewPublishedNews,
  defaultAuthorName = 'Dr. Terhemba Iorpuu (Academic Records)',
  defaultAuthorRole = 'School Administration'
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SchoolNews['category']>('General');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(defaultAuthorName);
  const [authorRole, setAuthorRole] = useState(defaultAuthorRole);

  // Attached Images & Videos state
  const [attachedImages, setAttachedImages] = useState<{ id: string; url: string; caption?: string }[]>([]);
  const [attachedVideos, setAttachedVideos] = useState<{ id: string; url: string; caption?: string }[]>([]);

  // URL inputs for quick paste
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoCaptionInput, setVideoCaptionInput] = useState('');

  // Upload status & feedback
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [postedSuccess, setPostedSuccess] = useState(false);

  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync form when editingItem changes
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      setCategory(editingItem.category || 'General');
      setSummary(editingItem.summary || '');
      setContent(editingItem.content || '');
      setAuthorName(editingItem.authorName || defaultAuthorName);
      setAuthorRole(editingItem.authorRole || defaultAuthorRole);

      const imgs = getNewsImages(editingItem).map((img, i) => ({
        id: `img-edit-${i}-${Date.now()}`,
        url: img.url,
        caption: img.caption
      }));
      const vids = getNewsVideos(editingItem).map((vid, i) => ({
        id: `vid-edit-${i}-${Date.now()}`,
        url: vid.url,
        caption: vid.caption
      }));
      setAttachedImages(imgs);
      setAttachedVideos(vids);
    } else {
      setTitle('');
      setCategory('General');
      setSummary('');
      setContent('');
      setAttachedImages([]);
      setAttachedVideos([]);
    }
  }, [editingItem, defaultAuthorName, defaultAuthorRole]);

  // Handle uploading image file(s) from device
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setMediaError(null);
    setUploadingImage(true);
    try {
      const newImages: { id: string; url: string; caption?: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const compressedDataUrl = await compressImageFileToDataUrl(file, 1200, 0.8);
        newImages.push({
          id: `img-${Date.now()}-${i}`,
          url: compressedDataUrl,
          caption: file.name.replace(/\.[^/.]+$/, '')
        });
      }
      setAttachedImages((prev) => [...prev, ...newImages]);
    } catch (err: any) {
      setMediaError(err?.message || 'Failed to process selected image file.');
    } finally {
      setUploadingImage(false);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
    }
  };

  // Handle adding image via pasted URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setMediaError(null);
    setAttachedImages((prev) => [
      ...prev,
      {
        id: `img-url-${Date.now()}`,
        url: imageUrlInput.trim(),
        caption: imageCaptionInput.trim() || undefined
      }
    ]);
    setImageUrlInput('');
    setImageCaptionInput('');
  };

  // Handle uploading video file from device
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaError(null);

    // Limit single video upload to 8MB so Firestore chunking stays fast
    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMediaError('Video file exceeds 8 MB limit. Please choose a shorter video clip or paste a YouTube/MP4 link.');
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
      return;
    }

    setUploadingVideo(true);
    try {
      const { dataUrl } = await readVideoFileToDataUrl(file);
      setAttachedVideos((prev) => [
        ...prev,
        {
          id: `vid-file-${Date.now()}`,
          url: dataUrl,
          caption: file.name.replace(/\.[^/.]+$/, '')
        }
      ]);
    } catch (err: any) {
      setMediaError(err?.message || 'Failed to read selected video file.');
    } finally {
      setUploadingVideo(false);
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = '';
      }
    }
  };

  // Handle adding video via URL (YouTube, Vimeo, or direct MP4/WebM)
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    setMediaError(null);
    setAttachedVideos((prev) => [
      ...prev,
      {
        id: `vid-url-${Date.now()}`,
        url: videoUrlInput.trim(),
        caption: videoCaptionInput.trim() || undefined
      }
    ]);
    setVideoUrlInput('');
    setVideoCaptionInput('');
  };

  const handleRemoveImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleRemoveVideo = (id: string) => {
    setAttachedVideos((prev) => prev.filter((vid) => vid.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMediaError(null);

    // Also include any URL currently typed in the image/video URL inputs if the user didn't click "+ Add" first
    const finalImages = [...attachedImages];
    if (imageUrlInput.trim()) {
      finalImages.push({
        id: `img-auto-${Date.now()}`,
        url: imageUrlInput.trim(),
        caption: imageCaptionInput.trim() || undefined
      });
    }
    const finalVideos = [...attachedVideos];
    if (videoUrlInput.trim()) {
      finalVideos.push({
        id: `vid-auto-${Date.now()}`,
        url: videoUrlInput.trim(),
        caption: videoCaptionInput.trim() || undefined
      });
    }

    const mediaItems: SchoolNewsMediaItem[] = [
      ...finalImages.map((img) => ({
        id: img.id,
        type: 'image' as const,
        url: img.url,
        caption: img.caption
      })),
      ...finalVideos.map((vid) => ({
        id: vid.id,
        type: 'video' as const,
        url: vid.url,
        caption: vid.caption
      }))
    ];

    const primaryImageUrl = finalImages[0]?.url || '';
    const primaryVideoUrl = finalVideos[0]?.url || '';

    setSubmitting(true);
    try {
      if (editingItem && onUpdateNews) {
        await onUpdateNews(editingItem.id, {
          title,
          category,
          summary,
          content,
          authorName: authorName || 'School Administration',
          authorRole: authorRole || 'Admin',
          imageUrl: primaryImageUrl,
          videoUrl: primaryVideoUrl,
          mediaItems
        });
        if (onCancelEdit) onCancelEdit();
      } else if (onPostNews) {
        await onPostNews({
          title,
          category,
          summary,
          content,
          authorName: authorName || 'School Administration',
          authorRole: authorRole || 'Admin',
          imageUrl: primaryImageUrl,
          videoUrl: primaryVideoUrl,
          mediaItems
        });
      }

      setTitle('');
      setSummary('');
      setContent('');
      setAttachedImages([]);
      setAttachedVideos([]);
      setImageUrlInput('');
      setImageCaptionInput('');
      setVideoUrlInput('');
      setVideoCaptionInput('');
      setPostedSuccess(true);
      confetti({ particleCount: 45, spread: 65 });
      setTimeout(() => setPostedSuccess(false), 6000);
    } catch (err: any) {
      console.error('Error publishing news:', err);
      setMediaError('Could not save news post. Please check your connection or reduce media file size.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#0b4d2c]" />
            <span>
              {editingItem
                ? 'Edit Published School News, Photos & Videos'
                : 'Post School News (With Text, Images & Videos)'}
            </span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Type your news announcement below and attach photos or videos. Published posts appear immediately on the Landing Page and School News portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {postedSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <Check className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-800">
                Published to Landing Page &amp; School News!
              </span>
              {onViewPublishedNews && (
                <button
                  type="button"
                  onClick={onViewPublishedNews}
                  className="ml-1 text-xs font-bold text-[#0b4d2c] underline hover:text-emerald-950 flex items-center gap-1"
                >
                  <span>View Live</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {mediaError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center justify-between">
          <span>{mediaError}</span>
          <button type="button" onClick={() => setMediaError(null)} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* 1. Headline & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block font-semibold text-stone-700 mb-1">
              News Article Headline / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MOAUM USTC Makurdi Robotics & Technical Exhibition 2026 Highlights"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none text-stone-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">News Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SchoolNews['category'])}
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] bg-white focus:outline-none text-stone-900 font-medium"
            >
              <option value="General">General School News</option>
              <option value="Admissions">Admissions &amp; Enrollment</option>
              <option value="Examination">Examination &amp; Results</option>
              <option value="Technical Workshop">Technical Workshop / Exhibition</option>
              <option value="Sports & Culture">Sports &amp; Culture</option>
            </select>
          </div>
        </div>

        {/* 2. Summary & Full Content */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Brief Summary / Lead Text (Shown on News Card)
          </label>
          <input
            type="text"
            placeholder="A short 1-2 sentence summary that appears on the Landing Page and School News preview card..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3.5 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Full News Story / Article Content *
          </label>
          <textarea
            required
            rows={5}
            placeholder="Type the complete school news announcement, event report, or bulletin here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none resize-y leading-relaxed"
          />
        </div>

        {/* 3. IMAGES & VIDEOS MEDIA STUDIO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          {/* IMAGES PANEL */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0b4d2c] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Attach News Image(s)</h4>
                  <p className="text-[11px] text-stone-500">
                    Upload photos from device or paste an image link
                  </p>
                </div>
              </div>

              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageFileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-3 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                {uploadingImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingImage ? 'Processing...' : 'Upload Photo(s)'}</span>
              </button>
            </div>

            {/* Or Paste Image URL */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="Or paste Image URL (https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg flex items-center justify-center gap-1 shrink-0 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Image URL</span>
              </button>
            </div>

            {/* Attached Images Preview */}
            {attachedImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {attachedImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative group rounded-lg overflow-hidden border border-stone-200 bg-white shadow-2xs"
                  >
                    <img
                      src={img.url}
                      alt={img.caption || `Attached photo ${idx + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <input
                      type="text"
                      placeholder="Photo caption (optional)"
                      value={img.caption || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttachedImages((prev) =>
                          prev.map((item) => (item.id === img.id ? { ...item, caption: val } : item))
                        );
                      }}
                      className="w-full px-2 py-1 text-[10px] border-t border-stone-100 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-stone-400 italic py-2 text-center border border-dashed border-stone-200 rounded-lg bg-white/60">
                No images attached yet. Click &quot;Upload Photo(s)&quot; or paste an image URL above.
              </div>
            )}
          </div>

          {/* VIDEOS PANEL */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Attach News Video(s)</h4>
                  <p className="text-[11px] text-stone-500">
                    Upload video clip (MP4/WebM) or paste YouTube / video link
                  </p>
                </div>
              </div>

              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/*"
                onChange={handleVideoFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoFileInputRef.current?.click()}
                disabled={uploadingVideo}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                {uploadingVideo ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingVideo ? 'Loading Video...' : 'Upload Video'}</span>
              </button>
            </div>

            {/* Or Paste Video URL */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="Or paste YouTube / MP4 Video URL (https://...)"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddVideoUrl}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg flex items-center justify-center gap-1 shrink-0 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video URL</span>
              </button>
            </div>

            {/* Attached Videos Preview */}
            {attachedVideos.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {attachedVideos.map((vid, idx) => (
                  <div
                    key={vid.id}
                    className="relative rounded-lg overflow-hidden border border-stone-200 bg-white shadow-2xs p-2 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
                      <span className="truncate">Attached Video #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(vid.id)}
                        className="px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <NewsVideoPlayer
                      url={vid.url}
                      title={`Preview Video ${idx + 1}`}
                      className="w-full aspect-video rounded-lg overflow-hidden bg-stone-950"
                    />
                    <input
                      type="text"
                      placeholder="Video caption (optional)"
                      value={vid.caption || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttachedVideos((prev) =>
                          prev.map((item) => (item.id === vid.id ? { ...item, caption: val } : item))
                        );
                      }}
                      className="w-full px-2 py-1 text-[10px] border border-stone-200 rounded focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-stone-400 italic py-2 text-center border border-dashed border-stone-200 rounded-lg bg-white/60">
                No videos attached yet. Click &quot;Upload Video&quot; or paste a YouTube/MP4 link above.
              </div>
            )}
          </div>
        </div>

        {/* 4. Author Info & Submit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Author Name / Sign-off</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Author Designation / Office</label>
            <input
              type="text"
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-stone-100">
          {editingItem && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2.5 border border-stone-300 rounded-lg text-stone-700 font-semibold hover:bg-stone-50"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || uploadingImage || uploadingVideo}
            className="px-6 py-2.5 bg-[#0b4d2c] hover:bg-[#083a21] disabled:opacity-60 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>
              {submitting
                ? 'Publishing to Website...'
                : editingItem
                ? 'Update Published News'
                : 'Publish News to Landing Page & School News'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
