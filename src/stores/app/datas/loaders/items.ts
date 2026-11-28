import { DataPathIds } from '@/shared/services/DataPath'
import { InitCrystalIcons } from '@/shared/services/Images'

import ItemsSystem from '@/lib/Items'

import { DatasStoreBase } from '../DatasStoreBase'
import { DownloadDatas } from '../utils/DownloadDatas'
import {
  downloadEquipmentDataset,
  recoverEquipmentDataset,
} from '../utils/DownloadEquipmentDataset'
import { LoadCrystals } from '../utils/LoadCrystals'
import { LoadEquipments } from '../utils/LoadEquipments'
import { LoadPotions } from '../utils/LoadPotions'

const initItemsInstance = () => {
  if (DatasStoreBase.Items === null) {
    DatasStoreBase.Items = ItemsSystem.create()
  }
  return DatasStoreBase.Items
}

export async function prepareItems(): Promise<() => Promise<void>> {
  const itemSystem = initItemsInstance()
  const equipmentData = await downloadEquipmentDataset()
  return async () => {
    const build = (data: typeof equipmentData) => {
      const draft = ItemsSystem.create()
      LoadEquipments(draft, data, true)
      return draft.equipments
    }
    try {
      itemSystem.equipments = build(equipmentData)
    } catch (error) {
      if (!(await recoverEquipmentDataset())) {
        throw error
      }
      itemSystem.equipments = build(await downloadEquipmentDataset())
    }
  }
}

export async function prepareCrystals(): Promise<() => Promise<void>> {
  const itemSystem = initItemsInstance()
  const [crystalData] = await DownloadDatas(DataPathIds.Crystal)
  return async () => {
    LoadCrystals(itemSystem, crystalData.baseData)
    await InitCrystalIcons()
  }
}

export async function prepareItemsPotion(): Promise<() => Promise<void>> {
  const itemsSystem = initItemsInstance()
  const [potionData] = await DownloadDatas(DataPathIds.Potion)
  return async () => {
    LoadPotions(itemsSystem.potionsRoot, potionData.baseData)
  }
}
