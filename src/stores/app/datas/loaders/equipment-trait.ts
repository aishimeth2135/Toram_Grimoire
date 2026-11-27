import { useLocaleStore } from '@/stores/app/locale'

import { AppStorageService } from '@/shared/services/AppStorageService'

import EquipmentTraitSystem from '@/lib/EquipmentTrait'

import { DatasStoreBase } from '../DatasStoreBase'
import {
  type EquipmentTraitDatasetItem,
  type EquipmentTraitTranslations,
  downloadEquipmentTraitDataset,
  recoverEquipmentTraitDataset,
} from '../utils/DownloadEquipmentTraitDataset'
import { applyEquipmentTraitRow } from '../utils/LoadEquipmentTrait'

export function buildEquipmentTraitDataset(
  records: EquipmentTraitDatasetItem[],
  primary: (typeof AppStorageService.LOCALE_LIST)[number],
  fallback: (typeof AppStorageService.LOCALE_LIST)[number]
) {
  const root = EquipmentTraitSystem.create()
  const localize = (value: string, translations: EquipmentTraitTranslations) => {
    if (primary === 'zh-TW') {
      return value
    }
    return translations[primary] || (fallback !== 'zh-TW' && translations[fallback]) || value
  }
  for (const { number, category, name, maxLevel, groups, translations, uid } of records) {
    const item = root.appendEquipmentTraitItem(
      String(number),
      category,
      localize(name, translations),
      uid
    )
    item.maxLevel = maxLevel
    for (const group of groups) {
      for (const row of group.rows) {
        applyEquipmentTraitRow(item, group.key, row.key, localize(row.value, row.translations))
      }
    }
  }
  return root
}

export async function prepareEquipmentTrait(): Promise<() => Promise<void>> {
  const locale = useLocaleStore()
  const primary = AppStorageService.LOCALE_LIST[locale.primaryLocaleIndex]
  const fallback = AppStorageService.LOCALE_LIST[locale.fallbackLocaleIndex]
  const records = await downloadEquipmentTraitDataset()
  return async () => {
    try {
      DatasStoreBase.EquipmentTrait = buildEquipmentTraitDataset(records, primary, fallback)
    } catch (error) {
      if (!(await recoverEquipmentTraitDataset())) {
        throw error
      }
      DatasStoreBase.EquipmentTrait = buildEquipmentTraitDataset(
        await downloadEquipmentTraitDataset(),
        primary,
        fallback
      )
    }
  }
}
