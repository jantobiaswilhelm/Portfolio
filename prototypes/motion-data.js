// Shared content for the motion prototypes (proto-3/4/5). Mirrors src/data/*.
// Served by `npm run dev` at /Portfolio/prototypes/…; also works over file://.
(function () {
  const IMG = location.protocol === 'file:' ? '../public/images/' : '/Portfolio/images/'
  const LADDER = [400, 800, 1200, 1600]

  // [id, w, h, place, focal, aperture, iso, largestWidth]
  const raw = [
    ['oeschinensee-2026/DSCF1628', 6240, 4160, 'Oeschinensee', '55mm', 'f/5', 160, 1600],
    ['oeschinensee-2026/DSCF1469', 4160, 6240, 'Oeschinensee', '34mm', 'f/5.6', 160, 1600],
    ['oeschinensee-2026/DSCF1439', 4160, 6240, 'Oeschinensee', '44mm', 'f/5', 160, 1600],
    ['oeschinensee-2026/DSCF1407', 4160, 6240, 'Oeschinensee', '55mm', 'f/4', 400, 1600],
    ['oeschinensee-2026/DSCF1378', 4160, 6240, 'Oeschinensee', '21mm', 'f/4.5', 160, 1600],
    ['oeschinensee-2026/DSCF1376', 4160, 6240, 'Oeschinensee', '30mm', 'f/5', 160, 1600],
    ['oeschinensee-2026/DSCF1372', 4160, 6240, 'Oeschinensee', '23mm', 'f/4', 160, 1600],
    ['oeschinensee-2026/DSCF1327', 4160, 6240, 'Oeschinensee', '37mm', 'f/5.6', 160, 1600],
    ['oeschinensee-2026/DSCF1323', 4160, 6240, 'Oeschinensee', '32mm', 'f/4.5', 160, 1600],
    ['amsterdam-2026/DSCF9671', 2080, 3120, 'Amsterdam', '55mm', 'f/5.6', 320, 1600],
    ['amsterdam-2026/DSCF9633', 1766, 2525, 'Amsterdam', '55mm', 'f/5.6', 320, 1600],
    ['amsterdam-2026/DSCF9620', 1871, 2960, 'Amsterdam', '48mm', 'f/5.6', 320, 1600],
    ['amsterdam-2026/DSCF9608', 3120, 2080, 'Amsterdam', '55mm', 'f/6.4', 320, 1600],
    ['italy-2026/DSCF9495', 2080, 3120, 'Italy', '55mm', 'f/5.6', 320, 1600],
    ['italy-2026/DSCF9341', 1568, 2267, 'Italy', '55mm', 'f/4', 160, 1200],
    ['italy-2026/DSCF9295', 2080, 3120, 'Italy', '53mm', 'f/4.5', 160, 1600],
    ['italy-2026/DSCF9258', 2850, 1900, 'Italy', '55mm', 'f/5.6', 160, 1600],
    ['italy-2026/DSCF9141', 2080, 3120, 'Italy', '44mm', 'f/4', 4000, 1600],
    ['italy-2026/DSCF9060', 2080, 3120, 'Italy', '22mm', 'f/3.6', 320, 1600],
    ['italy-2026/DSCF8987~2', 2080, 3120, 'Italy', '18mm', 'f/5.6', 160, 1600],
    ['italy-2026/DSCF8916', 2080, 3120, 'Italy', '55mm', 'f/5.6', 320, 1600],
    ['italy-2026/DSCF8901', 2080, 3120, 'Italy', '48mm', 'f/5.6', 320, 1600],
    ['italy-2026/DSCF8871', 2080, 3120, 'Italy', '18mm', 'f/2.8', 160, 1600],
    ['italy-2026/DSCF8820', 2080, 3120, 'Italy', '55mm', 'f/4', 160, 1600],
    ['oeschinensee-2026/IMG_20260912_152321_048', 1080, 1920, 'Oeschinensee', null, null, null, 800],
    ['oeschinensee-2026/IMG_20260912_152335_579', 1080, 1920, 'Oeschinensee', null, null, null, 800],
    ['undated/118130572_810097556468233_5376250552248582483_n', 1440, 1800, 'Undated', null, null, null, 1200],
    ['undated/264749647_504663010664148_3912904318719147918_n', 1440, 1151, 'Undated', null, null, null, 1200],
    ['undated/265400444_268649775135111_6317812263830818220_n', 1440, 960, 'Undated', null, null, null, 1200],
  ]

  const photos = raw.map(([id, w, h, place, focal, aperture, iso, max]) => ({
    id, w, h, place, focal, aperture, iso, max, ar: w / h,
  }))

  /** Smallest generated derivative at least `want` px wide (capped at what exists). */
  function photoSrc(p, want = 800, ext = 'webp') {
    const w = LADDER.find((l) => l >= want && l <= p.max) || p.max
    return `${IMG}photos/${p.id}-${w}.${ext}`
  }

  window.PORTFOLIO = {
    IMG,
    photos,
    photoSrc,
    hero: photos[0],
    profile: `${IMG}profile.png`,
    // Jan's own crop of DSCF1364 (Oeschinensee, 2026), 900px web copy
    portrait: { src: `${IMG}portrait-oeschinensee.webp`, fallback: `${IMG}portrait-oeschinensee.jpg`, w: 3550, h: 4129 },
    roles: ['Developer', 'Photographer', 'MSc Student', 'Gamer'],
    statement:
      'What started as talking about innovations quickly turned into "why don\'t I just build this myself."',
    bio: "I'm a Master's student in Business Information Systems who ships full-stack products, shoots street & travel photography, and games when the code compiles. I care about the seam where design, engineering and people meet.",
    facts: [
      { k: 'Based in', v: 'Basel 🇨🇭' },
      { k: 'Studying', v: 'MSc @ FHNW' },
      { k: 'Building with', v: 'React · Next · Spring' },
      { k: 'Shooting on', v: 'Fujifilm' },
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'Spring Boot', 'Python', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Firebase', 'Docker', 'Next.js', 'Figma'],
    projects: [
      {
        title: 'CX Lab Workspace', tagline: 'IBM Agentic AI Challenge × FHNW × Roche', year: '2026',
        stack: ['Next.js 14', 'TypeScript', 'Supabase', 'watsonx Orchestrate'],
        description: 'Recruitment workspace for the Roche Diagnostics CX Lab: a team of agents on IBM watsonx Orchestrate turns a recruiter\'s brief into a fully staffed user-research study.',
        highlights: ['Multi-agent orchestration with async run + poll + thread-stitching', 'Seven live views backed by Supabase', 'Recruiter-in-the-loop approval gates'],
        previews: [], hue: 210,
      },
      {
        title: 'Lutem', tagline: '"Headspace meets Steam"', year: '2025',
        stack: ['React', 'TypeScript', 'Spring Boot', 'Firebase'],
        description: 'AI-powered gaming recommendation platform that matches your mood to the perfect game.',
        highlights: ['Multi-dimensional recommendation engine', 'Steam library integration', '4 themes × 2 modes design system'],
        previews: [`${IMG}projects/lutem-1.png`, `${IMG}projects/lutem-2.png`, `${IMG}projects/lutem-3.png`], hue: 265,
      },
      {
        title: 'NetflixRating', tagline: 'Chrome extension for smarter browsing', year: '2026',
        stack: ['JavaScript', 'Chrome APIs', 'Manifest V3', 'OMDb API'],
        description: 'Overlays IMDb, Rotten Tomatoes and Letterboxd ratings directly onto Netflix\'s browse interface.',
        highlights: ['Multi-source ratings', 'Two-tier caching with request deduplication', 'SPA-aware DOM observation'],
        previews: [], hue: 0,
      },
      {
        title: 'MovieNight', tagline: 'Discord bot + web app for movie nights', year: '2025',
        stack: ['React', 'Express.js', 'Discord.js', 'PostgreSQL'],
        description: 'Organise movie nights inside Discord: voting sessions, wishlists, scheduling, ratings and stats.',
        highlights: ['Three-service architecture', 'TMDB-powered search', 'Discord OAuth2'],
        previews: [], hue: 235,
      },
      {
        title: 'SQL Scrolls Public Release', tagline: 'Bachelor Thesis — Gamified SQL learning', year: '2023',
        stack: ['JavaScript', 'Node.js', 'MongoDB', 'Docker'],
        description: 'Helped FHNW publish their in-house SQL learning game for public use — SQL fundamentals through interactive challenges with instant feedback.',
        highlights: ['Extended game with new tasks & UI improvements', 'Simplified deployment via Docker', 'Documentation & video tutorials'],
        previews: [`${IMG}projects/sqlscrolls-1.png`, `${IMG}projects/sqlscrolls-2.png`], hue: 35,
      },
      {
        title: 'Business Process Digitalization Guide', tagline: 'Process optimization consulting', year: '2022',
        stack: ['BPMN', 'UML', 'Process Modeling'],
        description: 'A structured guide for digitalizing business processes: analysed workflows, found inefficiencies, proposed concrete measures.',
        highlights: ['As-is / To-be process modeling', 'Digitalization roadmap', 'Media break reduction strategies'],
        previews: [], hue: 150,
      },
    ],
    // Full CV, restored from before the July redesign (src/data/skills.ts @ c1c3e4d^)
    // and corrected by Jan on 2026-09-26. `year` is the display label; `from`/`to`
    // place the bar on the axis (`to: null` = ongoing, `planned` = expected end).
    timeline: [
      { year: 'Mid-2025 – now', from: 2025.5, to: null, title: 'Support Hero', org: 'twio.tech', short: 'twio.tech', type: 'work', current: true },
      { year: '2024 – 2027', from: 2024, to: null, planned: 2027, title: 'MSc Business Information Systems', org: 'FHNW', short: 'MSc · FHNW', type: 'edu', current: true },
      { year: '2023 – 2024', from: 2023, to: 2024, title: 'Civil Service', org: 'WBZ', short: 'WBZ', type: 'work', current: false },
      { year: '2019 – 2023', from: 2019, to: 2023, title: 'BSc Business Information Technology', org: 'FHNW', short: 'BSc · FHNW', type: 'edu', current: false },
      { year: '2020', from: 2020, to: 2021, title: 'Exchange Semester', org: 'Erhvervsakademiet Aarhus', short: 'Aarhus', type: 'edu', current: false },
      { year: '2018 – 2019', from: 2018, to: 2019, title: 'Teaching Assistant (Civil Service)', org: 'HPS Liestal', short: 'HPS', type: 'work', current: false },
      { year: '2017 – 2018', from: 2017, to: 2018, title: 'Intern Supply Chain', org: 'SBB Cargo International', short: 'SBB', type: 'work', current: false },
      { year: '2014 – 2018', from: 2014, to: 2018, title: 'WMS (Federal VET Diploma)', org: '', short: 'WMS', type: 'edu', current: false },
    ],
    certifications: [
      { name: 'Cambridge FIRST', short: 'C1 English', level: 'Grade A (C1)', year: '2017', lang: 'English' },
      { name: 'DELF B1', short: 'DELF French', level: 'B2 Exam', year: '2015', lang: 'French' },
    ],
    languages: ['German', 'English', 'French'],
    trips: [
      { country: 'China', code: 'cn', city: 'Greater Bay Area', type: 'Field Trip', year: '2025' },
      { country: 'Denmark', code: 'dk', city: 'Aarhus', type: 'Exchange Semester', year: '2020' },
      { country: 'United Kingdom', code: 'gb', city: 'Cambridge', type: 'Language Stay', year: '2017' },
    ],
    socials: [
      { label: 'Email', href: 'mailto:jan.tobias.wilhelm@gmail.com' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jan-wilhelm-1a235a197/' },
      { label: 'GitHub', href: 'https://github.com/jantobiaswilhelm' },
      { label: 'Instagram', href: 'https://www.instagram.com/tschaaaaan/' },
    ],
    sections: [
      { id: 'hero', label: 'Home' },
      { id: 'about', label: 'About', num: '01' },
      { id: 'work', label: 'Work', num: '02' },
      { id: 'photography', label: 'Photography', num: '03' },
      { id: 'travel', label: 'Travel', num: '04' },
      { id: 'contact', label: 'Contact', num: '05' },
    ],
    prototypes: [
      { file: 'proto-3-darkroom.html', name: 'A · Darkroom' },
      { file: 'proto-4-kinetic.html', name: 'B · Kinetic' },
      { file: 'proto-5-shutter.html', name: 'C · Shutter' },
      { file: 'proto-6-mix.html', name: 'D · Mix' },
    ],
  }

  // Floating switcher between the three motion prototypes.
  document.addEventListener('DOMContentLoaded', () => {
    const here = location.pathname.split('/').pop()
    const bar = document.createElement('div')
    bar.className = 'proto-switch'
    bar.innerHTML = window.PORTFOLIO.prototypes
      .map((p) => `<a href="${p.file}"${p.file === here ? ' aria-current="page"' : ''}>${p.name}</a>`)
      .join('')
    const css = document.createElement('style')
    css.textContent = `.proto-switch{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9000;display:flex;gap:2px;padding:4px;border-radius:999px;background:rgba(19,19,24,.82);border:1px solid #232329;backdrop-filter:blur(10px);font:500 11px/1 'Space Grotesk',system-ui,sans-serif;letter-spacing:.06em}
.proto-switch a{padding:8px 12px;border-radius:999px;color:#9a9aa2;text-decoration:none;white-space:nowrap;transition:color .2s ease,background-color .2s ease}
.proto-switch a:hover{color:#ededf0}
.proto-switch a[aria-current]{background:#d4a853;color:#111}`
    document.head.appendChild(css)
    document.body.appendChild(bar)
  })
})()
