<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <!-- this component is splitted to handle EnchantStepStat -->
  <div class="pt-1">
    <div
      class="flex items-center flex-wrap py-0.5"
      :class="{ 'opacity-50': !stat.valid }"
    >
      <cy-icon-text
        :text-color="stat.value >= 0 ? 'dark' : 'orange'"
        :icon="stat.valid ? 'gg-shape-rhombus' : 'ic-round-close'"
      >
        {{ stat.showBase() }}
      </cy-icon-text>
      <cy-icon-text
        v-if="rootState.statDisplayMode === 0"
        icon="mdi-creation"
        class="ml-auto mr-2"
        size="small"
        text-color="purple"
      >
        {{ potentialEffect }}
      </cy-icon-text>
      <div v-else class="inline-flex items-center ml-auto">
        <cy-icon-text icon="mdi-cube-outline" size="small" icon-color="water-blue-light">
          {{ materialPoint.title }}
        </cy-icon-text>
        <span class="text-sm ml-2 text-water-blue">
          {{ materialPoint.value }}
        </span>
      </div>
    </div>
    <div class="flex items-center pb-0.5 overflow-y-auto">
      <cy-input-counter
        v-model:value="stat.value"
        inline
        max-button
        min-button
        :range="stat.limit"
        :disabled="!stat.valid"
      />
      <cy-button-icon
        icon="jam-close-circle"
        class="ml-auto"
        icon-color="gray"
        @click="stat.remove()"
      />
    </div>
  </div>
</template>

<script>
import { trimZero } from '@/shared/utils/string'

import { EnchantStepStat } from '@/lib/Enchant/Enchant'


export default {
  name: 'EnchantStepStat',
  RegisterLang: 'Enchant Simulator',
  inject: ['rootState'],
  props: {
    stat: {
      type: EnchantStepStat,
      required: true,
    },
  },
  computed: {
    potentialEffect() {
      return trimZero(this.stat.finalPotentialEffect.toFixed(2))
    },
    materialPoint() {
      const mp = this.stat.materialPointCost
      return {
        title: this.$lang('material point type list')[mp.type],
        value: mp.value,
      }
    },
  },
}
</script>
