<template>
  <AppLayoutMain>
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'BookView',
}
</script>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'

import { downloadCsv } from '@/stores/app/datas/utils/DownloadDatas'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

const currentRoute = useRoute()

const currentUrl = computed(() => {
  if (typeof currentRoute.query.csv === 'string') {
    return decodeURIComponent(currentRoute.query.csv)
  }
  return ''
})

watch(currentUrl, value => {
  const data = downloadCsv(value)
})
</script>
