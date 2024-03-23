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
        custom,
      }"
      :content-class="popperContentClass"
      @hidden="fixed = false"
    >
      <slot name="popper" :hide="hide" />
    </CyPopper>
  </component>
</template>

<script lang="ts" setup>
import { Ref, computed, ref, useSlots, watch } from 'vue'

import CyPopper from './cy-popper.vue'

interface Props {
  tag?: string
  autoSelect?: boolean
  placement?: string
  triggers?: string
  popperContentClass?: any
  custom?: boolean
  disabled?: boolean
}

// type Placement =
//   | 'top'
//   | 'top-start'
//   | 'top-end'
//   | 'right'
//   | 'right-start'
//   | 'right-end'
//   | 'bottom'
//   | 'bottom-start'
//   | 'bottom-end'
//   | 'left'
//   | 'left-start'
//   | 'left-end';

const props = withDefaults(defineProps<Props>(), {
  tag: 'div',
  placement: 'bottom-start',
  autoSelect: false,
  triggers: 'click',
  custom: false,
  disabled: false,
})

const slots = useSlots()

const mainElement: Ref<HTMLElement | null> = ref(null)
const popper: Ref<InstanceType<typeof CyPopper> | null> = ref(null)

const fixed = ref(false)

const innerShowTriggers = computed(() => props.triggers.split(' '))

const onClick = () => {
  if (props.disabled) {
    return
  }

  if (popper.value && innerShowTriggers.value.includes('click')) {
    popper.value.togglePopper(
      innerShowTriggers.value.includes('hover') ? true : undefined
    )
    fixed.value = true
  }
}
const onHover = () => {
  if (props.disabled) {
    return
  }

  if (
    popper.value &&
    innerShowTriggers.value.includes('hover') &&
    !fixed.value
  ) {
    popper.value.togglePopper()
  }
}

watch(
  () => props.disabled,
  value => {
    if (value) {
      popper.value?.togglePopper(false)
    }
  }
)
</script>
