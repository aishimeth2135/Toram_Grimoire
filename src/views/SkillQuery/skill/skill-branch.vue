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
        <!-- <component :is="currentComponent" :branch-item="skillBranchItem" :computing="computing" /> -->
        <SkillBranchDamage
          v-if="branchItem.name === SkillBranchNames.Damage"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <SkillBranchEffect
          v-else-if="branchItem.name === SkillBranchNames.Effect"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <SkillBranchHeal
          v-else-if="branchItem.name === SkillBranchNames.Heal"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <SkillBranchPassive
          v-else-if="branchItem.name === SkillBranchNames.Passive"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <SkillBranchStack
          v-else-if="branchItem.name === SkillBranchNames.Stack"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <SkillBranchProration
          v-else-if="branchItem.name === SkillBranchNames.Proration"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <SkillBranchList
          v-else-if="branchItem.name === SkillBranchNames.List"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <SkillBranchBasic
          v-else-if="branchItem.name === SkillBranchNames.Basic"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <SkillBranchReference
          v-else-if="branchItem.name === SkillBranchNames.Reference"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <skillBranchTable
          v-else-if="branchItem.name === SkillBranchNames.Table"
          :branch-item="skillBranchItem"
          :computing="computing"
        />
        <SkillBranchText v-else :branch-item="skillBranchItem" :computing="computing" />
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

// const currentComponent = computed(() => {
//   switch (branchItem.value.name) {
//     case SkillBranchNames.Damage:
//       return SkillBranchDamage
//     case SkillBranchNames.Effect:
//       return SkillBranchEffect
//     case SkillBranchNames.Heal:
//       return SkillBranchHeal
//     case SkillBranchNames.Passive:
//       return SkillBranchPassive
//     case SkillBranchNames.Stack:
//       return SkillBranchStack
//     case SkillBranchNames.Proration:
//       return SkillBranchProration
//     case SkillBranchNames.List:
//       return SkillBranchList
//     case SkillBranchNames.Basic:
//       return SkillBranchBasic
//     case SkillBranchNames.Reference:
//       return SkillBranchReference
//     case SkillBranchNames.Table:
//       return skillBranchTable
//     default:
//       return SkillBranchText
//   }
// })

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

  if (curBch.isGroup && curBch.groupState.expanded) {
    return 'pb-1'
  }
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

  if (cur === SkillBranchNames.Reference && next === SkillBranchNames.Reference) {
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

const { otherEffectBranches, currentOtherEffectBranch, setCurrentOtherEffectBranch } =
  setupOtherEffectBranches(branchItem)

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

<style scoped>
@reference "@/tailwind.css";

.skill-branch-wrapper {
  & :deep(.history-compare--mark) {
    background-color: --alpha(var(--color-violet-60) / 10%);
  }

  & :deep(.skill-formula-function-wrapper) {
    display: inline-flex;
    align-items: center;
    margin-inline: --spacing(0.5);
    border-radius: var(--radius-md);
    padding-right: --spacing(1);
    padding-left: --spacing(1.5);

    &.key--floor {
      background-color: var(--color-primary-30);
      & > .name {
        color: var(--color-primary-60);
      }
      & > .value > .param-separate {
        border-color: var(--color-primary-30);
      }
    }
    &.key--min {
      background-color: --alpha(var(--color-blue-30) / 50%);
      & > .name {
        color: var(--color-blue-60);
      }
      & > .value > .param-separate {
        border-color: var(--color-blue-30);
      }
    }
    &.key--max {
      background-color: --alpha(var(--color-cyan-30) / 50%);
      & > .name {
        color: var(--color-cyan-60);
      }
      & > .value > .param-separate {
        border-color: var(--color-cyan-30);
      }
    }

    & > .name {
      font-size: var(--text-sm);
      line-height: var(--text-sm--line-height);
    }
    & > .value {
      display: inline-flex;
      align-items: center;
      margin-right: --spacing(1);
      margin-left: --spacing(1.5);
      background-color: --alpha(var(--color-white) / 75%);
      padding-inline: --spacing(2);
      font-size: var(--text-sm);
      line-height: var(--text-sm--line-height);

      & > .param-separate {
        display: inline-block;
        margin-inline: --spacing(2);
        margin-top: --spacing(0.5);
        border-left-width: 0.1875rem;
        background-color: transparent;
        height: --spacing(4);
      }
    }
  }
}

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
html.theme--night-mode .app--skill-query--wrapper .history-compare--mark {
  background-color: --alpha(var(--app-violet-60) / 30%);
}
</style>
