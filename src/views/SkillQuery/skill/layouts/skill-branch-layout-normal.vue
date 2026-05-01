<template>
  <div class="skill-branch-layout-normal rounded-sm bg-white">
    <div class="border-red-30 rounded-sm border-2 border-l-4 bg-white pb-2">
      <div class="border-red-20 mb-2.5 flex items-center border-b py-1.5 pl-2.5">
        <cy-icon :icon="nameIcon" class="text-red-30" />
        <div class="text-red-40 ml-1.5">{{ container.get('name') }}</div>
      </div>
      <div class="flex items-start">
        <div class="shrink-0 pl-2.5">
          <div class="border-red-30 flex shrink-0 rounded-full border bg-white p-1.5">
            <cy-icon :icon="mainIcon" class="text-red-30" />
          </div>
        </div>
        <div class="pl-3.5 pr-2 pt-1">
          <div v-if="mainTitle" class="flex items-center">
            <div class="text-primary-80" v-html="mainTitle"></div>
            <div v-if="nameProps" class="text-emerald-60 flex space-x-2 pl-3 text-sm">
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
      <div
        v-if="subContentDatas && subContentDatas.length > 0"
        class="flex items-start py-1.5 pl-2.5"
      >
        <IconCircle icon="mdi:help" />
        <div class="border-y border-transparent pl-3.5 pr-2 pt-1">
          <span
            v-for="contentData in subContentDatas"
            :key="contentData.key"
            class="my-0.5 mr-3 inline-flex items-center text-sm"
            :class="contentData.colorClass"
          >
            <cy-icon small :icon="contentData.icon" :class="contentData.colorClass" />
            <div class="ml-1 flex items-center">
              <slot :name="`sub-content(${contentData.key})`">
                <span v-if="typeof contentData.title === 'string'" class="prop-value-wrapper">
                  {{ contentData.title }}
                </span>
                <SkillBranchPropValue
                  v-else
                  class="prop-value-wrapper"
                  :result="contentData.title"
                />
              </slot>
              <span v-if="contentData.value" class="prop-value-wrapper text-primary-50 ml-1.5">
                {{ contentData.value }}
              </span>
            </div>
          </span>
          <slot name="sub-content-extra" item-class="my-0.5 inline-flex items-center" />
        </div>
      </div>
      <div v-if="actionFrameData" class="flex items-start py-1.5 pl-2.5">
        <IconCircle icon="ic:outline-share-arrival-time" />
        <div class="pl-3.5 pr-2 pt-1">
          <div class="mb-1 flex items-center text-sm text-red-50">
            <div>{{ t('skill-query.branch.action-frame.title') }}</div>
            <span class="text-gray-30 ml-2">60F/1s</span>
          </div>
          <div class="flex flex-wrap items-center">
            <div class="mr-5 flex flex-wrap items-center">
              <div class="text-primary-30 text-sm">
                {{ t('skill-query.branch.action-frame.title-base') }}
              </div>
              <div class="text-red-60 ml-2.5 text-sm">
                {{ actionFrameData.base }}
              </div>
            </div>
            <div class="flex items-center">
              <div class="text-primary-30 text-sm">
                {{ t('skill-query.branch.action-frame.title-min') }}
              </div>
              <div class="text-red-60 ml-2.5 text-sm">
                {{ actionFrameData.min }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="hasArea" class="py-1.5">
        <div class="flex items-center pl-2">
          <cy-button-circle
            :selected="areaDetailVisible"
            icon="carbon:zoom-in-area"
            small
            @click.stop="toggleAreaDetailVisible"
          />
          <div class="text-primary-30 cursor-pointer pl-3" @click.stop="toggleAreaDetailVisible">
            {{ t('skill-query.branch.skill-area.button-text') }}
          </div>
        </div>
        <div v-if="areaDetailVisible" class="pl-6">
          <SkillAreaDetail :skill-branch-item="container.branchItem" :computing="computing" />
        </div>
      </div>
    </div>
    <template v-if="extraColumns.length > 0 || extraColumnsEmpty">
      <div class="border-primary-20 ml-7 h-3 border-l-2" />
      <div class="border-primary-20 rounded-sm border-2 bg-white pb-2 pt-2.5">
        <slot name="extra-columns-start" />
        <SkillBranchExtraColumn
          v-for="suffixData in extraColumns"
          :key="suffixData.id"
          :icon="suffixData.icon"
          :title="suffixData.title"
          :result="suffixData.result"
          :stat-containers="suffixData.statContainers"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, useSlots } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggle } from '@/shared/setup/State'
import { slotNotEmpty } from '@/shared/utils/vue'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import SkillAreaDetail from './skill-area-detail/index.vue'
import SkillBranchExtraColumn from './skill-branch-extra-column.vue'
import IconCircle from './skill-branch-layout-icon-circle.vue'
import SkillBranchPropValue from './skill-branch-prop-value.vue'

import DisplayDataContainer from '../branch-handlers/handle/DisplayDataContainer'
import type { ExtraSuffixBranchData } from '../setup'
import type { NormalLayoutSubContent } from './setup'

interface Props {
  computing: SkillComputingContainer
  container: DisplayDataContainer<SkillBranchItem>
  mainTitle?: string
  mainIcon?: string
  nameProps?: string[]
  nameIcon?: string
  subContents?: NormalLayoutSubContent[]
  hasArea?: boolean
  extraColumns?: ExtraSuffixBranchData[]
}

const props = withDefaults(defineProps<Props>(), {
  nameIcon: 'mdi-checkbox-multiple-blank-circle',
  hasArea: false,
  extraColumns: () => [],
})
const { container, subContents, hasArea } = toRefs(props)

const slots = useSlots()
const { t } = useI18n({ useScope: 'global' })

const areaDetailVisible = ref(false)
const toggleAreaDetailVisible = useToggle(areaDetailVisible)

const extraColumnsEmpty = computed(() => slotNotEmpty(slots['extra-columns-start']))

const typeMainColorMapping = {
  normal: 'text-primary-50',
  primary: 'text-red-50',
  gray: 'text-gray-40',
  cyan: 'text-cyan-50',
}

const subContentDatas = computed(() => {
  if (!subContents?.value) {
    return []
  }
  return subContents.value
    .filter(subContent => subContent.key.split('|').every(key => container.value.has(key)))
    .map(subContent => {
      const type = subContent.type ?? 'normal'
      const colorClass = typeMainColorMapping[type]
      return {
        key: subContent.key,
        icon: subContent.icon,
        title: subContent.title ?? container.value.result(subContent.key),
        colorClass,
        value: subContent.value ?? '',
        type,
        custom: subContent.custom,
      }
    })
    .filter(item => item.title || (item.title && item.value) || item.custom)
})

const actionFrameData = computed(() => {
  const branchItem = container.value.branchItem
  if (branchItem.hasProp('action_frame')) {
    const actionFrames = branchItem.prop('action_frame').split('~')
    return {
      base: actionFrames[0] ? actionFrames[0] + 'F' : '?',
      min: actionFrames[1] ? actionFrames[1] + 'F' : '?',
    }
  }
  return null
})
</script>

<style scoped>
@reference "@/tailwind.css";

.prop-value-wrapper :deep(.text-primary-50) {
  @apply text-fuchsia-60;
}

.skill-branch-layout-normal {
  @media screen and (min-width: 40rem) {
    min-width: 30rem;
  }
}
</style>
