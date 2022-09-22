<template>
  <div class="skill-branch-layout-normal bg-white rounded">
    <div class="border border-red-40 border-l-2 bg-white pb-2">
      <div class="flex items-center pl-4 mb-3 py-1.5 border-b border-red-20">
        <cy-icon-text :icon="nameIcon" icon-color="red-40" />
        <div class="ml-2 text-red-40">{{ container.get('name') }}</div>
      </div>
      <div class="flex items-start">
        <div class="pl-2.5 flex-shrink-0">
          <div class="flex p-1.5 flex-shrink-0 border border-red-40 rounded-full bg-white">
            <cy-icon-text :icon="mainIcon" icon-color="red-40" />
          </div>
        </div>
        <div class="pl-4 pr-2 pt-1">
          <div v-if="mainTitle" class="flex items-center">
            <div class="text-primary-80" v-html="mainTitle"></div>
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
      <div v-if="subContentDatas && subContentDatas.length > 0" class="pl-2.5 py-1.5 flex items-start">
        <IconCircle icon="mdi:help" />
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
      <div v-if="hasArea" class="py-1.5">
        <div class="flex items-center pl-2">
          <cy-button-circle
            :selected="contents.areaDetail"
            icon="carbon:zoom-in-area"
            small
            @click.stop="toggle('contents/areaDetail')"
          />
          <div
            class="pl-4 text-primary-30 cursor-pointer"
            @click.stop="toggle('contents/areaDetail')"
          >
            {{ t('skill-query.branch.skill-area.button-text') }}
          </div>
        </div>
        <div v-if="contents.areaDetail" class="pl-6">
          <SkillAreaDetail :skill-branch-item="container.branchItem" :computing="computing" />
        </div>
      </div>
    </div>
    <template v-if="extraColumns.length > 0 || extraColumnsEmpty">
      <div class="ml-[1.625rem] w-1 h-3 bg-primary-20 scale-x-50" />
      <div class="rounded border-1 border-primary-20 bg-white pt-2.5 pb-2">
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
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'

import { slotNotEmpty } from '@/shared/utils/vue'

import SkillComputingContainer, { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import ToggleService from '@/setup/ToggleService'

import SkillAreaDetail from './skill-area-detail/index.vue'
import SkillBranchExtraColumn from './skill-branch-extra-column.vue'
import IconCircle from './skill-branch-layout-icon-circle.vue'

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

const slots = useSlots()
const { t } = useI18n()

const { toggle, contents } = ToggleService({
  contents: ['areaDetail'] as const,
})

const extraColumnsEmpty = computed(() => slotNotEmpty(slots['extra-columns-start']))

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
