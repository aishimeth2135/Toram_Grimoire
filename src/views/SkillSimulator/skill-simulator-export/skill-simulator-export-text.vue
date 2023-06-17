<template>
  <cy-modal
    :visible="visible"
    :title="t('skill-simulator.export-text-title')"
    title-icon="mdi:note-text-outline"
    footer
    @close="emit('close')"
  >
    <template #default>
      <div
        ref="eportedTextContent"
        class="border border-primary-50 p-4 text-sm"
        v-html="currentText"
      ></div>
    </template>
    <template #footer-actions>
      <cy-button-action
        icon="bx:copy-alt"
        :disabled="!currentText || !eportedTextContent"
        @click="copyText"
      >
        {{ t('global.copy') }}
      </cy-button-action>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { Ref, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import Notify from '@/shared/setup/Notify'
import Cyteria from '@/shared/utils/Cyteria'

import { SkillBuild } from '@/lib/Character/SkillBuild'

import { exportSkillBuildText } from './utils'

interface Props {
  visible: boolean
  skillBuild: SkillBuild | null
}
interface Emits {
  (evt: 'close'): void
}

const props = defineProps<Props>()
const { visible } = toRefs(props)

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { notify } = Notify()

const eportedTextContent: Ref<HTMLElement | null> = ref(null)
const currentText = ref('')

watch(visible, async value => {
  if (value) {
    currentText.value = props.skillBuild
      ? exportSkillBuildText(props.skillBuild)
      : ''
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
</script>
