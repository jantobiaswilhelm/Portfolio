import { useEffect } from 'react'
import Photography from '../components/Photography'
import PageTransition from '../components/ui/PageTransition'

export default function PhotographyPage() {
  useEffect(() => {
    document.title = 'Photography | Jan Wilhelm'
  }, [])

  return (
    <PageTransition>
      <Photography />
    </PageTransition>
  )
}
