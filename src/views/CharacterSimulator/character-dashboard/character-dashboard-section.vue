<script lang="ts" setup>
import { type VNodeChild, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  title: string
}
interface Slots {
  default(): VNodeChild
}

defineProps<Props>()
defineSlots<Slots>()

const { t } = useI18n()
const expanded = ref(true)
</script>

<template>
  <section class="border-primary-20 shadow-xs border">
    <div class="px-4 py-2.5">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 text-left"
        @click="expanded = !expanded"
      >
        <span class="text-primary-70">
          {{ title }}
        </span>
        <span class="gap-icon text-primary-30 ml-auto flex items-center text-sm">
          <cy-icon small :icon="expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
          {{ t(expanded ? 'global.collapse' : 'global.expand') }}
        </span>
      </button>
    </div>
    <slot v-if="expanded" />
  </section>
</template>
