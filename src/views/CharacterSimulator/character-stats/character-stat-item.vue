<template>
  <div>
    <div
      class="flex cursor-pointer items-center py-0.5"
      @click="detailVisible = !detailVisible"
    >
      <template v-if="!characterStatResult.origin.isBoolStat">
        <div class="min-w-[2rem] text-stone-60">
          {{ characterStatResult.name }}
        </div>
        <span class="ml-4 text-primary-60">
          {{ characterStatResult.displayValue }}
        </span>
      </template>
      <span v-else class="text-primary-60">
        {{ characterStatResult.name }}
      </span>
      <div
        v-if="showPreviewValues"
        class="ml-6 flex items-center space-x-2 text-primary-30"
      >
        <div v-for="data in showStatDetailDatas.datas" :key="data.id">
          {{ data.title.value ?? data.title.displayedValue }}
        </div>
      </div>
    </div>
    <div
      v-if="detailVisible"
      class="mb-4 mt-2 border border-primary-10 px-4 py-3"
    >
      <div class="mb-2 mt-0.5 flex flex-wrap items-center">
        <div class="mr-4 flex">
          <cy-icon-text icon="gridicons:stats-alt" color="primary-80">
            {{ characterStatResult.name }}
          </cy-icon-text>
        </div>
        <div
          v-if="
            characterStatResult.origin.max || characterStatResult.origin.min
          "
          class="ml-auto flex items-center space-x-0.5 text-sm text-primary-30"
        >
          <div v-if="characterStatResult.origin.min">
            {{ characterStatResult.origin.min }}
          </div>
          <cy-icon icon="mdi:tilde" width="0.75rem" />
          <div v-if="characterStatResult.origin.max">
            {{ characterStatResult.origin.max }}
          </div>
        </div>
      </div>
      <div
        v-if="statDetailCaption"
        class="stat-detail-caption mb-3 text-sm text-stone-50"
        v-html="statDetailCaption"
      />
      <cy-icon-text v-if="showStatDetailDatas.conditionalBase" icon="mdi-sword">
        <CharacterStatDetailEquipments
          :equipment-texts="
            showStatDetailDatas.conditionalBase.title.equipments
          "
        />
      </cy-icon-text>
      <div class="mb-0.5 max-w-full overflow-x-auto pb-0.5">
        <div
          v-for="data in showStatDetailDatas.datas"
          :key="data.id"
          class="mt-1.5"
        >
          <div class="mb-1 flex items-center text-primary-70">
            <cy-icon icon="mdi:label-outline" class="mr-3 text-primary-20" />
            <span>{{ data.title.text }}</span>
            <span
              v-if="data.title.value !== null"
              class="ml-2.5 text-primary-50"
            >
              {{ data.title.value }}
            </span>
          </div>
          <div v-if="data.lines.length !== 0" class="space-y-0.5 pb-1 pl-2">
            <div
              v-for="line in data.lines"
              :key="'line-' + line.iid"
              class="flex w-max flex-wrap items-center text-sm"
            >
              <cy-icon icon="ic-round-add" small class="mr-2" />
              <span v-if="typeof line.title === 'string'">
                {{ line.title }}
              </span>
              <template v-else>
                <CharacterStatDetailEquipments
                  v-if="line.title.equipments.length !== 0"
                  :equipment-texts="line.title.equipments"
                  class="mr-2"
                />
                <span
                  v-if="line.title.captions.length > 0"
                  class="mr-2 space-x-1"
                >
                  <span
                    v-for="caption in line.title.captions"
                    :key="caption.id"
                  >
                    {{ caption.text }}
                  </span>
                </span>
              </template>
              <span class="text-primary-50">{{ line.value }}</span>
            </div>
          </div>
          <CharacterStatRecordedDetails
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

import { CharacterStatResultWithId } from '@/stores/views/character/setup'

import { lastElement } from '@/shared/utils/array'
import { TextWithId, getTextsWithId } from '@/shared/utils/data/text'
import { numberToFixed } from '@/shared/utils/number'

import { CharacterStatResultConditionBase } from '@/lib/Character/Character'
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
  value: string
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
      captions.length === 0
        ? [t('character-simulator.character-stat-detail.additional-value')]
        : []
  } else {
    str = str
      .replace(/\s+/g, '')
      .replace(/(?:&&|\|\|)#[a-zA-Z0-9._]+/g, '')
      .replace(/#[a-zA-Z0-9._]+(?:&&|\|\|)/g, '')
      .replace(/@([a-zA-Z0-9._]+)/g, (_match, p1) => {
        return (
          t(
            `character-simulator.character-stat-detail.equipment-restriction-text.${p1}`
          ) + ','
        )
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
  const valueFix = (value: number) => numberToFixed(value, 3).toString()

  const stat = props.characterStatResult
  const base = stat.origin.linkedStatBase
  const types = [
    null,
    StatTypes.Multiplier,
    StatTypes.Constant,
    StatTypes.Total,
  ]

  const list = (
    base ? ['base', 'multiplier', 'constant', 'total'] : ['base']
  ).map((id, idx) => ({
    type: types[idx],
    id,
  })) as (
    | {
        id: 'base'
        type: null
      }
    | {
        id: 'constant' | 'multiplier' | 'total'
        type: StatTypes
      }
  )[]

  const conditionalBase = stat.conditionalBase
    ? {
        title: handleConditional(stat.conditionalBase),
      }
    : null
  const datas = list
    .filter(item => item.id === 'base' || stat.statValueParts[item.id] !== 0)
    .map(item => {
      const id = item.id,
        type = item.type
      const value = stat.statValueParts[id]
      const title =
        id !== 'base'
          ? {
              text: base!.show(type!, value),
              value: null,
              displayedValue: base!.showValue(type!, value, false),
            }
          : {
              text: t('character-simulator.character-stat-detail.base-value'),
              value: valueFix(stat.statValueParts['base']),
              displayedValue: null,
            }
      if (id === 'multiplier') {
        title.text +=
          '｜' +
          Math.floor((value * stat.statValueParts['base']) / 100).toString()
      }

      const isBase = id === 'base'

      const lines: DetailLine[] = []
      const adds = stat.statPartsDetail.additionalValues[id].filter(
        add => add.value !== 0
      )

      const extraUnit = id === 'multiplier' || id === 'total'

      if (adds.length !== 0) {
        const initValue = stat.statPartsDetail.initValue[id]
        let hasInit = false
        if (initValue !== 0) {
          lines.push({
            title: t('character-simulator.character-stat-detail.init-value'),
            value: valueFix(initValue) + (extraUnit ? '%' : ''),
            iid: 0,
          })
          hasInit = true
        }
        const _lines = adds
          .sort(addItem => (addItem.isMul ? 1 : -1))
          .map((addItem, idx) => {
            let resValue = '0'
            if (addItem.isMul) {
              resValue =
                addItem.value > 0
                  ? `×${valueFix(addItem.value)}`
                  : `×(${valueFix(addItem.value)})`
            } else {
              resValue =
                (addItem.value > 0 && (hasInit || !isBase) ? '+' : '') +
                valueFix(addItem.value)
              if (!hasInit) {
                hasInit = true
              }
            }

            if (extraUnit) {
              resValue += '%'
            }

            return {
              iid: idx + 1,
              title: handleConditional(addItem),
              value: resValue,
            } as DetailLine
          })
        lines.push(..._lines)
      }

      if (conditionalBase) {
        const conditionalEqs = conditionalBase.title.equipments
        lines.forEach(line => {
          if (typeof line.title === 'string') {
            return
          }
          const eqs = line.title.equipments
          eqs.forEach((_text, idx) => {
            if (eqs.length - idx < conditionalEqs.length) {
              return
            }
            if (
              conditionalEqs.every(
                (eq, idx2) => eq.text === eqs[idx + idx2].text
              )
            ) {
              eqs.splice(idx, conditionalEqs.length)
            }
          })
        })
      }

      return {
        id,
        title,
        statRecorded:
          id !== 'base' ? stat.statPartsDetail.statRecordeds[id] : null,
        lines,
      }
    })

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
  return props.characterStatResult.defaultFormula
})
</script>
