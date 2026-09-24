import { DataPersistenceService } from '@/shared/services/DataPersistenceService'

import type { CharacterSaveData } from '@/lib/Character/Character'
import type { CharacterBuildLabelSaveData } from '@/lib/Character/Character'
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

export interface DamageCalculationSelectionSaveData {
  skillStates: Record<string, { enabled: boolean }>
  skillBranchStates: Record<string, { enabled: boolean }>
}

export interface SkillOptionsSaveData {
  skillBranchStates?: Record<string, { enabled: boolean }>
  stackValues: Record<string, number>
  formulaExtraValues: Record<string, Record<string, number>>
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
  damageCalc?: DamageCalculationSelectionSaveData
  skillOptions?: SkillOptionsSaveData
}

export interface CharacterSimulatorSaveDataRoot {
  summary: CharacterStoreSaveSummary
  datas: CharacterSimulatorSaveData
}

export const V2_AUTO_SAVE_STORAGE_KEY = 'app--character-simulator--data-v2--auto'

export const CharacterPersistenceService =
  new DataPersistenceService<CharacterSimulatorSaveDataRoot>({
    legacyKey: V2_AUTO_SAVE_STORAGE_KEY,
    compressedKey: 'app--character-simulator--lz-v1',
  })
