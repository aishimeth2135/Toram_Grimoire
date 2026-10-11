import { DataPathIds } from '@/shared/services/DataPath'

import EquipmentTraitSystem from '@/lib/EquipmentTrait'

import { DatasStoreBase } from '../DatasStoreBase'
import { DownloadDatasWithLocale } from '../utils/DownloadDatas'
import { LoadEquipmentTraits } from '../utils/LoadEquipmentTrait'

const initEquipmentTraitInstance = () => {
  if (DatasStoreBase.EquipmentTrait === null) {
    DatasStoreBase.EquipmentTrait = EquipmentTraitSystem.create()
  }
  return DatasStoreBase.EquipmentTrait
}

export async function prepareEquipmentTrait(): Promise<() => Promise<void>> {
  const equipmentTraitSystem = initEquipmentTraitInstance()
  const [equipmentTraitData] = await DownloadDatasWithLocale(DataPathIds.EquipmentTrait)
  return async () => {
    LoadEquipmentTraits(equipmentTraitSystem, equipmentTraitData)
  }
}
