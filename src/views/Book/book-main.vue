<template>
  <AppLayoutMain class="py-6">
    <div v-if="!hasQuery">
      <div class="py-3 px-4 border-1 border-light-2 rounded-sm bg-white">
        <textarea
          v-model="urlText"
          class="border-0 bg-transparent resize-none w-full outline-none"
          placeholder="https://"
        />
      </div>
      <div class="bg-light-0 rounded-r-md py-3 px-4 mt-6">
        {{ convertedUrl }}
      </div>
    </div>
    <div v-else>
      <div v-if="loading">
        Loading...
      </div>
      <BookPages
        v-else-if="pages.length > 0"
        :pages="pages"
      />
      <div v-else>
        No Data
      </div>
    </div>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { computed, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { downloadCsv } from '@/stores/app/datas/utils/DownloadDatas'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import { AppRouteNames } from '@/router/enums'

import BookPages from './book-pages/index.vue'

import { BookPage } from './setup/Book'
import { parseBook } from './setup/parseBook'

const router = useRouter()
const currentRoute = useRoute()

const urlText = ref('')

const fixedEncodeURIComponent = (str: string) => {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (char) {
    return '%' + char.charCodeAt(0).toString(16).toUpperCase()
  })
}

const convertedUrl = computed(() => {
  if (!urlText.value.startsWith('https://')) {
    return ''
  }
  const uri = fixedEncodeURIComponent(urlText.value)
  const href = router.resolve({
    name: AppRouteNames.BookView,
    query: { csv: uri, latest: '1' },
  }).href
  return `${location.protocol}//${location.host}${href}`
})

const hasQuery = computed(() => typeof currentRoute.query.csv === 'string')

const loading = ref(false)
const pages = shallowRef<BookPage[]>([])
const checkQuery = async () => {
  if (typeof currentRoute.query.csv === 'string') {
    loading.value = true
    let url = decodeURIComponent(currentRoute.query.csv)
    if (typeof currentRoute.query.latest === 'string' && currentRoute.query.latest === '1') {
      url += ('&cytime=' + Date.now())
    }
    console.log(url)
    const datas = await downloadCsv(url)
    pages.value = parseBook(datas)
    loading.value = false
  }
}

checkQuery()
</script>
