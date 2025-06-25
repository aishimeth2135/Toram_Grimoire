<template>
  <router-link v-slot="{ navigate }" :to="{ name: data.pathName }" custom>
    <div
      :class="{
        'app-router-link': true,
        'selected': currentRoute.name === data.pathName,
      }"
      v-bind="attrs"
      @click="navigate"
    >
      <cy-icon :icon="data.icon" class="mr-2.5" />
      <span
        :class="[
          currentRoute.name === data.pathName ? 'text-primary-80' : 'text-primary-90',
          { 'ml-4': isMain },
        ]"
      >
        {{ t(data.title) }}
      </span>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { type HomeRouteData } from './setup'

defineOptions({
  inheritAttrs: false,
})

interface Props {
  data: HomeRouteData
  isMain?: boolean
}

withDefaults(defineProps<Props>(), {
  isMain: false,
})

const { t } = useI18n()
const { currentRoute } = useRouter()

const attrs = useAttrs()
</script>

<style>
@reference "@/tailwind.css";

.app-router-link {
  @apply flex w-full cursor-pointer items-center px-4 py-2.5;

  &:hover {
    @apply bg-primary-5/50;
  }

  &.selected {
    @apply bg-primary-5;
  }
}
</style>
