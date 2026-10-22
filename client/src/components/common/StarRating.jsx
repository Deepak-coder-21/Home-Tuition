import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, reviewCount = null, size = "sm", interactive = false, onRate = null }) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <button
            type="button"
            key={star}
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(star)}
            className={`transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= Math.round(rating)
                  ? 'text-amber-500 fill-amber-400'
                  : 'text-stone-300 fill-transparent'
              }`}
            />
          </button>
        ))}
      </div>
      <span className={`font-bold text-stone-900 ${size === 'lg' ? 'text-base' : 'text-xs'}`}>
        {Number(rating).toFixed(1)}
      </span>
      {reviewCount !== null && (
        <span className="text-stone-500 text-xs">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
