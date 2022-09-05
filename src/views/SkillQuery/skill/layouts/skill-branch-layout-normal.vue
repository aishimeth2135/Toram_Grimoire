<template>
  <fieldset class="skill-branch-layout-normal border-1 border-primary-30 p-2 pt-1 bg-white">
    <legend class="flex items-center px-3">
      <cy-icon-text
        :icon="nameIcon"
        text-color="fuchsia-60"
      >
        {{ container.get('name') }}
      </cy-icon-text>
      <div v-if="nameProps" class="flex text-sm text-emerald-60 space-x-1.5 ml-3">
        <span v-for="nameProp in nameProps" :key="nameProp" class="inline-block">
          {{ nameProp }}
        </span>
      </div>
    </legend>
    <div v-if="subContentDatas" class="flex items-center flex-wrap pl-3">
      <template v-for="contentData in subContentDatas" :key="contentData.key">
        <span class="sub-content-item mr-3">
          <cy-icon-text
            small
            :icon="contentData.icon"
            :color="contentData.color"
            single-color
          >
            <span v-html="contentData.title"></span>
          </cy-icon-text>
          <span v-if="contentData.value" class="text-sm ml-1.5 text-primary-50">
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

import DisplayDataContainer from '../branch-handlers/handle/DisplayDataContainer'
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

const typeMainColorMapping = {
  normal: 'primary-50',
  primary: 'red',
  gray: 'gray-40',
  cyan: 'cyan',
}

const subContentDatas = computed(() => {
  if (!subContents?.value) {
    return []
  }
  return subContents.value
    .filter(subContent => subContent.key.split('|').every(key => container.value.has(key)))
    .map(subContent => {
      const type = subContent.type ?? 'normal'
      const color = typeMainColorMapping[type]
      return {
        key: subContent.key,
        icon: subContent.icon,
        title: subContent.title ?? container.value.get(subContent.key),
        color,
        value: subContent.value ?? '',
        type,
      }
    })
    .filter(item => item.title || (item.title && item.value))
})
</script>

<style lang="postcss" scoped>
.sub-content-item {
  @apply my-0.5 inline-flex items-center;

  & .text-primary-50 {
    @apply text-fuchsia-60;
  }
}

.skill-branch-layout-normal {
  @media screen and (min-width: 40rem) {
    min-width: 30rem;
  }
}
</style>
