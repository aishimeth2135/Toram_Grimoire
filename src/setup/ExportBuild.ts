import { useI18n } from 'vue-i18n'

import CY from '@/shared/utils/Cyteria'

import Notify from './Notify'

type ExportBuildsSaveHandler = (fileName: string, dataString: string) => void

type ExportBuildsOptions = {
  readonly save: (handleSave: ExportBuildsSaveHandler) => void
  readonly loaded: (dataResult: string) => void
}

export default function ExportBuild({ save, loaded }: ExportBuildsOptions) {
  const { t } = useI18n()
  const { notify } = Notify()

  const exportBuild = () => {
    try {
      const handleSave: ExportBuildsSaveHandler = (fileName, dataString) => {
        CY.file.save({
          data: dataString,
          fileName,
        })
      }
      save(handleSave)
    } catch (error) {
      notify(t('common.export-build.save-unknow-error-tips'))
      return
    }
  }

  const importBuild = () => {
    CY.file.load({
      succeed: res => {
        try {
          loaded(res)
          notify(t('common.export-build.load-success-tips'))
        } catch (error) {
          notify(t('common.export-build.load-failed-tips'))
        }
      },
      error: () => notify(t('common.export-build.load-unknow-error-tips')),
      checkFileType: fileType => {
        if (fileType !== 'txt') {
          notify(t('common.export-build.load-wrong-file-type-tips'))
          return false
        }
        return true
      },
    })
  }

  return {
    exportBuild,
    importBuild,
  }
}
