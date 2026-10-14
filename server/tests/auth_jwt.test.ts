import { describe, it, expect } from 'vitest';
import {
  validateAllowedEmail,
  generateOTP,
  verifyOTP,
  signJWT,
  verifyJWT,
} from '../services/authService.js';

describe('Auth Service & Domain Restrictions', () => {
  it('strictly rejects disposable and fake email addresses', () => {
    const res1 = validateAllowedEmail('hacker@mailinator.com');
    expect(res1.valid).toBe(false);
    expect(res1.message).toContain('Disposable and fake email domains');

    const res2 = validateAllowedEmail('test@tempmail.com');
    expect(res2.valid).toBe(false);
  });

  it('rejects unauthorized consumer email domains like hotmail or outlook', () => {
    const res = validateAllowedEmail('user@hotmail.com');
    expect(res.valid).toBe(false);
    expect(res.message).toContain('Restricted domain');
  });

  it('permits @gmail.com and @yahoo.com addresses', () => {
    const gmail = validateAllowedEmail('tanmay.researcher@gmail.com');
    expect(gmail.valid).toBe(true);
    expect(gmail.cleanEmail).toBe('tanmay.researcher@gmail.com');

    const yahoo = validateAllowedEmail('analyst@yahoo.com');
    expect(yahoo.valid).toBe(true);
  });

  it('permits institutional academic domains ending in .edu and .ac.in', () => {
    const edu = validateAllowedEmail('researcher@mit.edu');
    expect(edu.valid).toBe(true);
    expect(edu.domainType).toContain('Institutional');

    const acIn = validateAllowedEmail('tanmay@iitd.ac.in');
    expect(acIn.valid).toBe(true);
    expect(acIn.domainType).toContain('Institutional');
  });

  it('generates a 6-digit numeric OTP and verifies it correctly', () => {
    const email = 'doctor@stanford.edu';
    const otpResult = generateOTP(email);

    expect(otpResult.success).toBe(true);
    expect(otpResult.devOtp).toMatch(/^\d{6}$/);

    // Wrong OTP check
    const wrongCheck = verifyOTP(email, '999999');
    expect(wrongCheck.success).toBe(false);

    // Correct OTP check
    const correctCheck = verifyOTP(email, otpResult.devOtp!);
    expect(correctCheck.success).toBe(true);
    expect(correctCheck.message).toContain('verified');
  });

  it('signs and cryptographically verifies real HMAC-SHA256 JWT tokens', () => {
    const testUser = {
      id: 'usr_test_99',
      email: 'tanmay@iitd.ac.in',
      name: 'Tanmay Gupta',
      role: 'Lead ML Engineer',
      institution: 'IIT Delhi Biomimetic Lab',
    };

    const token = signJWT(testUser);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // Header.Payload.Signature

    const verified = verifyJWT(token);
    expect(verified.valid).toBe(true);
    expect(verified.payload.email).toBe('tanmay@iitd.ac.in');
    expect(verified.payload.role).toBe('Lead ML Engineer');
    expect(verified.payload.sub).toBe('usr_test_99');
  });
});
