import { DataPathIds } from '@/shared/services/DataPath'

import EnchantSystem from '@/lib/Enchant'

import { DatasStoreBase } from '../DatasStoreBase'
import { DownloadDatas } from '../utils/DownloadDatas'
import { LoadEnchant } from '../utils/LoadEnchant'

const initEnchantInstance = () => {
  if (DatasStoreBase.Enchant === null) {
    DatasStoreBase.Enchant = EnchantSystem.create()
  }
  return DatasStoreBase.Enchant
}

export async function prepareEnchant(): Promise<() => Promise<void>> {
  const enchantSystem = initEnchantInstance()
  const [enchantData] = await DownloadDatas(DataPathIds.Enchant)
  return async () => {
    LoadEnchant(enchantSystem, enchantData.baseData)
  }
}
