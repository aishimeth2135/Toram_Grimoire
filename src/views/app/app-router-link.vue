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
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-inline: --spacing(4);
  padding-block: --spacing(2.5);
  width: 100%;

  &:hover {
    background-color: --alpha(var(--color-primary-5) / 50%);
  }

  &.selected {
    background-color: var(--color-primary-5);
  }
}
</style>
