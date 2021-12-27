<template>
  <div id="app">
    <template v-if="store.state.language.i18nMessageLoaded">
      <AppNav />
      <AppLeftMenu />
      <router-view class="main-section app-main" />
      <AppFooter />
      <AppInitialize />
      <AppConfirm />
      <AppNotify />
      <AppLoading />
    </template>
    <div class="fixed w-full h-full flex items-center justify-center bg-white">
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
import { useStore } from 'vuex';

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

const store = useStore();
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
