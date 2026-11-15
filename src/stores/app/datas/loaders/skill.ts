import { useCharacterSkillStore } from '@/stores/views/character/skill'

import { DataPathIds } from '@/shared/services/DataPath'
import { InitSkillIcons } from '@/shared/services/Images'

import SkillSystem from '@/lib/Skill'

import { DatasStoreBase } from '../DatasStoreBase'
import { DownloadDatasWithLocale } from '../utils/DownloadDatas'
import {
  downloadSkillDataset,
  hasSkillDatasetSource,
  recoverSkillDatasetModel,
} from '../utils/DownloadSkillDataset'
import { LoadSkill, LoadSkillMain } from '../utils/LoadSkill'

export async function prepareSkill(): Promise<() => Promise<void>> {
  const cloud = hasSkillDatasetSource()
  const data = cloud
    ? await downloadSkillDataset()
    : await DownloadDatasWithLocale(DataPathIds.Skill, DataPathIds.SkillMain)
  const build = ([skillData, skillMainData]: typeof data) => {
    const skillSystem = SkillSystem.create()
    if (skillData.dataVersion) {
      skillSystem.setDataVersion(skillData.dataVersion)
    }
    LoadSkill(skillSystem, skillData, cloud)
    LoadSkillMain(skillSystem, skillMainData, cloud)
    return skillSystem
  }

  return async () => {
    let skillSystem: SkillSystem
    try {
      skillSystem = build(data)
    } catch (error) {
      if (!cloud || !(await recoverSkillDatasetModel())) {
        throw error
      }
      try {
        skillSystem = build(await downloadSkillDataset())
      } catch (previousError) {
        await recoverSkillDatasetModel()
        throw previousError
      }
    }
    await InitSkillIcons()
    useCharacterSkillStore().initSkillRoot(skillSystem.skillRoot)
    DatasStoreBase.Skill = skillSystem
  }
}
