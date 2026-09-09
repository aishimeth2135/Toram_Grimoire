<template>
  <div class="book-page-section-md-content" v-html="getSectionContentMd(section)"></div>
</template>

<script lang="ts" setup>
import { BookPageSection } from '../setup/Book'
import { getSectionContentMd } from './utils'

interface Props {
  section: BookPageSection
}

defineProps<Props>()
</script>

<style>
@reference "@/tailwind.css";

.book-page-section-md-content {
  h1 {
    border-bottom-width: 1px;
    font-size: var(--text-2xl);
    line-height: var(--text-2xl--line-height);
  }
  h2 {
    border-bottom-width: 1px;
    font-size: var(--text-xl);
    line-height: var(--text-xl--line-height);
  }
  h3 {
    font-size: var(--text-lg);
    line-height: var(--text-lg--line-height);
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: --spacing(6);
    margin-bottom: --spacing(4);
    border-color: var(--color-primary-30);
    padding-inline: --spacing(0.5);
    padding-bottom: --spacing(0.5);
    color: var(--color-primary-70);
  }

  p,
  blockquote,
  dl,
  table,
  pre {
    margin-top: --spacing(0);
    margin-bottom: --spacing(4);
  }

  p {
    padding-inline: --spacing(1);
  }

  strong {
    color: var(--color-primary-60);
    font-weight: var(--font-weight-normal);
    text-decoration-color: var(--color-primary-60);
  }

  mark {
    padding-inline: --spacing(0.5);
  }

  blockquote {
    border-left-width: 4px;
    border-color: var(--color-primary-30);
    padding-inline: --spacing(4);
    padding-block: --spacing(1);
    color: var(--color-primary-70);

    & > *:last-child {
      margin-bottom: --spacing(0);
    }
  }

  a {
    color: var(--color-primary-50);
    text-decoration-line: underline;
  }

  ul,
  ol {
    margin-bottom: --spacing(3);
    padding-block: --spacing(1);
    padding-right: --spacing(2);
  }
  li {
    align-items: flex-start;

    & > svg {
      display: inline-block;
      margin-bottom: --spacing(0.5);
    }
  }
  ul {
    padding-left: --spacing(2.5);
  }
  ul > li {
    position: relative;
    padding-bottom: --spacing(1);
    padding-left: --spacing(5);

    &::before {
      position: absolute;
      top: --spacing(1);
      left: --spacing(0);
      border-radius: calc(infinity * 1px);
      background-color: var(--color-primary-30);
      width: --spacing(2);
      height: --spacing(2);
      content: '';
    }
  }
  ol {
    padding-left: --spacing(4);
    list-style-type: decimal;
  }
  ol > li {
    margin-left: --spacing(2);
    padding-bottom: --spacing(1);
    padding-left: --spacing(1.5);

    &::marker {
      color: var(--color-primary-30);
    }
  }

  hr {
    margin-inline: --spacing(1);
    margin-block: --spacing(4);
    border-width: 0;
    background-color: var(--color-primary-30);
    height: 1px;
  }

  code {
    margin-inline: --spacing(0.5);
    box-shadow: var(--shadow-xs);
    background-color: var(--color-primary-5);
    padding: 0.125em 0;
    color: inherit !important;
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);

    &::before,
    &::after {
      content: '\00a0';
      letter-spacing: -0.2em;
    }
  }

  pre {
    margin-inline: --spacing(0.5);
    border-radius: var(--radius-md);
    background-color: var(--color-primary-5);
    padding-inline: --spacing(4);
    padding-block: --spacing(3);
    overflow-x: auto;

    code {
      margin: --spacing(0);
      background-color: transparent;
      padding: --spacing(0);

      &::before,
      &::after {
        content: none;
      }
    }
  }

  table > thead > tr,
  table > tbody > tr {
    & > th {
      border-bottom-width: 1px;
      border-color: var(--color-primary-30);
      padding-inline: --spacing(3);
      padding-block: --spacing(1.5);
      color: var(--color-primary-30);
      font-weight: var(--font-weight-normal);
      font-size: var(--text-sm);
      line-height: var(--text-sm--line-height);
      text-align: left;
    }
    & > td {
      border-bottom-width: 1px;
      border-color: var(--color-primary-30);
      padding-inline: --spacing(3);
      padding-block: --spacing(1.5);
    }
    & > th:first-child,
    & > td:first-child {
      padding-left: --spacing(5);
    }
    & > th:last-child,
    & > td:last-child {
      padding-right: --spacing(5);
    }
  }
}
</style>
