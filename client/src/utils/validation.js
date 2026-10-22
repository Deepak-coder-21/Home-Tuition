// Known temporary/disposable/fake email domains for instant client-side blocking
export const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamail.org',
  'sharklasers.com',
  'grr.la',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'fakeinbox.com',
  'throwawaymail.com',
  'burnermail.io',
  'getairmail.com',
  'dispostable.com',
  'maildrop.cc',
  'crazymailing.com',
  'mohmal.com',
  'nada.ltd',
  'getnada.com',
  'inboxkitten.com',
  'fakemailgenerator.com',
  'generator.email',
  'emailondeck.com',
  'tempail.com',
  'mytemp.email',
  'disposablemail.com',
  'dropmail.me',
  'disposable.com',
  'spambog.com',
  'trash-mail.com',
  'fakemail.net',
  'fakeemail.net',
  'dayrep.com',
  'teleworm.us',
  'armyspy.com',
  'test.com',
  'example.com',
  'sample.com',
  'fake.com',
  'fakemail.com',
  'testmail.com',
  'asdf.com'
]);

const EMAIL_FORMAT_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates basic email syntax.
 */
export const isValidEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  if (clean.length < 6 || clean.length > 254) return false;
  if (!EMAIL_FORMAT_REGEX.test(clean)) return false;

  const parts = clean.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;

  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) return false;

  return true;
};

/**
 * Checks if the email domain is in disposable/fake email blacklist.
 */
export const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  const domain = clean.split('@')[1];
  if (!domain) return false;

  if (DISPOSABLE_DOMAINS.has(domain)) return true;

  for (const blocked of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${blocked}`)) {
      return true;
    }
  }

  if (domain.includes('tempmail') || 
      domain.includes('disposable') || 
      domain.includes('throwaway') || 
      domain.includes('fakemail') ||
      domain.includes('trashmail') ||
      domain.includes('10minutemail')) {
    return true;
  }

  return false;
};

const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'admin123',
  'adminpassword',
  'welcome123',
  'iloveyou',
  'football',
  'letmein123',
  'abc12345',
  'pass1234'
]);

/**
 * Evaluates password strength and returns breakdown of requirements.
 */
export const checkPasswordStrength = (password, email = '') => {
  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      label: 'Too Short',
      color: 'stone',
      isValid: false,
      checks: {
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
        notCommon: true
      }
    };
  }

  const minLength = password.length >= 8 && password.length <= 128;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

  const cleanLower = password.toLowerCase();
  const containsCommon = ['password', '12345678', 'admin123', 'qwerty123'].some(w => cleanLower.includes(w));
  const notCommon = !COMMON_WEAK_PASSWORDS.has(cleanLower) && !containsCommon;

  let score = 0;
  if (password.length >= 8) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (!notCommon) score = Math.min(score, 1);

  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSpecial && notCommon;

  let label = 'Weak';
  let color = 'red';

  if (score === 4 && isValid) {
    label = 'Strong';
    color = 'emerald';
  } else if (score >= 3) {
    label = 'Moderate';
    color = 'amber';
  } else if (score >= 2) {
    label = 'Fair';
    color = 'orange';
  }

  return {
    score,
    label,
    color,
    isValid,
    checks: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      notCommon
    }
  };
};

const INTERNAL_ERROR_PATTERNS = [
  /mongo/i,
  /mongoose/i,
  /e11000/i,
  /duplicate key/i,
  /cast to objectid/i,
  /brevo/i,
  /api[_-]?key/i,
  /jwt/i,
  /token/i,
  /secret/i,
  /stack/i,
  /trace/i,
  /syntaxerror/i,
  /typeerror/i,
  /referenceerror/i,
  /unhandled/i,
  /internal server/i,
  /econnrefused/i,
  /enotfound/i,
  /socket/i,
  /schema/i,
  /failed to fetch/i,
  /networkerror/i,
  /load failed/i,
  /@gmail\.com/i,
  /deepak/i,
  /database/i,
  /atlas/i,
  /cluster/i,
  /driver/i,
  /status code 500/i,
  /status 500/i,
  /500 internal/i,
  /500/i
];

/**
 * Sanitizes any error message from APIs or exceptions to prevent
 * leaking internal system diagnostics or sensitive details to users.
 */
export const sanitizeErrorMessage = (error, fallback = 'Unable to complete request. Please try again.') => {
  if (!error) return fallback;
  const msg = typeof error === 'string' ? error : (error.message || String(error));
  
  if (!msg || msg.trim().length === 0) return fallback;

  // Check against known internal error patterns
  for (const pattern of INTERNAL_ERROR_PATTERNS) {
    if (pattern.test(msg)) {
      if (/network|fetch|econnrefused|socket|enotfound|load failed/i.test(msg)) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }
      if (/duplicate|e11000/i.test(msg)) {
        return 'An account with this email address already exists. Please log in.';
      }
      return fallback;
    }
  }

  // If message contains sensitive email or admin details, replace with fallback
  if (/@gmail\.com/i.test(msg) || /deepak/i.test(msg)) {
    return fallback;
  }

  return msg;
};


