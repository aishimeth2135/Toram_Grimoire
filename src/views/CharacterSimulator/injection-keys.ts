import { InjectionKey } from 'vue'

import { CharacterComboSkill } from '@/lib/Character/CharacterCombo'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import { CharacterEquipmentEditModes } from './character-equipment-details/setup'
import { TabIds } from './setup'

interface CharacterSimulatorInjection {
  editEquipment: (
    equipment: CharacterEquipment,
    mode?: CharacterEquipmentEditModes
  ) => void
  selectComboSkill: (comboSkill: CharacterComboSkill) => void
  setCurrentTab: (tabId: TabIds) => void
  characterSimulatorOptions: {
    characterStatsDetailPreviewVisible: boolean
  }
}

export const CharacterSimulatorInjectionKey: InjectionKey<CharacterSimulatorInjection> =
  Symbol('character-simulator')
