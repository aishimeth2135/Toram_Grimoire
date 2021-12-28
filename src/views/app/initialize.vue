<template>
  <div
    v-if="status !== 3"
    class="w-full h-full fixed top-0 left-0 bg-white z-100 flex items-center justify-center p-4"
  >
    <template v-if="status < 3">
      <div class="max-w-full text-center w-128">
        <div class="border-b border-light pb-4">
          <LoadingAnimation :status="status" @done="store.commit('initialize/initFinished')" />
        </div>
        <div class="pt-8 inline-block">
          <div v-for="item in initItems" :key="item.msg" class="flex justify-center items-center mb-2 pl-1">
            <span class="mr-3 w-full text-light-4">{{ t(item.msg) }}</span>
            <cy-icon-text
              class="flex"
              :icon="statusIcon(item.status)"
              :class="{ 'loading-circle': item.status === 0 }"
              :icon-color="item.status === -1 ? 'red' : 'water-blue'"
            />
          </div>
        </div>
      </div>
      <div class="absolute right-4 bottom-4 text-sm">
        <div>{{ t('app.loading-message.bottom-tips.0') }}</div>
        <div>{{ t('app.loading-message.bottom-tips.1') }}</div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AppInitialzie',
};
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { createNamespacedHelpers } from 'vuex-composition-helpers';

import LoadingAnimation from './initialization/loading-animation.vue';

const store = useStore();
const { useState } = createNamespacedHelpers('initialize');

const {
  initItems,
  status,
} = useState(['initItems', 'status', 'msgItems']);

const { t } = useI18n();
const statusIcon = (value: number) => {
  if (value >= 0) {
    return ['mdi-loading', 'ic-round-check-circle-outline'][value];
  }
  return 'ic-round-close';
};
</script>

<style lang="less" scoped>
&.loading-circle {
  animation: loading-circle 0.8s ease infinite;
}
@keyframes loading-circle {
  0% {
    transform: rotateZ(0);
  }
  80% {
    transform: rotateZ(359deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
</style>
