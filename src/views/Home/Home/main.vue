<template>
  <article class="home">
    <section class="main">
      <div class="title">Cy's Grimoire</div>
    </section>
    <section class="link-buttons">
      <div v-for="(data) in columns" class="column" :key="data.name + '|' + data.path">
        <router-link tag="div" :to="data.path" class="title">
          <div class="text">{{ langText(data.name + '/title') }}</div>
          <iconify-icon :name="data.icon" class="icon" />
        </router-link>
      </div>
    </section>
  </article>
</template>

<script>
  import GetLang from "@global-modules/LanguageSystem.js";

  import init from "./init.js";

  export default {
    data(){
      return {
        columns: [{
            name: 'skill-simulator',
            icon: 'ant-design:build-outlined',
            path: '/character/skill'
          }, {
            name: 'skill-query',
            icon: 'ic-outline-menu-book',
            path: '/skill'
          }, {
            name: 'item-query',
            icon: 'jam-box',
            path: 'item'
          }, {
            name: 'crystal-query',
            icon: 'bx-bx-cube-alt',
            path: '/item/crystal'
          }, {
            name: 'damage-calc',
            icon: 'mdi-sword',
            path: 'damage'
          }, {
            name: 'enchant-simulator',
            icon: 'mdi-cube-scan',
            path: 'enchant'
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
    padding-top: 4rem;
    padding-bottom: 5rem;
    margin-bottom: 3rem;
    border-bottom: 1px solid var(--primary-light-2);
    width: 100%;

    > .title {
      font-size: 2.8rem;
    }
  }

  .link-buttons {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .column {
    display: inline-block;
    margin: 1.5rem;

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
        background-color: var(--white);
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