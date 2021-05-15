<template>
  <footer class="app--footer">
    <div class="main-content">
      <cy-button v-if="checkLocalStorage"
        type="inline"
        icon="mdi-weather-night"
        @click="toggleNightMode"
        class="ml-auto mr-4">
        {{ $lang('night mode') }}
      </cy-button>
      <cy-icon-text icon="uil-twitter-alt">
        <a href="https://twitter.com/Cyteria_w" target="_blank" class="text-purple">Cyteria</a>
      </cy-icon-text>
    </div>
  </footer>
</template>

<script>
import CY from "@utils/Cyteria";

export default {
  RegisterLang: 'Footer',
  computed: {
    checkLocalStorage(){
      return CY.storageAvailable('localStorage');
    }
  },
  methods: {
    toggleNightMode(){
      localStorage['Theme--Night-Mode'] = localStorage['Theme--Night-Mode'] !== '1' ? '1' : '0';
      document.documentElement.classList.toggle('theme--night-mode');
    }
  }
};
</script>

<style lang="less" scoped>
footer.app--footer {
  border-top: 1px var(--primary-light) solid;
  margin-top: 2rem;
  background-color: var(--white);
  height: 3rem;

  > .main-content {
    max-width: 50rem;
    margin-left: auto;
    margin-right: auto;
    text-align: right;
    padding: 0.3rem 0.6rem;
    overflow-x: auto;
    white-space: nowrap;
    display: flex;
    align-items: center;
  }
}
</style>