export interface TimelineItem {
  /** Display label, e.g. "2019 – 2023" or "Mid-2025 – now". */
  year: string
  /** Where the bar starts on the axis, in fractional years (2025.5 = mid-2025). */
  from: number
  /** Where it ends; `null` = ongoing (runs to today). */
  to: number | null
  /** Expected end of something ongoing, drawn as a dashed tail. */
  planned?: number
  title: string
  org: string
  /** Label short enough to sit inside a one-year bar. */
  short: string
  type: 'work' | 'edu'
  current: boolean
}

/**
 * The CV, newest first. Restored from the pre-redesign site (two entries and
 * the certifications had been dropped) and corrected by Jan on 2026-09-26:
 * WBZ sat between the BSc and the MSc, twio.tech started mid-2025.
 */
export const timeline: TimelineItem[] = [
  { year: 'Mid-2025 – now', from: 2025.5, to: null, title: 'Support Hero', org: 'twio.tech', short: 'twio.tech', type: 'work', current: true },
  { year: '2024 – 2027', from: 2024, to: null, planned: 2027, title: 'MSc Business Information Systems', org: 'FHNW', short: 'MSc · FHNW', type: 'edu', current: true },
  { year: '2023 – 2024', from: 2023, to: 2024, title: 'Civil Service', org: 'WBZ', short: 'WBZ', type: 'work', current: false },
  { year: '2019 – 2023', from: 2019, to: 2023, title: 'BSc Business Information Technology', org: 'FHNW', short: 'BSc · FHNW', type: 'edu', current: false },
  { year: '2020', from: 2020, to: 2021, title: 'Exchange Semester', org: 'Erhvervsakademiet Aarhus', short: 'Aarhus', type: 'edu', current: false },
  { year: '2018 – 2019', from: 2018, to: 2019, title: 'Teaching Assistant (Civil Service)', org: 'HPS Liestal', short: 'HPS', type: 'work', current: false },
  { year: '2017 – 2018', from: 2017, to: 2018, title: 'Intern Supply Chain', org: 'SBB Cargo International', short: 'SBB', type: 'work', current: false },
  { year: '2014 – 2018', from: 2014, to: 2018, title: 'WMS (Federal VET Diploma)', org: '', short: 'WMS', type: 'edu', current: false },
]

export interface Certification {
  name: string
  short: string
  level: string
  year: string
  lang: string
}

export const certifications: Certification[] = [
  { name: 'Cambridge FIRST', short: 'C1 English', level: 'Grade A (C1)', year: '2017', lang: 'English' },
  { name: 'DELF B1', short: 'DELF French', level: 'B2 Exam', year: '2015', lang: 'French' },
]
