<template>
  <div id="app">
    <AppNav />
    <router-view class="main-section app-main" />
    <AppFooter />
    <AppInitialize />
    <AppConfirm />
    <AppNotify />
    <AppLoading />
  </div>
</template>

<script lang="ts">
export default {
  name: 'App',
};
</script>

<script lang="ts" setup>
import { onMounted } from 'vue';

import AppConfirm from '@/views/app/confirm.vue';
import AppFooter from '@/views/app/footer.vue';
import AppInitialize from '@/views/app/initialize.vue';
import AppLoading from '@/views/app/loading.vue';
import AppNav from '@/views/app/nav.vue';
import AppNotify from '@/views/app/notify.vue';


onMounted(() => {
  const el = document.getElementById('app--error');
  if (el) {
    el.parentElement!.removeChild(el);
  }
});
</script>

<style lang="less" scoped>
#app {
  .app-main {
    min-height: calc(100vh - 8rem);
  }

  &::v-deep(.main-section) {
    max-width: 50rem;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
