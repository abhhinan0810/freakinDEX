import React from 'react';
import StarRating from './StarRating';
import { Calendar, Trash2 } from 'lucide-react';

export default function ReviewCard({ review, onDelete }) {
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
    <div className="bg-[#17171F] border border-[#2A2A35] rounded-2xl p-4 transition-all hover:border-[#3a3a4a] space-y-2.5">
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
    </div>
  );
}
