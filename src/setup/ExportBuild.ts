import CY from '@/shared/utils/Cyteria';
import RegisterLang from './RegisterLang';
import Notify from './Notify';

type ExportBuildsSaveHandler = (fileName: string, dataString: string) => void;

type ExportBuildsOptions = {
  save: (handleSave: ExportBuildsSaveHandler) => void
  loaded: (dataResult: string) => void 
}

export default function({ save, loaded }: ExportBuildsOptions) {
  const { lang } = RegisterLang('common/Export build');
  const { notify } = Notify();

  const exportBuild = () => {
    try {
      const handleSave: ExportBuildsSaveHandler = (fileName, dataString) => {
        CY.file.save({
          data: dataString,
          fileName,
        });
      };
      save(handleSave);
    } catch (error) {
      notify(lang('message: unknow error when save'));
      return;
    }
  };

  const importBuild = () => {
    CY.file.load({
      succeed: res => {
        try {
          loaded(res);
          notify(lang('message: load successfully'));
        } catch (error) {
          notify(lang('message: load failed'));
        }
      },
      error: () => notify(lang('message: unknow error when load')),
      checkFileType: fileType => {
        if (fileType !== 'txt') {
          notify(lang('message: wrong type of .txt file'));
          return false;
        }
        return true;
      },
    });
  };

  return {
    exportBuild,
    importBuild,
  };
}
