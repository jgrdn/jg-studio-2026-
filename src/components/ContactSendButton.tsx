import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useSendButtonMotion } from '../hooks/useSendButtonMotion'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

export type ContactSendButtonHandle = {
  play: () => void
}

type Props = {
  onSend: () => Promise<void>
}

export const ContactSendButton = forwardRef<ContactSendButtonHandle, Props>(function ContactSendButton(
  { onSend },
  ref,
) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const [label, setLabel] = useState('Send')
  const [sent, setSent] = useState(false)

  const markSent = () => {
    setLabel('Thank you')
    setSent(true)
    buttonRef.current?.classList.add('is-sent')
  }

  useSendButtonMotion(buttonRef, {
    onSend,
    onThankYou: markSent,
    reducedMotion: reduced,
  })

  useImperativeHandle(ref, () => ({
    play: () => {
      const btn = buttonRef.current
      if (!btn || sent) return
      if (reduced) {
        btn.disabled = true
        void onSend()
          .then(() => {
            markSent()
          })
          .catch(() => {
            btn.disabled = false
          })
        return
      }
      btn.click()
    },
  }))

  return (
    <button
      ref={buttonRef}
      type="button"
      className={sent ? 'contact-send contact-send--sent' : 'contact-send'}
      aria-label={sent ? 'Message sent' : 'Send message'}
      disabled={sent}
    >
      <span className="contact-send__label">{label}</span>
      <div className="contact-send__stage" aria-hidden>
        <svg className="contact-send__envelope" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="1.5" className="contact-send__envelope-body" />
          <path d="M3 6.5 12 13.5 21 6.5" className="contact-send__envelope-flap" />
        </svg>
        <svg className="contact-send__check" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12.5" className="contact-send__check-ring" />
          <path d="M10.5 16.2 14.2 19.8 22 11.2" className="contact-send__check-tick" />
        </svg>
      </div>
    </button>
  )
})
