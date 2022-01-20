import type { ImageStore } from '.'

/**
 * convert image to modules
 */
export default function LoadSkillIcons(target: ImageStore) {
  const requireContext = require.context('@/assets/images/skill-icons', true, /stc_\d+\/st_\d+\/si_\d+\.png$/)
  requireContext.keys().forEach(fileName => {
    const image = requireContext(fileName)
    const match = fileName.match(/stc_(\d+)\/st_(\d+)\/si_(\d+)\.png$/)
    if (match) {
      target.append(`${match[1]}-${match[2]}-${match[3]}`, image)
    }
  })
}
