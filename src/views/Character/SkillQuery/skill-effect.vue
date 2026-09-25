<template>
  <div>
    <cy-tabs v-if="tabVisible" v-model="currentTab" class="mb-4">
      <cy-tab :value="ContentTabs.Info">
        {{ t('skill-query.skill-info') }}
      </cy-tab>
      <cy-tab :value="ContentTabs.History">
        {{ t('skill-query.historical-record') }}
      </cy-tab>
    </cy-tabs>
    <div class="skill-effect-main">
      <div v-if="currentTab === ContentTabs.Info">
        <SkillBranch
          v-for="branchItem in effectItem.visibleBranchItems"
          :key="branchItem.instanceId"
          :skill-branch-item="branchItem"
          :computing="rootComputingContainer"
        />
        <div v-if="registletItemStates.length > 0" class="mt-5 space-y-3 px-3">
          <SkillRegistletInfo
            v-for="registletItemState in registletItemStates"
            :key="registletItemState.item.id"
            :registlet-item-state="registletItemState"
          />
          <div class="px-4 py-2 text-sm">
            <div class="gap-icon text-primary-90 mr-2 mt-0.5 inline-flex items-center">
              <cy-icon icon="ic:outline-tips-and-updates" class="text-primary-30" />
              <span>
                <i18n-t
                  tag="span"
                  class="text-primary-50"
                  keypath="skill-query.registlet-info-tip"
                  scope="global"
                >
                  <template #link>
                    <GlossaryTagPopover :name="t('common.Registlet.title')" />
                  </template>
                </i18n-t>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="currentTab === ContentTabs.History">
        <SkillEffectHistory :skill-effect-item="effectItem" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, provide, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillEffectItem } from '@/lib/Skill/SkillComputing'

import GlossaryTagPopover from '@/views/GlossaryQuery/glossary-tag-popover.vue'

import SkillEffectHistory from './skill-effect-history/index.vue'
import SkillRegistletInfo from './skill/layouts/skill-registlet-info.vue'
import SkillBranch from './skill/skill-branch.vue'

import { ComputingContainerInjectionKey, SkillEffectInjectionKey } from './injection-keys'

defineOptions({
  name: 'SkillEffect',
})

interface Props {
  effectItem: SkillEffectItem
}

const props = defineProps<Props>()

const { rootComputingContainer, getSkillRegistletItemsState } = inject(
  ComputingContainerInjectionKey
)!

const effectItem = toRef(props, 'effectItem')

const registletItemStates = computed(() => {
  return getSkillRegistletItemsState(props.effectItem.parent.skill)
})

const { t } = useI18n()

const ContentTabs = {
  Info: 0,
  History: 1,
} as const
export type ContentTabs = (typeof ContentTabs)[keyof typeof ContentTabs]

const currentTab = ref<ContentTabs>(ContentTabs.Info)

const setTab = (tab: ContentTabs) => {
  currentTab.value = tab
}

const tabVisible = computed(() => {
  return props.effectItem.parent.effectItems.some(item => item.historys.length > 0)
})

watch(
  effectItem,
  () => {
    setTab(ContentTabs.Info)
  },
  { immediate: true }
)

provide(SkillEffectInjectionKey, {
  currentEffectItem: effectItem,
})
</script>
