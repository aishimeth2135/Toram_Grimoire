<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  BASE_GEMS,
  type ChromaticTransContainer,
  type ChromaticTransGem,
  type ChromaticTransStep,
} from '@/lib/ChromaticTrans'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'
import DyeColorButton from '@/components/common/dye-color-button.vue'

import ChromaticTransColorTable from './chromatic-trans-color-table.vue'
import ChromaticTransGemOption from './chromatic-trans-gem-option.vue'
import ChromaticTransGrayscaleTable from './chromatic-trans-grayscale-table.vue'

interface Props {
  container: ChromaticTransContainer
  step: ChromaticTransStep
  expanded?: boolean
}
interface Emits {
  (evt: 'select', gem: ChromaticTransGem): void
  (evt: 'toggle'): void
}

const props = withDefaults(defineProps<Props>(), { expanded: false })
const emit = defineEmits<Emits>()

interface GemGroup {
  id: string
  gems: ChromaticTransGem[]
}

const { t } = useI18n()
const hoveredGem = ref<ChromaticTransGem | null>(null)
const preview = computed<ChromaticTransStep>(() =>
  hoveredGem.value ? props.container.previewGem(props.step.index, hoveredGem.value) : props.step
)
const groups = computed<GemGroup[]>(() => {
  if (props.step.index === 0) {
    return [{ id: 'base', gems: [...BASE_GEMS] }]
  }

  const base = props.step.baseGem
  if (!base) {
    return []
  }

  return [
    { id: 'shade', gems: ['cat-eye', 'moonstone'] },
    { id: 'grayscale', gems: ['pearl', 'obsidian'] },
    { id: 'narrow', gems: [base, 'diamond'] },
    { id: 'mix', gems: BASE_GEMS.filter(gem => gem !== base) },
  ]
})

function selectGem(gem: ChromaticTransGem) {
  hoveredGem.value = null
  emit('select', gem)
}

watch(
  () => [props.step, props.expanded],
  () => {
    hoveredGem.value = null
  }
)
</script>

<template>
  <section class="border-primary-20 rounded-sm border px-3 py-2">
    <div
      class="flex cursor-pointer items-center gap-2 py-0.5"
      :class="{ 'mb-3': expanded }"
      @click="emit('toggle')"
    >
      <h2 class="text-primary-70">
        {{ t('chromatic-trans-simulator.step', { step: step.index + 1 }) }}
      </h2>
      <span v-if="step.index > 0" class="text-primary-40 text-sm">
        {{ t('chromatic-trans-simulator.optional') }}
      </span>
      <div class="gap-icon text-primary-30 ml-auto flex items-center text-sm">
        <cy-icon small :icon="expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
        {{ t('chromatic-trans-simulator.' + (expanded ? 'collapse' : 'expand')) }}
      </div>
    </div>
    <div v-if="expanded" class="flex flex-col gap-6 pb-2 sm:flex-row">
      <div class="sm:w-68 sm:max-w-68 min-w-0 shrink-0 grow space-y-3">
        <div v-for="group in groups" :key="group.id">
          <h3 class="text-primary-60 mb-2 text-sm">
            {{ t('chromatic-trans-simulator.' + group.id) }}
          </h3>
          <CardRowsWrapper :class="group.id === 'mix' ? 'max-h-32 overflow-y-auto' : ''">
            <CardRows>
              <ChromaticTransGemOption
                v-for="gem in group.gems"
                :key="gem"
                :gem="gem"
                :color="container.getGemPreviewColor(step.index, gem)"
                :selected="step.gem === gem"
                @select="selectGem(gem)"
                @preview="hoveredGem = gem"
                @leave="hoveredGem = null"
              />
            </CardRows>
          </CardRowsWrapper>
          <p v-if="group.id === 'grayscale'" class="text-gray-40 mt-2 px-1 text-sm">
            {{ t('chromatic-trans-simulator.grayscale-tips') }}
          </p>
        </div>
      </div>
      <div class="min-w-0 space-y-3">
        <h3 class="text-primary-60 text-sm">{{ t('chromatic-trans-simulator.preview') }}</h3>
        <ChromaticTransColorTable :pool="preview.pool" />
        <ChromaticTransGrayscaleTable v-if="preview.white || preview.black" :pool="preview.pool" />
        <div v-if="step.lockedColor !== null" class="text-red-60 mt-3 text-sm">
          {{ t('chromatic-trans-simulator.color-table-lock-tips') }}
        </div>
        <div class="mt-4">
          <h3 class="text-primary-60 mb-2.5 text-sm">
            {{ t('chromatic-trans-simulator.pool') }}
            <span class="text-orange-60 ml-1">
              {{ `[${preview.pool.length}]` }}
            </span>
          </h3>
          <div class="flex flex-wrap gap-1">
            <DyeColorButton
              v-for="color in preview.pool"
              :key="color"
              :color="color"
              class="h-7 w-10"
              :tabindex="-1"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
