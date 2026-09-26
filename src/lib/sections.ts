export type SectionId = 'hero' | 'about' | 'projects' | 'experience' | 'photography' | 'contact'

export interface SectionDef {
  id: SectionId
  label: string
  num?: string
}

export const SECTIONS: SectionDef[] = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About', num: '01' },
  { id: 'projects', label: 'Projects', num: '02' },
  { id: 'experience', label: 'Experience', num: '03' },
  { id: 'photography', label: 'Photography', num: '04' },
  { id: 'contact', label: 'Contact', num: '05' },
]

export const SECTION_IDS: SectionId[] = SECTIONS.map((s) => s.id)
