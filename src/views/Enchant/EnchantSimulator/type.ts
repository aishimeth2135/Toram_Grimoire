import { StatTypes } from '@/lib/Character/Stat/enums'
import { EnchantItem } from '@/lib/Enchant/Enchant'

interface SelectItemTarget {
  type: 'step' | 'doll';
  target: any;
  once: boolean;
}

interface EnchantItemData {
  id: string;
  type: StatTypes;
  origin: EnchantItem;
}

export {
  SelectItemTarget,
  EnchantItemData,
}
