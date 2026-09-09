<script lang="ts" setup>
import { type VNode, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'

import { isNumberString } from '@/shared/utils/string'

import type { EquipmentTraitItem } from '@/lib/EquipmentTrait'
import { EquipmentTraitCategory } from '@/lib/EquipmentTrait/EquipmentTrait/enums'
import {
  CommonTextParseItemIds,
  ResultContainer,
  TextResultContainerPart,
  TextResultContainerPartTypes,
} from '@/lib/common/ResultContainer'
import { getCommonTextParseItem, handleParseText } from '@/lib/common/ResultContainer/parseText'

import ShowStatComputed from '@/components/common/show-stat-computed.vue'

interface Props {
  traitItem: EquipmentTraitItem
}

const props = defineProps<Props>()

const { t } = useI18n()

const varTextsMap = {
  Lv: t('equipment-trait.trait-level'),
  STR: t('equipment-trait.trait-var-texts.STR'),
  DEX: t('equipment-trait.trait-var-texts.DEX'),
  INT: t('equipment-trait.trait-var-texts.INT'),
  AGI: t('equipment-trait.trait-var-texts.AGI'),
  VIT: t('equipment-trait.trait-var-texts.VIT'),
  TEC: t('equipment-trait.trait-var-texts.TEC'),
  CRT: t('equipment-trait.trait-var-texts.CRT'),
  LUK: t('equipment-trait.trait-var-texts.LUK'),
  MEN: t('equipment-trait.trait-var-texts.MEN'),
  BSTR: t('equipment-trait.trait-var-texts.BSTR'),
  BDEX: t('equipment-trait.trait-var-texts.BDEX'),
  BINT: t('equipment-trait.trait-var-texts.BINT'),
  BAGI: t('equipment-trait.trait-var-texts.BAGI'),
  BVIT: t('equipment-trait.trait-var-texts.BVIT'),
}

const traitTextFormulaReplaceTexts = computed(() => {
  return props.traitItem.getTextFormulaReplaceTexts()
})

const RenderCaption = ({ text }: { text: string }) => {
  const { parts } = handleParseText(text, [
    getCommonTextParseItem(CommonTextParseItemIds.Value),
    getCommonTextParseItem(CommonTextParseItemIds.BreakLine),
    getCommonTextParseItem(CommonTextParseItemIds.Separate),
  ])
  const handleValueDisplay = (valueStr: string) => {
    let res = props.traitItem.handleTextFormulaReplace(valueStr, traitTextFormulaReplaceTexts.value)
    res = res.replace(/\*/g, '×').replace(/\-{2}/g, '')
    Object.entries(varTextsMap).forEach(([varName, varText]) => {
      res = res.replace(new RegExp(varName, 'g'), varText)
    })
    return res
  }
  const renderParts = (textParts: typeof parts): (VNode | string)[] =>
    textParts.map(part => {
      if (typeof part === 'string') {
        return h('span', part)
      }
      if (part instanceof ResultContainer) {
        const displayValue = handleValueDisplay(part.value)
        const mainNode = h(
          'span',
          {
            class: isNumberString(displayValue)
              ? 'text-primary-50 px-0.5'
              : 'cy--text-separate text-primary-50',
          },
          displayValue
        )
        if (part.displayOptions.unit) {
          return h('span', { class: 'text-primary-50' }, [mainNode, part.displayOptions.unit])
        }
        return mainNode
      } else if (part instanceof TextResultContainerPart) {
        if (part.type === TextResultContainerPartTypes.BreakLine) {
          return h('br')
        }
        if (part.type === TextResultContainerPartTypes.Separate) {
          const mainNode = h(
            'span',
            { class: 'cy--text-separate text-primary-50' },
            renderParts(part.parts)
          )
          return part.unit
            ? h('span', { class: 'text-primary-50' }, [mainNode, part.unit])
            : mainNode
        }
      }
      return part.value
    })
  return h('span', { key: text }, renderParts(parts))
}

const firstStat = computed(() => props.traitItem.stats.at(0) ?? null)

const handleStatTraitStatValue = (valueStr: string) => {
  return valueStr.replace(/Lv/g, t('equipment-trait.trait-level')).replace(/\*/g, '×')
}
</script>

<template>
  <div v-if="traitItem.category === EquipmentTraitCategory.Special">
    <div>
      <RenderCaption :text="traitItem.caption.description" />
    </div>
    <div v-for="tipText in traitItem.caption.tips" :key="tipText">
      <RenderCaption :text="tipText" />
    </div>
  </div>
  <div v-else-if="firstStat">
    <ShowStatComputed :stat="firstStat" :handle-value="handleStatTraitStatValue" />
  </div>
  <div v-else>
    {{ t('global.none') }}
  </div>
</template>
