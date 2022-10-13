import { StatNormalTypes } from '@/lib/Character/Stat/enums'
import { EnchantItem } from '@/lib/Enchant/Enchant'

export interface EnchantStatOptionBase {
  type: StatNormalTypes
  origin: EnchantItem
}
