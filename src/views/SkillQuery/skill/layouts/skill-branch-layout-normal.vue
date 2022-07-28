<template>
  <fieldset class="skill-branch-layout-normal border-1 border-light p-2 pt-1 bg-white">
    <legend class="flex items-center px-3">
      <cy-icon-text
        :icon="nameIcon"
        text-color="purple"
      >
        {{ container.get('name') }}
      </cy-icon-text>
      <div v-if="nameProps" class="flex text-sm text-green space-x-1.5 ml-3">
        <span v-for="nameProp in nameProps" :key="nameProp" class="inline-block">
          {{ nameProp }}
        </span>
      </div>
    </legend>
    <div v-if="subContentDatas" class="flex items-center flex-wrap px-1 space-x-3">
      <template v-for="contentData in subContentDatas" :key="contentData.key">
        <span class="sub-content-item">
          <cy-icon-text
            small
            :text-color="contentData.color"
            :icon="contentData.icon"
            :color="contentData.type === 'primary' ? 'red' : 'default'"
          >
            <span v-html="contentData.title"></span>
          </cy-icon-text>
          <span v-if="contentData.value" class="text-sm ml-1.5 text-light-3">
            {{ contentData.value }}
          </span>
        </span>
      </template>
    </div>
    <div class="px-1">
      <slot />
      <div v-if="hasArea">
        <div>
          <cy-button-toggle
            :selected="contents.areaDetail"
            icon="carbon:zoom-in-area"
            @click.stop="toggle('contents/areaDetail')"
          >
            {{ t('skill-query.branch.skill-area.button-text') }}
          </cy-button-toggle>
        </div>
        <div v-if="contents.areaDetail">
          <SkillAreaDetail :skill-branch-item="container.branchItem" :computing="computing" />
        </div>
      </div>
    </div>
    <div>
      <slot name="extra-columns-start" />
      <SkillBranchExtraColumn
        v-for="suffixData in extraColumns"
        :key="suffixData.id"
        :icon="suffixData.icon"
        :title="suffixData.title"
        :text="suffixData.text"
        :stat-containers="suffixData.statContainers"
      />
    </div>
  </fieldset>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import SkillComputingContainer, { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import ToggleService from '@/setup/ToggleService'

import SkillAreaDetail from './skill-area-detail/index.vue'
import SkillBranchExtraColumn from './skill-branch-extra-column.vue'

import DisplayDataContainer from '../branch-handlers/utils/DisplayDataContainer'
import { ExtraSuffixBranchData } from '../setup'
import { NormalLayoutSubContent } from './setup'

interface Props {
  computing: SkillComputingContainer;
  container: DisplayDataContainer<SkillBranchItem>;
  nameProps?: string[];
  nameIcon?: string;
  subContents?: NormalLayoutSubContent[];
  hasArea?: boolean;
  extraColumns?: ExtraSuffixBranchData[];
}

const props = withDefaults(defineProps<Props>(), {
  nameIcon: 'mdi-checkbox-multiple-blank-circle',
  hasArea: false,
  extraColumns: () => [],
})
const { container, subContents, hasArea } = toRefs(props)

const { t } = useI18n()

const { toggle, contents } = ToggleService({
  contents: ['areaDetail'] as const,
})

const subContentDatas = computed(() => {
  if (!subContents?.value) {
    return []
  }
  return subContents.value
    .filter(subContent => subContent.key.split('|').every(key => container.value.has(key)))
    .map(subContent => {
      return {
        key: subContent.key,
        icon: subContent.icon,
        title: subContent.title ?? container.value.get(subContent.key),
        color: subContent.value ? 'light-2' : (subContent.color || (subContent.type === 'primary' ? 'red' : 'light-3')),
        value: subContent.value ?? '',
        type: subContent.type ?? 'normal',
      }
    })
    .filter(item => item.title || (item.title && item.value))
})
</script>

<style lang="postcss" scoped>
.sub-content-item {
  @apply my-0.5 inline-flex items-center;

  & .text-light-3 {
    @apply text-purple;
  }
}

.skill-branch-layout-normal {
  @media screen and (min-width: 40rem) {
    min-width: 30rem;
  }
}
</style>
