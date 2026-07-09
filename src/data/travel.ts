export interface Trip {
  country: string
  code: string
  city: string
  type: string
  year: string
}

export const trips: Trip[] = [
  { country: 'China', code: 'cn', city: 'Greater Bay Area', type: 'Field Trip', year: '2025' },
  { country: 'Denmark', code: 'dk', city: 'Aarhus', type: 'Exchange Semester', year: '2020' },
  { country: 'United Kingdom', code: 'gb', city: 'Cambridge', type: 'Language Stay', year: '2017' },
]
