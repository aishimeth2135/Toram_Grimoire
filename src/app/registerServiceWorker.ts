import { register } from 'register-service-worker';

import { useMainStore } from '@/stores/app/main';

import Grimoire from '@/shared/Grimoire';

import Notify from '@/setup/Notify';


export default function() {
  const mainStore = useMainStore();
  const { notify } = Notify();
  if (process.env.NODE_ENV === 'production') {
    register(`${process.env.BASE_URL}sw.js`, {
      ready (registration) {
        if (registration.waiting) {
          mainStore.serviceWorkerHasUpdate(registration);
          notify(Grimoire.i18n.t('app.settings.update.new-version-detected-tips'));
        }
      },
      registered () {},
      cached () {},
      updatefound (registration) {
        if (registration.installing) {
          registration.installing.addEventListener('statechange', () => {
            if (registration.waiting && navigator.serviceWorker.controller) {
              mainStore.serviceWorkerHasUpdate(registration);
              notify(Grimoire.i18n.t('app.settings.update.new-version-detected-tips'));
            }
          });
        }
      },
      updated () {},
      offline () {
        console.log('No internet connection found. App is running in offline mode.');
      },
      error (error) {
        console.error('Error during service worker registration:', error);
      },
    });

    window.addEventListener('load', () => {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    });
  }
}
