<template>
  <div class="mx-4 my-4 flex">
    <router-link v-slot="{ navigate }" :to="{ name: data.pathName }" custom>
      <div :class="classes.wrapper" @click="navigate">
        <div :class="classes.bg1" />
        <div :class="classes.bg2" />
        <div class="relative z-1 pl-[1.625rem] pt-[1.125rem]">
          <cy-icon-text
            :icon="data.icon"
            :icon-src="data.iconSrc"
            icon-width="2.5rem"
            icon-color="blue-20"
            class="cy--home-link-button-icon"
          />
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

import { RouteLinkData } from '@/shared/consts'

interface Props {
  data: RouteLinkData
}

defineProps<Props>()

const { t } = useI18n()

const classes = useCssModule()
</script>

<style lang="postcss" module>
.wrapper {
  @apply relative flex h-28 w-44 cursor-pointer;

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
  width: 10.75rem;
  height: 6.75rem;
  background-color: rgba(var(--app-rgb-primary-30), 0.2);
}

.bg2 {
  @apply absolute left-0 top-0 -z-1 h-28 w-44 rounded-lg duration-150;
  background-color: rgba(var(--app-rgb-white), 0.9);
  border-color: rgba(var(--app-rgb-primary-80), 0.3);
  border-width: 1px;
  border-style: solid;
}
</style>
