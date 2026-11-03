/**
 * Calculate average rating and total count safely
 * @param {Array<number|{rating: number}>} reviews 
 * @returns {{ averageRating: number, totalReviews: number, formatted: string }}
 */
export function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      formatted: '0.0',
    };
  }

  const validRatings = reviews
    .map(r => (typeof r === 'number' ? r : Number(r.rating)))
    .filter(r => !isNaN(r) && r >= 1 && r <= 5);

  if (validRatings.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      formatted: '0.0',
    };
  }

  const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / validRatings.length;
  // Round to 1 decimal place (e.g. 4.3) or 2 if precise
  const rounded = Math.round(avg * 10) / 10;

  return {
    averageRating: rounded,
    totalReviews: validRatings.length,
    formatted: rounded.toFixed(1),
  };
}

/**
 * Format a rating value into "X.X/5" or "New"
 */
export function formatRating(rating, totalReviews = 1) {
  if (!totalReviews || totalReviews === 0 || !rating) {
    return 'New';
  }
  const num = Number(rating);
  return `${num.toFixed(1)}/5`;
}
