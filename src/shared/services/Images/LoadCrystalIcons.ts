import type { ImageStore } from '.'

/**
 * convert images to one ImageStore
 */
export default function LoadCrystalIcons(target: ImageStore) {
  const modules = import.meta.globEager('/src/assets/images/crystals/*.png')
  Object.entries(modules as Record<string, any>).forEach(([path, context]) => {
    const match = path.match(/([a-zA-Z-]+).png$/)
    if (match) {
      target.append(match[1], context.default as string)
    }
  })
}
