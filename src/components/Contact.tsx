import { useRef } from 'react'
import type { FormEvent } from 'react'
import { site } from '../content/site'
import { CONTACT_SUBJECT_OPTIONS } from '../lib/contact/subjects'
import { submitContact } from '../lib/contact/submitContact'
import type { ContactFormPayload } from '../lib/contact/types'
import { ContactSendButton, type ContactSendButtonHandle } from './ContactSendButton'
import { Marquee } from './Marquee'

function readFormPayload(form: HTMLFormElement): ContactFormPayload {
  const data = new FormData(form)
  const phone = String(data.get('phone') ?? '').trim()
  return {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    ...(phone ? { phone } : {}),
    subject: String(data.get('subject') ?? ''),
    message: String(data.get('message') ?? ''),
  }
}

export function Contact() {
  const formRef = useRef<HTMLFormElement>(null)
  const sendRef = useRef<ContactSendButtonHandle>(null)

  async function sendViaResend() {
    const form = formRef.current
    if (!form) throw new Error('Form not ready')
    await submitContact(readFormPayload(form))
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formRef.current?.reportValidity()) return
    sendRef.current?.play()
  }

  return (
    <footer className="contact-section" id="contact" aria-labelledby="contact-heading">
      <div className="grid-12 grid-12--rg contact-section__grid">
        <div className="span-4 contact-left">
          <h2 id="contact-heading" className="sr-only">
            Contact
          </h2>
          <div className="contact-left__top">
            <a
              className="contact-email"
              href={`mailto:${site.email}`}
              data-cursor-variant="pill"
              data-cursor-label="Let’s talk"
            >
              {site.email.toUpperCase()}
            </a>
          </div>
          <p className="fineprint">
            © 2026 | Built by JG Studio
          </p>
        </div>
        <div className="span-8 contact-right">
          <form ref={formRef} className="contact-form" onSubmit={onSubmit} autoComplete="off">
            <div className="contact-form__shell">
              <div className="contact-form__fields">
                <div className="contact-form__row contact-form__row--inputs">
                  <label className="contact-field contact-field--name">
                    <span className="sr-only">Name</span>
                    <input
                      name="name"
                      type="text"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-1p-ignore
                      placeholder="Name"
                      required
                    />
                  </label>
                  <label className="contact-field contact-field--email">
                    <span className="sr-only">Email address</span>
                    <input
                      name="email"
                      type="email"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-1p-ignore
                      placeholder="Email address"
                      required
                    />
                  </label>
                  <label className="contact-field contact-field--phone">
                    <span className="sr-only">Phone number</span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="off"
                      autoCorrect="off"
                      data-1p-ignore
                      placeholder="Phone number"
                    />
                  </label>
                  <label className="contact-field contact-field--subject">
                    <span className="sr-only">Reason for contact</span>
                    <select name="subject" defaultValue="" autoComplete="off" required>
                      <option value="" disabled>
                        Reason for contact
                      </option>
                      {CONTACT_SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="contact-field contact-field--message">
                  <span className="sr-only">Message</span>
                  <textarea
                    name="message"
                    rows={5}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="sentences"
                    spellCheck={false}
                    data-1p-ignore
                    placeholder="Message"
                    required
                  />
                </label>
              </div>
              <ContactSendButton ref={sendRef} onSend={sendViaResend} />
            </div>
          </form>
        </div>
      </div>
      <div className="grid-12 marquee-wrap">
        <Marquee />
      </div>
    </footer>
  )
}
