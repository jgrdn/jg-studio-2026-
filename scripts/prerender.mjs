import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

if (process.env.VITE_GIF_MAKER_ONLY === 'true') {
  const gifMakerHtml = path.join(distDir, 'index.gif-maker.html')
  const indexHtml = path.join(distDir, 'index.html')
  try {
    await fs.rename(gifMakerHtml, indexHtml)
  } catch {
    // Already index.html when the template filename matches.
  }
  console.log('Skipping portfolio prerender (gif-maker-only build).')
  process.exit(0)
}

const templatePath = path.join(distDir, 'index.html')
const template = await fs.readFile(templatePath, 'utf8')

// Import the SSR bundle (built by `vite build --ssr`)
const entryUrl = pathToFileURL(path.join(ssrDir, 'entry-server.js')).href
const { render, getPrerenderRoutes } = await import(entryUrl)

const routes = typeof getPrerenderRoutes === 'function' ? getPrerenderRoutes() : ['/']

function withAppHtml(html, appHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

function withHeadHtml(html, headHtml) {
  if (!headHtml) return html
  return html.replace('</head>', `${headHtml}\n</head>`)
}

async function writeRoute(routeUrl, html) {
  if (routeUrl === '/') {
    await fs.writeFile(path.join(distDir, 'index.html'), html, 'utf8')
    return
  }

  const outDir = path.join(distDir, routeUrl.replace(/^\//, ''), 'index.html')
  await fs.mkdir(path.dirname(outDir), { recursive: true })
  await fs.writeFile(outDir, html, 'utf8')
}

for (const url of routes) {
  const { appHtml, headHtml } = render(url)
  const out = withHeadHtml(withAppHtml(template, appHtml), headHtml)
  await writeRoute(url, out)
}

