<template>
  <div
    v-show="branchItem.groupState.parentExpanded"
    :class="rootClass"
    class="skill-branch-wrapper"
  >
    <div class="skill-branch-content" :class="{ 'sub-content-active': contents.sub }">
      <div class="relative pt-1">
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
          @click="toggle('contents/sub')"
        />
      </div>
      <cy-transition>
        <div v-if="!sub && contents.sub">
          <div class="flex items-center pl-4 pt-2 pb-1 space-x-2">
            <cy-icon-text icon="ic:round-label" class="flex-shrink-0" />
            <div class="flex items-center flex-wrap">
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

<script lang="ts">
export default {
  name: 'SkillBranch',
}
</script>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import SkillComputingContainer, { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import ToggleService from '@/setup/ToggleService'

import SkillBranchDamage from './skill-branch-damage.vue'
import SkillBranchEffect from './skill-branch-effect.vue'
import SkillBranchHeal from './skill-branch-heal.vue'
import SkillBranchPassive from './skill-branch-passive.vue'
import SkillBranchStack from './skill-branch-stack.vue'
import SkillBranchText from './skill-branch-text.vue'
import SkillBranchList from './skill-branch-list.vue'
import SkillBranchProration from './skill-branch-proration.vue'
import SkillBranchBasic from './skill-branch-basic.vue'
import SkillBranchReference from './skill-branch-reference.vue'
import SkillEquipmentButton from './skill-equipment-button.vue'
import skillBranchTable from './skill-branch-table.vue'

import { setupOtherEffectBranches } from './setup'

interface Props {
  computing: SkillComputingContainer;
  skillBranchItem: SkillBranchItem;
  sub?: boolean;
  contentAuto?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sub: false,
  contentAuto: true,
})
const { skillBranchItem: branchItem, sub, contentAuto } = toRefs(props)

const { contents, toggle } = ToggleService({
  contents: ['sub'] as const,
})

const currentComponent = computed(() => {
  if (branchItem.value.is(SkillBranchNames.Damage)) {
    return SkillBranchDamage
  } else if (branchItem.value.is(SkillBranchNames.Effect)) {
    return SkillBranchEffect
  } else if (branchItem.value.is(SkillBranchNames.Heal)) {
    return SkillBranchHeal
  } else if (branchItem.value.is(SkillBranchNames.Passive)) {
    return SkillBranchPassive
  } else if (branchItem.value.is(SkillBranchNames.Stack)) {
    return SkillBranchStack
  } else if (branchItem.value.is(SkillBranchNames.Proration)) {
    return SkillBranchProration
  } else if (branchItem.value.is(SkillBranchNames.List)) {
    return SkillBranchList
  } else if (branchItem.value.is(SkillBranchNames.Basic)) {
    return SkillBranchBasic
  } else if (branchItem.value.is(SkillBranchNames.Reference)) {
    return SkillBranchReference
  } else if (branchItem.value.is(SkillBranchNames.Table)) {
    return skillBranchTable
  }
  return SkillBranchText
})

const NORMAL_LAYOUT_BRANCH_NAMES = [
  SkillBranchNames.Damage,
  SkillBranchNames.Effect,
  SkillBranchNames.Heal,
  SkillBranchNames.Passive,
]

const paddingBottomClass = computed(() => {
  const curBch = branchItem.value
  const branchItems = curBch.parent.branchItems
  const idx = branchItems.indexOf(curBch)
  if (idx === branchItems.length - 1 || sub.value) {
    return 'pb-0'
  }

  const nextBch = branchItems[idx + 1]
  const next = nextBch.name
  const cur = curBch.name

  const nextNormalLayout = NORMAL_LAYOUT_BRANCH_NAMES.includes(next)

  if (nextBch.isGroup || (curBch.isGroup && !curBch.groupState.expanded)) {
    return nextNormalLayout ? 'pb-4' : 'pb-5'
  }
  if (curBch.propBoolean('is_mark') || nextBch.propBoolean('is_mark')) {
    return nextNormalLayout ? 'pb-3' : 'pb-4'
  }
  if ([SkillBranchNames.Tips, SkillBranchNames.Text, SkillBranchNames.List].includes(cur) && next === SkillBranchNames.Tips) {
    return 'pb-1.5'
  }
  if (cur === SkillBranchNames.Reference && next === SkillBranchNames.Reference) {
    return 'pb-1'
  }
  if (next === SkillBranchNames.Reference) {
    return 'pb-4'
  }
  if (next === SkillBranchNames.List) {
    return 'pb-4'
  }
  return nextNormalLayout ? 'pb-2' : 'pb-3'
})

const rootClass = computed(() => {
  return {
    [paddingBottomClass.value]: true,
    'px-3': !sub.value,
    'content-auto': contentAuto.value,
  }
})

const {
  otherEffectBranches,
  currentOtherEffectBranch,
  setCurrentOtherEffectBranch,
} = setupOtherEffectBranches(branchItem)

const subButtonAvailable = computed(() => {
  if (otherEffectBranches.value.length === 0 || sub.value) {
    return false
  }
  return NORMAL_LAYOUT_BRANCH_NAMES.includes(branchItem.value.name)
})
</script>

<style lang="postcss" scoped>
.skill-branch-wrapper {
  & :deep(.click-button--tag) {
    @apply text-orange-60 cursor-pointer inline-block px-0.5;
  }

  & :deep(.click-button--skill) {
    @apply text-red-60 cursor-pointer inline-block px-0.5;
  }

  & :deep(.click-button--mark) {
    @apply text-primary-50;
  }

  & :deep(.click-button--branch) {
    @apply text-cyan-60 cursor-pointer inline-block px-0.5;
  }

  & :deep(.history-compare--mark) {
    @apply bg-violet-60 bg-opacity-10;
  }

  & :deep(.result-value--stack) {
    @apply text-blue-60;

    &.value-dark {
      @apply text-cyan-60;
    }
  }

  & :deep(.skill-formula-function-wrapper) {
    @apply rounded-md pr-1 pl-1.5 mx-0.5 inline-flex items-center;

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
      & > .value >  .param-separate {
        @apply border-cyan-30;
      }
    }

    & > .name {
      @apply text-sm
    }
    & > .value {
      @apply ml-1.5 mr-1 px-2 inline-flex items-center text-sm bg-white bg-opacity-75;

      & > .param-separate {
        @apply inline-block mx-2 mt-0.5 h-4 bg-opacity-0;

        border-left-width: 0.1875rem;
      }
    }
  }
}

.toggle-sub-button {
  @apply absolute top-0 -right-2;
}

.skill-branch-content {
  @apply border-l-0 border-primary-50 pl-0 duration-200;
  transition-property: border-left-width, padding-left;
  &.sub-content-active {
    @apply border-l-2 pl-3 pb-2;
  }
}
.group-end {
  @apply border-t-1 border-primary-50 relative;

  &::before {
    content: '';
    @apply absolute -right-2 -top-2 w-4 h-4 bg-primary-50;
  }
}
</style>

<style lang="postcss">
html.theme--night-mode .app--skill-query--wrapper .history-compare--mark {
  @apply bg-opacity-30 !important;
}
</style>
