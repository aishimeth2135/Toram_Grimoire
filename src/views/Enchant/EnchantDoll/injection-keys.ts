import { InjectionKey, Ref } from 'vue'

import { EnchantEquipment, EnchantStat } from '@/lib/Enchant/Enchant'
import EnchantDoll from '@/lib/Enchant/Enchant/doll'

import { SelectItemModes, StepIds } from './setup'

interface EnchantDollInjection {
  currentStep: Ref<StepIds>
  doll: Ref<EnchantDoll>
  negativeStats: Ref<EnchantStat[]>
  autoNegativeStats: Ref<EnchantStat[]>
  resultEquipment: Ref<EnchantEquipment | null>

  backToStep: (stepId: StepIds) => void
  openSelectItem: (mode: SelectItemModes) => void
  removeNegativeStat: (stat: EnchantStat) => void

  equipmentState: {
    autoFindPotentialMinimum: boolean
  }
  positiveStatsState: {
    autoFill: boolean
  }
  negativeStatsState: {
    auto: boolean
    manually: EnchantStat[]
  }
}

const EnchantDollInjectionKey: InjectionKey<EnchantDollInjection> =
  Symbol('enchant-doll')

export { EnchantDollInjectionKey }

export type { EnchantDollInjection }
