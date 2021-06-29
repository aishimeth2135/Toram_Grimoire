<template>
  <div class="pt-1">
    <div class="flex items-center flex-wrap py-0.5"
      :class="{ 'opacity-50': !stat.valid }">
      <cy-icon-text :text-color="stat.value >= 0 ? 'dark' : 'orange'"
        :icon="stat.valid ? 'gg-shape-rhombus' : 'ic-round-close'">
        {{ stat.show('base') }}
      </cy-icon-text>
      <cy-icon-text v-if="rootState.statDisplayMode === 0"
        icon="mdi-creation" class="ml-auto mr-2"
        text-size="small" text-color="purple">
        {{ potentialEffect }}
      </cy-icon-text>
      <div class="inline-flex items-center ml-auto" v-else>
         <cy-icon-text icon="mdi-cube-outline"
          text-size="small" icon-color="water-blue-light">
          {{ materialPoint.title }}
        </cy-icon-text>
        <span class="text-sm ml-2 text-water-blue">{{ materialPoint.value }}</span>
      </div>
    </div>
    <div class="flex items-center pb-0.5 overflow-y-auto">
      <cy-input-counter
        inline max-button min-button
        :value="stat.value"
        @update:value="setStatValue(stat, $event)"
        :range="stat.limit"
        :disabled="!stat.valid" />
      <cy-button type="icon" icon="jam-close-circle"
        class="ml-auto"
        @click="stat.remove()"
        icon-color="gray" />
    </div>
  </div>
</template>
<script>
import { EnchantStepStat } from "@/lib/Enchant/Enchant";
import { trimZero } from '@utils/string';

export default {
  RegisterLang: "Enchant Simulator",
  props: {
    stat: {
      type: EnchantStepStat,
      required: true
    }
  },
  inject: ['rootState'],
  methods: {
    setStatValue(stat, v) {
      stat.value = v;
    }
  },
  computed: {
    potentialEffect() {
      return trimZero(this.stat.finalPotentialEffect.toFixed(2));
    },
    materialPoint() {
      const mp = this.stat.materialPointCost;
      return {
        title: this.$lang('material point type list')[mp.type],
        value: mp.value
      };
    }
  }
}
</script>