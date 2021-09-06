/* eslint-disable no-console */

import { register } from 'register-service-worker';
import store from '@/store';
import MessageNotify from '@/lib/main/services/Notify';
import GetLang from '@/shared/services/Language';

export default function() {
  if (process.env.NODE_ENV === 'production') {
    register(`${process.env.BASE_URL}sw.js`, {
      ready (registration) {
        if (registration.waiting) {
          store.commit('main/serviceWorkerHasUpdate', registration);
          MessageNotify(GetLang('Settings/update/tips: new version detected'));
        }
      },
      registered () {},
      cached () {},
      updatefound (registration) {
        if (registration.installing) {
          registration.installing.addEventListener('statechange', () => {
            if (registration.waiting && navigator.serviceWorker.controller) {
              store.commit('main/serviceWorkerHasUpdate', registration);
              MessageNotify(GetLang('Settings/update/tips: new version detected'));
            }
          });
        }
      },
      updated () {},
      offline () {
        console.log('No internet connection found. App is running in offline mode.');
      },
      error (error) {
        console.error('Error during service worker registration:', error)
      },
    });

    window.addEventListener('load', () => {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload()
          refreshing = true;
        }
      });
    });
  }
}
