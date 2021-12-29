<template>
  <transition name="fade">
    <div
      v-show="visible"
      class="app-left-menu--wrapper"
      @click.stop="toggleVisible"
    >
      <div class="content-container" @click.stop>
        <div class="h-full overflow-y-auto">
          <div class="mx-1">
            <router-link
              v-for="(data) in viewButtons"
              :key="data.title"
              v-slot="{ navigate }"
              :to="{ name: data.pathName }"
              custom
            >
              <cy-button-line
                :icon="data.icon"
                class="app-left-menu--link-button"
                @click="navigate"
              >
                {{ t(data.title) }}
              </cy-button-line>
            </router-link>
          </div>
        </div>
        <div v-if="router.currentRoute.value.name !== 'Home'" class="flex mt-auto pt-2 ai-center justify-end">
          <cy-button-circle icon="bx:bx-share-alt" @click="copyCurrentUrl" />
          <router-link v-slot="{ navigate }" :to="{ name: 'Home' }" custom>
            <cy-button-circle icon="ant-design:home-outlined" @click="navigate" />
          </router-link>
        </div>
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
import type { Ref } from 'vue';

import CY from '@/shared/utils/Cyteria';

import Notify from '@/setup/Notify';

const router = useRouter();
const { t } = useI18n();
const store = useStore();
const { useState } = createNamespacedHelpers('left-menu');

const {
  viewButtons,
  visible,
} = useState(['viewButtons', 'visible']) as {
  viewButtons: Ref<{
    title: string;
    icon: string;
    pathName: string;
  }[] | null>;
  visible: Ref<boolean>;
};

const toggleVisible = () => {
  store.commit('left-menu/toggleVisible');
};

const { notify } = Notify();

const copyCurrentUrl = () => {
  CY.copyToClipboard(window.location.href);
  notify(t('app.features.copy-url-to-clipboard-success-tips'));
};
</script>

<style lang="postcss" scoped>
.app-left-menu--wrapper {
  @apply fixed w-64 top-11 left-2 opacity-100 z-100;
  height: calc(100% - 6.5rem);

  &.fade-enter-from, &.fade-leave-to {
    opacity: 0;
  }

  &.fade-enter-active, &.fade-leave-active {
    @apply duration-200;
  }

  & > .content-container {
    @apply p-2 pb-1 h-full w-full border-r border-light flex flex-col;
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

.app-left-menu--link-button {
  @apply w-full;
  @apply mx-0 !important;
}
</style>
