<template>
  <article class="flex justify-center flex-wrap">
    <section class="flex justify-center w-full pt-16 pb-20 mb-12 border-b border-solid border-light-2">
      <router-link v-slot="{ navigate }" to="/bubble/potum" custom>
        <div class="text-5xl" @click="navigate">
          Cy's Grimoire
        </div>
      </router-link>
    </section>
    <section class="flex justify-center flex-wrap">
      <div
        v-for="data in columns"
        :key="data.name + '|' + data.pathName"
        class="inline-block m-5"
      >
        <router-link v-slot="{ navigate }" :to="{ name: data.pathName }" custom>
          <div
            class="content-title flex items-center justify-center relative cursor-pointer duration-300 bg-white p-4 w-36 h-36 rounded-full border-2 border-solid border-light-2"
            role="link"
            @click="navigate"
          >
            <div class="text-lg text-center">
              {{ t('app.page-title.' + data.name) }}
            </div>
            <cy-icon-text
              :icon="data.icon"
              icon-width="2.75rem"
              icon-color="light-2"
              class="router-link-icon absolute top-0 left-0 bg-white rounded-full"
            />
          </div>
        </router-link>
      </div>
    </section>
  </article>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n'

const HOME_LINK_BUTTONS = [{
  name: 'skill-query',
  icon: 'ic-outline-menu-book',
  pathName: 'SkillQuery',
}, {
  name: 'character-simulator',
  icon: 'mdi-ghost',
  pathName: 'CharacterSimulator',
}, {
  name: 'skill-simulator',
  icon: 'ant-design:build-outlined',
  pathName: 'SkillSimulator',
}, {
  name: 'enchant-simulator',
  icon: 'mdi-cube-scan',
  pathName: 'EnchantSimulator',
}, {
  name: 'enchant-doll',
  icon: 'ant-design:calculator-outlined',
  pathName: 'EnchantDoll',
}, {
  name: 'item-query',
  icon: 'jam-box',
  pathName: 'ItemQuery',
}, {
  name: 'crystal-query',
  icon: 'bx-bx-cube-alt',
  pathName: 'CrystalQuery',
}, {
  name: 'damage-calculation',
  icon: 'mdi-sword',
  pathName: 'DamageCalculationMain',
}]

export default {
  name: 'AppHome',
}
</script>

<script lang="ts" setup>
const columns = HOME_LINK_BUTTONS

const { t } = useI18n()
</script>

<style lang="postcss" scoped>
.content-title:hover {
  @apply border-light-3;
  & > .router-link-icon {
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
