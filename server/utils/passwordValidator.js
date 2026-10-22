// List of commonly breached or easily guessable weak passwords
const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  'password1',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'admin123',
  'adminpassword',
  'welcome123',
  'iloveyou',
  'sunshine',
  'princess',
  'football',
  'monkey123',
  'master123',
  'letmein123',
  'abc12345',
  'pass1234',
  'default123'
]);

/**
 * Validates if a password meets strong password criteria:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character (!@#$%^&*...)
 * - Not a common/easily guessable password
 * 
 * @param {string} password 
 * @param {string} [associatedEmail] - Optional email to ensure password doesn't contain email prefix
 * @returns {{ isValid: boolean, message?: string, requirements: object }}
 */
export const validateStrongPassword = (password, associatedEmail = '') => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required.',
      requirements: {
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
        notCommon: false
      }
    };
  }

  const minLength = password.length >= 8;
  const maxLength = password.length <= 128;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

  const cleanLowerPass = password.toLowerCase();
  const containsCommonPhrase = ['password', '12345678', 'admin123', 'qwerty123'].some(phrase => cleanLowerPass.includes(phrase));
  const notCommon = !COMMON_WEAK_PASSWORDS.has(cleanLowerPass) && !containsCommonPhrase;

  const requirements = {
    minLength: minLength && maxLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    notCommon
  };

  if (!minLength) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long.',
      requirements
    };
  }

  if (!maxLength) {
    return {
      isValid: false,
      message: 'Password cannot exceed 128 characters.',
      requirements
    };
  }

  if (!hasUpper) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter (A-Z).',
      requirements
    };
  }

  if (!hasLower) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter (a-z).',
      requirements
    };
  }

  if (!hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one number (0-9).',
      requirements
    };
  }

  if (!hasSpecial) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character (!@#$%^&* etc.).',
      requirements
    };
  }

  if (!notCommon) {
    return {
      isValid: false,
      message: 'This password is too common or easily guessable. Please choose a more secure password.',
      requirements
    };
  }

  // Prevent using the user's email prefix as part of the password
  if (associatedEmail && typeof associatedEmail === 'string') {
    const emailPrefix = associatedEmail.split('@')[0]?.toLowerCase();
    if (emailPrefix && emailPrefix.length >= 3 && cleanLowerPass === emailPrefix) {
      return {
        isValid: false,
        message: 'Password cannot be the same as your email address.',
        requirements
      };
    }
  }

  return {
    isValid: true,
    message: 'Password is strong.',
    requirements
  };
};
