import React, { useState } from 'react';
import { SchoolNews } from '../types/school';
import { getNewsImages, getNewsVideos, parseVideoSource } from '../utils/newsMediaUtils';
import {
  Calendar,
  User,
  ChevronRight,
  Video,
  Image as ImageIcon,
  Play,
  X
} from 'lucide-react';

export const NewsVideoPlayer: React.FC<{
  url: string;
  title?: string;
  className?: string;
}> = ({ url, title = 'School News Video', className = 'w-full aspect-video rounded-xl overflow-hidden bg-stone-950' }) => {
  const parsed = parseVideoSource(url);
  if (!parsed) return null;

  if (parsed.kind === 'youtube' || parsed.kind === 'vimeo') {
    return (
      <div className={className} onClick={(e) => e.stopPropagation()}>
        <iframe
          src={parsed.src}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <video
        src={parsed.src}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain bg-stone-950"
      >
        Your browser does not support HTML5 video playback.
      </video>
    </div>
  );
};

export const SchoolNewsCard: React.FC<{
  item: SchoolNews;
  onSelect: (item: SchoolNews) => void;
}> = ({ item, onSelect }) => {
  const images = getNewsImages(item);
  const videos = getNewsVideos(item);
  const hasImage = images.length > 0;
  const hasVideo = videos.length > 0;

  const [playInlineVideo, setPlayInlineVideo] = useState(!hasImage && hasVideo);

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group hover:border-emerald-400"
    >
      <div>
        {/* Media Banner (Image and/or Video) */}
        {(hasImage || hasVideo) && (
          <div className="relative w-full aspect-video bg-stone-900 overflow-hidden border-b border-stone-100">
            {playInlineVideo && hasVideo ? (
              <NewsVideoPlayer
                url={videos[0].url}
                title={item.title}
                className="w-full h-full bg-stone-950"
              />
            ) : hasImage ? (
              <>
                <img
                  src={images[0].url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {hasVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayInlineVideo(true);
                    }}
                    className="absolute inset-0 bg-stone-950/35 hover:bg-stone-950/50 transition flex items-center justify-center group/play"
                    title="Play attached video"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg group-hover/play:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
                    </div>
                  </button>
                )}
              </>
            ) : null}

            {/* Media Type Badges */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 pointer-events-none">
              {hasImage && (
                <span className="px-2 py-0.5 rounded-md bg-stone-950/75 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-emerald-300" />
                  <span>{images.length > 1 ? `${images.length} Photos` : 'Photo'}</span>
                </span>
              )}
              {hasVideo && (
                <span className="px-2 py-0.5 rounded-md bg-amber-400/95 text-stone-950 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                  <Video className="w-3 h-3" />
                  <span>{videos.length > 1 ? `${videos.length} Videos` : 'Video'}</span>
                </span>
              )}
            </div>

            {playInlineVideo && hasImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayInlineVideo(false);
                }}
                className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 hover:bg-stone-900 text-white text-[10px] font-semibold"
              >
                Show Cover Photo
              </button>
            )}
          </div>
        )}

        {/* Text Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {item.category}
            </span>
            <span className="text-stone-400 text-[11px] flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-stone-400" />
              {new Date(item.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>

          <h3 className="font-bold text-base text-stone-900 group-hover:text-[#0b4d2c] transition-colors leading-snug">
            {item.title}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
            {item.summary || item.content}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5 text-[11px] truncate">
          <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="font-medium text-stone-700 truncate">{item.authorName}</span>
          <span className="text-stone-400 text-[10px]">({item.authorRole})</span>
        </div>
        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform shrink-0">
          Read Full Story <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

export const SchoolNewsDetailModal: React.FC<{
  article: SchoolNews | null;
  onClose: () => void;
}> = ({ article, onClose }) => {
  if (!article) return null;

  const images = getNewsImages(article);
  const videos = getNewsVideos(article);

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold uppercase tracking-wider">
            <span>{article.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500 font-mono font-normal">
              {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 text-sm font-bold transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-snug">
            {article.title}
          </h2>
          <p className="text-xs text-stone-500 mt-1.5">
            Published by <strong className="text-stone-700">{article.authorName}</strong> ({article.authorRole})
          </p>
        </div>

        {/* Attached Videos */}
        {videos.length > 0 && (
          <div className="space-y-3">
            {videos.map((vid, idx) => (
              <div key={idx} className="space-y-1.5">
                <NewsVideoPlayer
                  url={vid.url}
                  title={`${article.title} - Video ${idx + 1}`}
                  className="w-full aspect-video rounded-xl overflow-hidden bg-stone-950 border border-stone-200 shadow-sm"
                />
                {vid.caption && (
                  <p className="text-[11px] text-stone-500 italic">{vid.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Primary Cover Image (if 1 image) or Gallery (if multiple images) */}
        {images.length === 1 && (
          <div className="space-y-1.5">
            <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100 max-h-[440px] flex items-center justify-center">
              <img
                src={images[0].url}
                alt={article.title}
                className="w-full max-h-[440px] object-contain"
              />
            </div>
            {images[0].caption && (
              <p className="text-[11px] text-stone-500 italic">{images[0].caption}</p>
            )}
          </div>
        )}

        {images.length > 1 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Attached Photos ({images.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex flex-col"
                >
                  <img
                    src={img.url}
                    alt={img.caption || `${article.title} photo ${idx + 1}`}
                    className="w-full h-52 object-cover"
                  />
                  {img.caption && (
                    <span className="p-2 text-[11px] text-stone-600 bg-white border-t border-stone-100">
                      {img.caption}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {article.summary && (
          <p className="text-xs sm:text-sm font-semibold text-stone-700 bg-stone-50 p-3.5 rounded-lg border-l-4 border-emerald-600">
            {article.summary}
          </p>
        )}

        <div className="text-stone-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-2 pt-1">
          {article.content}
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold"
          >
            Close Article
          </button>
        </div>
      </div>
    </div>
  );
};
