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

<style lang="postcss">
.app-layout-main--container {
  @apply flex min-h-full flex-shrink-0 flex-col pb-16;
}

@media (min-width: 880px) {
  .app-layout-main--container.page-two-columns {
    @apply h-full w-full flex-row;
    padding-left: var(--app-side-menu-minimize-width);
    max-width: none;

    & > .two-columns-column {
      width: 50%;
      @apply mr-1 h-full overflow-y-auto rounded-sm border-1 border-primary-30;
    }
  }
}

.app-layout-main--aside {
  @apply fixed h-full overflow-x-hidden overflow-y-scroll;

  width: calc(
    100% - (100% - var(--app-screen-max-width)) / 2 - var(--app-side-menu-width) -
      var(--app-main-content-width) - var(--app-main-content-padding-x) * 2
  );
  top: 0;
  right: calc(-1 * var(--app-layout-main--aside-scroll-width-extra));
  padding-right: calc(1rem + var(--app-layout-main--aside-scroll-width-extra));

  --app-layout-main--aside-scroll-width-extra: 0.5rem;
}

/* bottom */
.app-layout--bottom {
  @apply pointer-events-none sticky bottom-0 z-20 p-2 wd:fixed;
}
</style>
