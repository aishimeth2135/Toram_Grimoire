<template>
  <div class="skill-branch-layout-normal rounded bg-white">
    <div class="rounded border-1 border-l-2 border-red-30 bg-white pb-2">
      <div class="mb-3 flex items-center border-b border-red-20 py-1.5 pl-4">
        <cy-icon :icon="nameIcon" color="red-30" />
        <div class="ml-2 text-red-40">{{ container.get('name') }}</div>
      </div>
      <div class="flex items-start">
        <div class="flex-shrink-0 pl-2.5">
          <div
            class="flex flex-shrink-0 rounded-full border border-red-30 bg-white p-1.5"
          >
            <cy-icon :icon="mainIcon" color="red-30" />
          </div>
        </div>
        <div class="pl-4 pr-2 pt-1">
          <div v-if="mainTitle" class="flex items-center">
            <div class="text-primary-80" v-html="mainTitle"></div>
            <div
              v-if="nameProps"
              class="flex space-x-2 pl-4 text-sm text-emerald-60"
            >
              <span
                v-for="nameProp in nameProps"
                :key="nameProp"
                class="inline-block"
              >
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
        <div class="border-y border-transparent pl-4 pr-2 pt-1">
          <span
            v-for="contentData in subContentDatas"
            :key="contentData.key"
            class="my-0.5 mr-3 inline-flex items-center"
          >
            <cy-icon-text
              small
              :icon="contentData.icon"
              :color="contentData.color"
              single-color
            >
              <slot :name="`sub-content(${contentData.key})`">
                <span
                  v-if="typeof contentData.title === 'string'"
                  class="prop-value-wrapper"
                  v-html="contentData.title"
                />
                <SkillBranchPropValue
                  v-else
                  class="prop-value-wrapper"
                  :result="contentData.title"
                />
              </slot>
            </cy-icon-text>
            <span
              v-if="contentData.value"
              class="prop-value-wrapper ml-1.5 text-sm text-primary-50"
            >
              {{ contentData.value }}
            </span>
          </span>
          <slot
            name="sub-content-extra"
            item-class="my-0.5 inline-flex items-center"
          />
        </div>
      </div>
      <div v-if="actionFrameData" class="flex items-start py-1.5 pl-2.5">
        <IconCircle icon="ic:outline-share-arrival-time" />
        <div class="pl-4 pr-2 pt-1">
          <div class="mb-1 flex items-center text-sm text-red-50">
            <div>{{ t('skill-query.branch.action-frame.title') }}</div>
            <cy-icon
              class="ml-2"
              icon="material-symbols:60fps-select-rounded"
              color="blue-30"
            />
          </div>
          <div class="flex flex-wrap items-center">
            <div class="mr-5 flex flex-wrap items-center">
              <div class="text-sm text-primary-30">
                {{ t('skill-query.branch.action-frame.title-base') }}
              </div>
              <div class="ml-2.5 text-sm text-red-60">
                {{ actionFrameData.base }}
              </div>
            </div>
            <div class="flex items-center">
              <div class="text-sm text-primary-30">
                {{ t('skill-query.branch.action-frame.title-min') }}
              </div>
              <div class="ml-2.5 text-sm text-red-60">
                {{ actionFrameData.min }}
              </div>
            </div>
          </div>
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
            class="cursor-pointer pl-4 text-primary-30"
            @click.stop="toggle('contents/areaDetail')"
          >
            {{ t('skill-query.branch.skill-area.button-text') }}
          </div>
        </div>
        <div v-if="contents.areaDetail" class="pl-6">
          <SkillAreaDetail
            :skill-branch-item="container.branchItem"
            :computing="computing"
          />
        </div>
      </div>
    </div>
    <template v-if="extraColumns.length > 0 || extraColumnsEmpty">
      <div class="ml-7 h-3 border-l-1 border-primary-20" />
      <div class="rounded border-1 border-primary-20 bg-white pb-2 pt-2.5">
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
import { useI18n } from 'vue-i18n'

import ToggleService from '@/shared/setup/ToggleService'
import { slotNotEmpty } from '@/shared/utils/vue'

import {
  SkillBranchItem,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputing'

import SkillAreaDetail from './skill-area-detail/index.vue'
import SkillBranchExtraColumn from './skill-branch-extra-column.vue'
import IconCircle from './skill-branch-layout-icon-circle.vue'
import SkillBranchPropValue from './skill-branch-prop-value.vue'

import DisplayDataContainer from '../branch-handlers/handle/DisplayDataContainer'
import { ExtraSuffixBranchData } from '../setup'
import { NormalLayoutSubContent } from './setup'

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

const { toggle, contents } = ToggleService({
  contents: ['areaDetail'] as const,
})

const extraColumnsEmpty = computed(() =>
  slotNotEmpty(slots['extra-columns-start'])
)

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
    .filter(subContent =>
      subContent.key.split('|').every(key => container.value.has(key))
    )
    .map(subContent => {
      const type = subContent.type ?? 'normal'
      const color = typeMainColorMapping[type]
      return {
        key: subContent.key,
        icon: subContent.icon,
        title: subContent.title ?? container.value.result(subContent.key),
        color,
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

<style lang="postcss" scoped>
.prop-value-wrapper :deep(.text-primary-50) {
  @apply text-fuchsia-60;
}

.skill-branch-layout-normal {
  @media screen and (min-width: 40rem) {
    min-width: 30rem;
  }
}
</style>
