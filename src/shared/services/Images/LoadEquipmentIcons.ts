import type { ImageStore } from '.'

/**
 * convert images to one ImageStore
 */
export default function LoadEquipmentIcons(target: ImageStore) {
  const modules = import.meta.globEager('/src/assets/images/character/equipment/*.png')
  Object.entries(modules as Record<string, any>).forEach(([path, context]) => {
    const fieldIdMatch = path.match(/([a-zA-z-]+)\/i([a-zA-Z-]+).png$/)
    if (fieldIdMatch) {
      target.append(`${fieldIdMatch[1]}-${fieldIdMatch[2]}`, context as string)
    }
    const match = path.match(/([a-zA-Z-]+).png$/)
    if (match) {
      target.append(match[1], context.default as string)
    }
  })
}
