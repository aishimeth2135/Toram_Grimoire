import { DataPathIds } from '@/shared/services/DataPath'

import RegistletSystem from '@/lib/Registlet'

import { DatasStoreBase } from '../DatasStoreBase'
import { DownloadDatas } from '../utils/DownloadDatas'
import { LoadRegistlet } from '../utils/LoadRegistlet'

const initRegistletInstance = () => {
  if (DatasStoreBase.Registlet === null) {
    DatasStoreBase.Registlet = RegistletSystem.create()
  }
  return DatasStoreBase.Registlet
}

export async function prepareRegistlet(): Promise<() => Promise<void>> {
  const registSystem = initRegistletInstance()
  const [registletData] = await DownloadDatas(DataPathIds.Registlet)
  return async () => {
    LoadRegistlet(registSystem, registletData.baseData)
  }
}
