<template>
  <div>
    <SkillBranchLayoutNormal
      :computing="computing"
      :container="container"
      name-icon="ri-sword-fill"
      :name-props="nameProps"
      :sub-contents="subContents"
      :has-area="hasArea"
      :extra-columns="extraSuffixBranchDatas"
    >
      <SkillDamageFormula :container="container" />
      <template #extra-columns-start>
        <SkillBranchExtraColumn
          v-if="container.get('dual_element')"
          icon="bx-bx-circle"
          :title="t('skill-query.branch.global-suffix.extra.condition-default-value')"
        >
          <div class="py-0 5 pl-1 flex items-center">
            <div class="mr-2" :class="TAG_BUTTON_CLASS_NAME">{{ t('skill-query.branch.dual-element-title') }}</div>
            <div class="text-violet-60">{{ container.get('dual_element') }}</div>
          </div>
        </SkillBranchExtraColumn>
        <SkillBranchExtraColumn
          v-for="sufContainer in dualElementSuffixBranchItems"
          :key="sufContainer.instanceId"
          icon="eva-checkmark-circle-2-outline"
          :title="sufContainer.get('condition')"
        >
          <div class="py-0 5 pl-1 flex items-center">
            <div class="mr-2" :class="TAG_BUTTON_CLASS_NAME">{{ t('skill-query.branch.dual-element-title') }}</div>
            <div class="text-violet-60">{{ sufContainer.get('dual_element') }}</div>
          </div>
        </SkillBranchExtraColumn>
        <SkillBranchExtraColumn
          v-if="container.get('ailment_name')"
          icon="ri-plant-line"
          :title="t('skill-query.branch.ailment-title')"
          :text="getAilmentText(container)"
        />
      </template>
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import SkillComputingContainer, { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue'
import SkillDamageFormula from './layouts/skill-damage-formula.vue'
import SkillBranchExtraColumn from './layouts/skill-branch-extra-column.vue'

import DamageHandler from './branch-handlers/DamageHandler'
import ExtraHandler from './branch-handlers/ExtraHandler'
import { TAG_BUTTON_CLASS_NAME } from '../utils'
import DisplayDataContainer from './branch-handlers/handle/DisplayDataContainer'
import { ExtraSuffixBranchData } from './setup'
import { NormalLayoutSubContent } from './layouts/setup'

const ELEMENT_ICON_MAPPING: Record<string, string> = {
  'neutral': 'bx-bx-circle',
  'fire': 'fa-brands:gripfire',
  'water': 'ion-water',
  'earth': 'bx-bx-cube-alt',
  'wind': 'simple-icons:tailwindcss',
  'light': 'carbon-light',
  'dark': 'bx-bx-moon',
}

interface Props {
  computing: SkillComputingContainer;
  branchItem: SkillBranchItem;
}

const { t } = useI18n()

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => DamageHandler(props.computing, branchItem.value))

const nameProps = computed(() => {
  const res = [container.value.get('damage_type')]
  if (container.value.get('type')) {
    res.push(container.value.get('type'))
  }
  return res
})

const getAilmentText = (dataContainer: DisplayDataContainer) => {
  const text = dataContainer.get('ailment_name')
  return t('skill-query.branch.damage.ailment-caption', {
    chance: dataContainer.get('ailment_chance'),
    name: `<span class="${TAG_BUTTON_CLASS_NAME}">${text}</span>`,
  })
}

const getElementIcon = (value: string) => {
  return ELEMENT_ICON_MAPPING[value] || 'bx-bx-circle'
}

const getElementCaption = (value: string) => {
  const str = `<span class="text-primary-50">${t('skill-query.branch.damage.element.' + value)}</span>`
  return t('skill-query.branch.apply-element', { element: str })
}

const subContents = computed(() => {
  const result: NormalLayoutSubContent[] = []
  result.push({
    key: 'title',
    icon: 'bx-bx-game',
    type: 'primary',
  }, {
    key: 'element',
    icon: getElementIcon(branchItem.value.prop('element')),
  }, {
    key: 'is_place',
    icon: 'emojione-monotone:heavy-large-circle',
  })
  if (branchItem.value.prop('title') !== 'each') {
    result.push({
      key: 'frequency',
      icon: 'bi-circle-square',
    })
  }
  if (container.value.getValue('duration') !== '0' && container.value.getValue('cycle') !== '0') {
    result.push({
      key: 'duration|cycle',
      icon: 'ic-round-timer',
      title: t('skill-query.branch.damage.duration-caption-with-cycle', {
        duration: container.value.get('duration'),
        cycle: container.value.get('cycle'),
      }),
    })
  }
  result.push({
    key: '@proration/damage',
    icon: 'ri-error-warning-line',
    title: container.value.get('@proration/damage: title'),
    value: container.value.get('@proration/damage'),
  }, {
    key: '@proration/proration',
    icon: 'ri-error-warning-line',
    title: container.value.get('@proration/proration: title'),
    value: container.value.get('@proration/proration'),
  })
  const getBoolIcon = (value: string): string => {
    const mapping = {
      '1': 'ic:round-check-circle-outline',
      '0': 'jam:close-circle',
      'none': 'bx:bx-help-circle',
    } as Record<string, string>
    return mapping[value]
  }
  const getBoolColorType = (value: string) => {
    const mapping = {
      '1': 'cyan',
      '0': 'gray',
      'none': 'normal',
    } as Record<string, NormalLayoutSubContent['type']>
    return mapping[value]
  }
  result.push({
    key: 'range_damage',
    icon: getBoolIcon(branchItem.value.prop('range_damage')),
    type: getBoolColorType(branchItem.value.prop('range_damage')),
  }, {
    key: 'unsheathe_damage',
    icon: getBoolIcon(branchItem.value.prop('unsheathe_damage')),
    type: getBoolColorType(branchItem.value.prop('unsheathe_damage')),
  }, {
    key: 'combo_rate',
    icon: 'jam:close-circle',
    type: getBoolColorType(branchItem.value.prop('combo_rate')),
  })
  if (container.value.has('frequency') && parseInt(container.value.getValue('frequency'), 10) > 1) {
    result.push({
      key: 'judgment',
      icon: 'ic:outline-view-timeline',
    }, {
      key: 'frequency_judgment',
      icon: 'ic:outline-view-timeline',
    })
  }
  return result
})

const extraSuffixBranchDatas = computed(() => {
  return branchItem.value.suffixBranches
    .filter(suffix => {
      if (!suffix.is(SkillBranchNames.Extra) || suffix.hasProp('dual_element')) {
        return false
      }
      return suffix.hasProp('caption') ||
        suffix.hasProp('ailment_name') ||
        suffix.hasProp('element') ||
        suffix.stats.length > 0
    })
    .filter(suffix => !suffix.propBoolean('hidden'))
    .map((suffix, idx) => {
      const dataContainer = ExtraHandler(props.computing, suffix)
      const baseData: ExtraSuffixBranchData = {
        id: idx.toString(),
        icon: 'eva-checkmark-circle-2-outline',
        title: dataContainer.get('condition'),
      }
      if (dataContainer.get('target')) {
        baseData.titleProps = [dataContainer.get('target')]
      }
      if (dataContainer.get('caption')) {
        baseData.text = dataContainer.get('caption')
      } else if (dataContainer.get('ailment_name')) {
        baseData.text = getAilmentText(dataContainer)
      } else if (dataContainer.get('element')) {
        baseData.text = getElementCaption(dataContainer.get('element'))
      } else {
        baseData.statContainers = dataContainer.statContainers
      }
      return baseData
    })
})

const dualElementSuffixBranchItems = computed(() => {
  return branchItem.value.suffixBranches
    .filter(suffix => {
      return suffix.hasProp('dual_element')
    })
    .map(suffix => ExtraHandler(props.computing, suffix))
})

const hasArea = computed(() => {
  return container.value.getOrigin('type') === 'AOE'
})
</script>
