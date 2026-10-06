<template>
  <div
    v-show="branchItem.groupState.parentExpanded"
    :class="rootClass"
    class="skill-branch-wrapper"
  >
    <div class="skill-branch-content" :class="{ 'sub-content-active': subContentVisible }">
      <div class="relative">
        <div
          v-if="currentEffectEquipments && subContentVisible"
          class="flex items-center pb-1.5 pl-3 pt-2"
        >
          <div class="text-gray-40 shrink-0 pr-3 text-sm">
            {{ t('skill-query.branch.current-effect-equipments-prefix') }}
          </div>
          <SkillEquipmentButton :equipments="currentEffectEquipments" selected />
        </div>
        <component :is="currentComponent" :branch-item="skillBranchItem" :computing="computing" />
        <cy-button-circle
          v-if="subButtonAvailable"
          icon="mdi:select-compare"
          class="toggle-sub-button"
          small
          @click="toggleSubContent"
        />
      </div>
      <cy-transition>
        <div v-if="!sub && subContentVisible">
          <div class="flex items-center pb-1.5 pl-3 pt-3">
            <div class="text-gray-40 shrink-0 pr-3 text-sm">
              {{ t('skill-query.branch.compared-effect-equipments-prefix') }}
            </div>
            <div class="flex flex-wrap items-center">
              <div class="mr-2">
                <SkillEquipmentButton
                  v-for="(branch, idx) in otherEffectBranches"
                  :key="branch.parent.equipmentId"
                  :equipments="branch.parent.equipments"
                  :selected="currentOtherEffectBranch === branch"
                  @click="setCurrentOtherEffectBranch(idx)"
                />
              </div>
            </div>
          </div>
          <div v-if="currentOtherEffectBranch">
            <SkillBranch :skill-branch-item="currentOtherEffectBranch" :computing="computing" sub />
          </div>
        </div>
      </cy-transition>
    </div>
    <div v-if="skillBranchItem.groupState.isGroupEnd && !sub" class="pt-5">
      <div class="group-end" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Component, computed, toRefs } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggle } from '@/shared/composables/State'

import { SkillBranchNames } from '@/lib/Skill/Skill'
import {
  SkillBranchItem,
  SkillComputingContainer,
  SkillEffectItem,
} from '@/lib/Skill/SkillComputing'

import SkillBranchBasic from './skill-branch-basic.vue'
import SkillBranchDamage from './skill-branch-damage.vue'
import SkillBranchEffect from './skill-branch-effect.vue'
import SkillBranchHeal from './skill-branch-heal.vue'
import SkillBranchList from './skill-branch-list.vue'
import SkillBranchPassive from './skill-branch-passive.vue'
import SkillBranchProration from './skill-branch-proration.vue'
import SkillBranchReference from './skill-branch-reference.vue'
import SkillBranchStack from './skill-branch-stack.vue'
import skillBranchTable from './skill-branch-table.vue'
import SkillBranchText from './skill-branch-text.vue'
import SkillEquipmentButton from './skill-equipment-button.vue'

import { NORMAL_LAYOUT_BRANCH_NAMES, setupOtherEffectBranches } from './setup'

defineOptions({
  name: 'SkillBranch',
})

interface Props {
  computing: SkillComputingContainer
  skillBranchItem: SkillBranchItem
  sub?: boolean
  contentAuto?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sub: false,
  contentAuto: true,
})
const { skillBranchItem: branchItem, sub, contentAuto } = toRefs(props)

const { t } = useI18n()

const subContentVisible = ref(false)
const toggleSubContent = useToggle(subContentVisible)

const branchComponents: Partial<Record<SkillBranchNames, Component>> = {
  [SkillBranchNames.Damage]: SkillBranchDamage,
  [SkillBranchNames.Effect]: SkillBranchEffect,
  [SkillBranchNames.Heal]: SkillBranchHeal,
  [SkillBranchNames.Passive]: SkillBranchPassive,
  [SkillBranchNames.Stack]: SkillBranchStack,
  [SkillBranchNames.Proration]: SkillBranchProration,
  [SkillBranchNames.List]: SkillBranchList,
  [SkillBranchNames.Basic]: SkillBranchBasic,
  [SkillBranchNames.Reference]: SkillBranchReference,
  [SkillBranchNames.Table]: skillBranchTable,
  [SkillBranchNames.Text]: SkillBranchText,
  [SkillBranchNames.Tips]: SkillBranchText,
}

const currentComponent = computed<Component>(
  () => branchItem.value.resolveKindConfig(branchComponents) ?? SkillBranchText
)

const paddingBottomClass = computed(() => {
  const curBch = branchItem.value
  const branchItems = curBch.parent.visibleBranchItems
  const idx = branchItems.indexOf(curBch)

  if (idx === branchItems.length - 1 || sub.value) {
    return 'pb-0'
  }

  const nextBch = branchItems[idx + 1]
  const nextNormalLayout = NORMAL_LAYOUT_BRANCH_NAMES.some(kind => nextBch.isA(kind))

  if (curBch.isGroup && curBch.groupState.expanded) {
    return 'pb-1'
  }
  if (nextBch.isGroup || (curBch.isGroup && !curBch.groupState.expanded)) {
    return nextNormalLayout ? 'pb-3' : 'pb-4'
  }
  if (curBch.propBoolean('is_mark') || nextBch.propBoolean('is_mark')) {
    return nextNormalLayout ? 'pb-4' : 'pb-5'
  }
  if (nextBch.isA(SkillBranchNames.Tips)) {
    if (curBch.isA(SkillBranchNames.Text) || curBch.isA(SkillBranchNames.List)) {
      return 'pb-2.5'
    }
    if (curBch.isA(SkillBranchNames.Tips)) {
      return 'pb-0'
    }
  }

  if (curBch.isA(SkillBranchNames.Reference) && nextBch.isA(SkillBranchNames.Reference)) {
    return 'pb-2'
  }
  if (nextBch.isA(SkillBranchNames.Reference)) {
    return 'pb-5'
  }
  if (nextBch.isA(SkillBranchNames.List)) {
    return 'pb-5'
  }
  if (nextBch.isA(SkillBranchNames.Proration)) {
    return 'pb-5'
  }
  return nextNormalLayout ? 'pb-4' : 'pb-4'
})

const rootClass = computed(() => {
  return {
    [paddingBottomClass.value]: true,
    'px-2.5': !sub.value,
    'content-auto': contentAuto.value,
  }
})

const { otherEffectBranches, currentOtherEffectBranch, setCurrentOtherEffectBranch } =
  setupOtherEffectBranches(branchItem)

const currentEffectEquipments = computed(() => {
  const current = branchItem.value
  if (current.overrideId === -1) {
    return null
  }
  if (current.parent instanceof SkillEffectItem) {
    return current.parent.equipments
  }
  return null
})

const subButtonAvailable = computed(() => {
  if (otherEffectBranches.value.length === 0 || sub.value) {
    return false
  }
  return NORMAL_LAYOUT_BRANCH_NAMES.some(kind => branchItem.value.isA(kind))
})
</script>

<style scoped>
@reference "@/tailwind.css";

.toggle-sub-button {
  position: absolute;
  top: --spacing(0.5);
  right: --spacing(1);
  z-index: 5;
}

.skill-branch-content {
  transition-duration: 200ms;
  transition-property: border-left-width, padding-left;
  border-left-width: 0;
  border-color: var(--color-primary-50);
  padding-left: --spacing(0);

  &.sub-content-active {
    border-left-width: 4px;
    padding-bottom: --spacing(2);
    padding-left: --spacing(3);
  }
}
.group-end {
  position: relative;
  border-top-width: 1px;
  border-color: var(--color-primary-50);

  &::before {
    position: absolute;
    top: --spacing(-2);
    right: --spacing(-2);
    background-color: var(--color-primary-50);
    width: --spacing(4);
    height: --spacing(4);
    content: '';
  }
}
</style>

<style>
html.theme--night-mode .skill-effect-wrapper .history-compare--mark {
  background-color: --alpha(var(--app-violet-60) / 30%);
}
</style>
