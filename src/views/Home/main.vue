<template>
  <article class="home">
    <section class="main">
      <div class="title">Cy's Grimoire</div>
    </section>
    <section>
      <div v-for="(data, i) in columns" class="column">
        <router-link tag="div" :to="data.path" class="title">
          <div class="text">{{ langText(data.name + '/title') }}</div>
          <iconify-icon :name="data.icon" class="icon" />
        </router-link>
        <!-- <div class="content">
          {{ langText(data.name + '/content') }}
        </div> -->
      </div>
    </section>
  </article>
</template>

<script>
  import GetLang from "@global-modules/LanguageSystem.js";
  import vue_iconifyIcon from "@global-vue-components/iconify-icon.vue";

  import init from "./init.js";

  export default {
    data(){
      return {
        columns: [{
            name: 'character-simulator',
            icon: 'mdi-rabbit',
            path: '/character'
          }, {
            name: 'skill-query',
            icon: 'mdi-rabbit',
            path: '/skill'
          }
        ]
      };
    },
    beforeCreate(){
      init();
    },
    methods: {
      langText(v, vs){
        return GetLang('Home/' + v, vs);
      }
    },
    components: {
      'iconify-icon': vue_iconifyIcon
    }
  };
</script>

<style lang="less" scoped>
  .home {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .main {
    display: flex;
    justify-content: center;
    padding: 6rem 0;
    margin-bottom: 4rem;
    border-bottom: 1px solid var(--primary-light-2);
    width: 100%;

    > .title {
      font-size: 2.5rem;
    }
  }

  .column {
    display: inline-block;
    margin: 0.8rem;

    > .title {
      width: 10rem;
      height: 10rem;
      border-radius: 50%;
      border: 2px solid var(--primary-light-2);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: 0.3s;

      > .text {
        font-size: 1.1rem;
      }

      > .icon {
        position: absolute;
        top: 0;
        left: 0;
        width: 3rem;
        height: 3rem;
        fill: currentcolor;
        color: var(--primary-light-2);
      }

      &:hover {
        border-color: var(--primary-light-3);
        > .icon {
          color: var(--primary-light-3);
        }
      }
    }
  }
</style>