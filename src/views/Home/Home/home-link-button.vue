<template>
  <div class="flex" :class="!device.isMobile ? 'm-4' : 'm-2'">
    <router-link
      v-if="!device.isMobile"
      v-slot="{ navigate }"
      :to="{ name: data.pathName }"
      custom
    >
      <div :class="classes.wrapper" @click="navigate">
        <div :class="classes.bg1" />
        <div :class="classes.bg2" />
        <div class="relative z-1 pl-[1.625rem] pt-[1.125rem]">
          <cy-icon :icon="data.icon" width="2.5rem" class="text-blue-20" />
        </div>
        <div :class="classes.title">
          {{ t('app.page-title.' + data.name) }}
        </div>
      </div>
    </router-link>
    <router-link
      v-else
      v-slot="{ navigate }"
      :to="{ name: data.pathName }"
      custom
    >
      <div
        :class="[classes.wrapper, classes['wrapper-mobile']]"
        @click="navigate"
      >
        <div :class="classes.bg1" />
        <div :class="classes.bg2" />
        <div class="relative z-1 pl-3 pt-2">
          <cy-icon :icon="data.icon" width="1.5rem" class="text-blue-20" />
        </div>
        <div :class="classes.title">
          {{ t('app.page-title.' + data.name) }}
        </div>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { useCssModule } from 'vue'
import { useI18n } from 'vue-i18n'

import { type RouteLinkData } from '@/shared/consts/route'
import { useDevice } from '@/shared/setup/Device'

interface Props {
  data: RouteLinkData
}

defineProps<Props>()

const { t } = useI18n()
const { device } = useDevice()

const classes = useCssModule()
</script>

<style lang="postcss" module>
.wrapper {
  @apply relative flex h-28 w-44 cursor-pointer;

  &.wrapper-mobile {
    @apply h-16 w-44;
  }

  &:hover > .bg2 {
    background-color: var(--app-white);
    border-color: rgba(var(--app-rgb-primary-80), 0.75);
  }
}

.title {
  @apply absolute bottom-0 right-0 px-3 pb-2 text-right text-blue-80;
}

.bg1 {
  @apply absolute left-2.5 top-2.5 -z-1 rounded-lg;
  width: calc(100% - 0.25rem);
  height: calc(100% - 0.25rem);
  background-color: rgba(var(--app-rgb-primary-30), 0.2);
}

.bg2 {
  @apply absolute left-0 top-0 -z-1 h-full w-full rounded-lg duration-150;
  background-color: rgba(var(--app-rgb-white), 0.9);
  border-color: rgba(var(--app-rgb-primary-80), 0.3);
  border-width: 1px;
  border-style: solid;
}
</style>
