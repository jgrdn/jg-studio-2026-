import { AgencyMarquee } from './components/AgencyMarquee'
import { BlurDocumentTitle } from './components/BlurDocumentTitle'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { GsapEnhancements } from './components/GsapEnhancements'
import { ViewportReveal } from './components/ViewportReveal'
import { Cursor } from './components/Cursor'
import { ProjectAmbience } from './components/ProjectAmbience'
import { AppRoutes } from './AppRoutes'
import { SiteNav } from './components/SiteNav'
import { MotionRefreshProvider, useMotionRefresh } from './motion/MotionRefreshContext'
import { lazy, Suspense } from 'react'
import { isGifConvertorContext } from './lib/gifConvertor/host'

const GifConvertorApp = lazy(() =>
  import('./gif-convertor/GifConvertorApp').then((m) => ({ default: m.GifConvertorApp })),
)

function AppShell() {
  const { displayPath } = useMotionRefresh()
  const hideMarquee = displayPath.startsWith('/work/')

  return (
    <>
      <SiteNav />
      <GsapEnhancements />
      <ViewportReveal />
      <ProjectAmbience />
      <AppRoutes />
      {!hideMarquee ? <AgencyMarquee /> : null}
    </>
  )
}

function App() {
  if (isGifConvertorContext()) {
    return (
      <Suspense fallback={null}>
        <GifConvertorApp />
      </Suspense>
    )
  }

  return (
    <>
      <BlurDocumentTitle />
      <GoogleAnalytics />
      <MotionRefreshProvider>
        <AppShell />
      </MotionRefreshProvider>
      <Cursor />
    </>
  )
}

export default App
