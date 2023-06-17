<template>
  <router-link v-slot="{ navigate }" :to="{ name: data.pathName }" custom>
    <div
      :class="{
        [classes.link]: true,
        [classes.selected]: currentRoute.name === data.pathName,
      }"
      v-bind="attrs"
      @click="navigate"
    >
      <cy-icon :icon="data.icon" />
      <span
        :class="[
          currentRoute.name === data.pathName
            ? 'text-primary-80'
            : 'text-primary-90',
          { 'ml-4': isMain },
        ]"
      >
        {{ t(data.title) }}
      </span>
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
import { useCssModule } from 'vue'

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

const classes = useCssModule()
</script>

<style lang="postcss" module>
.link {
  @apply flex w-full cursor-pointer items-center bg-opacity-25 px-4 py-2.5;

  &:hover {
    @apply bg-primary-5 bg-opacity-50;
  }

  &.selected {
    @apply bg-primary-5 bg-opacity-100;
  }
}
</style>
