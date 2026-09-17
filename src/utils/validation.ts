/**
 * Input validation utilities
 */

export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  // RFC 5322 standard simple regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone || !phone.trim()) return false;
  // Accommodate Ugandan/African and international formats: +256..., 07..., 075..., etc.
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return cleaned.length >= 8 && cleaned.length <= 15 && /^[+]?[0-9]+$/.test(cleaned);
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCustomerDetails(
  name: string,
  phone: string,
  email: string,
  location: string
): ValidationResult {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Please enter your full name.' };
  }
  if (!phone || !phone.trim()) {
    return { valid: false, error: 'Please provide your phone number so we can reach you.' };
  }
  if (!isValidPhone(phone)) {
    return {
      valid: false,
      error: 'Please provide a valid phone number (e.g. 0772123456 or +256701234567).',
    };
  }
  if (!email || !email.trim()) {
    return { valid: false, error: 'Please provide your email address for order notifications.' };
  }
  if (!isValidEmail(email)) {
    return { valid: false, error: 'Please provide a valid email address (e.g. student@college.ac.ug).' };
  }
  if (!location || !location.trim()) {
    return {
      valid: false,
      error: 'Please specify your delivery location (e.g. Nkrumah Hall, CEDAT Room 204).',
    };
  }

  return { valid: true };
}
