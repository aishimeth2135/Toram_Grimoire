<template>
  <div
    v-show="branchItem.groupState.parentExpanded"
    :class="rootClass"
    class="skill-branch-wrapper"
  >
    <div
      class="skill-branch-content"
      :class="{ 'sub-content-active': subContentVisible }"
    >
      <div class="relative">
        <div
          v-if="currentEffectEquipments && subContentVisible"
          class="flex items-center pb-1.5 pl-3 pt-2"
        >
          <div class="flex-shrink-0 pr-3 text-sm text-stone-40">
            {{ t('skill-query.branch.current-effect-equipments-prefix') }}
          </div>
          <SkillEquipmentButton
            :equipments="currentEffectEquipments"
            selected
          />
        </div>
        <component
          :is="currentComponent"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
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
            <div class="flex-shrink-0 pr-3 text-sm text-stone-40">
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
            <SkillBranch
              :skill-branch-item="currentOtherEffectBranch"
              :computing="computing"
              sub
            />
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
import { computed, toRefs } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggle } from '@/shared/setup/State'

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

const currentComponent = computed(() => {
  switch (branchItem.value.name) {
    case SkillBranchNames.Damage:
      return SkillBranchDamage
    case SkillBranchNames.Effect:
      return SkillBranchEffect
    case SkillBranchNames.Heal:
      return SkillBranchHeal
    case SkillBranchNames.Passive:
      return SkillBranchPassive
    case SkillBranchNames.Stack:
      return SkillBranchStack
    case SkillBranchNames.Proration:
      return SkillBranchProration
    case SkillBranchNames.List:
      return SkillBranchList
    case SkillBranchNames.Basic:
      return SkillBranchBasic
    case SkillBranchNames.Reference:
      return SkillBranchReference
    case SkillBranchNames.Table:
      return skillBranchTable
    default:
      return SkillBranchText
  }
})

const paddingBottomClass = computed(() => {
  const curBch = branchItem.value
  const branchItems = curBch.parent.visibleBranchItems
  const idx = branchItems.indexOf(curBch)

  if (idx === branchItems.length - 1 || sub.value) {
    return 'pb-0'
  }

  const nextBch = branchItems[idx + 1]
  const next = nextBch.name
  const cur = curBch.name

  const nextNormalLayout = NORMAL_LAYOUT_BRANCH_NAMES.includes(next)

  if (nextBch.isGroup || (curBch.isGroup && !curBch.groupState.expanded)) {
    return nextNormalLayout ? 'pb-3' : 'pb-4'
  }
  if (curBch.propBoolean('is_mark') || nextBch.propBoolean('is_mark')) {
    return nextNormalLayout ? 'pb-4' : 'pb-5'
  }
  if (next === SkillBranchNames.Tips) {
    if (cur === SkillBranchNames.Text || cur === SkillBranchNames.List) {
      return 'pb-2.5'
    }
    if (cur === SkillBranchNames.Tips) {
      return 'pb-0'
    }
  }
  if (
    cur === SkillBranchNames.Reference &&
    next === SkillBranchNames.Reference
  ) {
    return 'pb-2'
  }
  if (next === SkillBranchNames.Reference) {
    return 'pb-5'
  }
  if (next === SkillBranchNames.List) {
    return 'pb-5'
  }
  if (next === SkillBranchNames.Proration) {
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

const {
  otherEffectBranches,
  currentOtherEffectBranch,
  setCurrentOtherEffectBranch,
} = setupOtherEffectBranches(branchItem)

const currentEffectEquipments = computed(() => {
  const current = branchItem.value
  if (current.id === -1) {
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
  return NORMAL_LAYOUT_BRANCH_NAMES.includes(branchItem.value.name)
})
</script>

<style lang="postcss" scoped>
.skill-branch-wrapper {
  & :deep(.history-compare--mark) {
    @apply bg-violet-60 bg-opacity-10;
  }

  & :deep(.skill-formula-function-wrapper) {
    @apply mx-0.5 inline-flex items-center rounded-md pl-1.5 pr-1;

    &.key--floor {
      @apply bg-primary-30;
      & > .name {
        @apply text-primary-60;
      }
      & > .value > .param-separate {
        @apply border-primary-30;
      }
    }
    &.key--min {
      @apply bg-blue-30 bg-opacity-50;
      & > .name {
        @apply text-blue-60;
      }
      & > .value > .param-separate {
        @apply border-blue-30;
      }
    }
    &.key--max {
      @apply bg-cyan-30 bg-opacity-50;
      & > .name {
        @apply text-cyan-60;
      }
      & > .value > .param-separate {
        @apply border-cyan-30;
      }
    }

    & > .name {
      @apply text-sm;
    }
    & > .value {
      @apply ml-1.5 mr-1 inline-flex items-center bg-white bg-opacity-75 px-2 text-sm;

      & > .param-separate {
        @apply mx-2 mt-0.5 inline-block h-4 bg-opacity-0;

        border-left-width: 0.1875rem;
      }
    }
  }
}

.toggle-sub-button {
  @apply absolute right-1 top-0.5 z-5;
}

.skill-branch-content {
  @apply border-l-0 border-primary-50 pl-0 duration-200;
  transition-property: border-left-width, padding-left;
  &.sub-content-active {
    @apply border-l-2 pb-2 pl-3;
  }
}
.group-end {
  @apply relative border-t-1 border-primary-50;

  &::before {
    content: '';
    @apply absolute -right-2 -top-2 h-4 w-4 bg-primary-50;
  }
}
</style>

<style lang="postcss">
html.theme--night-mode .app--skill-query--wrapper .history-compare--mark {
  @apply bg-opacity-30 !important;
}
</style>
