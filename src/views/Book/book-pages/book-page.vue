<template>
  <div class="bg-white px-4 py-4">
    <BookPageSectionView v-for="(section, idx) in page.sections" :key="idx" :section="section" />
  </div>
</template>

<script lang="ts" setup>
import BookPageSectionView from './book-page-section.vue'

import { BookPage } from '../setup/Book'

interface Props {
  page: BookPage
}

defineProps<Props>()
</script>
