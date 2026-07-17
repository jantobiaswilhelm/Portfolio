export interface TimelineItem {
  year: string
  title: string
  type: 'work' | 'edu'
  current: boolean
}

export const timeline: TimelineItem[] = [
  { year: '2025', title: 'Support Hero @ twio.tech', type: 'work', current: true },
  { year: '2024–2027', title: 'MSc Business Information Systems @ FHNW', type: 'edu', current: true },
  { year: '2024', title: 'Civil Service @ WBZ', type: 'work', current: false },
  { year: '2019–2023', title: 'BSc Business Information Technology @ FHNW', type: 'edu', current: false },
  { year: '2020', title: 'Exchange @ Erhvervsakademiet Aarhus', type: 'edu', current: false },
  { year: '2017–2018', title: 'Intern Supply Chain @ SBB Cargo International', type: 'work', current: false },
]
