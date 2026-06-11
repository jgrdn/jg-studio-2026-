import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import App from './App'
import { projects } from './content/site'

export type RenderResult = {
  appHtml: string
  headHtml: string
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getPrerenderRoutes() {
  const slugs = projects
    .map((p) => (p as { slug?: string; title: string }).slug ?? slugify(p.title))
    .filter(Boolean)
  return ['/', ...slugs.map((s) => `/work/${s}`)]
}

export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState | null } = {}

  const appHtml = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>,
  )

  const helmet = helmetContext.helmet ?? undefined

  const headHtml = [
    helmet?.title?.toString?.() ?? '',
    helmet?.meta?.toString?.() ?? '',
    helmet?.link?.toString?.() ?? '',
    helmet?.script?.toString?.() ?? '',
  ]
    .filter(Boolean)
    .join('\n')

  return { appHtml, headHtml }
}

