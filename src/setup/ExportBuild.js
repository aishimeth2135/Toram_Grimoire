import CY from '@utils/Cyteria';
import RegisterLang from './RegisterLang';
import Notify from './Notify';

/**
 * @param {Object} params
 * @param {function(function(string, string): void): void} params.save
 * @param {function(string): void} params.loaded
 */
export default function({ save, loaded }) {
  const { lang } = RegisterLang('common/Export build');
  const { notify } = Notify();

  const exportBuild = () => {
    try {
      const handleSave = (fileName, dataString) => {
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
