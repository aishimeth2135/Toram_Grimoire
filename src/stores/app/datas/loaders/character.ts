import { DataPathIds } from '@/shared/services/DataPath'
import { InitEquipmentIcons } from '@/shared/services/Images'

import CharacterSystem from '@/lib/Character'

import { DatasStoreBase } from '../DatasStoreBase'
import { DownloadDatasWithLocale } from '../utils/DownloadDatas'
import { downloadStatDataset, hasSkillDatasetSource } from '../utils/DownloadSkillDataset'
import { LoadCharacterStats } from '../utils/LoadCharacterStat'
import { LoadStats } from '../utils/LoadStats'

const initCharacterInstance = () => {
  if (DatasStoreBase.Character === null) {
    DatasStoreBase.Character = CharacterSystem.create()
  }
  return DatasStoreBase.Character
}

export async function prepareStats(): Promise<() => Promise<void>> {
  const characterSystem = initCharacterInstance()
  const statsData =
    (hasSkillDatasetSource() ? await downloadStatDataset() : null) ??
    (await DownloadDatasWithLocale(DataPathIds.Stats))[0]
  return async () => {
    LoadStats(characterSystem, statsData)
    await InitEquipmentIcons()
  }
}

export async function prepareCharacterStats(): Promise<() => Promise<void>> {
  const characterSystem = initCharacterInstance()
  const [characterStatsData] = await DownloadDatasWithLocale(DataPathIds.CharacterStats)
  return async () => {
    LoadCharacterStats(characterSystem, characterStatsData)
  }
}
