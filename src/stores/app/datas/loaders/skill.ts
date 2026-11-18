import { useCharacterSkillStore } from '@/stores/views/character/skill'

import { InitSkillIcons } from '@/shared/services/Images'

import SkillSystem from '@/lib/Skill'

import { DatasStoreBase } from '../DatasStoreBase'
import { downloadSkillDataset, recoverSkillDatasetModel } from '../utils/DownloadSkillDataset'
import { LoadSkill, LoadSkillMain } from '../utils/LoadSkill'

export async function prepareSkill(): Promise<() => Promise<void>> {
  const data = await downloadSkillDataset()
  const build = ([skillData, skillMainData]: typeof data) => {
    const skillSystem = SkillSystem.create()
    LoadSkill(skillSystem, skillData)
    LoadSkillMain(skillSystem, skillMainData)
    return skillSystem
  }

  return async () => {
    let skillSystem: SkillSystem
    try {
      skillSystem = build(data)
    } catch (error) {
      if (!(await recoverSkillDatasetModel())) {
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
