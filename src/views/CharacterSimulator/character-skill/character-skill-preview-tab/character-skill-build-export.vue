<script lang="ts" setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDevice } from '@/shared/setup/Device'
import Notify from '@/shared/setup/Notify'
import Cyteria from '@/shared/utils/Cyteria'

import { SkillBuild } from '@/lib/Character/SkillBuild'
import { getSkillBuildImageDataURL, getSkillBuildText } from '@/lib/Character/SkillBuild/utils'

import FloatPage from '@/components/app-layout/float-page/float-page.vue'

interface Props {
  skillBuild: SkillBuild
}

const props = defineProps<Props>()
const { t } = useI18n()
const { notify } = Notify()
const { device } = useDevice()

const visible = ref(false)

const enum ExportMode {
  Text,
  Image,
}

const currentExportMode = ref<ExportMode>(ExportMode.Text)
const eportedTextContent = useTemplateRef('eportedTextContent')

const exportedText = computed(() => getSkillBuildText(props.skillBuild))

const lastSkillBuild = ref<SkillBuild | null>(null)
const exportedImage = ref('')

watch(currentExportMode, value => {
  if (value === ExportMode.Image && lastSkillBuild.value !== props.skillBuild) {
    lastSkillBuild.value = props.skillBuild
    getSkillBuildImageDataURL(props.skillBuild).then(
      result => (exportedImage.value = result ?? '#')
    )
  }
})

const copyText = () => {
  if (!eportedTextContent.value) {
    return
  }
  if (Cyteria.copyToClipboard(eportedTextContent.value.innerText)) {
    notify(t('app.features.copy-to-clipboard-success-tips'))
  }
}

const downloadImage = () => {
  if (!props.skillBuild || !exportedImage.value) {
    return
  }
  Cyteria.file.save({
    dataUrl: exportedImage.value,
    fileName: props.skillBuild.name + '.png',
  })
}
</script>

<template>
  <div>
    <cy-button-circle small icon="mdi:export-variant" @click="visible = true" />
    <FloatPage
      v-model:visible="visible"
      :title="t('character-simulator.skill-build.export-buile-title')"
    >
      <div class="h-full w-full p-4 wd:flex">
        <cy-tabs
          v-model="currentExportMode"
          :class="device.isWide ? 'mr-6 min-w-[8rem]' : 'mb-6'"
          :direction="device.isWide ? 'vertical' : 'horizontal'"
        >
          <cy-tab :value="ExportMode.Text">
            {{ t('character-simulator.skill-build.export-text') }}
          </cy-tab>
          <cy-tab :value="ExportMode.Image">
            {{ t('character-simulator.skill-build.export-image') }}
          </cy-tab>
        </cy-tabs>
        <div
          v-if="currentExportMode === ExportMode.Text"
          :class="device.isWide ? 'grow overflow-y-auto' : 'pb-6'"
        >
          <div class="mb-4 flex">
            <cy-button-circle icon="mdi:content-copy" small @click="copyText" />
            <div class="flex min-h-full items-center px-4 text-sm text-primary-50">
              {{ t('character-simulator.skill-build.export-text-caption') }}
            </div>
          </div>
          <div ref="eportedTextContent" v-html="exportedText" />
        </div>
        <div
          v-if="currentExportMode === ExportMode.Image"
          :class="device.isWide ? 'grow overflow-y-auto' : 'pb-6'"
        >
          <div class="mb-4 flex">
            <cy-button-circle icon="mdi:download" small @click="downloadImage" />
            <div class="space-y-2 px-4 text-sm text-primary-50">
              <div>
                {{ t('character-simulator.skill-build.export-image-caption.0') }}
              </div>
              <div>
                {{ t('character-simulator.skill-build.export-image-caption.1') }}
              </div>
              <div>
                {{ t('character-simulator.skill-build.export-image-caption.2') }}
              </div>
            </div>
          </div>
          <div class="w-full overflow-x-auto">
            <img :src="exportedImage" class="max-w-none" />
          </div>
        </div>
      </div>
    </FloatPage>
  </div>
</template>
