<template>
  <cy-modal
    :visible="visible"
    :title="t('skill-simulator.export-image.title')"
    title-icon="uil:image-download"
    width="auto"
    footer
    @close="emit('close')"
  >
    <template #default>
      <div v-if="currentImage" class="overflow-x-auto">
        <img :src="currentImage || '#'" class="max-w-none">
      </div>
      <div v-else class="flex justify-center py-8">
        <cy-icon-text icon="mdi:image-outline" icon-width="3rem" />
      </div>
      <div class="p-3 border border-light-2 mt-6" style="max-width: 27.5rem">
        <cy-icon-text icon="ic:outline-info" size="small" align-v="start" text-color="light-2">
          {{ t('skill-simulator.export-image.preview-ios-tips') }}
        </cy-icon-text>
      </div>
    </template>
    <template #footer-actions>
      <cy-button-border
        icon="uil:image-download"
        :disabled="!currentImage"
        @click="downloadImage"
      >
        {{ t('global.export') }}
      </cy-button-border>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBuild } from '@/stores/views/character/skill-build/SkillBuild'

import Cyteria from '@/shared/utils/Cyteria'

import { exportSkillBuildImage } from './utils'

interface Props {
  visible: boolean;
  skillBuild: SkillBuild | null;
}
interface Emits {
  (evt: 'close'): void;
}

const props = defineProps<Props>()
const { visible } = toRefs(props)

const emit = defineEmits<Emits>()

const { t } = useI18n()

const currentImage = ref('')

watch(visible, async (value) => {
  if (value) {
    if (props.skillBuild) {
      const res = await exportSkillBuildImage(props.skillBuild)
      currentImage.value = res || ''
    } else {
      currentImage.value = ''
    }
  }
})

const downloadImage = () => {
  if (!props.skillBuild || !currentImage.value) {
    return
  }
  Cyteria.file.save({
    dataUrl: currentImage.value,
    fileName: props.skillBuild.name + '.png',
  })
}
</script>
