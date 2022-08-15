<template>
  <component
    :is="tag"
    v-if="slots['default']"
    ref="mainElement"
    class="cy--popover"
    @click.stop="popper ? popper.togglePopper(undefined) : undefined"
  >
    <slot :shown="popper ? popper.shown : false" />
    <CyPopper
      ref="popper"
      :element="mainElement"
      :options="options"
    >
      <slot name="popper" />
    </CyPopper>
  </component>
</template>

<script lang="ts" setup>
import { Ref, ref, useSlots } from 'vue'

import CyPopper from './cy-popper.vue'

import { PopperOptions } from './setup'

interface Props {
  tag?: string;
  options?: PopperOptions;
}

withDefaults(defineProps<Props>(), {
  tag: 'div',
})

const slots = useSlots()

const mainElement: Ref<HTMLElement | null> = ref(null)
const popper: Ref<InstanceType<typeof CyPopper> | null> = ref(null)
</script>
