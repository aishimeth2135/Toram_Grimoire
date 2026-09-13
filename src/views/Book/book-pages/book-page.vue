<template>
  <div class="bg-white p-4">
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
