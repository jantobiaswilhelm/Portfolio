export type SectionId = 'hero' | 'about' | 'work' | 'photography' | 'travel' | 'contact'

export interface SectionDef {
  id: SectionId
  label: string
  num?: string
}

export const SECTIONS: SectionDef[] = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About', num: '01' },
  { id: 'work', label: 'Work', num: '02' },
  { id: 'photography', label: 'Photography', num: '03' },
  { id: 'travel', label: 'Travel', num: '04' },
  { id: 'contact', label: 'Contact', num: '05' },
]

export const SECTION_IDS: SectionId[] = SECTIONS.map((s) => s.id)
