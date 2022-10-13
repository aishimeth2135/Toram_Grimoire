<!-- this component is splitted to handle EnchantStepStat -->
<template>
  <div class="pt-1">
    <div
      class="flex flex-wrap items-center py-0.5"
      :class="{ 'opacity-50': !stat.valid }"
    >
      <cy-icon-text
        :text-color="stat.value >= 0 ? 'primary-90' : 'orange-60'"
        :icon="stat.valid ? 'gg-shape-rhombus' : 'ic-round-close'"
      >
        {{ stat.showBase() }}
      </cy-icon-text>
      <cy-icon-text
        v-if="rootState.statDisplayMode === 0"
        icon="mdi-creation"
        class="ml-auto mr-2"
        small
        text-color="fuchsia-60"
      >
        {{ potentialEffect }}
      </cy-icon-text>
      <div v-else class="ml-auto inline-flex items-center">
        <cy-icon-text icon="mdi-cube-outline" small icon-color="blue-30">
          {{ materialPoint.title }}
        </cy-icon-text>
        <span class="ml-2 text-sm text-blue-60">
          {{ materialPoint.value }}
        </span>
      </div>
    </div>
    <div class="flex items-center overflow-y-auto pb-0.5">
      <cy-input-counter
        v-model:value="
          stat.value /* eslint-disable-line vue/no-mutating-props */
        "
        inline
        max-button
        min-button
        :range="stat.limit"
        :disabled="!stat.valid"
      />
      <cy-button-icon
        icon="jam-close-circle"
        class="ml-auto"
        icon-color="gray-60"
        @click="stat.remove()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

import { trimFloatStringZero } from '@/shared/utils/string'

import { EnchantStepStat } from '@/lib/Enchant/Enchant'

import { EnchantSimulatorInjectionKey } from '../injection-keys'

interface Props {
  stat: EnchantStepStat
}

const props = defineProps<Props>()

const { t } = useI18n()

const { rootState } = inject(EnchantSimulatorInjectionKey)!

const potentialEffect = computed(() =>
  trimFloatStringZero(props.stat.finalPotentialEffect.toFixed(2))
)

const materialPoint = computed(() => {
  const mp = props.stat.materialPointCost
  return {
    title: t(`enchant-simulator.material-point-type-list.${mp.type}`),
    value: mp.value,
  }
})
</script>
