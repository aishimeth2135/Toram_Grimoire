<template>
  <div
    class="book-page-section-md-content"
    v-html="getSectionContentMd(section)"
  >
  </div>
</template>

<script lang="ts" setup>
import { BookPageSection } from '../setup/Book'
import { getSectionContentMd } from './utils'

interface Props {
  section: BookPageSection;
}

defineProps<Props>()
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
    @apply border-light-2 mt-6 mb-4 pb-0.5 px-0.5 text-dark-light;
  }

  p, blockquote, dl, table, pre {
    @apply mt-0 mb-4;
  }

  p {
    @apply px-1;
  }

  strong {
    @apply font-normal text-light-4 decoration-light-4;
  }

  mark {
    @apply px-0.5;
  }

  blockquote {
    @apply px-4 py-1 border-l-2 border-light text-dark-light;

    & > *:last-child {
      @apply mb-0;
    }
  }

  a {
    @apply text-light-3 underline;
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
    @apply absolute left-0 top-1 w-2 h-2 bg-light rounded-full;
  }
  ol {
    list-style-type: decimal;
    @apply pl-4;
  }
  ol > li {
    @apply pl-1.5 pb-1 ml-2;
  }
  ol > li::marker {
    @apply text-light-2;
  }

  hr {
    height: 1px;
    @apply my-4 mx-1 bg-light border-0;
  }

  code {
    @apply bg-light-0 mx-0.5 rounded-sm text-sm;
    padding: 0.125em 0;
    color: inherit !important;

    &::before, &::after {
      letter-spacing: -0.2em;
      content: "\00a0";
    }
  }

  pre {
    @apply px-4 py-3 bg-light-0 rounded-md mx-0.5 overflow-x-auto;

    code {
      @apply m-0 p-0 bg-opacity-0;

      &::before, &::after {
        content: none;
      }
    }
  }

  table > thead > tr, table > tbody > tr {
    & > th {
      @apply text-sm text-light-2 text-left font-normal border-b-1 border-light-2 px-3 py-1.5;
    }
    & > td {
      @apply border-b border-light px-3 py-1.5;
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
