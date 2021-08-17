import store from '@/store';

export default function(app) {
  const confirm = item => {
    if (typeof item === 'string') {
      item = {
        message: item,
      };
    }
    const emptyFun = () => {};
    const oldConfirm = item.confirm || emptyFun;
    const oldCancel = item.cancel || emptyFun;
    return new Promise((resolve) => {
      const resItem = {
        message: item.message,
        icon: item.icon,
        confirm: () => {
          oldConfirm();
          resolve(true);
        },
        cancel: () => {
          oldCancel();
          resolve(false);
        },
      };
      store.commit('confirm/appendItem', resItem);
    });
  };
  app.config.globalProperties.$confirm = confirm;
}
