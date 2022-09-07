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
  @apply min-h-full mx-auto flex flex-col
}

@media (min-width: 55rem) {
  .app-layout-main.two-columns {
    @apply flex-row h-full w-full pl-14;
    max-width: none;

    & > .two-columns-column {
      width: 50%;
      @apply h-full overflow-y-auto border-1 border-primary-30 rounded-sm mr-1;
    }
  }
}
</style>
