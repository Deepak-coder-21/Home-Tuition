import dns from 'dns';

// Comprehensive list of known temporary, disposable, fake, or burner email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
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
  'spambog.de',
  'spambog.ru',
  'tempinbox.com',
  'throwawayemailaddress.com',
  'trash-mail.com',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfemail.de',
  'fakemail.net',
  'fakeemail.net',
  'tempmailaddress.com',
  'dayrep.com',
  'teleworm.us',
  'armyspy.com',
  'cuvox.de',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'trbvm.com',
  'zoemail.org',
  'inboxbear.com',
  'burneremail.com',
  'test.com',
  'example.com',
  'sample.com',
  'fake.com',
  'fakemail.com',
  'testmail.com',
  'asdf.com',
  'mailcatch.com',
  'mailnesia.com',
  'tmail.ws',
  'mintemail.com',
  'crazymailing.com',
  'binkmail.com',
  'bobmail.info',
  'chammy.info',
  'devnullmail.com',
  'letthemeatspam.com',
  'mailin8r.com',
  'mailinator2.com',
  'notmailinator.com',
  'reallymymail.com',
  'reconmail.com',
  'safetymail.info',
  'sendspamhere.com',
  'sogetthis.com',
  'spambooger.com',
  'spamherelots.com',
  'spamhole.com',
  'suremail.info',
  'thisisnotmyrealemail.com',
  'tradermail.info',
  'veryrealemail.com',
  'zippymail.info'
]);

// Standard RFC-compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Checks if a domain is an obvious disposable/burner email domain.
 * @param {string} domain 
 * @returns {boolean}
 */
export const isDisposableDomain = (domain) => {
  if (!domain) return true;
  const cleanDomain = domain.toLowerCase().trim();
  if (DISPOSABLE_EMAIL_DOMAINS.has(cleanDomain)) return true;

  // Check subdomains (e.g., abc.mailinator.com)
  for (const blocked of DISPOSABLE_EMAIL_DOMAINS) {
    if (cleanDomain.endsWith(`.${blocked}`)) {
      return true;
    }
  }

  // Common disposable patterns
  if (cleanDomain.includes('tempmail') || 
      cleanDomain.includes('disposable') || 
      cleanDomain.includes('throwaway') || 
      cleanDomain.includes('fakemail') ||
      cleanDomain.includes('trashmail') ||
      cleanDomain.includes('10minutemail')) {
    return true;
  }

  return false;
};

/**
 * Checks if the email domain has active DNS MX records.
 * Uses a 3-second timeout to avoid stalling on slow networks.
 * @param {string} domain 
 * @returns {Promise<boolean>}
 */
export const checkDomainHasMxRecords = async (domain) => {
  if (!domain) return false;
  const cleanDomain = domain.toLowerCase().trim();

  try {
    const mxRecords = await Promise.race([
      dns.promises.resolveMx(cleanDomain),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DNS_LOOKUP_TIMEOUT')), 3500)
      )
    ]);

    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch (error) {
    // If lookup timed out or network has temporary DNS issues, fallback to A record check
    if (error.message === 'DNS_LOOKUP_TIMEOUT') {
      try {
        const aRecords = await dns.promises.resolve4(cleanDomain);
        return Array.isArray(aRecords) && aRecords.length > 0;
      } catch {
        return true; // Don't block user if whole DNS timed out due to network glitch
      }
    }

    // Specific DNS failure codes indicating the domain does not exist or has no mail exchange
    if (['ENOTFOUND', 'ENODATA', 'SERVFAIL', 'NXDOMAIN'].includes(error.code)) {
      return false;
    }

    // Default to true on unknown network exceptions to avoid false positives
    return true;
  }
};

/**
 * Validates whether an email is real, syntactically sound, not disposable,
 * and belongs to an active domain.
 * 
 * @param {string} email 
 * @returns {Promise<{ isValid: boolean, message?: string, domain?: string }>}
 */
export const validateRealEmail = async (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email address is required.' };
  }

  const normalized = email.toLowerCase().trim();

  if (normalized.length < 6 || normalized.length > 254) {
    return { isValid: false, message: 'Email length must be between 6 and 254 characters.' };
  }

  if (!EMAIL_REGEX.test(normalized)) {
    return { isValid: false, message: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Invalid email address structure.' };
  }

  const [localPart, domain] = parts;

  // Check local part restrictions
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { isValid: false, message: 'Email username cannot start, end, or contain consecutive dots.' };
  }

  // TLD check (must have at least 2 characters)
  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
    return { isValid: false, message: 'Email domain must have a valid extension (e.g. .com, .edu, .org).' };
  }

  // Check against disposable/burner domain blacklist
  if (isDisposableDomain(domain)) {
    return { 
      isValid: false, 
      message: 'Disposable, burner, or temporary email addresses are not permitted. Please use a genuine personal or work email address.' 
    };
  }

  // Check if domain actually exists with active mail records
  const hasMx = await checkDomainHasMxRecords(domain);
  if (!hasMx) {
    return { 
      isValid: false, 
      message: `The email domain '@${domain}' does not appear to exist or cannot receive emails. Please use a real email address.` 
    };
  }

  return { isValid: true, domain };
};
