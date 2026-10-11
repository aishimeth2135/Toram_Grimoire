import { DataPathIds } from '@/shared/services/DataPath'

import GlossarySystem from '@/lib/Glossary'

import { DatasStoreBase } from '../DatasStoreBase'
import { DownloadDatasWithLocale } from '../utils/DownloadDatas'
import { LoadGlossaryTag } from '../utils/LoadGlossary'

const initGlossaryInstance = () => {
  if (DatasStoreBase.Glossary === null) {
    DatasStoreBase.Glossary = GlossarySystem.create()
  }
  return DatasStoreBase.Glossary
}

export async function prepareGlossary(): Promise<() => Promise<void>> {
  const glossarySystem = initGlossaryInstance()
  const [glossaryData] = await DownloadDatasWithLocale(DataPathIds.Glossary)
  return async () => {
    LoadGlossaryTag(glossarySystem, glossaryData)
  }
}
