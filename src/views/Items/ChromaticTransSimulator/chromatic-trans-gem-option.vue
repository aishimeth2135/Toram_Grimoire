<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { ChromaticTransGem } from '@/lib/ChromaticTrans/gems'

import CardRow from '@/components/card/card-row.vue'
import DyeColorButton from '@/components/common/dye-color-button.vue'

interface Props {
  gem: ChromaticTransGem
  color: number
  selected?: boolean
}
interface Emits {
  (evt: 'select'): void
  (evt: 'preview'): void
  (evt: 'leave'): void
}

withDefaults(defineProps<Props>(), { selected: false })
const emit = defineEmits<Emits>()

const { t } = useI18n()
</script>

<template>
  <CardRow :selected="selected" hover>
    <div
      role="button"
      tabindex="0"
      class="flex cursor-pointer items-center gap-2 px-3 py-2"
      :class="{ 'bg-primary-10 text-primary-90 ring-primary-30 ring-1 ring-inset': selected }"
      :aria-pressed="selected"
      @click="emit('select')"
      @keydown.enter.prevent="emit('select')"
      @keydown.space.prevent="emit('select')"
      @mouseenter="emit('preview')"
      @mouseleave="emit('leave')"
      @focus="emit('preview')"
      @blur="emit('leave')"
    >
      <DyeColorButton
        :color="color"
        class="pointer-events-none h-5 w-6 text-sm"
        :tabindex="-1"
        aria-hidden="true"
      />
      {{ t('chromatic-trans-simulator.gems.' + gem) }}
    </div>
  </CardRow>
</template>
