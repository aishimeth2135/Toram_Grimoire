<template>
    <nav class="app--nav">
      <app-left-menu />
      <div class="content">
        <template v-for="(item, i) in items">
          <iconify-icon v-if="i != 0" name="ic-round-keyboard-arrow-right" :key="item.path + '-icon'" />
          <span :key="item.path + '-text'">
            <router-link v-if="i != items.length - 1" :to="item.path" v-slot="{ navigate }" custom>
              <span class="link-btn" @click="navigate" @keypress.enter="navigate" role="link">{{ item.title }}</span>
            </router-link>
            <template v-else>
              {{ item.title }}
            </template>
          </span>
        </template>
      </div>
      <span class="setting-button">
        <app-settings />
      </span>
    </nav>
</template>

<script>
  import Vuex from 'vuex';

  import vue_leftMenu from "./left-menu.vue";
  import vue_settings from "./settings.vue";

  export default {
    computed: {
      ...Vuex.mapState('nav', ['items'])
    },
    components: {
      'app-left-menu': vue_leftMenu,
      'app-settings': vue_settings
    }
  };
</script>

<style lang="less" scoped>
  @deep-operator: ~'>>>';

  .app--nav {
    display: flex;
    align-items: center;
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid var(--primary-light);
    margin-bottom: 1rem;
    background-color: var(--white);
  }

  .content {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    overflow-y: auto;
    font-size: 0.9rem;
    padding: 0 0.4rem;

    @{deep-operator} svg {
      width: 1.2rem;
      height: 1.2rem;
      fill: currentcolor;
      color: var(--primary-light-2);
      margin: 0 0.6rem;
    }
  }

  .link-btn {
    color: var(--primary-light-3);
    text-decoration: underline;
    cursor: pointer;
  }

  .setting-button {
    margin-left: auto;
  }
</style>