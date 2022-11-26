<template>
  <div v-if="effectItem">
    <div v-if="tabVisible" class="mb-3 space-x-2 px-2">
      <cy-button-plain
        icon="bx:bxs-book-bookmark"
        class="skill-effect-tab-button"
        :selected="tabs.skillInfo"
        @click="setTab('skillInfo')"
      >
        {{ t('skill-query.skill-info') }}
      </cy-button-plain>
      <cy-button-plain
        icon="ic:round-history"
        class="skill-effect-tab-button"
        :selected="tabs.skillHistory"
        :disabled="effectItem.historys.length === 0"
        @click="setTab('skillHistory')"
      >
        {{ t('skill-query.historical-record') }}
      </cy-button-plain>
    </div>
    <div ref="skillBranchesElement" class="skill-effect-main">
      <div v-if="tabs.skillInfo">
        <SkillBranch
          v-for="branchItem in effectItem.branchItems"
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
            <cy-icon-text
              icon="ic:outline-tips-and-updates"
              class="mr-2 mt-0.5"
            >
              <i18n-t
                tag="span"
                class="text-primary-50"
                keypath="skill-query.registlet-info-tip"
                scope="global"
              >
                <template #link>
                  <GlossaryTagPopover
                    :name="t('skill-query.registlet-title')"
                  />
                </template>
              </i18n-t>
            </cy-icon-text>
          </div>
        </div>
      </div>
      <div v-if="tabs.skillHistory">
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

<script lang="ts">
export default {
  name: 'SkillEffect',
}
</script>

<script lang="ts" setup>
import { computed, inject, provide, ref, watch } from 'vue'
import { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Skill } from '@/lib/Skill/Skill'
import { EquipmentRestrictions } from '@/lib/Skill/SkillComputingContainer'

import ToggleService from '@/setup/ToggleService'

import GlossaryTagPopover from '../GlossaryQuery/glossary-tag-popover.vue'
import SkillEffectHistory from './skill-effect-history/index.vue'
import SkillSwitchEffectButtons from './skill-switch-effect-buttons.vue'
import SkillRegistletInfo from './skill/layouts/skill-registlet-info.vue'
import SkillBranch from './skill/skill-branch.vue'

import {
  ComputingContainerInjectionKey,
  SkillEffectInjectionKey,
} from './injection-keys'

interface Props {
  selectedEquipment: EquipmentRestrictions
}

interface Emits {
  (evt: 'set-current-skill', skill: Skill): void
  (evt: 'update:selected-equipment', value: EquipmentRestrictions): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  rootComputingContainer,
  getSkillRegistletItemsState,
  currentSkillItem,
} = inject(ComputingContainerInjectionKey)!

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
const { tabs, toggle } = ToggleService({
  tabs: [{ name: 'skillInfo', default: true }, 'skillHistory'] as const,
})

const setTab = (target: 'skillInfo' | 'skillHistory') => {
  toggle(`tabs/${target}`, true, false)
}

const tabVisible = computed(() => {
  return (
    effectItem.value?.parent.effectItems.some(
      item => item.historys.length > 0
    ) ?? false
  )
})

const skillBranchesElement: Ref<HTMLElement | null> = ref(null)

watch(effectItem, () => setTab('skillInfo'), { immediate: true })

provide(SkillEffectInjectionKey, {
  currentEffectItem: effectItem,
})
</script>

<style lang="postcss" scoped>
.skill-effect-tab-button {
  @apply inline-flex cursor-pointer items-center border-b-1 border-transparent px-3 py-0.5 hover:border-primary-30;

  &.selected {
    @apply border-primary-60 hover:border-primary-60;
  }
}
</style>
