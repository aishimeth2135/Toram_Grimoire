import type { ImageStore } from '.'

/**
 * convert image to modules
 */
export default function LoadCrystalIcons(target: ImageStore) {
  const requireContext = require.context('@/assets/images/crystals', true, /[a-zA-z-]+\.png$/)
  requireContext.keys().forEach(fileName => {
    const image = requireContext(fileName)
    const match = fileName.match(/([a-zA-Z-]+).png$/)
    if (match) {
      target.append(match[1], image)
    }
  })
}
