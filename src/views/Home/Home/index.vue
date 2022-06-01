<template>
  <AppLayoutMain>
    <div class="flex justify-center items-center h-32">
      <div class="px-4 py-6 sticky top-0">
        <router-link v-slot="{ navigate }" :to="{ name: AppRouteNames.Bubble, params: { iconName: 'potum' } }" custom>
          <div class="text-4xl" @click="navigate">
            Cy's Grimoire
          </div>
        </router-link>
      </div>
    </div>
    <div class="w-full px-2 mt-auto">
      <section
        ref="mainSection"
        class="flex justify-center flex-wrap py-6 rounded-3xl app-home-main-section"
        @mousemove="pointMove"
        @mouseleave="pointPosition.display = 'none'"
      >
        <div class="app-home-main-point" :style="pointPosition" />
        <HomeLinkButton
          v-for="data in columns"
          :key="data.name + '|' + data.pathName"
          :data="data"
        />
      </section>
    </div>
    <footer class="flex items-center justify-center w-full px-2 h-32 mt-auto">
      <div class="flex items-center sticky bottom-0 space-x-4 py-4">
        <AppSetting />
        <router-link v-slot="{ navigate }" :to="{ name: AppRouteNames.About }" custom>
          <cy-button-plain icon="bx-bxs-star-half" @click="navigate">
            {{ t('app.page-title.about') }}
          </cy-button-plain>
        </router-link>
      </div>
    </footer>
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'AppHome',
}
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { reactive, ref, Ref } from 'vue'

import { ROUTE_LINK_DATAS } from '@/shared/consts'

import AppSetting from '@/views/app/app-settings.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import { AppRouteNames } from '@/router/enums'

import HomeLinkButton from './home-link-button.vue'

const columns = ROUTE_LINK_DATAS

const { t } = useI18n()

const mainSection: Ref<HTMLElement | null> = ref(null)
const pointPosition = reactive({
  top: '0px',
  left: '0px',
  display: 'none',
})

const pointMove = (evt: MouseEvent) => {
  if (mainSection.value) {
    const rect = mainSection.value.getBoundingClientRect()
    const left = (evt.clientX - rect.left)
    const top = (evt.clientY - rect.top)
    if (left >= 0 && top >= 0) {
      pointPosition.left = left + 'px'
      pointPosition.top = top + 'px'
      pointPosition.display = 'block'
    }
  }
}
</script>

<style lang="postcss" scoped>
.app-home-main-section {
  @apply relative overflow-hidden;

  &::before {
    content: '';
    opacity: 0.75;

    @apply w-full h-full bg-white absolute top-0 left-0;
  }

  & > .app-home-main-point {
    @apply bg-light bg-opacity-50 w-8 h-8 absolute rounded-full pointer-events-none;
    transform: translate(-50%, -50%);
    animation: app-home-main-point 2.5s ease infinite;
  }
}

@keyframes app-home-main-point {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
