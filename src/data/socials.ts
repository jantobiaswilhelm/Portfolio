import { Mail, Linkedin, Github, Instagram, Coffee } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Social {
  icon: LucideIcon
  label: string
  href: string
}

export const socials: Social[] = [
  { icon: Mail, label: 'Email', href: 'mailto:jan.tobias.wilhelm@gmail.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/jan-wilhelm-1a235a197/' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/jantobiaswilhelm' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/tschaaaaan/' },
  { icon: Coffee, label: 'Ko-fi', href: 'https://ko-fi.com/lutem' },
]
