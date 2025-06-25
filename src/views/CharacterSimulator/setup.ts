import { reactive, shallowReactive, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { ViewNames } from '@/shared/consts/view'
import { defineViewState } from '@/shared/setup/State'

import type { CharacterComboSkill } from '@/lib/Character/CharacterCombo'
import type { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import type { CharacterEquipmentEditModes } from './character-equipment-details/setup'

export const useCharacterSimulatorState = defineViewState(ViewNames.CharacterSimulator, () => {
  const router = useRouter()

  const editedCurrentEquipment = shallowRef<CharacterEquipment | null>(null)
  const editedEquipmentEditMode = shallowRef<CharacterEquipmentEditModes | null>(null)
  const currentComboSkillState = shallowReactive({
    current: null as CharacterComboSkill | null,
  })

  const editEquipment = (equip: CharacterEquipment, initMode?: CharacterEquipmentEditModes) => {
    editedCurrentEquipment.value = equip
    editedEquipmentEditMode.value = initMode ?? null
  }
  const selectComboSkill = (comboSkill: CharacterComboSkill) => {
    currentComboSkillState.current = comboSkill
  }

  const characterSimulatorOptions = reactive({
    characterStatsDetailPreviewVisible: false,
  })

  return {
    editedCurrentEquipment,
    editedEquipmentEditMode,
    editEquipment,
    selectComboSkill,
    characterSimulatorOptions,
    setCurrentTab: (pathName: string) => router.push({ name: pathName }),
  }
})
