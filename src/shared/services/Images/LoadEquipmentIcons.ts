import type { ImageStore } from '.';

/**
 * convert image to modules
 */
export default function LoadEquipmentIcons(target: ImageStore) {
  const requireContext = require.context('@/assets/images/character/equipment', true, /[a-zA-z-]+\.png$/);
  requireContext.keys().forEach(fileName => {
    const image = requireContext(fileName);
    const fieldIdMatch = fileName.match(/([a-zA-z-]+)\/i([a-zA-Z-]+).png$/);
    if (fieldIdMatch) {
      target.append(`${fieldIdMatch[1]}-${fieldIdMatch[2]}`, image);
    }
    const match = fileName.match(/([a-zA-Z-]+).png$/);
    if (match) {
      target.append(match[1], image);
    }
  });
}
