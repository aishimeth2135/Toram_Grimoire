import { LocalStorageService } from '@/shared/services/Storage'

import type { CharacterSaveData } from '@/lib/Character/Character'
import type { CharacterBuildLabelSaveData } from '@/lib/Character/Character/CharacterBuildLabel'
import type { EquipmentSaveData } from '@/lib/Character/CharacterEquipment'
import type { FoodsBuildSaveData } from '@/lib/Character/FoodBuild'
import type { PotionBuildSaveData } from '@/lib/Character/PotionBuild'
import type { RegistletBuildSaveData } from '@/lib/Character/RegistletBuild'
import type { SkillBuildSaveData } from '@/lib/Character/SkillBuild'

export interface EquipmentSaveDataWithIndex extends EquipmentSaveData {
  idx: number
}

export interface CharacterStoreSaveSummary {
  characterIndex: number
}

interface CharacterStoreCharacterStateSaveData {
  id: number
  skillBuildId: number | null
  foodBuildId: number | null
  registletBuildId: number | null
  potionBuildId: number | null
}

export interface CharacterSimulatorSaveData {
  version: string
  characters: CharacterSaveData[]
  characterStates: CharacterStoreCharacterStateSaveData[]
  equipments: EquipmentSaveDataWithIndex[]
  skillBuilds: SkillBuildSaveData[]
  foodBuilds: FoodsBuildSaveData[]
  registletBuilds: RegistletBuildSaveData[]
  potionBuilds: PotionBuildSaveData[]
  buildLabels: CharacterBuildLabelSaveData[]
}

export interface CharacterSimulatorSaveDataRoot {
  summary: CharacterStoreSaveSummary
  datas: CharacterSimulatorSaveData
}

export const V2_AUTO_SAVE_STORAGE_KEY = 'app--character-simulator--data-v2--auto'

export function deleteCharacterSimulatorSaveData() {
  return LocalStorageService.removeItem(V2_AUTO_SAVE_STORAGE_KEY)
}

export function loadCharacterSimulatorSaveDataRoot() {
  return LocalStorageService.getJson<CharacterSimulatorSaveDataRoot>(V2_AUTO_SAVE_STORAGE_KEY)
}

export function saveCharacterSimulatorSaveDataRoot(data: CharacterSimulatorSaveDataRoot) {
  return LocalStorageService.setJson(V2_AUTO_SAVE_STORAGE_KEY, data)
}
