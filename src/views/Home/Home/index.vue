<template>
  <article class="flex justify-center flex-wrap">
    <section class="flex justify-center w-full pt-16 pb-20 mb-12 border-b border-solid border-light-2">
      <router-link to="/bubble/potum" v-slot="{ navigate }" custom>
        <div class="text-5xl" @click="navigate">Cy's Grimoire</div>
      </router-link>
    </section>
    <section class="flex justify-center flex-wrap">
      <div v-for="data in columns"
        class="inline-block m-5"
        :key="data.name + '|' + data.path">
        <router-link :to="data.path" v-slot="{ navigate }" custom>
          <div @click="data.navigate ? data.navigate($event, navigate) : navigate($event)"
            class="content-title flex items-center justify-center relative cursor-pointer duration-300 bg-white p-4 w-36 h-36 rounded-full border-2 border-solid border-light-2"
            role="link">
            <div class="text-lg text-center">{{ $globalLang('Page Title/' + data.name) }}</div>
            <iconify-icon :name="data.icon"
              class="icon absolute top-0 left-0 w-11 h-11 fill-current text-light-2 bg-white rounded-full" />
          </div>
        </router-link>
      </div>
    </section>
  </article>
</template>

<script>
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
          path: '/character',
          navigate: (e, navigate) => {
            this.$store.commit('main/setRedirectPath', '/character/skill');
            navigate(e);
          }
        }, {
          name: 'enchant/enchant-simulator',
          icon: 'mdi-cube-scan',
          path: '/enchant'
        }, {
          name: 'enchant/enchant-doll',
          icon: 'ant-design:calculator-outlined',
          path: '/enchant/doll'
        }, {
          name: 'item-query',
          icon: 'jam-box',
          path: '/items'
        }, {
          name: 'crystal-query',
          icon: 'bx-bx-cube-alt',
          path: '/items/crystal'
        }, {
          name: 'calculation/damage',
          icon: 'mdi-sword',
          path: '/damage'
        }
      ]
    };
  }
};
</script>

<style lang="less" scoped>
.content-title:hover {
  @apply border-light-3;
  & > .icon {
    @apply text-light-3;
    animation: move-rotate 1.3s ease;
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