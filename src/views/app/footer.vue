<template>
  <footer>
    <div class="content">
      <cy-button iconify-name="mdi-weather-night"
        v-if="checkLocalStorage"
        @click="toggleNightMode"
        class="border-0 p-0">
        {{ langText('night mode') }}
      </cy-button>
      <cy-icon-text iconify-name="ant-design:home-outlined">
        <a href="https://home.gamer.com.tw/homeindex.php?owner=mushroom2135">{{ langText('baha home') }}</a>
      </cy-icon-text>
      <cy-icon-text iconify-name="ant-design:twitter-outlined">
        <a href="https://twitter.com/Cyteria_w">Cyteria</a>
      </cy-icon-text>
    </div>
  </footer>
</template>

<script>
  import CY from "@Utils/Cyteria";
  import GetLang from "@Services/Language";

  export default {
    computed: {
      checkLocalStorage(){
        return CY.storageAvailable('localStorage');
      }
    },
    methods: {
      toggleNightMode(){
        localStorage['Theme--Night-Mode'] = localStorage['Theme--Night-Mode'] !== '1' ? '1' : '0';
        document.documentElement.classList.toggle('theme--night-mode');
      },
      langText(v, vs){
        return GetLang('Footer/' + v, vs);
      }
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';

  footer {
    border-top: 1px var(--primary-light) solid;
    margin-top: 2rem;
    background-color: var(--white);
    height: 3rem;

    > .content {
      max-width: 50rem;
      margin-left: auto;
      margin-right: auto;
      text-align: right;
      padding: 0.3rem 0.6rem;
      overflow-x: auto;
      white-space: nowrap;

      @{deep} span {
        margin-left: 1rem;
      }
    }
  }
</style>