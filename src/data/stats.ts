import { projects } from './projects'
import photos from './photos.json'

export const stats = {
  projects: projects.length,
  active: projects.filter((p) => p.current).length,
  frames: (photos as unknown[]).length,
}
