<template>
  <div v-if="effectItem">
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
            <cy-icon-text icon="ic:outline-tips-and-updates" class="mr-2 mt-0.5">
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
            </cy-icon-text>
          </div>
        </div>
      </div>
      <div v-else-if="currentTab === ContentTabs.History">
        <SkillEffectHistory :skill-effect-item="effectItem" />
      </div>
    </div>
  </div>
  <div v-else>
    <cy-default-tips icon="uil:books">
      <div>{{ t('skill-query.no-any-skill-effect-match-message.0') }}</div>
      <div>{{ t('skill-query.no-any-skill-effect-match-message.1') }}</div>
    </cy-default-tips>
    <div v-if="currentSkillItem" class="mt-4">
      <SkillSwitchEffectButtons
        :skill-item="currentSkillItem"
        @select-equipment="emit('update:selected-equipment', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { EquipmentRestrictions } from '@/lib/Character/Stat'
import { Skill } from '@/lib/Skill/Skill'

import GlossaryTagPopover from '../GlossaryQuery/glossary-tag-popover.vue'
import SkillEffectHistory from './skill-effect-history/index.vue'
import SkillSwitchEffectButtons from './skill-switch-effect-buttons.vue'
import SkillRegistletInfo from './skill/layouts/skill-registlet-info.vue'
import SkillBranch from './skill/skill-branch.vue'

import { ComputingContainerInjectionKey, SkillEffectInjectionKey } from './injection-keys'

defineOptions({
  name: 'SkillEffect',
})

interface Props {
  selectedEquipment: EquipmentRestrictions
}

interface Emits {
  (evt: 'set-current-skill', skill: Skill): void
  (evt: 'update:selected-equipment', value: EquipmentRestrictions): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { rootComputingContainer, getSkillRegistletItemsState, currentSkillItem } = inject(
  ComputingContainerInjectionKey
)!

const effectItem = computed(() => {
  if (!currentSkillItem.value) {
    return null
  }
  return currentSkillItem.value.findEffectItem(props.selectedEquipment) || null
})

const registletItemStates = computed(() => {
  if (!currentSkillItem.value) {
    return []
  }
  return getSkillRegistletItemsState(currentSkillItem.value.skill)
})

const { t } = useI18n()

const enum ContentTabs {
  Info,
  History,
}

const currentTab = ref<ContentTabs>(ContentTabs.Info)

const setTab = (tab: ContentTabs) => {
  currentTab.value = tab
}

const tabVisible = computed(() => {
  return effectItem.value?.parent.effectItems.some(item => item.historys.length > 0) ?? false
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
