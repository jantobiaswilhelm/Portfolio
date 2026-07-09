export const statement =
  'What started as talking about innovations quickly turned into "why don\'t I just build this myself."'

export const bio =
  "I'm a Master's student in Business Information Systems who ships full-stack products, shoots street & travel photography, and games when the code compiles. I care about the seam where design, engineering and people meet."

export interface Fact {
  k: string
  v: string
}

export const facts: Fact[] = [
  { k: 'Based in', v: 'Basel 🇨🇭' },
  { k: 'Studying', v: 'MSc @ FHNW' },
  { k: 'Building with', v: 'React · Next · Spring' },
  { k: 'Shooting on', v: 'Fujifilm' },
]

export const languages = ['German', 'English', 'French']

export const techStack = [
  'React', 'TypeScript', 'Node.js', 'Spring Boot', 'Python', 'Tailwind CSS',
  'PostgreSQL', 'MongoDB', 'Firebase', 'Docker', 'Next.js', 'Figma',
]

export const roles = ['Developer', 'Photographer', 'MSc Student', 'Gamer']
