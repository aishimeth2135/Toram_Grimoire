<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import {
  retrySkillDataset,
  skillDatasetStatus,
} from '@/stores/app/datas/utils/DownloadSkillDataset'

import { AppRouteNames } from '@/router/enums'

const { t } = useI18n()
const route = useRoute()
const retrying = ref(false)
const status = computed(() => {
  const skillRoute = route.matched.some(
    record =>
      record.name === AppRouteNames.SkillQuery ||
      record.name === AppRouteNames.CharacterSimulator ||
      record.name === AppRouteNames.Registlet
  )
  const snapshot = skillDatasetStatus.value
  return skillRoute && snapshot.state === 'ready' ? snapshot : null
})

async function retry() {
  retrying.value = true
  try {
    await retrySkillDataset()
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
    data-skill-dataset-status
  >
    <div>
      <p v-if="status.updateAvailable">{{ t('app.skill-dataset.update') }}</p>
      <p v-else-if="status.stale">{{ t('app.skill-dataset.stale') }}</p>
      <p v-if="!status.offlineReady">{{ t('app.skill-dataset.no-offline') }}</p>
    </div>
    <cy-button-plain v-if="status.updateAvailable" icon="mdi-refresh" @click="reload">
      {{ t('app.loading-message.retry') }}
    </cy-button-plain>
    <cy-button-plain v-else icon="mdi-refresh" :disabled="retrying" @click="retry">
      {{ t(retrying ? 'app.loading-message.retrying' : 'app.skill-dataset.retry') }}
    </cy-button-plain>
  </section>
</template>
