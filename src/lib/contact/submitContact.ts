import type { ContactFormPayload } from './types'

export async function submitContact(payload: ContactFormPayload): Promise<void> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await res.json().catch(() => ({}))) as { error?: string }

  if (!res.ok) {
    throw new Error(data.error ?? 'Unable to send your message')
  }
}
