<template>
  <div>
    <div class="mb-2 mt-0.5 flex flex-wrap items-center">
      <div class="mr-4 flex">
        <cy-icon-text icon="gridicons:stats-alt" color="primary-80">
          {{ characterStatResult.name }}
        </cy-icon-text>
      </div>
      <div
        v-if="characterStatResult.origin.max || characterStatResult.origin.min"
        class="ml-auto flex items-center space-x-0.5 text-sm text-primary-30"
      >
        <div v-if="characterStatResult.origin.min">
          {{ characterStatResult.origin.min }}
        </div>
        <cy-icon icon="mdi:tilde" width="0.8rem" />
        <div v-if="characterStatResult.origin.max">
          {{ characterStatResult.origin.max }}
        </div>
      </div>
    </div>
    <div
      v-if="statDetailCaption"
      class="stat-detail-caption mb-3 pl-2 text-sm"
      v-html="statDetailCaption"
    />
    <cy-icon-text v-if="showStatDetailDatas.conditionalBase" icon="mdi-sword">
      <CharacterStatDetailEquipments
        :equipment-texts="showStatDetailDatas.conditionalBase.title.equipments"
      />
    </cy-icon-text>
    <div class="mb-0.5 max-w-full overflow-x-auto pb-0.5">
      <div
        v-for="data in showStatDetailDatas.datas"
        :key="data.id"
        class="mt-1"
      >
        <div class="flex items-center">
          <cy-icon-text icon="mdi:label-outline" text-color="fuchsia-60">
            <template v-if="!!(typeof data.title !== 'object')">
              {{ data.title }}
            </template>
            <template v-else>
              <span>{{ data.title.text }}</span>
              <span class="ml-1.5 text-primary-50">{{ data.title.value }}</span>
            </template>
          </cy-icon-text>
          <div class="ml-3">
            <cy-popover v-if="data.statRecorded" placement="bottom-start">
              <template #default="{ shown }">
                <div class="flex">
                  <cy-button-icon
                    icon="mdi:help-circle-outline"
                    :selected="shown"
                  />
                </div>
              </template>
              <template #popper>
                <div class="px-3 py-2 text-sm">
                  <div
                    v-for="(src, idx) in data.statRecorded.sources"
                    :key="idx"
                    class="flex items-center space-x-2"
                  >
                    <template v-if="src.type === StatValueSourceTypes.Skill">
                      <div
                        v-if="(src.src as SkillBranch).name === SkillBranchNames.Passive"
                        class="text-primary-30"
                      >
                        {{
                          t('character-simulator.skill-build.passive-skills')
                        }}
                      </div>
                      <div v-else class="text-primary-30">
                        {{ t('character-simulator.skill-build.active-skills') }}
                      </div>
                      <div>
                        {{ (src.src as SkillBranch).parent.parent.name }}
                      </div>
                    </template>
                    <template
                      v-else-if="src.type === StatValueSourceTypes.Equipment"
                    >
                      <div class="text-orange-30">
                        {{
                          t(
                            'common.Equipment.category.' +
                              (src.src as CharacterEquipment).type
                          )
                        }}
                      </div>
                      <div>
                        {{ (src.src as CharacterEquipment).name }}
                      </div>
                    </template>
                    <template
                      v-else-if="src.type === StatValueSourceTypes.Crystal"
                    >
                      <div class="text-cyan-30">
                        {{
                          t('character-simulator.character-stat-detail.crystal')
                        }}
                      </div>
                      <div>
                        {{ (src.src as EquipmentCrystal).name }}
                      </div>
                    </template>
                    <div
                      v-else-if="src.type === StatValueSourceTypes.Food"
                      class="text-emerald-30"
                    >
                      {{ t('character-simulator.character-stat-detail.food') }}
                    </div>
                    <template
                      v-else-if="src.type === StatValueSourceTypes.Registlet"
                    >
                      <div class="text-blue-30">
                        {{ t('common.Registlet.title') }}
                      </div>
                      <div>{{ (src.src as RegistletItemBase).name }}</div>
                    </template>
                    <template
                      v-else-if="src.type === StatValueSourceTypes.Potion"
                    >
                      <div class="text-orange-30">
                        {{ t('character-simulator.potion-build.potion') }}
                      </div>
                      <div>{{ (src.src as BagPotion).name }}</div>
                    </template>
                    <div class="text-primary-50">
                      {{ data.statRecorded.showValue(src.value) }}
                    </div>
                  </div>
                </div>
              </template>
            </cy-popover>
          </div>
        </div>
        <div
          v-if="data.lines.length !== 0"
          class="mt-0.5 space-y-0.5 pb-1 pl-2"
        >
          <div
            v-for="line in data.lines"
            :key="'line-' + line.iid"
            class="flex w-max flex-wrap items-center"
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
              <span class="space-x-1 text-sm">
                <span v-for="caption in line.title.captions" :key="caption.iid">
                  {{ caption.text }}
                </span>
              </span>
            </template>
            <span class="ml-2 text-sm text-primary-50">{{ line.value }}</span>
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

import { lastElement } from '@/shared/utils/array'

import {
  CharacterStatFormulaResultConditionalBase,
  StatPartsDetailAdditionalValueItem,
} from '@/lib/Character/Character'
import {
  CharacterEquipment,
  EquipmentCrystal,
} from '@/lib/Character/CharacterEquipment'
import { StatTypes, StatValueSourceTypes } from '@/lib/Character/Stat'
import { BagPotion } from '@/lib/Items/BagItem'
import { RegistletItemBase } from '@/lib/Registlet/RegistletItem'
import { SkillBranch } from '@/lib/Skill/Skill'
import { SkillBranchNames } from '@/lib/Skill/Skill'

import CharacterStatDetailEquipments from './character-stat-detail-equipments.vue'

interface Props {
  characterStatResult: CharacterStatResultWithId
}

const props = defineProps<Props>()

const { t } = useI18n()

interface TextWithId {
  iid: number
  text: string
}
interface DetailLineTitle {
  equipments: TextWithId[]
  captions: TextWithId[]
}
interface DetailLine {
  iid: number
  title: string | DetailLineTitle
  value: string
}

const handleConditional = (
  conditionObj:
    | CharacterStatFormulaResultConditionalBase
    | StatPartsDetailAdditionalValueItem
) => {
  const captions: {
    iid: number
    text: string
  }[] = []
  conditionObj.options.forEach(opt => {
    const match = opt.match(/^"([^"]+)"$/)
    match &&
      captions.push({
        iid: captions.length,
        text: match[1],
      })
  })

  let str = conditionObj.conditional
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
      .replace(/@([a-zA-Z0-9._]+)/g, (match, p1) => {
        return (
          t(
            `character-simulator.character-stat-detail.equipment-restriction-text.${p1}`
          ) + ','
        )
      })
      .replace(/&&|\|\|/g, match => (match === '&&' ? '+,' : '/,'))
      .replace(/\(|\)/g, match => match + ',')
      .replace(/^\(([^)]+)\)$/, (match, p1) => p1)

    strs = str.split(',')
    if (lastElement(strs) === '') {
      strs.pop()
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
  const valueFix = (value: number) =>
    value
      .toString()
      .replace(/^(-?\d+\.)(\d{3,})$/, (match, m1, m2) => m1 + m2.slice(0, 3))
      .replace(/^(-?\d+)(\.0+)$/, (match, m1) => m1)

  const stat = props.characterStatResult
  const base = stat.origin.linkedStatBase
  const types = [
    null,
    StatTypes.Constant,
    StatTypes.Multiplier,
    StatTypes.Total,
  ]

  const list = (
    base ? ['base', 'constant', 'multiplier', 'total'] : ['base']
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
      let title =
        id !== 'base'
          ? base!.show(type!, value)
          : {
              text: t('character-simulator.character-stat-detail.base-value'),
              value: valueFix(stat.statValueParts['base']),
            }
      if (id === 'multiplier') {
        title +=
          '｜' +
          Math.floor((value * stat.statValueParts['base']) / 100).toString()
      }

      const isBase = id === 'base'

      const lines: DetailLine[] = []
      const adds = stat.statPartsDetail.additionalValues[id].filter(
        add => add.value !== 0
      )
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
    (match, m1) => `<span class="cy--text-separate">${m1}</span>`
  )
})
</script>
