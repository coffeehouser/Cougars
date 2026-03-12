// Form validation utilities

export const validateCharacterForm = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = 'Character name is required';
  } else if (formData.name.length > 50) {
    errors.name = 'Character name cannot exceed 50 characters';
  }

  // Race validation
  if (!formData.race || formData.race.trim().length === 0) {
    errors.race = 'Race is required';
  }

  // Class validation
  if (!formData.class || formData.class.trim().length === 0) {
    errors.class = 'Class is required';
  }

  // Level validation
  const level = parseInt(formData.level);
  if (isNaN(level) || level < 1 || level > 20) {
    errors.level = 'Level must be between 1 and 20';
  }

  // Stats validation
  const statsToValidate = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  statsToValidate.forEach(stat => {
    const value = parseInt(formData.stats[stat]);
    if (isNaN(value) || value < 1 || value > 30) {
      errors[stat] = `${stat.charAt(0).toUpperCase() + stat.slice(1)} must be between 1 and 30`;
    }
  });

  // Bio validation (optional but limited)
  if (formData.bio && formData.bio.length > 2000) {
    errors.bio = 'Bio cannot exceed 2000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateImageFile = (file) => {
  const errors = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    return { isValid: false, errors: ['No file selected'] };
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push('Only JPEG, PNG, GIF, and WebP images are allowed');
  }

  if (file.size > maxSize) {
    errors.push('Image must be less than 10MB');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove any potential XSS  attempts
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
