import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { registerGsapPlugins } from '../motion/gsapPlugins'

const IDLE_VARS = {
  '--send-press': 1,
  '--label-o': 1,
  '--fly-o': 0,
  '--fly-y': '0.5rem',
  '--fly-scale': 0.88,
  '--target-o': 0,
  '--target-y': '0px',
  '--target-scale': 0.88,
  '--target-tick-offset': '14px',
} as const

const EASE = {
  out: 'power3.out',
  in: 'power2.in',
  inOut: 'power2.inOut',
  soft: 'sine.inOut',
} as const

type Options = {
  onSend: () => Promise<void>
  onThankYou: () => void
  onFailed?: () => void
  reducedMotion: boolean
}

function resetGraphics(button: HTMLButtonElement) {
  gsap.set(button, {
    '--send-press': 1,
    '--fly-o': 0,
    '--fly-y': '0.5rem',
    '--fly-scale': 0.88,
    '--target-o': 0,
    '--target-y': '0px',
    '--target-scale': 0.88,
    '--target-tick-offset': '14px',
  })
}

function finishSuccess(button: HTMLButtonElement, onThankYou: () => void) {
  onThankYou()
  button.classList.remove('is-sending')
  button.classList.add('is-sent')
  resetGraphics(button)
  gsap.to(button, { '--label-o': 1, '--send-press': 1, duration: 0.48, ease: EASE.out })
}

function finishFailure(
  button: HTMLButtonElement,
  setBusy: (busy: boolean) => void,
  onFailed?: () => void,
) {
  setBusy(false)
  button.disabled = false
  button.classList.remove('is-sending')
  resetGraphics(button)
  gsap.set(button, { '--label-o': 1, '--send-press': 1 })
  onFailed?.()
}

export function useSendButtonMotion(
  buttonRef: RefObject<HTMLButtonElement | null>,
  { onSend, onThankYou, onFailed, reducedMotion }: Options,
) {
  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    gsap.set(button, IDLE_VARS)

    if (reducedMotion) return

    registerGsapPlugins()

    let busy = false
    let tl: gsap.core.Timeline | null = null

    const onPointerDown = () => {
      if (busy || button.classList.contains('is-sent')) return
      gsap.to(button, { '--send-press': 0.97, duration: 0.18, ease: EASE.soft })
    }

    const onPointerUp = () => {
      if (busy || button.classList.contains('is-sent')) return
      gsap.to(button, { '--send-press': 1, duration: 0.28, ease: EASE.out })
    }

    const runSendAnimation = () => {
      if (busy || button.classList.contains('is-sent')) return
      busy = true
      button.classList.add('is-sending')
      button.disabled = true
      tl?.kill()

      tl = gsap
        .timeline({ defaults: { ease: EASE.out } })
        .to(button, { '--send-press': 0.97, duration: 0.2, ease: EASE.soft }, 0)
        .to(button, { '--label-o': 0, duration: 0.32, ease: EASE.in }, 0.02)
        .to(
          button,
          {
            '--fly-o': 1,
            '--fly-y': '-0.28rem',
            '--fly-scale': 1,
            duration: 0.55,
            ease: EASE.out,
          },
          0.1,
        )
        .to(
          button,
          {
            '--fly-o': 0,
            '--fly-y': '-0.12rem',
            '--fly-scale': 0.94,
            duration: 0.38,
            ease: EASE.inOut,
          },
          0.52,
        )
        .to(
          button,
          {
            '--target-o': 1,
            '--target-y': '0px',
            '--target-scale': 1,
            duration: 0.42,
            ease: EASE.out,
          },
          0.48,
        )
        .to(
          button,
          { '--target-tick-offset': '0px', duration: 0.5, ease: EASE.inOut },
          0.62,
        )
        .add(() => {
          void onSend()
            .then(() => {
              busy = false
              finishSuccess(button, onThankYou)
            })
            .catch(() => {
              finishFailure(button, (v) => {
                busy = v
              }, onFailed)
            })
        }, 1.12)
    }

    const onClick = (e: MouseEvent) => {
      e.preventDefault()
      runSendAnimation()
    }

    button.addEventListener('pointerdown', onPointerDown)
    button.addEventListener('pointerup', onPointerUp)
    button.addEventListener('pointerleave', onPointerUp)
    button.addEventListener('click', onClick)

    return () => {
      button.removeEventListener('pointerdown', onPointerDown)
      button.removeEventListener('pointerup', onPointerUp)
      button.removeEventListener('pointerleave', onPointerUp)
      button.removeEventListener('click', onClick)
      tl?.kill()
      gsap.killTweensOf(button)
    }
  }, [buttonRef, onSend, onThankYou, onFailed, reducedMotion])
}
