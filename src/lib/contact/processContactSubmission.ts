import { sendContactEmail } from './sendContactEmail'
import { validateContactPayload } from './validateContact'

export type ContactApiResult = {
  status: number
  body: { ok?: true; error?: string }
}

export async function processContactSubmission(body: unknown): Promise<ContactApiResult> {
  const validated = validateContactPayload(body)
  if (!validated.ok) {
    return { status: 400, body: { error: validated.error } }
  }

  try {
    await sendContactEmail(validated.data)
    return { status: 200, body: { ok: true } }
  } catch (error) {
    console.error('[contact]', error)
    return { status: 500, body: { error: 'Unable to send your message right now' } }
  }
}
