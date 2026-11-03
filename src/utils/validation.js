export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

export const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

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

/**
 * Validate an uploaded media file
 */
export function validateMediaFile(file) {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: `Unsupported file type: ${file.type || file.name}. Allowed: JPG, PNG, WEBP, MP4, WEBM, MOV.`
    };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Image ${file.name} exceeds max size of 15MB (${(file.size / (1024 * 1024)).toFixed(1)}MB)`
    };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return {
      isValid: false,
      error: `Video ${file.name} exceeds max size of 100MB (${(file.size / (1024 * 1024)).toFixed(1)}MB)`
    };
  }

  return {
    isValid: true,
    fileType: isImage ? 'image' : 'video'
  };
}
