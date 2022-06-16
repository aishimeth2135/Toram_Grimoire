<template>
  <div>
    <div class="mb-2 flex items-center flex-wrap">
      <div class="flex mr-4">
        <cy-icon-text icon="gridicons:stats-alt" color="orange">
          {{ characterStatResult.name }}
        </cy-icon-text>
      </div>
      <div
        v-if="characterStatResult.origin.max ||characterStatResult.origin.min"
        class="flex items-center ml-auto text-light-2 text-sm space-x-0.5"
      >
        <div v-if="characterStatResult.origin.min">{{ characterStatResult.origin.min }}</div>
        <cy-icon-text icon="mdi:tilde" icon-width="0.8rem" />
        <div v-if="characterStatResult.origin.max">{{ characterStatResult.origin.max }}</div>
      </div>
    </div>
    <div
      v-if="statDetailCaption"
      class="stat-detail-caption text-sm mb-3 pl-2"
      v-html="statDetailCaption"
    />
    <cy-icon-text
      v-if="showStatDetailDatas.conditionalBase"
      icon="mdi-sword"
    >
      <CharacterStatDetailEquipments :equipment-texts="showStatDetailDatas.conditionalBase.title.equipments" />
    </cy-icon-text>
    <div class="max-w-full overflow-x-auto pb-0.5 mb-0.5">
      <div
        v-for="data in showStatDetailDatas.datas"
        :key="data.iid"
        class="mt-1"
      >
        <cy-icon-text icon="mdi:label-outline" text-color="purple">
          <template v-if="(typeof data.title !== 'object')">
            {{ data.title }}
          </template>
          <template v-else>
            <span>{{ data.title.text }}</span>
            <span class="ml-1.5 text-light-3">{{ data.title.value }}</span>
          </template>
        </cy-icon-text>
        <div
          v-if="data.lines.length !== 0"
          class="pl-2 mt-0.5 pb-1"
        >
          <div
            v-for="line in data.lines"
            :key="'line-' + line.iid"
            class="flex items-center flex-wrap w-max"
          >
            <cy-icon-text
              v-if="typeof line.title === 'string'"
              icon="ic-round-add"
              small
            >
              {{ line.title }}
            </cy-icon-text>
            <template v-else>
              <cy-icon-text icon="ic-round-add" small>
                <CharacterStatDetailEquipments
                  v-if="line.title.equipments.length !== 0"
                  :equipment-texts="line.title.equipments"
                  class="mr-2"
                />
              </cy-icon-text>
              <span class="space-x-1">
                <span
                  v-for="caption in line.title.captions"
                  :key="caption.iid"
                >
                  {{ caption.text }}
                </span>
              </span>
            </template>
            <span class="text-sm text-light-3 ml-2">{{ line.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterStatResultWithId } from '@/stores/views/character/setup'

import { StatTypes } from '@/lib/Character/Stat/enums'
import { CharacterStatFormulaResultConditionalBase, StatPartsDetailAdditionalValueItem } from '@/lib/Character/Character'

import CharacterStatDetailEquipments from './character-stat-detail-equipments.vue'

interface Props {
  characterStatResult: CharacterStatResultWithId;
}

const props = defineProps<Props>()

const { t } = useI18n()

interface TextWithId {
  iid: number;
  text: string;
}
interface DetailLineTitle {
  equipments: TextWithId[];
  captions: TextWithId[];
}
interface DetailLine {
  iid: number;
  title: string | DetailLineTitle;
  value: string;
}

const handleConditional = (conditionObj: CharacterStatFormulaResultConditionalBase | StatPartsDetailAdditionalValueItem) => {
  const captions: {
    iid: number;
    text: string;
  }[] = []
  conditionObj.options.forEach(opt => {
    const match = opt.match(/^"([^"]+)"$/)
    match && captions.push({
      iid: captions.length,
      text: match[1],
    })
  })

  let str = conditionObj.conditional
  let strs: string[] = []
  if (str === '#') {
    strs = captions.length === 0 ? [t('character-simulator.character-stat-detail.additional-value')] : []
  } else {
    str = str.replace(/\s+/g, '')
      .replace(/(?:&&|\|\|)#[a-zA-Z0-9._]+/g, '')
      .replace(/#[a-zA-Z0-9._]+(?:&&|\|\|)/g, '')
      .replace(/@([a-zA-Z0-9._]+)/g, (match, p1) => {
        return t('character-simulator.character-stat-detail.equipment-restriction-text.' + p1) + ','
      })
      .replace(/&&|\|\|/g, match => match === '&&' ? '+,' : '/,')
      .replace(/\(|\)/g, match => match + ',')
      .replace(/^\(([^)]+)\)$/, (match, p1) => p1)

    strs = str.split(',')
    if (strs[strs.length - 1] === '') {
      strs = strs.slice(0, -1)
    }
  }

  const equipments = strs.map((item, idx) => ({
    iid: idx,
    text: item,
  }))

  return {
    equipments,
    captions,
  } as DetailLineTitle
}

const showStatDetailDatas = computed(() => {
  const valueFix = (value: number) => value.toString()
    .replace(/^(-?\d+\.)(\d{3,})$/, (match, m1, m2) => m1 + m2.slice(0, 3))
    .replace(/^(-?\d+)(\.0+)$/, (match, m1) => m1)

  const stat = props.characterStatResult
  const base = stat.origin.linkedStatBase
  const types = [null, StatTypes.Constant, StatTypes.Multiplier, StatTypes.Total]

  const list = (base ? ['base', 'constant', 'multiplier', 'total'] : ['base']).map((id, idx) => ({
    type: types[idx],
    id,
  })) as ({
    id: 'base';
    type: null;
  } | {
    id: 'constant' | 'multiplier' | 'total';
    type: StatTypes;
  })[]

  const conditionalBase = stat.conditionalBase ? {
    title: handleConditional(stat.conditionalBase),
  } : null
  const datas = list
    .filter(item => item.id === 'base' || stat.statValueParts[item.id] !== 0)
    .map((item, itemIdx) => {
      const id = item.id,
        type = item.type
      const value = stat.statValueParts[id]
      let title = id !== 'base' ? base!.show(type!, value) : {
        text: t('character-simulator.character-stat-detail.base-value'),
        value: valueFix(stat.statValueParts['base']),
      }
      if (id === 'multiplier') {
        title += '｜' + Math.floor(value * stat.statValueParts['base'] / 100).toString()
      }

      const isBase = id === 'base'

      const lines: DetailLine[] = []
      const adds = stat.statPartsDetail.additionalValues[id].filter(add => add.value !== 0)
      if (adds.length !== 0) {
        const initValue = stat.statPartsDetail.initValue[id]
        let hasInit = false
        if (initValue !== 0) {
          lines.push({
            title: t('character-simulator.character-stat-detail.init-value'),
            value: valueFix(initValue),
            iid: 0,
          })
          hasInit = true
        }
        const _lines = adds
          .sort(addItem => addItem.isMul ? 1 : -1)
          .map((addItem, idx) => {
            let resValue = '0'
            if (addItem.isMul) {
              resValue = addItem.value > 0 ? `×${valueFix(addItem.value)}` : `×(${valueFix(addItem.value)})`
            } else {
              resValue = (addItem.value > 0 && (hasInit || !isBase) ? '+' : '') + valueFix(addItem.value)
              if (!hasInit) {
                hasInit = true
              }
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
          eqs.forEach((text, idx) => {
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
        iid: itemIdx,
        title,
        lines,
      }
    })

  return {
    datas,
    conditionalBase,
  }
})

const statDetailCaption = computed(() => {
  return props.characterStatResult.origin.caption
    .replace(/\(\(([^)]+)\)\)/g, (match, m1) => `<span class="separate-scope">${m1}</span>`)
})
</script>
