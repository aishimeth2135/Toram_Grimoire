<template>
  <div>
    <div class="heal-formula-main inline-flex flex-wrap items-center pb-1.5">
      <div class="heal-formula-main-first" />
      <span v-if="isSingleValue" class="attr-item text-primary-30 mr-1 text-sm">
        {{ t('skill-query.branch.heal.constant-prefix') }}
      </span>
      <template v-if="container.has('constant')">
        <SkillBranchPropValue class="attr-item" :result="container.result('constant')" />
        <cy-icon v-if="extraItems.length !== 0" icon="ic-round-add" />
      </template>

      <template v-for="(item, idx) in extraItems" :key="item.key">
        <span class="attr-item space-x-0.5">
          <span>{{ item.text }}</span>
          <cy-icon icon="ic-round-close" />
          <SkillBranchPropValue class="attr-item" :result="container.result(item.key)" />
        </span>
        <cy-icon v-if="idx !== extraItems.length - 1" icon="ic-round-add" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { isNumberString } from '@/shared/utils/string'

import SkillBranchPropValue from './skill-branch-prop-value.vue'

import DisplayDataContainer, {
  type HealExtraItem,
} from '../branch-handlers/handle/DisplayDataContainer'

interface Props {
  container: DisplayDataContainer
}

const props = defineProps<Props>()

const { container } = toRefs(props)
const { t } = useI18n()

const extraItems = computed<HealExtraItem[]>(() => container.value.getCustomData('healExtraItems'))

const isSingleValue = computed(() => {
  return extraItems.value.length === 0 && isNumberString(container.value.getValue('constant'))
})
</script>

<style scoped>
@reference "@/tailwind.css";

.attr-item {
  display: inline-flex;
  align-items: center;
  padding-inline: --spacing(1.5);
}

.heal-formula-main > .heal-formula-main-first + .attr-item {
  padding-left: --spacing(0);
}
</style>
