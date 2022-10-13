<template>
  <router-link v-slot="{ navigate }" :to="{ name: data.pathName }" custom>
    <div
      class="app--router-link-button"
      :class="{ selected: currentRoute.name === data.pathName }"
      v-bind="attrs"
      @click="navigate"
    >
      <cy-icon-text
        :icon="data.icon"
        :text-color="
          currentRoute.name === data.pathName ? 'primary-80' : 'primary-90'
        "
      >
        <span :class="{ 'ml-4': isMain }">{{ t(data.title) }}</span>
      </cy-icon-text>
    </div>
  </router-link>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script lang="ts" setup>
import { useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { AppRouteNames } from '@/router/enums'

interface Props {
  data: {
    title: string
    icon: string
    pathName: AppRouteNames
  }
  isMain?: boolean
}

withDefaults(defineProps<Props>(), {
  isMain: false,
})

const { t } = useI18n()
const { currentRoute } = useRouter()

const attrs = useAttrs()
</script>

<style lang="postcss" scoped>
.app--router-link-button {
  @apply w-full cursor-pointer bg-opacity-25 py-1.5 px-4;

  &:hover {
    @apply bg-primary-5 bg-opacity-50;
  }

  &.selected {
    @apply bg-primary-5 bg-opacity-100;
  }
}
</style>
