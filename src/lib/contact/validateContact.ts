import { CONTACT_SUBJECT_OPTIONS } from './subjects'
import type { ContactFormPayload } from './types'

const SUBJECT_VALUES = new Set<string>(CONTACT_SUBJECT_OPTIONS.map((o) => o.value))
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContactPayload(body: unknown):
  | { ok: true; data: ContactFormPayload }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' }
  }

  const raw = body as Record<string, unknown>
  const name = String(raw.name ?? '').trim()
  const email = String(raw.email ?? '').trim()
  const phone = String(raw.phone ?? '').trim()
  const subject = String(raw.subject ?? '').trim()
  const message = String(raw.message ?? '').trim()

  if (!name || name.length > 120) {
    return { ok: false, error: 'Please enter your name' }
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: 'Please enter a valid email address' }
  }
  if (phone.length > 40) {
    return { ok: false, error: 'Phone number is too long' }
  }
  if (!SUBJECT_VALUES.has(subject as ContactFormPayload['subject'])) {
    return { ok: false, error: 'Please choose a reason for contact' }
  }
  if (!message || message.length > 5000) {
    return { ok: false, error: 'Please enter a message' }
  }

  return {
    ok: true,
    data: {
      name,
      email,
      ...(phone ? { phone } : {}),
      subject,
      message,
    },
  }
}
