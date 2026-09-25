<script lang="ts" setup>
import { type VNodeChild, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  title: string
  titleIcon: string
  defaultHidden?: boolean
}
interface Slots {
  default(): VNodeChild
}

const props = withDefaults(defineProps<Props>(), {
  defaultHidden: false,
})
defineSlots<Slots>()

const { t } = useI18n()
const expanded = ref(!props.defaultHidden)
</script>

<template>
  <section class="border-primary-20 shadow-xs border">
    <div class="border-primary-10 border-b">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left"
        @click="expanded = !expanded"
      >
        <div class="text-primary-70 gap-icon flex items-center">
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
