<template>
  <div id="app">
    <template v-if="languageStore.i18nMessageLoaded">
      <AppNav />
      <AppLeftMenu />
      <router-view class="main-section app-main" />
      <AppFooter />
      <AppInitialize />
      <AppConfirm />
      <AppNotify />
      <AppLoading />
    </template>
    <div v-else class="fixed w-full h-full top-0 left-0 flex items-center justify-center bg-white z-100">
      <div class="flex justify-center flex-wrap">
        <LoadingAnimation :status="0" />
        <div class="text-xl w-full text-center mt-2 text-light-2">
          Load language data...
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'App',
};
</script>

<script lang="ts" setup>
import { onMounted } from 'vue';

import { useLanguageStore } from '@/stores/app/language';

import AppNav from '@/views/app/nav.vue';
import AppLeftMenu from '@/views/app/left-menu.vue';
import AppFooter from '@/views/app/footer.vue';
import AppInitialize from '@/views/app/initialize.vue';
import AppLoading from '@/views/app/loading.vue';
import AppNotify from '@/views/app/notify.vue';
import AppConfirm from '@/views/app/confirm.vue';
import LoadingAnimation from '@/views/app/initialization/loading-animation.vue';

onMounted(() => {
  const el = document.getElementById('app--error');
  if (el) {
    el.parentElement!.removeChild(el);
  }
});

const languageStore = useLanguageStore();
languageStore.updateLocaleMessages();
</script>

<style lang="less" scoped>
#app {
  .app-main {
    min-height: calc(100vh - 8rem);
  }

  &::v-deep(.main-section) {
    max-width: 48rem;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
