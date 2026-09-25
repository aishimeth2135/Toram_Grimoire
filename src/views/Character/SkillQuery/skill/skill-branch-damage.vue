<template>
  <div>
    <SkillBranchLayoutNormal
      :computing="computing"
      :container="container"
      name-icon="ri-sword-fill"
      :sub-contents="subContents"
      :has-area="hasArea"
      :extra-columns="extraSuffixBranchDatas"
      main-icon="mdi-sword"
      :main-title="mainTitie"
    >
      <SkillDamageFormula :container="container" />
      <template v-if="damageHit">
        <i18n-t
          keypath="skill-query.branch.damage.total-damage-caption"
          tag="div"
          scope="global"
          class="text-primary-50 mt-3 text-sm"
        >
          <template #frequency>
            <SkillBranchPropValue :result="container.result('frequency')" />
          </template>
        </i18n-t>
        <cy-button-plain
          v-if="hitCount > 0"
          :selected="hitDamageVisible"
          class="gap-icon-tight text-sm"
          :end-icon="hitDamageVisible ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          @click="hitDamageVisible = !hitDamageVisible"
        >
          {{ t('skill-query.branch.damage.view-hit-damage') }}
        </cy-button-plain>
        <div v-if="hitDamageVisible" class="mt-2 space-y-2">
          <div v-for="(hitContainer, index) in hitContainers" :key="index">
            <div class="text-primary-30 text-sm">
              {{ t('skill-query.branch.damage.hit-damage-label', { hit: index + 1 }) }}
            </div>
            <SkillDamageFormula :container="hitContainer" hide-base-caption />
          </div>
        </div>
      </template>
      <template #sub-content(frequency)>
        <i18n-t keypath="skill-query.branch.damage.frequency-caption" tag="span" scope="global">
          <template #frequency>
            <SkillBranchPropValue :result="container.result('frequency')" />
          </template>
        </i18n-t>
      </template>
      <template #sub-content(duration|cycle)>
        <i18n-t
          keypath="skill-query.branch.damage.duration-caption-with-cycle"
          tag="span"
          scope="global"
        >
          <template #duration>
            <SkillBranchPropValue :result="container.result('duration')" />
          </template>
          <template #cycle>
            <SkillBranchPropValue :result="container.result('cycle')" />
          </template>
        </i18n-t>
      </template>
      <template #extra-columns-start>
        <SkillBranchExtraColumn
          v-if="container.has('dual_element')"
          icon="bx-bx-circle"
          :title="t('skill-query.branch.global-suffix.extra.condition-default-value')"
        >
          <div class="flex items-center py-0.5">
            <GlossaryTagPopover class="mr-2" :name="t('skill-query.branch.dual-element-title')" />
            <div class="text-violet-60">
              {{ container.get('dual_element') }}
            </div>
          </div>
        </SkillBranchExtraColumn>
        <SkillBranchExtraColumn
          v-for="sufContainer in dualElementSuffixBranchItems"
          :key="sufContainer.instanceId"
          icon="ic:round-done"
          :title="sufContainer.get('condition')"
        >
          <div class="flex items-center py-0.5">
            <GlossaryTagPopover class="mr-2" :name="t('skill-query.branch.dual-element-title')" />
            <div class="text-violet-60">
              {{ sufContainer.get('dual_element') }}
            </div>
          </div>
        </SkillBranchExtraColumn>
        <SkillBranchExtraColumn
          v-if="container.get('ailment_name')"
          icon="mdi:creation"
          :title="t('skill-query.branch.ailment-title')"
        >
          <i18n-t keypath="skill-query.branch.damage.ailment-caption" tag="span" scope="global">
            <template #chance>
              <SkillBranchPropValue :result="container.result('ailment_chance')" />
            </template>
            <template #name>
              <GlossaryTagPopover :name="container.get('ailment_name')" />
            </template>
          </i18n-t>
        </SkillBranchExtraColumn>
        <SkillBranchExtraColumn
          v-for="sufContainer in ailmentSuffixBranchItems"
          :key="sufContainer.instanceId"
          icon="mdi:creation"
          :title="sufContainer.get('condition')"
        >
          <i18n-t keypath="skill-query.branch.damage.ailment-caption" tag="span" scope="global">
            <template #chance>
              <SkillBranchPropValue :result="sufContainer.result('ailment_chance')" />
            </template>
            <template #name>
              <GlossaryTagPopover :name="sufContainer.get('ailment_name')" />
            </template>
          </i18n-t>
        </SkillBranchExtraColumn>
      </template>
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { toInt } from '@/shared/utils/number'

import { getDamageHit } from '@/lib/Skill/Properties'
import { SkillBranchNames } from '@/lib/Skill/Skill'
import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'
import { DamageHandler, type DisplayDataContainer } from '@/lib/Skill/SkillDisplay'
import { ExtraHandler } from '@/lib/Skill/SkillDisplay'

import GlossaryTagPopover from '@/views/GlossaryQuery/glossary-tag-popover.vue'

import SkillBranchExtraColumn from './layouts/skill-branch-extra-column.vue'
import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue'
import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'
import SkillDamageFormula from './layouts/skill-damage-formula.vue'

import { type NormalLayoutSubContent } from './layouts/setup'
import { type ExtraSuffixBranchData } from './setup'

const ELEMENT_ICON_MAPPING: Record<string, string> = {
  neutral: 'bx-bx-circle',
  fire: 'fa-brands:gripfire',
  water: 'ion-water',
  earth: 'bx-bx-cube-alt',
  wind: 'simple-icons:tailwindcss',
  light: 'carbon-light',
  dark: 'bx-bx-moon',
}

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const { t } = useI18n()

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => DamageHandler(props.computing, branchItem.value))
const damageHit = computed(() => getDamageHit(branchItem.value))
const hitDamageVisible = ref(false)
const hitCount = computed(() => {
  const frequency = Number(container.value.getValue('frequency'))
  return Number.isSafeInteger(frequency) && frequency > 0 ? frequency : 0
})
const hitContainers = computed<DisplayDataContainer<SkillBranchItem>[]>(() =>
  Array.from({ length: hitCount.value }, (_unused, index) =>
    DamageHandler(props.computing, branchItem.value, index + 1)
  )
)

const mainTitie = computed(() => {
  let res = container.value.get('damage_type')
  if (container.value.get('type')) {
    res = container.value.get('type') + ' ' + res
  }
  return res
})

const getElementIcon = (value: string) => {
  return ELEMENT_ICON_MAPPING[value] || 'bx-bx-circle'
}

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

const subContents = computed(() => {
  const result: NormalLayoutSubContent[] = []
  result.push(
    {
      key: 'title',
      icon: 'bx-bx-game',
      type: 'primary',
    },
    {
      key: 'element',
      icon: getElementIcon(branchItem.value.prop('element')),
    },
    {
      key: 'is_place',
      icon: 'emojione-monotone:heavy-large-circle',
    },
    {
      key: 'range_damage',
      icon: getBoolIcon(branchItem.value.prop('range_damage')),
      type: getBoolColorType(branchItem.value.prop('range_damage')),
    },
    {
      key: 'unsheathe_damage',
      icon: getBoolIcon(branchItem.value.prop('unsheathe_damage')),
      type: getBoolColorType(branchItem.value.prop('unsheathe_damage')),
    },
    {
      key: 'combo_rate',
      icon: 'jam:close-circle',
      type: getBoolColorType(branchItem.value.prop('combo_rate')),
    },
    {
      key: '@proration/damage',
      icon: 'ri-error-warning-line',
      title: container.value.title('@proration/damage'),
      value: container.value.result('@proration/damage') ?? undefined,
    },
    {
      key: '@proration/proration',
      icon: 'ri-error-warning-line',
      title: container.value.title('@proration/proration'),
      value: container.value.result('@proration/proration') ?? undefined,
    }
  )
  if (branchItem.value.prop('title') !== 'each' && !damageHit.value) {
    result.push({
      key: 'frequency',
      icon: 'bi-circle-square',
      custom: true,
    })
  }
  if (container.value.getValue('duration') !== '0' && container.value.getValue('cycle') !== '0') {
    result.push({
      key: 'duration|cycle',
      icon: 'ic-round-timer',
      custom: true,
    })
  }
  if (container.value.has('frequency') && (toInt(container.value.getValue('frequency')) ?? 0) > 1) {
    result.push(
      {
        key: 'judgment',
        icon: 'ic:outline-view-timeline',
      },
      {
        key: 'frequency_judgment',
        icon: 'ic:outline-view-timeline',
      }
    )
  }
  return result
})

const extraSuffixBranchDatas = computed(() => {
  return branchItem.value.suffixBranches
    .filter(suffix => {
      if (
        !suffix.isA(SkillBranchNames.Extra) ||
        suffix.hasProp('dual_element') ||
        suffix.hasProp('ailment_name')
      ) {
        return false
      }
      return suffix.hasProp('caption') || suffix.stats.length > 0
    })
    .filter(suffix => !suffix.propBoolean('hidden'))
    .map((suffix, idx) => {
      const dataContainer = ExtraHandler(props.computing, suffix)
      const baseData: ExtraSuffixBranchData = {
        id: idx.toString(),
        icon: 'ic:round-done',
        title: dataContainer.get('condition'),
        result: null,
      }
      if (dataContainer.get('target')) {
        baseData.titleProps = [dataContainer.get('target')]
      }
      if (dataContainer.get('caption')) {
        baseData.result = dataContainer.result('caption')
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

const ailmentSuffixBranchItems = computed(() => {
  return branchItem.value.suffixBranches
    .filter(suffix => {
      return suffix.hasProp('ailment_name')
    })
    .map(suffix => ExtraHandler(props.computing, suffix))
})

const hasArea = computed(() => container.value.getOrigin('type') === 'AOE')
</script>
