<template>
  <div>
    <div class="inline-flex items-center flex-wrap">
      <span v-if="container.get('extra_constant') && frequencyVisible" class="divider border-orange" />
      <span v-if="container.get('constant')" class="divider" />
      <span v-if="container.get('base')" class="attr-item">{{ container.get('base') }}</span>
      <cy-icon-text
        v-if="container.get('base') && container.get('constant')"
        icon="ic-round-add"
      />
      <span
        v-if="container.get('constant')"
        class="attr-item"
        v-html="container.get('constant')"
      />
      <span v-if="container.get('constant')" class="divider" />
      <cy-icon-text icon="ic-round-close" />
      <span class="attr-item" v-html="container.get('multiplier')" />
      <cy-icon-text
        v-if="container.get('extra_constant')"
        icon="ic-round-add"
      />
      <span
        v-if="container.get('extra_constant')"
        class="attr-item"
        v-html="container.get('extra_constant')"
      />
      <span
        v-if="container.get('extra_constant') && frequencyVisible"
        class="divider border-orange"
      />
      <cy-icon-text
        v-if="frequencyVisible && container.get('frequency')"
        icon="ic-round-close"
      />
      <span
        v-if="frequencyVisible"
        class="attr-item"
        v-html="container.get('frequency')"
      />
    </div>
    <div
      v-if="container.get('@custom-base-caption')"
      class="pl-4 mb-2.5 flex items-center flex-wrap"
    >
      <cy-icon-text text-color="purple" small class="mt-1">
        {{ container.get('base') }}
      </cy-icon-text>
      <div class="pl-3 text-light-3 text-sm mt-1" v-html="container.get('@custom-base-caption')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import DisplayDataContainer from '../branch-handlers/utils/DisplayDataContainer'

interface Props {
  container: DisplayDataContainer;
}

const props = defineProps<Props>()

const { container } = toRefs(props)

const frequencyVisible = computed(() => {
  return container.value.branchItem.prop('title') === 'each'
})
</script>

<style lang="postcss" scoped>
.divider {
  @apply border-l-1 border-light-2 mx-2 h-6;
}

.attr-item {
  @apply inline-flex items-center my-1 py-0.5 px-1.5;
}
</style>
