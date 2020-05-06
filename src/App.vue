<template>
  <div id="app">
    <app-nav />
    <router-view class="main-section" />
    <app-footer class="main-section" />
    <app-loading />
  </div>
</template>

<script>
  // app components
  import vue_nav from "@views/app/nav.vue";
  import vue_loading from "@views/app/loading.vue";
  import vue_footer from "@views/app/footer.vue"; 

  export default {
    name: 'app',
    components: {
      'app-loading': vue_loading,
      'app-footer': vue_footer,
      'app-nav': vue_nav
    }
  };
</script>

<style lang="less" scoped>
  @deep-operator: ~'>>>';

  #app {
    @{deep-operator} .main-section {
      max-width: 50rem;
      margin-left: auto;
      margin-right: auto;
    }
  }
</style>
