<template>
  <div>
    <div class="flex cursor-pointer items-center py-0.5" @click="detailVisible = !detailVisible">
      <template v-if="!characterStatResult.origin.isBoolStat">
        <div class="min-w-[2rem] text-stone-60">
          {{ characterStatResult.name }}
        </div>
        <span class="ml-2 text-primary-60">
          {{ characterStatResult.displayValue }}
        </span>
      </template>
      <span v-else class="text-primary-60">
        {{ characterStatResult.name }}
      </span>
      <div v-if="showPreviewValues" class="ml-6 flex items-center space-x-2 text-primary-30">
        <div v-for="data in showStatDetailDatas.datas" :key="data.id">
          {{ data.title.value }}
        </div>
      </div>
    </div>
    <div v-if="detailVisible" class="mb-4 mt-2 border border-primary-10">
      <div
        v-if="characterStatResult.origin.max || characterStatResult.origin.min"
        class="flex items-center border-b border-primary-10 px-3 py-1 text-sm text-primary-50"
      >
        <div v-if="characterStatResult.origin.min" class="flex items-center">
          <cy-icon icon="ic:round-arrow-downward" small class="mr-1" />
          {{ characterStatResult.origin.min }}
        </div>
        <div v-if="characterStatResult.origin.max" class="flex items-center">
          <cy-icon icon="ic:round-arrow-upward" small class="mr-1" />
          {{ characterStatResult.origin.max }}
        </div>
      </div>
      <div
        v-if="statDetailCaption"
        class="stat-detail-caption border-b border-primary-10 px-3 py-2 text-sm text-stone-50"
        v-html="statDetailCaption"
      />
      <cy-icon-text v-if="showStatDetailDatas.conditionalBase" icon="mdi-sword">
        <CharacterStatDetailEquipments
          :equipment-texts="showStatDetailDatas.conditionalBase.title.equipments"
        />
      </cy-icon-text>
      <div class="max-w-full space-y-2 overflow-x-auto px-3 py-3 text-sm">
        <div v-for="data in showStatDetailDatas.datas" :key="data.id">
          <div class="flex items-center text-primary-70">
            <cy-icon icon="mdi:label-outline" class="mr-2 text-primary-20" />
            <span>{{ data.title.text }}</span>
            <span v-if="data.title.value !== null" class="ml-2 text-primary-50">
              {{ data.title.value }}
            </span>
          </div>
          <div v-if="data.lines.length !== 0" class="mt-1.5 space-y-0.5 pb-1 pl-2">
            <div v-for="line in data.lines" :key="'line-' + line.iid" class="flex">
              <div class="h-text-sm flex items-center">
                <cy-icon icon="ic-round-add" small class="mr-1" />
              </div>
              <div class="flex flex-wrap items-center">
                <template v-if="typeof line.title === 'string'">
                  <span class="mr-2">
                    {{ line.title }}
                  </span>
                  <span class="text-primary-50">{{ line.value }}</span>
                </template>
                <template v-else>
                  <CharacterStatDetailEquipments
                    v-if="line.title.equipments.length !== 0"
                    :equipment-texts="line.title.equipments"
                    class="mr-2"
                  />
                  <div class="flex items-center">
                    <span v-if="line.title.captions.length > 0" class="mr-2 space-x-1">
                      <span v-for="caption in line.title.captions" :key="caption.id">
                        {{ caption.text }}
                      </span>
                    </span>
                    <span class="text-primary-50">{{ line.value }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <CharacterStatRecordedDetails
            class="mt-1.5"
            v-if="data.statRecorded"
            :stat="data.statRecorded"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { CharacterStatResultWithId } from '@/stores/views/character/setup'

import { lastElement } from '@/shared/utils/array'
import { type TextWithId, getTextsWithId } from '@/shared/utils/data/text'
import { numberToFixed } from '@/shared/utils/number'

import type { CharacterStatResultConditionBase } from '@/lib/Character/Character'
import { StatTypes } from '@/lib/Character/Stat'

import CharacterStatDetailEquipments from './character-stat-detail-equipments.vue'
import CharacterStatRecordedDetails from './character-stat-recorded-details.vue'

interface Props {
  characterStatResult: CharacterStatResultWithId
  previewVisible: boolean
}

const props = defineProps<Props>()

const { t } = useI18n()

const detailVisible = ref(false)

interface DetailLineTitle {
  equipments: TextWithId[]
  captions: TextWithId[]
}
interface DetailLine {
  iid: number
  title: string | DetailLineTitle
  value: string | null
}

const handleConditional = (conditionBase: CharacterStatResultConditionBase) => {
  const captions: TextWithId[] = []

  conditionBase.options.forEach(opt => {
    const match = opt.match(/^"([^"]+)"$/)
    if (match) {
      captions.push({
        id: captions.length,
        text: match[1],
      })
    }
  })

  let str = conditionBase.conditional
  let strs: string[] = []
  if (str === '#') {
    strs =
      captions.length === 0 ? [t('character-simulator.character-stat-detail.additional-value')] : []
  } else {
    str = str
      .replace(/\s+/g, '')
      .replace(/(?:&&|\|\|)#[a-zA-Z0-9._]+/g, '')
      .replace(/#[a-zA-Z0-9._]+(?:&&|\|\|)/g, '')
      .replace(/@([a-zA-Z0-9._]+)/g, (_match, p1) => {
        return t(`character-simulator.character-stat-detail.equipment-restriction-text.${p1}`) + ','
      })
      .replace(/&&|\|\|/g, match => (match === '&&' ? '+,' : '/,'))
      .replace(/\(|\)/g, match => match + ',')
      .replace(/^\(([^)]+)\)$/, (_match, p1) => p1)

    strs = str.split(',')
    if (lastElement(strs) === '') {
      strs.pop()
    }
  }

  const equipments = getTextsWithId(strs)

  return {
    equipments,
    captions,
  } as DetailLineTitle
}

const showStatDetailDatas = computed(() => {
  type SubDisplayedPartKeys = 'multiplier' | 'constant' | 'total'
  type DisplayedPartKeys = 'base' | SubDisplayedPartKeys

  const valueFix = (value: number) => numberToFixed(value, 3).toString()
  const getStatTypeByPartKey = (partKey: DisplayedPartKeys) => {
    switch (partKey) {
      case 'multiplier':
        return StatTypes.Multiplier
      case 'constant':
        return StatTypes.Constant
      case 'total':
        return StatTypes.Total
    }
  }

  const statResult = props.characterStatResult
  const linkedBaseStat = statResult.origin.linkedStatBase

  const conditionalBase = statResult.conditionalBase
    ? {
        title: handleConditional(statResult.conditionalBase),
      }
    : null

  const getDisplayedData = (key: DisplayedPartKeys) => {
    const value = statResult.statValueParts[key]
    const isBase = key === 'base'

    let title: {
      text: string
      value: string | null
    }

    if (isBase) {
      title = {
        text: t('character-simulator.character-stat-detail.base-value'),
        value: valueFix(statResult.statValueParts.base),
      }
    } else {
      const statType = getStatTypeByPartKey(key)
      title = {
        text: linkedBaseStat!.show(statType!, value),
        value: null,
      }
      if (statResult.isDefaultFormula) {
        if (key === 'multiplier') {
          const displayedValue = valueFix((value * statResult.statValueParts.base) / 100)
          title.value = (displayedValue.startsWith('-') ? '' : '+') + displayedValue
        } else {
          title.value = linkedBaseStat!.showValue(statType!, value, false)
        }
      }
    }

    const displayedLines: DetailLine[] = []
    const adds = statResult.statPartsDetail.additionalValues[key].filter(add => add.value !== 0)

    const hasExtraUnit = key === 'multiplier' || key === 'total'

    if (adds.length !== 0) {
      const initValue = statResult.statPartsDetail.initValue[key]
      let hasInit = false
      if (initValue !== 0) {
        displayedLines.push({
          title: t('character-simulator.character-stat-detail.init-value'),
          value: valueFix(initValue) + (hasExtraUnit ? '%' : ''),
          iid: 0,
        })
        hasInit = true
      }
      const addsLines = adds
        .sort(addItem => (addItem.isMul ? 1 : -1))
        .map((addItem, idx) => {
          let resValue = '0'
          if (addItem.isMul) {
            resValue =
              addItem.value > 0 ? `×${valueFix(addItem.value)}` : `×(${valueFix(addItem.value)})`
          } else {
            resValue =
              (addItem.value > 0 && (hasInit || !isBase) ? '+' : '') + valueFix(addItem.value)
            if (!hasInit) {
              hasInit = true
            }
          }

          if (hasExtraUnit) {
            resValue += '%'
          }

          return {
            iid: idx + 1,
            title: handleConditional(addItem),
            value: resValue,
          } as DetailLine
        })
      displayedLines.push(...addsLines)
    }

    if (conditionalBase) {
      const conditionalEqs = conditionalBase.title.equipments
      displayedLines.forEach(line => {
        if (typeof line.title === 'string') {
          return
        }
        const eqs = line.title.equipments
        eqs.forEach((_text, idx) => {
          if (eqs.length - idx < conditionalEqs.length) {
            return
          }
          if (conditionalEqs.every((eq, idx2) => eq.text === eqs[idx + idx2].text)) {
            eqs.splice(idx, conditionalEqs.length)
          }
        })
      })
    }

    return {
      id: key,
      title,
      statRecorded: !isBase ? statResult.statPartsDetail.statRecordeds[key] : null,
      lines: displayedLines,
    }
  }

  const datas = [getDisplayedData('base')]
  if (statResult.statValueParts.multiplier) {
    datas.push(getDisplayedData('multiplier'))
  }
  if (statResult.statValueParts.constant) {
    datas.push(getDisplayedData('constant'))
  }
  if (statResult.statValueParts.total) {
    datas.push(getDisplayedData('total'))
  }

  return {
    datas,
    conditionalBase,
  }
})

const statDetailCaption = computed(() => {
  return props.characterStatResult.origin.caption.replace(
    /\(\(([^)]+)\)\)/g,
    (_match, m1) => `<span class="cy--text-separate">${m1}</span>`
  )
})

const showPreviewValues = computed(() => {
  if (!props.previewVisible) {
    return false
  }
  if (props.characterStatResult.origin.isBoolStat) {
    return false
  }
  if (showStatDetailDatas.value.datas.length <= 1) {
    return false
  }
  return props.characterStatResult.isDefaultFormula
})
</script>
