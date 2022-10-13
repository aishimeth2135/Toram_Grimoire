<template>
  <div
    class="book-page-section-md-content"
    v-html="getSectionContentMd(section)"
  ></div>
</template>

<script lang="ts" setup>
import { BookPageSection } from '../setup/Book'
import { getSectionContentMd } from './utils'

interface Props {
  section: BookPageSection
}

defineProps<Props>()
</script>

<style lang="postcss" scoped>
:deep(.book-page-section-md-content) {
  h1 {
    @apply border-b text-2xl;
  }
  h2 {
    @apply border-b text-xl;
  }
  h3 {
    @apply text-lg;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply mt-6 mb-4 border-primary-30 px-0.5 pb-0.5 text-primary-70;
  }

  p,
  blockquote,
  dl,
  table,
  pre {
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
    @apply border-l-2 border-primary-30 px-4 py-1 text-primary-70;

    & > *:last-child {
      @apply mb-0;
    }
  }

  a {
    @apply text-primary-50 underline;
  }

  ul,
  ol {
    @apply mb-3 py-1 pr-2;
  }
  li {
    @apply items-start;

    & > svg {
      @apply mb-0.5 inline-block;
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
    @apply absolute left-0 top-1 h-2 w-2 rounded-full bg-primary-30;
  }
  ol {
    list-style-type: decimal;
    @apply pl-4;
  }
  ol > li {
    @apply ml-2 pl-1.5 pb-1;
  }
  ol > li::marker {
    @apply text-primary-30;
  }

  hr {
    height: 1px;
    @apply my-4 mx-1 border-0 bg-primary-30;
  }

  code {
    @apply mx-0.5 rounded-sm bg-primary-5 text-sm;
    padding: 0.125em 0;
    color: inherit !important;

    &::before,
    &::after {
      letter-spacing: -0.2em;
      content: '\00a0';
    }
  }

  pre {
    @apply mx-0.5 overflow-x-auto rounded-md bg-primary-5 px-4 py-3;

    code {
      @apply m-0 bg-opacity-0 p-0;

      &::before,
      &::after {
        content: none;
      }
    }
  }

  table > thead > tr,
  table > tbody > tr {
    & > th {
      @apply border-b-1 border-primary-30 px-3 py-1.5 text-left text-sm font-normal text-primary-30;
    }
    & > td {
      @apply border-b border-primary-30 px-3 py-1.5;
    }
    & > th:first-child,
    & > td:first-child {
      @apply pl-5;
    }
    & > th:last-child,
    & > td:last-child {
      @apply pr-5;
    }
  }
}
</style>
