import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import { ScrollToTop } from './components/ScrollToTop.tsx'
import { SmoothScroll } from './components/SmoothScroll.tsx'
import { isGifConvertorContext } from './lib/gifConvertor/host'

const isGifTool = isGifConvertorContext()

async function boot() {
  if (isGifTool) {
    await import('./gif-convertor/gif-convertor.css')
  } else {
    await import('./index.css')
  }

  const app = (
    <HelmetProvider>
      <BrowserRouter>
        {!isGifTool ? <ScrollToTop /> : null}
        <App />
      </BrowserRouter>
    </HelmetProvider>
  )

  createRoot(document.getElementById('root')!).render(
    <StrictMode>{isGifTool ? app : <SmoothScroll>{app}</SmoothScroll>}</StrictMode>,
  )
}

void boot()
