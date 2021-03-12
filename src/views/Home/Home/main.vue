<template>
  <article class="home">
    <section class="main">
      <router-link to="/bubble/potum" v-slot="{ navigate }" custom>
        <div class="title" @click="navigate">Cy's Grimoire</div>
      </router-link>
    </section>
    <section class="link-buttons">
      <div v-for="(data) in columns" class="column" :key="data.name + '|' + data.path">
        <router-link :to="data.path" v-slot="{ navigate }" custom>
          <div class="title" @click="navigate" role="link">
            <div class="text">{{ langText(data.name + '/title') }}</div>
            <iconify-icon :name="data.icon" class="icon" />
          </div>
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
            name: 'skill-query',
            icon: 'ic-outline-menu-book',
            path: '/skill'
          }, {
            name: 'character-simulator',
            icon: 'mdi-ghost',
            path: '/character'
          }, {
            name: 'skill-simulator',
            icon: 'ant-design:build-outlined',
            path: '/character/skill'
          }, {
            name: 'enchant-simulator',
            icon: 'mdi-cube-scan',
            path: 'enchant'
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
  margin: 1.3rem;

  > .title {
    width: 9rem;
    height: 9rem;
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
      width: 2.7rem;
      height: 2.7rem;
      fill: currentcolor;
      color: var(--primary-light-2);
      background-color: var(--white);
      border-radius: 50%;
    }

    &:hover {
      border-color: var(--primary-light-3);
      > .icon {
        color: var(--primary-light-3);
        animation: move-rotate 1.3s ease;
      }
    }
  }
}
@keyframes move-rotate {
  0%{
    top: 3.1rem;
    left: 3.1rem;
    transform: rotate(-135deg) translateX(4.5rem) rotate(135deg);
  }
  100%{
    top: 3.1rem;
    left: 3.1rem;
    transform: rotate(225deg) translateX(4.5rem) rotate(-225deg);
  }
}
</style>