import { projects } from './projects'
import { photos } from './photos-manifest'

export const stats = {
  projects: projects.length,
  active: projects.filter((p) => p.current).length,
  frames: photos.length,
}
