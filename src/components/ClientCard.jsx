import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import { getAvatarById } from '../utils/avatars';
import { Flame, MapPin, ChevronRight } from 'lucide-react';

export default function ClientCard({ client }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/client/${client.clientId}`);
  };

  const handleSmashedAgainClick = (e) => {
    e.stopPropagation(); // prevent triggering handleCardClick
    navigate(`/client/${client.clientId}/review`);
  };

  const avatarInfo = getAvatarById(client.avatarId);
  const ratingValue = client.averageRating || 0;
  const totalReviews = client.totalReviews || 0;

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-[#17171F] hover:bg-[#20202A]/80 border border-[#2A2A35] hover:border-purple-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-purple-500/10 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3.5">
        {/* Profile Avatar */}
        <div className="relative shrink-0">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${avatarInfo.gradient} flex items-center justify-center text-2xl shadow-inner border border-white/10 group-hover:scale-105 transition-all`}
          >
            <span>{avatarInfo.emoji}</span>
          </div>
        </div>

        {/* Client Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
              {client.name}
            </h3>
            {client.age && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#20202A] text-purple-300 border border-[#2A2A35]">
                {client.age} y/o
              </span>
            )}
          </div>

          {client.place && (
            <div className="flex items-center gap-1 text-xs text-[#92929E] mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
              <span className="truncate">{client.place}</span>
            </div>
          )}

          {/* Star & Numerical Rating */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={ratingValue} size="xs" />
            <span className="text-xs font-bold text-white">
              {ratingValue ? ratingValue.toFixed(1) : '0.0'}
              <span className="text-[#92929E] font-normal">/5</span>
            </span>
            <span className="text-[11px] text-[#92929E]">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-[#92929E] group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
      </div>

      {/* Smashed Again Action Button */}
      <div className="mt-3.5 pt-3 border-t border-[#2A2A35]/60 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#92929E]">
          {totalReviews === 0
            ? 'No sessions logged yet'
            : `Last active ${client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : 'recently'}`}
        </span>

        <button
          onClick={handleSmashedAgainClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md hover:shadow-pink-500/25 active:scale-95 transition-all"
        >
          <Flame className="w-3.5 h-3.5 fill-current text-amber-300" />
          <span>Smashed Again</span>
        </button>
      </div>
    </div>
  );
}
