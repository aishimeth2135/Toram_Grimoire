<template>
  <div>
    <div class="heal-formula-main inline-flex flex-wrap items-center">
      <div class="heal-formula-main-first" />
      <span v-if="isSingleValue" class="attr-item mr-1 text-sm text-primary-30">
        {{ t('skill-query.branch.heal.constant-pretext') }}
      </span>
      <span
        v-if="container.get('constant')"
        class="attr-item"
        v-html="container.get('constant')"
      />
      <cy-icon-text
        v-if="container.get('constant') && extraValueList.length !== 0"
        icon="ic-round-add"
      />

      <template
        v-for="(item, idx) in extraValueList"
        :key="item.text + item.value"
      >
        <span class="attr-item space-x-0.5">
          <span>{{ item.text }}</span>
          <cy-icon-text icon="ic-round-close" />
          <span class="text-primary-50" v-html="item.value" />
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
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { isNumberString } from '@/shared/utils/string'

import DisplayDataContainer from '../branch-handlers/handle/DisplayDataContainer'

interface Props {
  container: DisplayDataContainer
}

const props = defineProps<Props>()

const { container } = toRefs(props)
const { t } = useI18n()

const extraValueList = computed(
  () =>
    container.value.getCustomData('extraValueList') as {
      text: string
      value: string
    }[]
)

const isSingleValue = computed(() => {
  return (
    extraValueList.value.length === 0 &&
    isNumberString(container.value.containers['constant'].value)
  )
})
</script>

<style lang="postcss" scoped>
.attr-item {
  @apply my-1 inline-flex items-center py-0.5 px-1.5;
}

.heal-formula-main > .heal-formula-main-first + .attr-item {
  @apply pl-0;
}
</style>
