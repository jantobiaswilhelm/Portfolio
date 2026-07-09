import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCountUp } from '../../hooks/useCountUp'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export function StatCounter({ value, label }: { value: number; label: string }) {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(false)
  const animated = useCountUp(value, active && !reduced)
  const display = reduced ? value : animated

  return (
    <motion.div onViewportEnter={() => setActive(true)} viewport={{ once: true }}>
      <div className="font-head text-4xl font-bold text-tp">{display}</div>
      <div className="text-xs text-tm tracking-[0.1em] uppercase">{label}</div>
    </motion.div>
  )
}
