<template>
  <footer>
    <cy-button iconify-name="mdi-weather-night"
      v-if="checkLocalStorage"
      @click="toggleNightMode"
      class="no-border no-padding">
      {{ langText('night mode') }}
    </cy-button>
    <cy-icon-text iconify-name="ant-design:home-outlined">
      <a href="https://home.gamer.com.tw/homeindex.php?owner=mushroom2135">{{ langText('baha home') }}</a>
    </cy-icon-text>
    <cy-icon-text iconify-name="ant-design:twitter-outlined">
      <a href="https://twitter.com/Cyteria_w">Cyteria</a>
    </cy-icon-text>
  </footer>
</template>

<script>
  import CY from "@global-modules/cyteria.js";
  import GetLang from "@global-modules/LanguageSystem.js";

  export default {
    computed: {
      checkLocalStorage(){
        return CY.storageAvailable('localStorage');
      }
    },
    methods: {
      toggleNightMode(){
        localStorage['Theme--Night-Mode'] = localStorage['Theme--Night-Mode'] !== '1' ? '1' : '0';
        document.body.classList.toggle('theme--night-mode');
      },
      langText(v, vs){
        return GetLang('Footer/' + v, vs);
      }
    }
  };
</script>

<style lang="less" scoped>
  @deep-operator: ~'>>>';

  footer {
    border-top: 1px var(--primary-light) solid;
    margin-top: 2rem;

    text-align: right;
    padding: 0.3rem 0.6rem;
    overflow-x: auto;
    white-space: nowrap;

    @{deep-operator} span {
      margin-left: 1rem;
    }
  }
</style>