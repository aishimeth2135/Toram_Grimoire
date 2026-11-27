import Grimoire from '@/shared/Grimoire'

import { StatComputed } from '@/lib/Character/Stat'
import RegistletSystem from '@/lib/Registlet'
import {
  RegistletItemBaseSkill,
  RegistletItemBaseSpecial,
  RegistletItemBaseStat,
  RegistletItemRow,
} from '@/lib/Registlet/RegistletItem'

import { DatasStoreBase } from '../DatasStoreBase'
import {
  type RegistletDatasetItem,
  downloadRegistletDataset,
  recoverRegistletDatasetModel,
} from '../utils/DownloadRegistletDataset'
import { parseStatValueDataRaw } from '../utils/utils'

export function buildRegistletDataset(records: RegistletDatasetItem[]) {
  const root = RegistletSystem.create()
  for (const record of records) {
    const infos = { ...record, publicId: record.id }
    if (record.category === 'stat') {
      const row = record.groups.find(({ key }) => key === 'stat')?.rows[0]
      if (!row) {
        continue
      }

      const { value: id, type } = parseStatValueDataRaw(row.key)
      const stat = Grimoire.Character.findStatBase(id)
      if (stat) {
        const item = RegistletItemBaseStat.create(root.statCategory, infos, stat, type)
        item.rows.push(RegistletItemRow.create('value', row.value))
        root.statCategory.appendItem(item)
      }
    } else {
      const rows = record.groups.find(({ key }) => key === 'caption')?.rows ?? []
      const captions = rows.map(({ key, value }) => RegistletItemRow.create(key, value))
      if (record.category === 'skill') {
        const skills = record.skillIds.flatMap(id => {
          const skill = Grimoire.Skill.skillRoot.findSkillById(id)
          return skill ? [skill] : []
        })
        const item = RegistletItemBaseSkill.create(root.skillCategory, infos, skills)
        item.rows.push(...captions)
        root.skillCategory.appendItem(item)
      } else {
        const item = RegistletItemBaseSpecial.create(root.specialCategory, infos)
        item.rows.push(...captions)
        for (const row of record.groups.find(({ key }) => key === 'buff_stat')?.rows ?? []) {
          const { value: id, type } = parseStatValueDataRaw(row.key)
          const stat = Grimoire.Character.findStatBase(id)
          if (stat) {
            item.buffStats ??= []
            item.buffStats.push(StatComputed.create(stat, type, row.value))
          }
        }
        root.specialCategory.appendItem(item)
      }
    }
  }
  return root
}

export async function prepareRegistlet(): Promise<() => Promise<void>> {
  const data = await downloadRegistletDataset()
  return async () => {
    try {
      DatasStoreBase.Registlet = buildRegistletDataset(data)
    } catch (error) {
      if (!(await recoverRegistletDatasetModel())) {
        throw error
      }
      DatasStoreBase.Registlet = buildRegistletDataset(await downloadRegistletDataset())
    }
  }
}
