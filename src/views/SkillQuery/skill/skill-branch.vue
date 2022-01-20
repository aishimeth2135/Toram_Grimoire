<template>
  <div
    v-show="branchItem.groupState.parentExpanded"
    :class="rootClass"
    class="skill-branch-wrapper"
  >
    <div :class="{ 'sub-content-active': contents.sub }">
      <div class="relative pt-1">
        <component
          :is="currentComponent"
          :branch-item="skillBranchItem"
        />
        <cy-button-icon
          v-if="subButtonAvailable"
          icon="mdi:leaf-circle-outline"
          class="toggle-sub-button"
          icon-width="1.5rem"
          @click="toggle('contents/sub')"
        />
      </div>
      <cy-transition type="fade">
        <div v-if="!sub && contents.sub">
          <div class="flex items-center px-4 pt-2 pb-1 space-x-2">
            <cy-icon-text icon="ic:round-label" />
            <SkillEquipmentButton
              v-for="(branch, idx) in otherEffectBranches"
              :key="branch.parent.equipmentId"
              :skill-branch-item="branch"
              :selected="currentOtherEffectBranch === branch"
              @click="setCurrentOtherEffectBranch(idx)"
            />
          </div>
          <div v-if="currentOtherEffectBranch">
            <SkillBranch
              :skill-branch-item="currentOtherEffectBranch"
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

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
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

import { setupOtherEffectBranches } from './setup'

interface Props {
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
  if (branchItem.value.name === SkillBranchNames.Damage) {
    return SkillBranchDamage
  } else if (branchItem.value.name === SkillBranchNames.Effect) {
    return SkillBranchEffect
  } else if (branchItem.value.name === SkillBranchNames.Heal) {
    return SkillBranchHeal
  } else if (branchItem.value.name === SkillBranchNames.Passive) {
    return SkillBranchPassive
  } else if (branchItem.value.name === SkillBranchNames.Stack) {
    return SkillBranchStack
  } else if (branchItem.value.name === SkillBranchNames.Proration) {
    return SkillBranchProration
  } else if (branchItem.value.name === SkillBranchNames.List) {
    return SkillBranchList
  } else if (branchItem.value.name === SkillBranchNames.Basic) {
    return SkillBranchBasic
  } else if (branchItem.value.name === SkillBranchNames.Reference) {
    return SkillBranchReference
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
  if (curBch.attrBoolean('is_mark') || nextBch.attrBoolean('is_mark')) {
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
    @apply text-orange cursor-pointer inline-block px-0.5;
  }

  & :deep(.click-button--skill) {
    @apply text-red cursor-pointer inline-block px-0.5;
  }

  & :deep(.click-button--mark) {
    @apply text-light-3;
  }

  & :deep(.click-button--branch) {
    @apply text-blue-green cursor-pointer inline-block px-0.5;
  }

  & :deep(.history-compare--mark) {
    @apply bg-blue-purple bg-opacity-10;
  }

  & :deep(.result-value--stack) {
    @apply text-water-blue;

    &.value-dark {
      @apply text-blue-green;
    }
  }

  & :deep(.skill-formula-function-wrapper) {
    @apply rounded-md pr-1 pl-2 mx-0.5 inline-flex items-center;

    &.key--floor {
      @apply bg-light;
      & > .name {
        @apply text-light-4;
      }
      & .param-separate {
        @apply border-light;
      }
    }
    &.key--min {
      @apply bg-water-blue-light;
      & > .name {
        @apply text-water-blue;
      }
      & .param-separate {
        @apply border-water-blue-light;
      }
    }
    &.key--max {
      @apply bg-blue-green-light;
      & > .name {
        @apply text-blue-green;
      }
      & .param-separate {
        @apply border-blue-green-light;
      }
    }
    & > .value {
      @apply bg-white rounded ml-1.5 mr-1 px-2 inline-flex items-center text-sm;

      & > .param-separate {
        @apply inline-block border-l-1 mx-2 mt-0.5 h-3;
      }
    }
  }
}

.toggle-sub-button {
  @apply absolute top-0 right-2.5;
}

.sub-content-active {
  @apply border-l-2 border-light-3 pl-3 pb-2;
}
.group-end {
  @apply border-t-1 border-light-3 relative;

  &::before {
    content: '';
    @apply absolute -right-2 -top-2 w-4 h-4 bg-light-3;
  }
}
</style>

<style lang="postcss">
html.theme--night-mode .app--skill-query--wrapper .history-compare--mark {
  @apply bg-opacity-30 !important;
}
</style>
