<template>
  <div class="pt-1">
    <div class="flex items-center py-0.5">
      <cy-icon-text :text-color="stat.value >= 0 ? 'dark' : 'orange'">
        {{ stat.show('base') }}
      </cy-icon-text>
      <cy-icon-text icon="mdi-creation" class="ml-auto mr-2"
        text-size="small" text-color="purple">
        {{ potentialEffect }}
      </cy-icon-text>
    </div>
    <div class="flex items-center pb-0.5">
      <cy-input-counter
        inline max-button min-button
        :value="stat.value"
        @update:value="setStatValue(stat, $event)"
        :range="stat.limit" />
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
  props: {
    stat: {
      type: EnchantStepStat
    }
  },
  methods: {
    setStatValue(stat, v) {
      stat.value = v;
    }
  },
  computed: {
    potentialEffect() {
      return trimZero(this.stat.finalPotentialEffect.toFixed(2));
    }
  }
}
</script>