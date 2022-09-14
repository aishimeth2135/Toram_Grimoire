<template>
  <div>
    <component :is="sectionComponent" :section="section" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import BookPageSectionContent from './book-page-section-content.vue'
import BookPageSectionDetail from './book-page-section-detail.vue'
import BookPageSectionEquipment from './book-page-section-equipment.vue'

import { BookPageSection } from '../setup/Book'
import { BookPageSectionTypes } from '../setup/Book/enums'

interface Props {
  section: BookPageSection;
}

const props = defineProps<Props>()

const sectionComponent = computed(() => {
  if (props.section.type === BookPageSectionTypes.Content) {
    return BookPageSectionContent
  }
  if (props.section.type === BookPageSectionTypes.Detail) {
    return BookPageSectionDetail
  }
  if (props.section.type === BookPageSectionTypes.Equipment) {
    return BookPageSectionEquipment
  }
  return null
})
</script>

<style lang="postcss" scoped>
:deep(.book-page-section-md-content) {
  h1 {
    @apply text-2xl border-b;
  }
  h2 {
    @apply text-xl border-b;
  }
  h3 {
    @apply text-lg;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply border-primary-30 mt-6 mb-4 pb-0.5 px-0.5 text-primary-70;
  }

  p, blockquote, dl, table, pre {
    @apply mt-0 mb-4;
  }

  p {
    @apply px-1;
  }

  strong {
    @apply font-normal text-primary-60 decoration-primary-60;
  }

  mark {
    @apply px-0.5;
  }

  blockquote {
    @apply px-4 py-1 border-l-2 border-primary-30 text-primary-70;

    & > *:last-child {
      @apply mb-0;
    }
  }

  a {
    @apply text-primary-50 underline;
  }

  ul, ol {
    @apply pr-2 py-1 mb-3;
  }
  li {
    @apply items-start;

    & > svg {
      @apply inline-block mb-0.5;
    }
  }
  ul {
    @apply pl-2.5;
  }
  ul > li {
    @apply relative pl-5 pb-1;
  }
  ul > li::before {
    content: '';
    @apply absolute left-0 top-1 w-2 h-2 bg-primary-30 rounded-full;
  }
  ol {
    list-style-type: decimal;
    @apply pl-4;
  }
  ol > li {
    @apply pl-1.5 pb-1 ml-2;
  }
  ol > li::marker {
    @apply text-primary-30;
  }

  hr {
    height: 1px;
    @apply my-4 mx-1 bg-primary-30 border-0;
  }

  code {
    @apply bg-primary-5 mx-0.5 rounded-sm text-sm;
    padding: 0.125em 0;
    color: inherit !important;

    &::before, &::after {
      letter-spacing: -0.2em;
      content: "\00a0";
    }
  }

  pre {
    @apply px-4 py-3 bg-primary-5 rounded-md mx-0.5 overflow-x-auto;

    code {
      @apply m-0 p-0 bg-opacity-0;

      &::before, &::after {
        content: none;
      }
    }
  }

  table > thead > tr, table > tbody > tr {
    & > th {
      @apply text-sm text-primary-30 text-left font-normal border-b-1 border-primary-30 px-3 py-1.5;
    }
    & > td {
      @apply border-b border-primary-30 px-3 py-1.5;
    }
    & > th:first-child, & > td:first-child {
      @apply pl-5;
    }
    & > th:last-child, & > td:last-child {
      @apply pr-5;
    }
  }
}
</style>