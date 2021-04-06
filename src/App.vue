<template>
  <div id="app">
    <app-nav />
    <router-view class="main-section app-main" />
    <app-footer />
    <app-loading />
    <app-show-message />
  </div>
</template>

<script>
  // app components
  import vue_nav from "@views/app/nav.vue";
  import vue_loading from "@views/app/loading.vue";
  import vue_footer from "@views/app/footer.vue";
  import vue_showMessage from "@views/app/show-message.vue";

  export default {
    name: 'app',
    components: {
      'app-loading': vue_loading,
      'app-footer': vue_footer,
      'app-nav': vue_nav,
      'app-show-message': vue_showMessage
    }
  };
</script>
<style lang="less" scoped>
  @deep: ~'>>>';

  #app {
    .app-main {
      min-height: calc(100vh - 8rem);
    }

    @{deep} .main-section {
      max-width: 50rem;
      margin-left: auto;
      margin-right: auto;
    }
  }
</style>
