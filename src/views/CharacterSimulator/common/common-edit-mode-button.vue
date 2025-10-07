<script lang="ts" setup>
import { computed } from 'vue'

import commonSwitchModeButton from './common-switch-mode-button.vue'

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
  <commonSwitchModeButton
    v-model:is-left="isPreview"
    left-icon="mdi:format-list-bulleted"
    right-icon="mdi:edit"
  />
</template>
