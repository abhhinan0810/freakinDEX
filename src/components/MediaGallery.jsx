import React, { useState } from 'react';
import { Play, Maximize2, X, Download, Image as ImageIcon, Film } from 'lucide-react';

export default function MediaGallery({ mediaList = [], loading = false }) {
  const [selectedMedia, setSelectedMedia] = useState(null);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="aspect-square bg-[#17171F] rounded-2xl border border-[#2A2A35] shimmer-effect" />
        ))}
      </div>
    );
  }

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="bg-[#17171F] border border-dashed border-[#2A2A35] rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[#20202A] flex items-center justify-center mx-auto text-[#92929E] mb-3">
          <ImageIcon className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-white/90">No Media Uploaded Yet</p>
        <p className="text-xs text-[#92929E] mt-1 max-w-xs mx-auto">
          Photos and videos attached to sessions will be stored privately here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {mediaList.map((item, index) => {
          const isVideo = item.fileType === 'video' || item.fileName?.match(/\.(mp4|webm|mov)$/i);

          return (
            <div
              key={item.mediaId || index}
              onClick={() => setSelectedMedia(item)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-[#17171F] border border-[#2A2A35] hover:border-purple-500/50 cursor-pointer shadow-md transition-all active:scale-95"
            >
              {isVideo ? (
                <div className="w-full h-full relative flex items-center justify-center bg-black/60">
                  <video
                    src={item.downloadUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1">
                    <Film className="w-3 h-3 text-pink-400" />
                    <span>VIDEO</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <img
                    src={item.downloadUrl}
                    alt={item.fileName || 'Media asset'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Media Preview Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar Actions */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-medium text-gray-300 truncate max-w-xs">
                {selectedMedia.fileName || 'Private Media Item'}
              </span>
              <div className="flex items-center gap-2">
                {selectedMedia.downloadUrl && (
                  <a
                    href={selectedMedia.downloadUrl}
                    download={selectedMedia.fileName || 'media'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-[#17171F] border border-[#2A2A35] hover:border-purple-400 text-gray-200 hover:text-white transition-colors"
                    title="Download Media"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 rounded-full bg-[#17171F] border border-[#2A2A35] hover:border-rose-400 text-gray-200 hover:text-rose-400 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#2A2A35]">
              {selectedMedia.fileType === 'video' || selectedMedia.fileName?.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={selectedMedia.downloadUrl}
                  controls
                  autoPlay
                  className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain"
                />
              ) : (
                <img
                  src={selectedMedia.downloadUrl}
                  alt={selectedMedia.fileName || 'Preview'}
                  className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
