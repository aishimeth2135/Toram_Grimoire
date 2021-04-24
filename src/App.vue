<template>
  <div id="app">
    <app-nav />
    <router-view class="main-section app-main" />
    <app-footer />
    <app-initialize />
    <app-notify />
  </div>
</template>

<script>
  // app components
  import vue_nav from "@views/app/nav.vue";
  import vue_initialize from "@views/app/initialize.vue";
  import vue_footer from "@views/app/footer.vue";
  import vue_notify from "@views/app/notify.vue";

  export default {
    name: 'app',
    components: {
      'app-initialize': vue_initialize,
      'app-footer': vue_footer,
      'app-nav': vue_nav,
      'app-notify': vue_notify
    }
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
