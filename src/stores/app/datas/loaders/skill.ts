import { useCharacterSkillStore } from '@/stores/views/character/skill'

import { DataPathIds } from '@/shared/services/DataPath'
import { InitSkillIcons } from '@/shared/services/Images'

import SkillSystem from '@/lib/Skill'

import { DatasStoreBase } from '../DatasStoreBase'
import { DownloadDatasWithLocale } from '../utils/DownloadDatas'
import { LoadSkill, LoadSkillMain } from '../utils/LoadSkill'

const initSkillInstance = () => {
  if (DatasStoreBase.Skill === null) {
    DatasStoreBase.Skill = SkillSystem.create()
  }
  return DatasStoreBase.Skill
}

export async function prepareSkill(): Promise<() => Promise<void>> {
  const skillSystem = initSkillInstance()
  const [skillData, skillMainData] = await DownloadDatasWithLocale(
    DataPathIds.Skill,
    DataPathIds.SkillMain
  )
  if (skillData.dataVersion) {
    skillSystem.setDataVersion(skillData.dataVersion)
  }
  return async () => {
    LoadSkill(skillSystem, skillData)
    LoadSkillMain(skillSystem, skillMainData)
    const skillStore = useCharacterSkillStore()
    skillStore.initSkillRoot(skillSystem.skillRoot)

    await InitSkillIcons()
  }
}
