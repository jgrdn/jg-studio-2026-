import { useContext, useEffect, useMemo, useState } from 'react'
import { useMotionRefresh } from '../motion/MotionRefreshContext'
import { LenisContext } from './SmoothScroll'

type Logo = {
  name: string
  src: string
  w: number
  h: number
  maxWidthPx: number
  heightPx?: number
}

const DEFAULT_LOGO_HEIGHT_PX = 32

function logoFootprint(logo: Logo): { width: string; height: string } {
  const heightPx = logo.heightPx ?? DEFAULT_LOGO_HEIGHT_PX
  const aspect = logo.w / logo.h
  const naturalWidth = Math.round(heightPx * aspect)
  const width = Math.min(logo.maxWidthPx, naturalWidth)
  return { width: `${Math.max(width, 36)}px`, height: `${heightPx}px` }
}

/**
 * Fade out as the bottom of #brands reaches the viewport bottom
 * (fully hidden once you've scrolled to the end of "Brands I've worked on").
 */
function scrollFadeOpacity(brandsBottom: number, vh: number) {
  const fadeLength = Math.max(200, vh * 0.2)
  const fadeEnd = vh
  const fadeStart = fadeEnd + fadeLength

  if (brandsBottom >= fadeStart) return 1
  if (brandsBottom <= fadeEnd) return 0
  return (brandsBottom - fadeEnd) / (fadeStart - fadeEnd)
}

export function AgencyMarquee() {
  const { generation } = useMotionRefresh()
  const lenis = useContext(LenisContext)
  const [scrollOpacity, setScrollOpacity] = useState(1)

  const logos = useMemo<Logo[]>(
    () => [
      { name: 'Make Us Care', src: '/agency-logos/MakeUsCare.png', w: 105, h: 68, maxWidthPx: 56, heightPx: 34 },
      { name: 'MBA', src: '/agency-logos/MBA.png', w: 183, h: 58, maxWidthPx: 70 },
      { name: 'Storm Brands', src: '/agency-logos/StormBrands.png', w: 177, h: 44, maxWidthPx: 102 },
      { name: 'Extreme', src: '/agency-logos/Extreme.png', w: 94, h: 66, maxWidthPx: 40 },
      { name: 'The Gate', src: '/agency-logos/TheGate.png', w: 142, h: 64, maxWidthPx: 72 },
      { name: 'Hogarth', src: '/agency-logos/Hogarth.png', w: 276, h: 40, maxWidthPx: 108 },
      { name: 'MullenLowe', src: '/agency-logos/MullenLowe.png', w: 360, h: 38, maxWidthPx: 118 },
      { name: 'VML', src: '/agency-logos/VML.png', w: 168, h: 49, maxWidthPx: 86 },
      { name: 'Havas', src: '/agency-logos/Havas.png', w: 196, h: 41, maxWidthPx: 98 },
      { name: 'True', src: '/agency-logos/True.png', w: 139, h: 55, maxWidthPx: 72 },
      { name: "St Luke's", src: '/agency-logos/StLukes.png', w: 278, h: 36, maxWidthPx: 104 },
      { name: 'Ogilvy', src: '/agency-logos/Ogilvy.png', w: 154, h: 60, maxWidthPx: 68 },
    ],
    [],
  )

  const logoRow = useMemo(() => {
    return logos.map((logo) => {
      const box = logoFootprint(logo)
      return (
        <div
          key={logo.name}
          className="agency-marquee__item"
          style={{ width: box.width, height: box.height }}
        >
          <img
            className="agency-marquee__logo"
            src={logo.src}
            alt={logo.name}
            width={logo.w}
            height={logo.h}
            loading="eager"
          />
        </div>
      )
    })
  }, [logos])

  useEffect(() => {
    let raf = 0

    const compute = () => {
      const brands = document.getElementById('brands')
      const vh = window.innerHeight
      if (!brands) {
        setScrollOpacity(1)
        return
      }

      const bottom = brands.getBoundingClientRect().bottom
      setScrollOpacity(scrollFadeOpacity(bottom, vh))
    }

    const onScrollOrResize = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        compute()
      })
    }

    compute()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    lenis?.on('scroll', onScrollOrResize)

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      lenis?.off('scroll', onScrollOrResize)
      cancelAnimationFrame(raf)
    }
  }, [lenis, generation])

  const hidden = scrollOpacity < 0.005

  return (
    <div
      className="agency-marquee"
      aria-hidden="true"
      style={{
        opacity: scrollOpacity,
        visibility: hidden ? 'hidden' : 'visible',
      }}
    >
      <div className="agency-marquee__inner">
        <div className="agency-marquee__track">
          <div className="agency-marquee__row">{logoRow}</div>
          <div className="agency-marquee__row" aria-hidden="true">
            {logoRow}
          </div>
        </div>
      </div>
    </div>
  )
}
