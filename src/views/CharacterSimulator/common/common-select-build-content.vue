<script lang="ts" setup generic="Build">
import { useI18n } from 'vue-i18n'

interface Props {
  selectedBuild: Build
  currentBuild: Build
}
interface Emits {
  (evt: 'select-build'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap items-center bg-blue-5/30 px-4 py-3">
    <cy-button-action
      :disabled="currentBuild === selectedBuild"
      icon="carbon:location-current"
      class="mr-4"
      @click="emit('select-build')"
    >
      {{ t('character-simulator.build-common.select-build-button') }}
    </cy-button-action>
    <div
      v-if="currentBuild === selectedBuild"
      class="mr-6 flex items-center py-2 text-blue-70"
    >
      <cy-icon icon="ic:round-check-circle-outline" class="mr-2 text-blue-50" />
      {{ t('character-simulator.build-common.build-selected-message') }}
    </div>
  </div>
</template>
