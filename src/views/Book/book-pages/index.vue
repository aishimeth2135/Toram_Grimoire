<template>
  <div class="space-y-3">
    <BookPageView v-for="(page, idx) in pages" :key="idx" :page="page" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'BookPages',
}
</script>

<script lang="ts" setup>
import BookPageView from './book-page.vue'

import { BookPage } from '../setup/Book'

interface Props {
  pages: BookPage[]
}

defineProps<Props>()
</script>
