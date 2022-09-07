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
      #default="{ hide }"
      ref="popper"
      :element="mainElement"
      :options="{
        placement,
        autoSelect,
      }"
    >
      <slot name="popper" :hide="hide" />
    </CyPopper>
  </component>
</template>

<script lang="ts" setup>
import { Ref, ref, useSlots } from 'vue'

import CyPopper from './cy-popper.vue'

interface Props {
  tag?: string;
  autoSelect?: boolean;
  placement?: string;
}

withDefaults(defineProps<Props>(), {
  tag: 'div',
  placement: 'bottom-start',
  autoSelect: false,
})

const slots = useSlots()

const mainElement: Ref<HTMLElement | null> = ref(null)
const popper: Ref<InstanceType<typeof CyPopper> | null> = ref(null)
</script>
