import { onUnmounted } from 'vue';
import { GetLang } from '@services/Language';
import { MessageNotify } from '@services/Notify';

/**
 * @param {function} save
 */
export default function ({ save, loadFirst }) {
  try {
    loadFirst();
  } catch (error) {
    MessageNotify(GetLang('common/Auto Save/message: unknow error when load'));
    return;
  }
  const originalSave = save;
  save = () => {
    try {
      originalSave();
    } catch (error) {
      MessageNotify(GetLang('common/Auto Save/message: unknow error when save'));
    }
  };
  const beforeunload = () => save();
  const visibilitychange = () => document.visibilityState === 'hidden' && save();
  window.addEventListener('beforeunload', beforeunload);
  document.addEventListener('visibilitychange', visibilitychange);
  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeunload);
    document.removeEventListener('visibilitychange', visibilitychange);
    save();
  });
}
