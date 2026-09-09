<!-- this component is splitted to handle EnchantStepStat -->
<template>
  <div class="pb-1 pt-1">
    <div class="flex flex-wrap items-center py-0.5" :class="{ 'opacity-50': !stat.valid }">
      <div
        class="gap-icon inline-flex items-center"
        :class="stat.value >= 0 ? 'text-primary-90' : 'text-orange-60'"
      >
        <cy-icon
          :icon="stat.valid ? 'gg-shape-rhombus' : 'ic-round-close'"
          class="text-primary-30"
        />
        {{ stat.showBase() }}
      </div>
      <div
        v-if="rootState.statDisplayMode === 0"
        class="gap-icon text-fuchsia-60 ml-auto mr-2 inline-flex items-center text-sm"
      >
        <cy-icon icon="mdi-creation" small class="text-primary-30" />
        {{ potentialEffect }}
      </div>
      <div v-else class="ml-auto inline-flex items-center">
        <div class="gap-icon text-primary-90 inline-flex items-center text-sm">
          <cy-icon icon="mdi-cube-outline" small class="text-blue-30" />
          {{ materialPoint.title }}
        </div>
        <span class="text-blue-60 ml-2 text-sm">
          {{ materialPoint.value }}
        </span>
      </div>
    </div>
    <div class="flex items-center overflow-y-auto pb-0.5">
      <cy-input-counter
        v-model:value="stat.value /* eslint-disable-line vue/no-mutating-props */"
        inline
        max-button
        min-button
        :range="[stat.limit.min, stat.limit.max]"
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
