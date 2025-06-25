<script lang="ts" setup>
import { useDevice } from '@/shared/setup/Device'
import { usePageLayout } from '@/shared/setup/Layout'

const { layout } = usePageLayout()

const { device } = useDevice()
</script>

<template>
  <main class="app-layout-container-root min-h-full">
    <div
      class="app-layout-main--container app-layout-horizontal-container"
      :class="{
        'page-two-columns': layout.twoColumns,
      }"
    >
      <slot></slot>
      <template v-if="layout.twoColumns">
        <div class="two-columns-column">
          <slot name="column(0)" />
        </div>
        <div class="two-columns-column">
          <slot name="column(1)" />
        </div>
      </template>
    </div>
    <aside v-if="device.hasAside" class="app-layout-main--aside">
      <div class="bg-white py-4">
        <slot name="aside"></slot>
      </div>
    </aside>
  </main>
</template>
