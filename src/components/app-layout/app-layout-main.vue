<template>
  <main class="app-layout-main" :class="{ 'two-columns': twoColumns }">
    <slot></slot>
    <template v-if="twoColumns">
      <div class="two-columns-column">
        <slot name="column(0)" />
      </div>
      <div class="two-columns-column">
        <slot name="column(1)" />
      </div>
    </template>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const currentRoute = useRoute()

const twoColumns = computed(() => currentRoute.meta.twoColumnsLayout === true)
</script>

<style lang="postcss" scoped>
.app-layout-main {
  max-width: 48rem;
  @apply mx-auto flex min-h-full flex-col;
}

@media (min-width: 55rem) {
  .app-layout-main.two-columns {
    @apply h-full w-full flex-row pl-14;
    max-width: none;

    & > .two-columns-column {
      width: 50%;
      @apply mr-1 h-full overflow-y-auto rounded-sm border-1 border-primary-30;
    }
  }
}
</style>
