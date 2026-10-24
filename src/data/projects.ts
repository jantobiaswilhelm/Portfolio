export interface Preview {
  /** Shown in the row and the hover card. */
  src: string
  caption: string
  w: number
  h: number
  /** Larger file for the lightbox; falls back to `src`. */
  full?: string
}

export interface Project {
  title: string
  tagline: string
  year: string
  current: boolean
  description: string
  stack: string[]
  live?: string
  github?: string
  document?: string
  publication?: string
  intro?: string
  highlights: string[]
  featured: boolean
  previews: Preview[]
  /** Hue for the generated preview card when there are no screenshots. */
  hue: number
}

export const projects: Project[] = [
  {
    title: 'CX Lab Workspace',
    hue: 210,
    tagline: 'IBM Agentic AI Challenge × FHNW × Roche',
    year: '2026',
    current: true,
    description: 'Recruitment workspace for the Roche Diagnostics CX Lab, built as part of the IBM Agentic AI Challenge in collaboration with FHNW. A team of specialised agents on IBM watsonx Orchestrate — Intake Parser, Smart Matcher, Scheduler, Comms Agent — work behind a custom chat to turn a recruiter\'s natural-language brief into a fully staffed user-research study: parsing requirements, matching against a participant pool, drafting invitations, and handing off to scheduling. The Next.js interface wraps the orchestrator in seven live data views (dashboard, projects, calendar, participants, communications, registrations, screener/feedback) backed by Supabase, plus public flows for participant self-registration, screener questionnaires, and post-session feedback.',
    stack: ['Next.js 14', 'TypeScript', 'Tailwind', 'Supabase', 'IBM watsonx Orchestrate', 'PostgreSQL'],
    highlights: [
      'Multi-agent orchestration on IBM watsonx Orchestrate with async run + poll + thread-stitching',
      'Seven live views: dashboard, projects, calendar, participants, communications, registrations, screener',
      'Token-protected public flows for participant registration, screener questionnaires, and feedback',
      'Recruiter-in-the-loop approval gates between matching, invitation, and booking stages',
      'Custom "Clinical Atelier" design system — hairline borders, ink-on-paper typography, editorial accents',
      'End-to-end pipeline: brief → match → invite → screen → schedule → conduct → feedback → report',
    ],
    featured: true,
    previews: [
      { src: 'images/projects/cxlab-1-sm.webp', full: 'images/projects/cxlab-1.webp', w: 2880, h: 1800, caption: 'Dashboard with the recruitment orchestrator' },
      { src: 'images/projects/cxlab-2-sm.webp', full: 'images/projects/cxlab-2.webp', w: 2880, h: 1800, caption: 'Participation pipeline and the Smart Matcher’s ranked candidates' },
      { src: 'images/projects/cxlab-3-sm.webp', full: 'images/projects/cxlab-3.webp', w: 2880, h: 1800, caption: 'Session calendar across active studies' },
    ],
  },
  {
    title: 'Lutem',
    hue: 265,
    tagline: 'A game diary that knows how games make you feel',
    year: '2026',
    current: true,
    description: 'A game diary with a recommendation engine built in. You log what you play, and after a session a two-tap check-in records how it left you: relaxed, energized, absorbed, frustrated, drained. Those check-ins feed "Play tonight": say how you want to feel and how much time you have, and it picks from your own games with a reason drawn from your history. Lutem started in my Master\'s coursework as a Spring Boot + React prototype; in 2026 I rebuilt it from scratch as a mobile-first Next.js app on Supabase, and I\'m currently building the recommendation engine.',
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind', 'PostgreSQL', 'IGDB API', 'Claude API'],
    document: 'docs/lutem-project.pdf',
    highlights: [
      'Two-tap session check-ins: how a game left you, not just a star rating',
      'Game pages that aggregate how a game feels from everyone\'s check-ins',
      '"Play tonight": a mood plus your free time, picked from your own library (in progress)',
      'Emotional tags drafted by Claude on first log, gradually replaced by real check-ins',
      '"Calm Journal" design system with a colour per mood and a "Dusk" dark mode',
      'Postgres row-level security, a local Supabase stack, Vitest and Playwright tests',
    ],
    featured: true,
    previews: [
      { src: 'images/projects/lutem-1-sm.webp', full: 'images/projects/lutem-1.webp', w: 2880, h: 1800, caption: 'Mood picker, the two-tap check-in, and how a game feels' },
      { src: 'images/projects/lutem-2-sm.webp', full: 'images/projects/lutem-2.webp', w: 2880, h: 1800, caption: 'The same flow in Dusk, the dark theme, with the diary of check-ins' },
      { src: 'images/projects/lutem-3-sm.webp', full: 'images/projects/lutem-3.webp', w: 2880, h: 1800, caption: 'Game page on desktop: ratings, feelings from check-ins, and tags' },
    ],
  },
  {
    title: 'NetflixRating',
    hue: 0,
    tagline: 'Chrome extension for smarter browsing',
    year: '2026',
    current: true,
    description: 'Chrome extension that overlays IMDb, Rotten Tomatoes, and Letterboxd ratings directly onto Netflix\'s browse interface. Features smart two-tier caching, watched tracking, and genre page sorting — all built with vanilla JS and Manifest V3.',
    stack: ['JavaScript', 'Chrome APIs', 'Manifest V3', 'HTML/CSS', 'OMDb API'],
    live: 'https://chromewebstore.google.com/detail/netflixrating/gefngcjodmnmgkfnjmlidofjcpjhmodm',
    highlights: ['Multi-source ratings: IMDb, Rotten Tomatoes, Letterboxd', 'Two-tier caching with request deduplication', 'Watched tracking with visual indicators', 'Genre page sorting by rating source', 'SPA-aware DOM observation with IntersectionObserver'],
    featured: false,
    previews: [
      { src: 'images/projects/netflixrating-1-sm.webp', full: 'images/projects/netflixrating-1.webp', w: 1280, h: 800, caption: 'Ratings under every title on Netflix’s browse rows' },
      { src: 'images/projects/netflixrating-2-sm.webp', full: 'images/projects/netflixrating-2.webp', w: 2880, h: 1800, caption: 'Settings popup: rating sources, display style, API usage and cache' },
    ],
  },
  {
    title: 'Garderobe',
    hue: 345,
    tagline: 'A virtual closet and AI try-on studio',
    year: '2026',
    current: false,
    description: 'A personal closet and try-on studio. You photograph a piece of clothing and Garderobe cuts it out right in the browser, then Gemini names it, files it under a category and type, and picks out its colour. Pieces can also be lifted straight out of a shop photo of someone wearing them. In the Studio you choose up to six pieces and Gemini renders them as one outfit on a full-body photo of you, keeping your face, hair and pose, so you can see a look before you get dressed. Single user, German and English.',
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'Supabase', 'Gemini API', 'ONNX / WebAssembly'],
    highlights: [
      'In-browser background removal (ONNX on WebAssembly): free, and the photo never leaves the device',
      'Gemini auto-tagging: name, category, sub-type and dominant colour, all editable',
      '"Ghost-mannequin" extraction pulls a single garment out of a worn or shop photo',
      'Identity-preserving try-on renders, where a dress replaces top and bottoms rather than stacking',
      'Lookbook of saved renders with zoom, native share sheet and download',
      'Hand-written CSS, bilingual German / English, optional shared-password gate',
    ],
    featured: false,
    previews: [
      { src: 'images/projects/garderobe-1-sm.webp', full: 'images/projects/garderobe-1.webp', w: 2880, h: 1800, caption: 'The closet: every piece cut out and tagged automatically' },
      { src: 'images/projects/garderobe-2-sm.webp', full: 'images/projects/garderobe-2.webp', w: 2880, h: 1800, caption: 'The studio: your photo is the canvas, the closet is the palette' },
      { src: 'images/projects/garderobe-3-sm.webp', full: 'images/projects/garderobe-3.webp', w: 2880, h: 1800, caption: 'Two pieces picked, ready to try on, with an optional clean studio backdrop' },
    ],
  },
  {
    title: 'MovieNight',
    hue: 235,
    tagline: 'Discord bot + web app for movie nights',
    year: '2025',
    current: true,
    description: 'Full-stack application for organizing movie nights within Discord communities. A React web app and Discord bot work together — enabling movie voting sessions, personal wishlists, scheduling, ratings, and statistics, all backed by a shared PostgreSQL database and TMDB integration.',
    stack: ['React', 'Express.js', 'Discord.js', 'PostgreSQL', 'TMDB API', 'JWT', 'Vite'],
    highlights: ['Three-service architecture: web app, REST API, and Discord bot', 'TMDB-powered movie search with trailers and recommendations', 'Voting system with real-time progress tracking', 'Personal wishlists with random movie picker', 'Discord OAuth2 authentication'],
    featured: false,
    previews: [
      { src: 'images/projects/movienight-1-sm.webp', full: 'images/projects/movienight-1.webp', w: 2880, h: 1800, caption: 'Tonight’s screening, the suggestion board, and what’s coming up' },
      { src: 'images/projects/movienight-2-sm.webp', full: 'images/projects/movienight-2.webp', w: 2880, h: 1800, caption: 'The archive of every film the server has watched' },
      { src: 'images/projects/movienight-3-sm.webp', full: 'images/projects/movienight-3.webp', w: 2880, h: 1800, caption: 'A marathon that schedules its films one Saturday at a time' },
      { src: 'images/projects/movienight-4-sm.webp', full: 'images/projects/movienight-4.webp', w: 2880, h: 1800, caption: 'Stats: the club’s top-rated films, ratings and hours in the dark' },
    ],
  },
  {
    title: 'SQL Scrolls Public Release',
    hue: 35,
    tagline: 'Bachelor Thesis — Gamified SQL learning',
    year: '2023',
    current: false,
    description: 'Helped FHNW publish their in-house SQL learning game for public use. The game teaches SQL fundamentals through interactive challenges with instant feedback — learning by doing.',
    stack: ['JavaScript', 'HTML/CSS', 'Node.js', 'MongoDB', 'Docker', 'Git'],
    github: 'https://github.com/fhnw-sql/FHNW-SQLScrolls',
    publication: 'https://irf.fhnw.ch/entities/publication/f7aa9072-b6f5-4cfb-b0dc-a43211171f50',
    intro: 'https://studierendenprojekte.wirtschaft.fhnw.ch/view/2699',
    highlights: ['Extended game with new tasks & UI improvements', 'Simplified deployment via Docker', 'Migrated project from GitLab to GitHub', 'Created documentation & video tutorials', 'Test plan execution & bugfixing'],
    featured: false,
    previews: [
      { src: 'images/projects/sqlscrolls-1.png', w: 2047, h: 1101, caption: 'Game interface' },
      { src: 'images/projects/sqlscrolls-2.png', w: 728, h: 427, caption: 'SQL challenge' },
    ],
  },
  {
    title: 'Business Process Digitalization Guide',
    hue: 150,
    tagline: 'Process optimization consulting',
    year: '2022',
    current: false,
    description: 'Practical project at FHNW developing a structured guide for digitalizing business processes. Analyzed workflows, identified inefficiencies, and proposed concrete improvement measures.',
    stack: ['BPMN', 'UML', 'Process Modeling', 'Requirements Engineering'],
    highlights: ['As-is / To-be process modeling', 'Potential analysis for inefficiencies', 'Digitalization roadmap', 'Media break reduction strategies'],
    featured: false,
    previews: [],
  },
]
