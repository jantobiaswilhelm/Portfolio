export type Preview = { src: string; caption: string }

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
}

export const projects: Project[] = [
  {
    title: 'Lutem',
    tagline: '"Headspace meets Steam"',
    year: '2025',
    current: true,
    description: 'AI-powered gaming recommendation platform that matches your mood to the perfect game. Built as part of my Master\'s coursework with startup potential.',
    stack: ['React', 'TypeScript', 'Spring Boot', 'Firebase', 'PostgreSQL', 'Tailwind'],
    live: 'https://lutemweb.netlify.app',
    github: 'https://github.com/jantobiaswilhelm/LutemPrototype',
    document: 'docs/lutem-project.pdf',
    highlights: ['Multi-dimensional recommendation engine', 'Steam library integration', '4 themes × 2 modes design system'],
    featured: true,
    previews: [
      { src: 'images/projects/lutem-1.png', caption: 'Mood selection interface' },
      { src: 'images/projects/lutem-2.png', caption: 'Game recommendations' },
      { src: 'images/projects/lutem-3.png', caption: 'Theme variants' },
    ],
  },
  {
    title: 'NetflixRating',
    tagline: 'Chrome extension for smarter browsing',
    year: '2026',
    current: true,
    description: 'Chrome extension that overlays IMDb, Rotten Tomatoes, and Letterboxd ratings directly onto Netflix\'s browse interface. Features smart two-tier caching, watched tracking, and genre page sorting — all built with vanilla JS and Manifest V3.',
    stack: ['JavaScript', 'Chrome APIs', 'Manifest V3', 'HTML/CSS', 'OMDb API'],
    live: 'https://chromewebstore.google.com/detail/netflixrating/gefngcjodmnmgkfnjmlidofjcpjhmodm',
    highlights: ['Multi-source ratings: IMDb, Rotten Tomatoes, Letterboxd', 'Two-tier caching with request deduplication', 'Watched tracking with visual indicators', 'Genre page sorting by rating source', 'SPA-aware DOM observation with IntersectionObserver'],
    featured: false,
    previews: [],
  },
  {
    title: 'MovieNight',
    tagline: 'Discord bot + web app for movie nights',
    year: '2025',
    current: true,
    description: 'Full-stack application for organizing movie nights within Discord communities. A React web app and Discord bot work together — enabling movie voting sessions, personal wishlists, scheduling, ratings, and statistics, all backed by a shared PostgreSQL database and TMDB integration.',
    stack: ['React', 'Express.js', 'Discord.js', 'PostgreSQL', 'TMDB API', 'JWT', 'Vite'],
    highlights: ['Three-service architecture: web app, REST API, and Discord bot', 'TMDB-powered movie search with trailers and recommendations', 'Voting system with real-time progress tracking', 'Personal wishlists with random movie picker', 'Discord OAuth2 authentication'],
    featured: false,
    previews: [],
  },
  {
    title: 'SQL Scrolls Public Release',
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
      { src: 'images/projects/sqlscrolls-1.png', caption: 'Game interface' },
      { src: 'images/projects/sqlscrolls-2.png', caption: 'SQL challenge' },
    ],
  },
  {
    title: 'Business Process Digitalization Guide',
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
