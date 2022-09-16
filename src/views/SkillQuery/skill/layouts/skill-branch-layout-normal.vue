<template>
  <div class="skill-branch-layout-normal bg-white rounded border-1 border-primary-10 relative">
    <div class="absolute top-4 left-6 w-1 bg-primary-10 z-0 scale-x-50" style="height: calc(100% - 1rem);" />
    <div class="relative z-1 pb-2">
      <div class="flex items-center pl-4 pr-2 py-2 bg-white border-b border-primary-20 mb-4">
        <cy-icon-text :icon="nameIcon" />
        <div class="pl-3 text-primary-80">{{ container.get('name') }}</div>
      </div>
      <div class="pb-2">
        <div class="bg-primary-5 py-2 flex items-start">
          <div class="pl-2.5 flex-shrink-0" :class="{ 'invisible': !mainIcon }">
            <div class="flex p-1.5 flex-shrink-0 border border-red-40 rounded-full bg-white">
              <cy-icon-text :icon="mainIcon" icon-color="red-40" />
            </div>
          </div>
          <div class="pl-4 pr-2 pt-1">
            <div v-if="mainTitle" class="flex items-center">
              <div class="text-primary-80">{{ mainTitle }}</div>
              <div v-if="nameProps" class="flex text-sm text-emerald-60 space-x-2 pl-4">
                <span v-for="nameProp in nameProps" :key="nameProp" class="inline-block">
                  {{ nameProp }}
                </span>
              </div>
            </div>
            <div>
              <slot />
            </div>
          </div>
        </div>
      </div>
      <div v-if="subContentDatas && subContentDatas.length > 0" class="pb-2 flex items-start">
        <div class="pl-2.5 flex-shrink-0">
          <div class="flex p-1.5 flex-shrink-0 border border-primary-30 rounded-full bg-white">
            <cy-icon-text icon="mdi:help" icon-color="primary-30" />
          </div>
        </div>
        <div class="pl-4 pr-2 pt-1 border-y border-transparent">
          <span v-for="contentData in subContentDatas" :key="contentData.key" class="sub-content-item mr-3">
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
        </div>
      </div>
      <div v-if="hasArea" class="pt-2.5 pb-2">
        <div class="flex items-center pl-2">
          <cy-button-circle
            :selected="contents.areaDetail"
            icon="carbon:zoom-in-area"
            small
            @click.stop="toggle('contents/areaDetail')"
          />
          <div class="pl-4 text-primary-30">{{ t('skill-query.branch.skill-area.button-text') }}</div>
        </div>
        <div v-if="contents.areaDetail" class="pl-6">
          <SkillAreaDetail :skill-branch-item="container.branchItem" :computing="computing" />
        </div>
      </div>
      <div v-if="extraColumns.length > 0" class="pt-4">
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
    </div>
  </div>
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
  mainTitle?: string;
  mainIcon?: string;
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
  primary: 'red-50',
  gray: 'gray-40',
  cyan: 'cyan-50',
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
