import GlossarySystem from '@/lib/Glossary'

import { DatasStoreBase } from '../DatasStoreBase'
import {
  downloadGlossaryDataset,
  recoverGlossaryDatasetModel,
} from '../utils/DownloadGlossaryDataset'
import { LoadGlossaryTag } from '../utils/LoadGlossary'

export async function prepareGlossary(): Promise<() => Promise<void>> {
  const data = await downloadGlossaryDataset()
  const build = (source: typeof data) => {
    const glossary = GlossarySystem.create()
    LoadGlossaryTag(glossary, source)
    return glossary
  }
  return async () => {
    try {
      DatasStoreBase.Glossary = build(data)
    } catch (error) {
      if (!(await recoverGlossaryDatasetModel())) {
        throw error
      }
      DatasStoreBase.Glossary = build(await downloadGlossaryDataset())
    }
  }
}
