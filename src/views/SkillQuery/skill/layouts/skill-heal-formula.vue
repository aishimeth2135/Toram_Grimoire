<template>
  <div>
    <div class="heal-formula-main inline-flex flex-wrap items-center pb-1.5">
      <div class="heal-formula-main-first" />
      <span v-if="isSingleValue" class="attr-item text-primary-30 mr-1 text-sm">
        {{ t('skill-query.branch.heal.constant-prefix') }}
      </span>
      <template v-if="container.has('constant')">
        <SkillBranchPropValue class="attr-item" :result="container.result('constant')" />
        <cy-icon v-if="extraTextList.length !== 0" icon="ic-round-add" />
      </template>

      <template v-for="(text, idx) in extraTextList" :key="text + idx">
        <span class="attr-item space-x-0.5">
          <span>{{ text }}</span>
          <cy-icon icon="ic-round-close" />
          <SkillBranchPropValue
            class="attr-item"
            :result="container.result(`@extra_value[${idx}]`)"
          />
        </span>
        <cy-icon v-if="idx !== extraTextList.length - 1" icon="ic-round-add" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { isNumberString } from '@/shared/utils/string'

import SkillBranchPropValue from './skill-branch-prop-value.vue'

import DisplayDataContainer from '../branch-handlers/handle/DisplayDataContainer'

interface Props {
  container: DisplayDataContainer
}

const props = defineProps<Props>()

const { container } = toRefs(props)
const { t } = useI18n()

const extraTextList = computed(() => container.value.getCustomData('extraTextList') as string[])

const isSingleValue = computed(() => {
  return extraTextList.value.length === 0 && isNumberString(container.value.getValue('constant'))
})
</script>

<style scoped>
@reference "@/tailwind.css";

.attr-item {
  @apply inline-flex items-center px-1.5;
}

.heal-formula-main > .heal-formula-main-first + .attr-item {
  @apply pl-0;
}
</style>
