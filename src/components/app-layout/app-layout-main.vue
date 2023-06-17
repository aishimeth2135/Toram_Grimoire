<template>
  <main
    class="app-layout-main--root flex min-h-full w-full justify-center"
    :class="{ 'has-aside': device.hasAside && !noAside }"
  >
    <div
      class="app-layout-main--container"
      :class="{ 'two-columns': twoColumns }"
    >
      <slot></slot>
      <template v-if="twoColumns">
        <div class="two-columns-column">
          <slot name="column(0)" />
        </div>
        <div class="two-columns-column">
          <slot name="column(1)" />
        </div>
      </template>
    </div>
    <aside v-if="!noAside && device.hasAside" class="app-layout-main--aside">
      <div class="app-layout-main--aside-container">
        <slot name="aside"></slot>
      </div>
    </aside>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useDevice } from '@/shared/setup/Device'

interface Props {
  noAside?: boolean
}

withDefaults(defineProps<Props>(), { noAside: false })

const currentRoute = useRoute()

const twoColumns = computed(() => currentRoute.meta.twoColumnsLayout === true)

const { device } = useDevice()
</script>

<style lang="postcss" scoped>
.app-layout-main--container {
  @apply flex min-h-full flex-shrink-0 flex-col;

  width: var(--app-main-content-width);
}

@media (max-width: 816px) {
  .app-layout-main--container {
    width: 100%;
  }
}

@media (min-width: 880px) {
  .app-layout-main--container.two-columns {
    @apply h-full w-full flex-row;
    padding-left: 56px;
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
</style>
