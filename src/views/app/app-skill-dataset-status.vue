<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import {
  glossaryDatasetStatus,
  retryGlossaryDataset,
} from '@/stores/app/datas/utils/DownloadGlossaryDataset'
import {
  retrySkillDataset,
  skillDatasetStatus,
} from '@/stores/app/datas/utils/DownloadSkillDataset'

import { AppRouteNames } from '@/router/enums'

const { t } = useI18n()
const props = defineProps<{ dataset?: 'glossary' }>()
const messages = props.dataset === 'glossary' ? 'app.glossary-dataset' : 'app.skill-dataset'
const route = useRoute()
const retrying = ref(false)
const status = computed(() => {
  const usesData = route.matched.some(
    record =>
      record.name === AppRouteNames.SkillQuery ||
      record.name === AppRouteNames.CharacterSimulator ||
      record.name === AppRouteNames.Registlet ||
      (props.dataset === 'glossary' && record.name === AppRouteNames.Glossary)
  )
  const snapshot =
    props.dataset === 'glossary' ? glossaryDatasetStatus.value : skillDatasetStatus.value
  return usesData && snapshot.state === 'ready' ? snapshot : null
})

async function retry() {
  retrying.value = true
  try {
    await (props.dataset === 'glossary' ? retryGlossaryDataset : retrySkillDataset)()
  } catch {
    // The current model remains usable and the status reports that it may be stale.
  } finally {
    retrying.value = false
  }
}

const reload = () => window.location.reload()
</script>

<template>
  <section
    v-if="status && (status.stale || !status.offlineReady || status.updateAvailable)"
    class="bg-orange-10 text-primary-80 flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm"
    aria-live="polite"
    :data-skill-dataset-status="dataset === 'glossary' ? undefined : ''"
    :data-glossary-dataset-status="dataset === 'glossary' ? '' : undefined"
  >
    <div>
      <p v-if="status.updateAvailable">{{ t(messages + '.update') }}</p>
      <p v-else-if="status.stale">{{ t(messages + '.stale') }}</p>
      <p v-if="!status.offlineReady">{{ t(messages + '.no-offline') }}</p>
    </div>
    <cy-button-plain v-if="status.updateAvailable" icon="mdi-refresh" @click="reload">
      {{ t('app.loading-message.retry') }}
    </cy-button-plain>
    <cy-button-plain v-else icon="mdi-refresh" :disabled="retrying" @click="retry">
      {{ t(retrying ? 'app.loading-message.retrying' : messages + '.retry') }}
    </cy-button-plain>
  </section>
</template>
