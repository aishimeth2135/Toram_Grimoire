<script lang="ts" setup>
import ButtonIcon from './button-icon.vue'
import CyButtonBase from './cy-button-base.vue'

import { type ButtonBaseProps, useButtonBaseBinds } from './setup'

type Props = ButtonBaseProps

const props = defineProps<Props>()

const buttonBaseBinds = useButtonBaseBinds(props)
</script>

<template>
  <CyButtonBase
    v-slot="{ iconClass }"
    v-bind="buttonBaseBinds"
    class="cy-button-radio px-2 py-1"
  >
    <ButtonIcon
      :icon="
        selected
          ? 'ic:round-radio-button-checked'
          : 'ic:round-radio-button-unchecked'
      "
      :class="iconClass"
    />
    <div v-if="$slots.default" class="ml-2 mr-1.5 flex">
      <slot />
    </div>
  </CyButtonBase>
</template>
