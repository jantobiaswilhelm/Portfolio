export const techStack = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Spring Boot', 'Python', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Firebase', 'Docker', 'Git', 'Figma', 'BPMN', 'UML', 'ERD']

export const certifications = [
  { name: 'Cambridge FIRST', level: 'Grade A (C1)', year: '2017', lang: 'English' },
  { name: 'DELF B1', level: 'B2 Exam', year: '2015', lang: 'French' },
]

export const international = [
  { country: 'China', code: 'cn', city: 'Greater Bay Area', year: '2025', type: 'Field Trip' },
  { country: 'Denmark', code: 'dk', city: 'Aarhus', year: '2020', type: 'Exchange Semester' },
  { country: 'UK', code: 'gb', city: 'Cambridge', year: '2017', type: 'Language Stay' },
]

export interface TimelineItem {
  year: string
  title: string
  type: 'work' | 'edu'
  current: boolean
}

export const timeline: TimelineItem[] = [
  { year: '2025', title: 'Support Hero @ twio.tech', type: 'work', current: true },
  { year: '2024-2027', title: 'MSc Business Information Systems @ FHNW', type: 'edu', current: true },
  { year: '2024', title: 'Civil Service @ WBZ', type: 'work', current: false },
  { year: '2019-2023', title: 'BSc Business Information Technology @ FHNW', type: 'edu', current: false },
  { year: '2020', title: 'Exchange @ Erhvervsakademiet Aarhus', type: 'edu', current: false },
  { year: '2018-2019', title: 'Teaching Assistant @ HPS Liestal (Civil Service)', type: 'work', current: false },
  { year: '2017-2018', title: 'Intern Supply Chain @ SBB Cargo International', type: 'work', current: false },
  { year: '2014-2018', title: 'WMS (Federal VET Diploma)', type: 'edu', current: false },
]
