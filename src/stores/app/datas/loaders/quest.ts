import { DataPathIds } from '@/shared/services/DataPath'

import QuestSystem from '@/lib/Quest'

import { DatasStoreBase } from '../DatasStoreBase'
import { DownloadDatas } from '../utils/DownloadDatas'
import { LoadQuests } from '../utils/LoadQuests'

const initQuestInstance = () => {
  if (DatasStoreBase.Quest === null) {
    DatasStoreBase.Quest = QuestSystem.create()
  }
  return DatasStoreBase.Quest
}

export async function prepareQuest(): Promise<() => Promise<void>> {
  const questSystem = initQuestInstance()
  const [mainQuestData] = await DownloadDatas(DataPathIds.Quest)
  return async () => {
    LoadQuests(questSystem, mainQuestData.baseData)
  }
}
