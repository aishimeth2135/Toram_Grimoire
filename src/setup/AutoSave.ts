import { onUnmounted } from 'vue';
import RegisterLang from './RegisterLang';
import Notify from './Notify';

type AutoSaveOptions = {
  save: () => void
  loadFirst: () => void
}

export default function ({ save, loadFirst }: AutoSaveOptions): void {
  const { lang } = RegisterLang('common/Export build');
  const { notify } = Notify();

  try {
    loadFirst();
  } catch (error) {
    notify(lang('common/Auto Save/message: unknow error when load'));
    return;
  }
  const saveHandler = () => {
    try {
      save();
    } catch (error) {
      notify(lang('common/Auto Save/message: unknow error when save'));
    }
  };
  const beforeunload = () => saveHandler();
  const visibilitychange = () => document.visibilityState === 'hidden' && saveHandler();
  window.addEventListener('beforeunload', beforeunload);
  document.addEventListener('visibilitychange', visibilitychange);
  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeunload);
    document.removeEventListener('visibilitychange', visibilitychange);
    saveHandler();
  });
}
