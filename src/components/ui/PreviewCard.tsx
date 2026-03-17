import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface PreviewCardProps {
  title: string
  icon: LucideIcon
  to: string
  delay?: number
  children: React.ReactNode
}

export default function PreviewCard({ title, icon: Icon, to, delay = 0, children }: PreviewCardProps) {
  return (
    <Link to={to} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-bg-card border border-border rounded-2xl p-6 hover:border-accent/60 hover:shadow-[0_0_30px_-5px_rgba(212,168,83,0.15)] transition-all duration-300 h-full cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Icon size={20} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">{title}</h3>
          </div>
          <ArrowRight size={18} className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
        </div>
        <div>
          {children}
        </div>
      </motion.div>
    </Link>
  )
}
