import { SITE_OG_IMAGE } from '../content/media'
import { HomeIntroColumn } from '../components/HomeIntroColumn'
import { Hero } from '../components/Hero'
import { HeroMedia } from '../components/HeroMedia'
import { Brands } from '../components/Brands'
import { Work } from '../components/Work'
import { Recognition } from '../components/Recognition'
import { Contact } from '../components/Contact'
import { Helmet } from 'react-helmet-async'

export function HomePage() {
  return (
    <main id="top">
      <Helmet>
        <title>Joey Gordon | Executive Design Director</title>
        <meta
          name="description"
          content="Joey Gordon, Executive Design Director. Brand, product, and digital experience leadership across global and independent studios."
        />
        <link rel="canonical" href="https://jg.studio/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="JG Studio" />
        <meta property="og:title" content="Joey Gordon | Executive Design Director" />
        <meta
          property="og:description"
          content="Executive Design Director. Brand, product, and digital experience leadership across global and independent studios."
        />
        <meta property="og:url" content="https://jg.studio/" />
        <meta property="og:image" content={`https://jg.studio${SITE_OG_IMAGE}`} />
        <meta property="og:image:alt" content="Joey Gordon, Executive Design Director" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Joey Gordon | Executive Design Director" />
        <meta
          name="twitter:description"
          content="Executive Design Director. Brand, product, and digital experience leadership across global and independent studios."
        />
        <meta name="twitter:image" content={`https://jg.studio${SITE_OG_IMAGE}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Joey Gordon',
            jobTitle: 'Executive Design Director',
            url: 'https://jg.studio/',
            email: 'mailto:joey@jg.studio',
            image: `https://jg.studio${SITE_OG_IMAGE}`,
            sameAs: ['https://www.linkedin.com/in/joeygordon/'],
          })}
        </script>
      </Helmet>
      <section className="home-intro" aria-label="Introduction">
        <div className="grid-12 grid-12--rg home-intro__grid">
          <div className="span-4 home-intro__copy" data-viewport-reveal="off">
            <HomeIntroColumn>
              <Hero />
            </HomeIntroColumn>
          </div>
          <div className="span-8 home-intro__media">
            <HeroMedia />
          </div>
          <Brands />
        </div>
      </section>
      <Work />
      <Recognition />
      <Contact />
    </main>
  )
}
