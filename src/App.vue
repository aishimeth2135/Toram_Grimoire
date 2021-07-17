<template>
  <div id="app">
    <app-nav />
    <router-view class="main-section app-main" />
    <app-footer />
    <app-initialize />
    <app-confirm />
    <app-notify />
    <app-loading />
  </div>
</template>

<script>
import { InitLanguageSystem } from "@services/Language";

// app components
import vue_nav from "@/views/app/nav.vue";
import vue_initialize from "@/views/app/initialize.vue";
import vue_footer from "@/views/app/footer.vue";
import vue_notify from "@/views/app/notify.vue";
import vue_loading from "@/views/app/loading.vue";
import vue_confirm from "@/views/app/confirm.vue";

export default {
  name: 'App',
  components: {
    'app-initialize': vue_initialize,
    'app-footer': vue_footer,
    'app-nav': vue_nav,
    'app-notify': vue_notify,
    'app-loading': vue_loading,
    'app-confirm': vue_confirm,
  },
  beforeCreate() {
    InitLanguageSystem();
  },
};
</script>
<style lang="less" scoped>
#app {
  .app-main {
    min-height: calc(100vh - 8rem);
  }

  ::v-deep(.main-section) {
    max-width: 50rem;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
