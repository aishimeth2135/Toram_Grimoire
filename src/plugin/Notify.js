import MessageNotify from '@/shared/services/Notify';

import store from '@/store';

export default function(app) {
  app.config.globalProperties.$notify = MessageNotify;
  app.config.globalProperties.$notify.loading = {
    show() {
      store.commit('notify/loading/show');
    },
    hide() {
      store.commit('notify/loading/hide');
    },
  };
}
