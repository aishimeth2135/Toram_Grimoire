import { BagCrystal } from '@/lib/Items/BagItem'

export function getCrystalPureColor(crystal: BagCrystal) {
  switch (crystal.category) {
    case 0:
      return 'red'
    case 1:
      return 'emerald'
    case 2:
      return 'orange'
    case 3:
      return 'fuchsia'
    default:
      return 'blue'
  }
}
