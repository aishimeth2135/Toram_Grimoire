<script lang="ts" setup>
import { computed } from 'vue'

import CommonSwitchModeButtonVertical from './common-switch-mode-button-vertical.vue'
import CommonSwitchModeButton from './common-switch-mode-button.vue'

interface Props {
  vertical?: boolean
}

withDefaults(defineProps<Props>(), {
  vertical: false,
})

const isEditing = defineModel<boolean>('isEditing', { required: true })

const isPreview = computed({
  get() {
    return !isEditing.value
  },
  set(value) {
    isEditing.value = !value
  },
})
</script>

<template>
  <CommonSwitchModeButtonVertical
    v-if="vertical"
    v-model:is-top="isPreview"
    top-icon="mdi:format-list-bulleted"
    bottom-icon="mdi:edit"
  />
  <CommonSwitchModeButton
    v-else
    v-model:is-left="isPreview"
    left-icon="mdi:format-list-bulleted"
    right-icon="mdi:edit"
  />
</template>
