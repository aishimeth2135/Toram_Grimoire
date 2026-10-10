<script lang="ts" setup>
import { type VNodeChild, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  title: string
  titleIcon: string
  level?: 'primary' | 'secondary'
}
interface Slots {
  default(): VNodeChild
}

withDefaults(defineProps<Props>(), {
  level: 'primary',
})
defineSlots<Slots>()

const { t } = useI18n()
const expanded = ref(false)
</script>

<template>
  <section class="border-primary-20 shadow-xs border">
    <div class="border-primary-10 border-b">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 text-left"
        :class="level === 'primary' ? 'px-4 py-3' : 'px-3 py-2.5'"
        @click="expanded = !expanded"
      >
        <div
          class="gap-icon text-primary-70 flex items-center"
          :class="{ 'text-sm': level === 'secondary' }"
        >
          <cy-icon :icon="titleIcon" />
          {{ title }}
        </div>
        <span class="gap-icon text-primary-30 ml-auto flex items-center text-sm">
          <cy-icon small :icon="expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
          {{ t(expanded ? 'global.collapse' : 'global.expand') }}
        </span>
      </button>
    </div>
    <slot v-if="expanded" />
  </section>
</template>
