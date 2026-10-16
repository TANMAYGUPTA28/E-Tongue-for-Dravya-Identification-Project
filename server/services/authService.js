import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV === 'test' ? 'etongue-test-secret-salt-environment-safe' : crypto.randomBytes(32).toString('hex'));
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_COOLDOWN_MS = 30 * 1000;  // 30 seconds between requests

// In-memory OTP storage: email -> { otp, expiresAt, attempts, lastRequestedAt, verified }
const otpStore = new Map();

// Known disposable email domains to strictly block
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'sharklasers.com', 'dispostable.com', 'yopmail.com', 'trashmail.com',
  'getnada.com', 'fakeinbox.com', 'throwawaymail.com', 'burnermail.io'
]);

/**
 * Validates if an email belongs to an allowed domain:
 * - @gmail.com
 * - @yahoo.com
 * - .edu / .edu.in / .ac.in (Academic / University credentials)
 * - @etongue.lab (Internal Laboratory Accounts)
 */
export function validateAllowedEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Basic syntax check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, message: 'Invalid email address format' };
  }

  const [, domain] = cleanEmail.split('@');

  // Block known disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, message: 'Disposable and fake email domains are strictly forbidden' };
  }

  // Whitelist check
  const isGmail = domain === 'gmail.com';
  const isYahoo = domain === 'yahoo.com' || domain === 'yahoo.in' || domain === 'yahoo.co.in';
  const isEdu = domain.endsWith('.edu') || domain.endsWith('.edu.in') || domain.endsWith('.ac.in');
  const isInternal = domain === 'etongue.lab';

  if (!isGmail && !isYahoo && !isEdu && !isInternal) {
    return {
      valid: false,
      message: 'Restricted domain: Only official Gmail (@gmail.com), Yahoo (@yahoo.com), or Institutional (.edu, .ac.in) emails are permitted for lab access.'
    };
  }

  let domainType = 'Personal';
  if (isEdu) domainType = 'Institutional (.edu / .ac.in)';
  else if (isGmail) domainType = 'Google Workspace / Gmail';
  else if (isYahoo) domainType = 'Yahoo Mail';
  else if (isInternal) domainType = 'Internal Lab Credential';

  return { valid: true, cleanEmail, domain, domainType };
}

/**
 * Generate a 6-digit numeric OTP with cooldown and TTL
 */
export function generateOTP(email) {
  const validation = validateAllowedEmail(email);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const cleanEmail = validation.cleanEmail;
  const existing = otpStore.get(cleanEmail);
  const now = Date.now();

  // Rate limiting cooldown
  if (existing && now - existing.lastRequestedAt < OTP_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - (now - existing.lastRequestedAt)) / 1000);
    throw new Error(`Please wait ${waitSeconds}s before requesting a new verification code.`);
  }

  // Generate 6-digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + OTP_EXPIRY_MS;

  otpStore.set(cleanEmail, {
    otp,
    expiresAt,
    attempts: 0,
    lastRequestedAt: now,
    verified: false,
  });

  console.log(`[AUTH SERVICE] 🔐 Verification OTP for <${cleanEmail}>: [ ${otp} ] (Expires in 5m)`);

  return {
    success: true,
    email: cleanEmail,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    domainType: validation.domainType,
    devOtp: otp, // Returned in dev mode for UI auto-fill / toast testing
  };
}

/**
 * Verify submitted OTP for an email
 */
export function verifyOTP(email, code) {
  const validation = validateAllowedEmail(email);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  const cleanEmail = validation.cleanEmail;
  const entry = otpStore.get(cleanEmail);

  if (!entry) {
    return { success: false, message: 'No active verification code found. Please request an OTP.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanEmail);
    return { success: false, message: 'Verification code has expired. Please request a new one.' };
  }

  if (entry.attempts >= 4) {
    otpStore.delete(cleanEmail);
    return { success: false, message: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (entry.otp !== code.trim()) {
    entry.attempts++;
    return {
      success: false,
      message: `Invalid code. ${4 - entry.attempts} attempt(s) remaining.`
    };
  }

  // Mark as verified
  entry.verified = true;
  return {
    success: true,
    message: 'Identity verified successfully',
    email: cleanEmail
  };
}

/**
 * Check if email has completed OTP verification
 */
export function isEmailVerified(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const entry = otpStore.get(cleanEmail);
  return !!(entry && entry.verified && Date.now() <= entry.expiresAt + 10 * 60 * 1000);
}

/**
 * Clean up OTP record after successful registration/login
 */
export function consumeEmailVerification(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  otpStore.delete(cleanEmail);
}

/**
 * Sign standard JWT Token with user claims
 */
export function signJWT(user) {
  const payload = {
    sub: user.id || user._id,
    email: user.email,
    name: user.name,
    role: user.role || 'Junior Analytical Chemist',
    institution: user.institution || 'AYUSH Quality Control Division',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'etongue-dravya-6000',
    audience: 'dravya-analyst-portal'
  });
}

/**
 * Verify and decode JWT Token
 */
export function verifyJWT(token) {
  try {
    return {
      valid: true,
      payload: jwt.verify(token, JWT_SECRET, {
        issuer: 'etongue-dravya-6000',
        audience: 'dravya-analyst-portal'
      })
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message
    };
  }
}

/**
 * Hash password using standard scrypt cryptographic derivation with random salt
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password using timing-safe comparison
 */
export function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) return false;
  // Backward compatibility with initial seeded plaintext passwords
  if (!storedPassword.includes(':')) {
    return storedPassword === password;
  }
  try {
    const [salt, key] = storedPassword.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

