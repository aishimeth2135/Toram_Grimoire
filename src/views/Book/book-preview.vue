<template>
  <AppLayoutMain class="py-4">
    <template #column(0)>
      <textarea
        v-model="currentText"
        class="book-preview-textarea outline-hidden m-0 block h-full w-full resize-none border-0 bg-white p-3 !font-mono"
      />
    </template>
    <template #column(1)>
      <div>
        <BookPages :pages="pages" />
      </div>
    </template>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import Papa from 'papaparse'
import { ref, shallowRef, watch } from 'vue'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import BookPages from './book-pages/index.vue'

import { BookPage } from './setup/Book'
import { parseBook } from './setup/parseBook'
import { getExamplePagesText } from './setup/utils'

const currentText = ref(getExamplePagesText())

const pages = shallowRef<BookPage[]>([])

watch(
  currentText,
  value => {
    const text = value
    const parse = Papa.parse(text)
    if (
      parse.errors.length === 0 ||
      (parse.errors.length === 1 && parse.errors[0].code === 'UndetectableDelimiter')
    ) {
      const datas = parse.data as string[][]
      pages.value = parseBook(datas)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
@reference "@/tailwind.css";

@media (max-width: 55rem) {
  .book-preview-textarea {
    @apply mb-6 h-128;
  }
}
</style>
