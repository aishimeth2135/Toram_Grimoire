<template>
  <transition name="fade">
    <div
      v-if="viewButtons && viewButtons.length !== 0"
      v-show="visible"
      class="app-left-menu--wrapper"
      @click.stop="toggleVisible"
    >
      <div class="content-container" @click.stop>
        <cy-button-line
          v-for="(data) in viewButtons"
          :key="data.title"
          :icon="data.icon"
          class="w-full"
          @click="setCurrentView(data)"
        >
          {{ t(data.title) }}
        </cy-button-line>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
export default {
  name: 'AppLeftMenu',
};
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { createNamespacedHelpers } from 'vuex-composition-helpers';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const router = useRouter();
const { t } = useI18n();
const store = useStore();
const { useState } = createNamespacedHelpers('left-menu');

const {
  viewButtons,
  visible,
} = useState(['viewButtons', 'visible']);

const setCurrentView = (data: { pathName: string }) => {
  if (router.currentRoute.value.name !== data.pathName) {
    router.replace({ name: data.pathName });
  }
};

const toggleVisible = () => {
  store.commit('left-menu/toggleVisible');
};
</script>

<style lang="postcss" scoped>
.app-left-menu--wrapper {
  @apply fixed w-64 top-11 left-2 opacity-100 z-100;
  height: calc(100% - 5rem);

  &.fade-enter-from, &.fade-leave-to {
    opacity: 0;
  }

  &.fade-enter-active, &.fade-leave-active {
    @apply duration-200;
  }

  & > .content-container {
    @apply p-2 w-full h-full overflow-y-auto;
  }
}

@media screen and (max-width: 82rem) {
  .app-left-menu--wrapper {
    @apply top-0 left-0 right-auto bg-black bg-opacity-50 h-full;
    width: calc(100% + 30rem);

    &.fade-enter-from, &.fade-leave-to {
      @apply -left-80 opacity-100;
    }

    & > .content-container {
      @apply w-64 bg-white bg-opacity-100 pt-4;
    }

    &.content-invisible {
      display: none;
    }
  }
}
</style>
