import React from 'react';
import StarRating from './StarRating';
import { Calendar, Play, Trash2 } from 'lucide-react';

export default function ReviewCard({ review, onDelete, onMediaClick }) {
  const formattedDate = review.reviewDate
    ? new Date(review.reviewDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown Date';

  return (
    <div className="bg-[#17171F] border border-[#2A2A35] rounded-2xl p-4 transition-all hover:border-[#3a3a4a] space-y-3">
      {/* Header: Rating & Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs font-bold text-white">
            {review.rating ? Number(review.rating).toFixed(1) : '5.0'}/5
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#92929E]">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{formattedDate}</span>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(review.reviewId)}
              className="text-[#92929E] hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
              title="Delete review"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Review Text */}
      {review.reviewText && (
        <p className="text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
          {review.reviewText}
        </p>
      )}

      {/* Associated Media Thumbnails */}
      {review.media && review.media.length > 0 && (
        <div className="pt-1 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {review.media.map((med, idx) => {
            const isVideo = med.fileType === 'video' || med.fileName?.endsWith('.mp4');

            return (
              <div
                key={med.mediaId || idx}
                onClick={() => onMediaClick && onMediaClick(med)}
                className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#20202A] border border-[#2A2A35] shrink-0 cursor-pointer group hover:border-purple-500/50"
              >
                {isVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/40">
                    <video
                      src={med.downloadUrl}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                      <div className="w-6 h-6 rounded-full bg-purple-600/90 flex items-center justify-center text-white">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={med.downloadUrl}
                    alt={med.fileName || 'Review attachment'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
