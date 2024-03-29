<template>
  <component
    :is="tag"
    v-if="slots['default']"
    ref="mainElement"
    class="cy--popover"
    @click.stop="onClick"
    @mouseenter="onHover"
    @mouseleave="onHover"
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
      :content-class="popperClass"
      @hidden="fixed = false"
    >
      <slot name="popper" :hide="hide" />
    </CyPopper>
  </component>
</template>

<script lang="ts" setup>
import { Ref, computed, ref, useSlots } from 'vue'

import CyPopper from './cy-popper.vue'

interface Props {
  tag?: string
  autoSelect?: boolean
  placement?: string
  showTriggers?: string
  popperClass?: any
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'div',
  placement: 'bottom-start',
  autoSelect: false,
  showTriggers: 'click',
})

const slots = useSlots()

const mainElement: Ref<HTMLElement | null> = ref(null)
const popper: Ref<InstanceType<typeof CyPopper> | null> = ref(null)

const fixed = ref(false)

const innerShowTriggers = computed(() => props.showTriggers.split(' '))

const onClick = () => {
  if (popper.value && innerShowTriggers.value.includes('click')) {
    popper.value.togglePopper(
      innerShowTriggers.value.includes('hover') ? true : undefined
    )
    fixed.value = true
  }
}
const onHover = () => {
  if (
    popper.value &&
    innerShowTriggers.value.includes('hover') &&
    !fixed.value
  ) {
    popper.value.togglePopper()
  }
}
</script>
