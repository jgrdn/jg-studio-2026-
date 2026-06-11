/// <reference types="node" />

import { Resend } from 'resend'
import { contactSubjectLabel } from './subjects'
import type { ContactFormPayload } from './types'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export async function sendContactEmail(payload: ContactFormPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO ?? 'joey@jg.studio'
  const from = process.env.RESEND_FROM

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  if (!from) {
    throw new Error('RESEND_FROM is not configured')
  }

  const resend = new Resend(apiKey)
  const subjectLabel = contactSubjectLabel(payload.subject)
  const phoneLine = payload.phone ? `\nPhone: ${payload.phone}` : ''

  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}${phoneLine}`,
    `Reason: ${subjectLabel}`,
    '',
    payload.message,
  ].join('\n')

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    ${payload.phone ? `<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>` : ''}
    <p><strong>Reason:</strong> ${escapeHtml(subjectLabel)}</p>
    <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
  `.trim()

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email,
    subject: `[JG Studio] ${subjectLabel}`,
    text,
    html,
  })

  if (error) {
    throw error
  }
}
