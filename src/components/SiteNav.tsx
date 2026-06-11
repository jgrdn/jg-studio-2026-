import { useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { site } from '../content/site'
import { useNavPanelMotion } from '../hooks/useNavPanelMotion'
import { useNavToggleMotion } from '../hooks/useNavToggleMotion'
import { LenisContext } from './SmoothScroll'
import { scrollToAnchorId } from '../motion/scrollToAnchor'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'
import { StudioMark } from './StudioMark'
import type { HomeScrollState } from './ScrollToTop'

const homeNav = [
  { label: 'About', section: 'about' },
  { label: 'Projects', section: 'work' },
  { label: 'Contact', section: 'contact' },
  { label: 'Archive', route: '/work/archive' as const },
] as const

const siteNav = [
  { label: 'Home', route: '/' as const },
  { label: 'Projects', route: '/' as const, section: 'work' },
  { label: 'About', route: '/' as const, section: 'about' },
  { label: 'Archive', route: '/work/archive' as const },
  { label: 'Contact', route: '/' as const, section: 'contact' },
] as const

function formatLondonTime(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

/** Persistent fixed nav — lives outside page transitions. */
export function SiteNav() {
  const { pathname } = useLocation()
  const lenis = useContext(LenisContext)
  const reduced = usePrefersReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [clock, setClock] = useState(() => formatLondonTime(new Date()))
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleMarkRef = useRef<HTMLSpanElement>(null)
  const navLabelId = useId()
  const onHome = pathname === '/'

  useNavPanelMotion(panelRef, menuOpen)
  useNavToggleMotion(toggleMarkRef, menuOpen)

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatLondonTime(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [])

  const close = useCallback(() => setMenuOpen(false), [])

  const scrollToSection = useCallback(
    (sectionId: string) => {
      close()
      scrollToAnchorId(sectionId, lenis, { immediate: reduced })
    },
    [close, lenis, reduced],
  )

  const hoverMenuMq = useCallback(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    [],
  )

  const openOnToggleHover = useCallback(() => {
    if (hoverMenuMq()) setMenuOpen(true)
  }, [hoverMenuMq])

  const closeOnShellLeave = useCallback(() => {
    if (hoverMenuMq()) setMenuOpen(false)
  }, [hoverMenuMq])

  const toggleClick = useCallback(() => setMenuOpen((o) => !o), [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen, close])

  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (reduced) return

    const threshold = 8
    let raf = 0

    const readY = () => {
      // Lenis can lag behind window.scrollY during transitions; take the max.
      const y = Math.max(window.scrollY || 0, window.pageYOffset || 0)
      setScrolled(y > threshold)
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        readY()
      })
    }

    readY()
    window.addEventListener('scroll', onScroll, { passive: true })
    lenis?.on('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      lenis?.off('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [lenis, reduced])

  const onMarkClick = useCallback(
    (e: React.MouseEvent) => {
      if (onHome) {
        e.preventDefault()
        scrollToSection('top')
        return
      }
      close()
    },
    [onHome, scrollToSection, close],
  )

  return (
    <div className="site-nav">
      <div
        id="site-nav-menu"
        className={[
          'nav-shell',
          menuOpen ? 'nav-shell--open' : '',
          scrolled || menuOpen ? 'nav-shell--surface' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="navigation"
        aria-label="Site"
        onMouseLeave={closeOnShellLeave}
      >
        <div className="nav-shell__bar">
          <StudioMark id={navLabelId} to="/" onClick={onMarkClick} />
          <button
            type="button"
            className="nav-shell__toggle"
            aria-expanded={menuOpen}
            aria-controls="nav-shell-panel"
            onMouseEnter={openOnToggleHover}
            onClick={toggleClick}
            data-cursor-variant="spot"
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span ref={toggleMarkRef} className="nav-mark" aria-hidden>
              <span className="nav-mark__dot" />
              <span className="nav-mark__dot" />
              <span className="nav-mark__dot" />
            </span>
          </button>
        </div>

        <div
          ref={panelRef}
          id="nav-shell-panel"
          className="nav-shell__panel"
          aria-hidden={!menuOpen}
          inert={!menuOpen ? true : undefined}
        >
          <nav className="menu-nav" aria-label="Primary">
            <ul>
              {onHome
                ? homeNav.map((item) => (
                    <li key={item.label}>
                      {'section' in item ? (
                        <button
                          type="button"
                          className="menu-nav__link"
                          onClick={() => scrollToSection(item.section)}
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link className="menu-nav__link" to={item.route} onClick={close}>
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))
                : siteNav.map((item) => (
                    <li key={item.label}>
                      <Link
                        className="menu-nav__link"
                        to={item.route}
                        state={
                          'section' in item
                            ? ({ scrollTo: item.section } satisfies HomeScrollState)
                            : null
                        }
                        onClick={close}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
            </ul>
          </nav>
          <div className="nav-shell__footer">
            <a className="menu-linkedin" href={site.linkedInUrl} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <time className="menu-clock" dateTime={new Date().toISOString()}>
              {clock} LON
            </time>
          </div>
        </div>
      </div>
    </div>
  )
}
