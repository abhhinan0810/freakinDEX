/**
 * Validate client form fields
 */
export function validateClientForm({ name, age, place }) {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Client name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  const parsedAge = parseInt(age, 10);
  if (!age || isNaN(parsedAge)) {
    errors.age = 'Age is required and must be a number';
  } else if (parsedAge < 18) {
    errors.age = 'Client must be 18 or older (strict requirement)';
  } else if (parsedAge > 120) {
    errors.age = 'Please enter a realistic age';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate review form fields
 */
export function validateReviewForm({ rating, reviewText }) {
  const errors = {};

  const numRating = Number(rating);
  if (!numRating || isNaN(numRating) || numRating < 1 || numRating > 5) {
    errors.rating = 'Rating must be between 1 and 5 stars';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
