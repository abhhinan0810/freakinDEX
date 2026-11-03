import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  interactive = false,
  onChange = () => {},
  size = 'md',
  showNumber = false,
  totalReviews = null,
  className = '',
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const activeRating = hoverRating || rating || 0;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starVal) => {
          const isFilled = starVal <= activeRating;
          const isHalf = !isFilled && starVal - 0.5 <= activeRating;

          return (
            <button
              type="button"
              key={starVal}
              disabled={!interactive}
              onClick={() => interactive && onChange(starVal)}
              onMouseEnter={() => interactive && setHoverRating(starVal)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${
                interactive
                  ? 'cursor-pointer transform hover:scale-125 transition-transform p-0.5 active:scale-95'
                  : 'cursor-default'
              } focus:outline-none`}
              aria-label={`${starVal} Star`}
            >
              <Star
                className={`${currentSize} transition-colors duration-150 ${
                  isFilled
                    ? 'fill-[#FFC857] text-[#FFC857] filter drop-shadow-[0_0_6px_rgba(255,200,87,0.4)]'
                    : isHalf
                    ? 'fill-[#FFC857]/50 text-[#FFC857]'
                    : 'fill-transparent text-[#2A2A35]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs font-semibold text-white/90 ml-1">
          {rating ? Number(rating).toFixed(1) : '0.0'}
          <span className="text-[#92929E] font-normal">/5</span>
          {totalReviews !== null && (
            <span className="text-[#92929E] font-normal ml-1">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
}

