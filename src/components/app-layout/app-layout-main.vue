<script lang="ts" setup>
import { computed } from 'vue'

import { useDevice } from '@/shared/setup/Device'
import { usePageLayout } from '@/shared/setup/Layout'

interface Props {
  noAside?: boolean
}

const props = withDefaults(defineProps<Props>(), { noAside: false })

const { layout } = usePageLayout()

const { device } = useDevice()

const hasAside = computed(() => device.hasAside && !props.noAside)
</script>

<template>
  <main
    class="app-layout-main--root flex min-h-full w-full justify-center"
    :class="{ 'has-aside': hasAside }"
  >
    <div
      class="app-layout-main--container"
      :class="{
        'page-two-columns': layout.twoColumns,
        'page-wide': layout.wide && !device.isMobile,
        'page-mobile': device.isMobile,
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
    <aside v-if="hasAside" class="app-layout-main--aside">
      <div class="app-layout-main--aside-container">
        <slot name="aside"></slot>
      </div>
    </aside>
  </main>
</template>

<style lang="postcss">
.app-layout-main--container {
  @apply flex min-h-full flex-shrink-0 flex-col pb-16;

  width: var(--app-main-content-width);
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

.app-layout-main--aside-container {
  @apply bg-white py-4;
}

.app-layout-main--root.has-aside {
  padding-left: calc(
    (100% - var(--app-screen-max-width)) / 2 + var(--app-side-menu-width) +
      var(--app-main-content-padding-x)
  );
  padding-right: calc(
    100% - (100% - var(--app-screen-max-width)) / 2 - var(--app-side-menu-width) -
      var(--app-main-content-width) - var(--app-main-content-padding-x) * 2
  );
}

.app-layout-main--container.page-wide {
  @apply w-full;
  padding-left: var(--app-side-menu-minimize-width);
  padding-right: var(--app-side-menu-minimize-width);
  max-width: var(--app-screen-max-width);

  & .app-layout--bottom {
    @apply w-full;
    padding-left: var(--app-side-menu-minimize-width);
    padding-right: var(--app-side-menu-minimize-width);
    max-width: var(--app-screen-max-width);
  }
}

.app-layout-main--container.page-mobile {
  padding-top: 2rem;
}

/* bottom */
.app-layout--bottom {
  @apply pointer-events-none fixed bottom-0 z-20 p-2;
  width: var(--app-main-content-width);
}

@media (max-width: 816px) {
  .app-layout-main--container {
    @apply w-full;
  }

  .app-layout--bottom {
    @apply w-full;
  }
}
</style>
