<template>
  <div>
    <div class="inline-flex items-center flex-wrap">
      <span
        v-if="isSingleValue"
        class="text-sm mr-1 text-light-2"
      >
        {{ t('skill-query.branch.heal.constant-pretext') }}
      </span>
      <span
        v-if="container.get('constant')"
        class="attr-scope"
        v-html="container.get('constant')"
      />
      <cy-icon-text
        v-if="container.get('constant') && container.get('@extra-value-list').length !== 0"
        icon="ic-round-add"
      />

      <template
        v-for="(item, idx) in extraValueList"
        :key="item.text + item.value"
      >
        <span class="extra-value">
          <span class="attr-scope title">{{ item.text }}</span>
          <cy-icon-text icon="ic-round-close" />
          <span class="attr-scope value" v-html="item.value" />
        </span>
        <cy-icon-text
          v-if="idx !== extraValueList.length - 1"
          icon="ic-round-add"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from '@vue/reactivity';
import { useI18n } from 'vue-i18n';

import { isNumberString } from '@/shared/utils/string';

import DisplayDataContainer from '../branch-handlers/utils/DisplayDataContainer';

interface Props {
  container: DisplayDataContainer;
}

const props = defineProps<Props>();

const { container } = toRefs(props);
const { t } = useI18n();

const extraValueList = computed(() => container.value.customDatas.extraValueList as { text: string; value: string }[]);

const isSingleValue = computed(() => {
  return extraValueList.value.length === 0 && isNumberString(container.value.containers['constant'].value);
});
</script>

<style lang="postcss" scoped>
.divider {
  @apply border-l-1 border-light-2 mx-2 h-6;
}

.attr-item {
  @apply inline-flex items-center my-1 py-0.5 px-1.5;
}
</style>
