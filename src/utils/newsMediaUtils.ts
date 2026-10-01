import { SchoolNews } from '../types/school';

/**
 * Compresses and resizes an uploaded image file to a clean JPEG Data URL
 * so it fits comfortably within Firestore document size limits and loads rapidly.
 */
export async function compressImageFileToDataUrl(
  file: File,
  maxDimension = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Reads an uploaded video file into a Data URL.
 */
export async function readVideoFileToDataUrl(
  file: File
): Promise<{ dataUrl: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read video file'));
    reader.onload = () => {
      resolve({
        dataUrl: reader.result as string,
        sizeBytes: file.size
      });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Parses a video URL or Data URL into an embeddable or direct video source.
 */
export function parseVideoSource(
  rawUrl?: string
): { kind: 'youtube' | 'vimeo' | 'direct'; src: string } | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  const url = rawUrl.trim();

  // Direct uploaded video data URL
  if (url.startsWith('data:video/')) {
    return { kind: 'direct', src: url };
  }

  // YouTube formats:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/shorts/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      kind: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
    };
  }

  // Vimeo formats:
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      kind: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }

  // Direct video URL (.mp4, .webm, .ogg, blob:, http/https stream)
  return { kind: 'direct', src: url };
}

/**
 * Extracts all unique images attached to a SchoolNews item.
 */
export function getNewsImages(item: SchoolNews): { url: string; caption?: string }[] {
  const results: { url: string; caption?: string }[] = [];
  const seen = new Set<string>();

  if (item.imageUrl && item.imageUrl.trim()) {
    seen.add(item.imageUrl.trim());
    results.push({ url: item.imageUrl.trim() });
  }

  if (Array.isArray(item.mediaItems)) {
    for (const m of item.mediaItems) {
      if (m.type === 'image' && m.url && m.url.trim() && !seen.has(m.url.trim())) {
        seen.add(m.url.trim());
        results.push({ url: m.url.trim(), caption: m.caption });
      }
    }
  }

  return results;
}

/**
 * Extracts all unique videos attached to a SchoolNews item.
 */
export function getNewsVideos(item: SchoolNews): { url: string; caption?: string }[] {
  const results: { url: string; caption?: string }[] = [];
  const seen = new Set<string>();

  if (item.videoUrl && item.videoUrl.trim() && !item.videoUrl.startsWith('__CHUNKED_MEDIA__:')) {
    seen.add(item.videoUrl.trim());
    results.push({ url: item.videoUrl.trim() });
  }

  if (Array.isArray(item.mediaItems)) {
    for (const m of item.mediaItems) {
      if (
        m.type === 'video' &&
        m.url &&
        m.url.trim() &&
        !m.url.startsWith('__CHUNKED_MEDIA__:') &&
        !seen.has(m.url.trim())
      ) {
        seen.add(m.url.trim());
        results.push({ url: m.url.trim(), caption: m.caption });
      }
    }
  }

  return results;
}
