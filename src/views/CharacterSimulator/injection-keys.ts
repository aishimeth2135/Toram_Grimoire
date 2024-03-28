import { InjectionKey } from 'vue'

import { CharacterComboSkill } from '@/lib/Character/CharacterCombo'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import { CharacterSimulatorRouteNames } from '@/router/Character'

import { CharacterEquipmentEditModes } from './character-equipment-details/setup'

interface CharacterSimulatorInjection {
  editEquipment: (
    equipment: CharacterEquipment,
    mode?: CharacterEquipmentEditModes
  ) => void
  selectComboSkill: (comboSkill: CharacterComboSkill) => void
  setCurrentTab: (pathName: CharacterSimulatorRouteNames) => void
  characterSimulatorOptions: {
    characterStatsDetailPreviewVisible: boolean
  }
}

export const CharacterSimulatorInjectionKey: InjectionKey<CharacterSimulatorInjection> =
  Symbol('character-simulator')
