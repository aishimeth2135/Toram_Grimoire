import type { StatNormalTypes } from '@/lib/Character/Stat'
import { EnchantItem } from '@/lib/Enchant/Enchant'

export interface EnchantStatOptionBase {
  type: StatNormalTypes
  origin: EnchantItem
}
