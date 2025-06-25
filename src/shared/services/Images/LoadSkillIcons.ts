import type { ImageStore } from '.'

/**
 * convert images to one ImageStore
 */
export default function LoadSkillIcons(target: ImageStore) {
  const modules = import.meta.glob('/src/assets/images/skill-icons/**/*.png', {
    eager: true,
  })
  Object.entries(modules as Record<string, any>).forEach(([path, context]) => {
    const match = path.match(/stc_(\d+)\/st_(\d+)\/si_(\d+)\.png$/)
    if (match) {
      target.append(`${match[1]}-${match[2]}-${match[3]}`, context.default as string)
    }
  })
}
