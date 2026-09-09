<template>
  <div v-if="enchantResult.length !== 0">
    <div class="flex items-start">
      <cy-button-icon
        :icon="resultStatsVisible ? 'ant-design:star-filled' : 'ant-design:star-outlined'"
        class="text-orange-60 shrink-0"
        :selected="resultStatsVisible"
        @click="toggleResultStatsVisible"
      />
      <cy-transition>
        <div v-if="resultStatsVisible" class="mb-2">
          <div>
            <span
              v-for="item in enchantResultStats"
              :key="item.stat.statId"
              :class="
                item.negative
                  ? ['text-orange-60', 'border-orange-60']
                  : ['text-primary-60', 'border-primary-60']
              "
              class="stat-scope"
            >
              {{ item.text }}
            </span>
          </div>
          <div class="mt-2">
            <span
              v-for="item in enchantResultMaterials"
              :key="item.title"
              class="stat-scope border-blue-30 text-blue-30 text-sm"
            >
              <span class="text-primary-90">{{ item.title }}</span>
              <span class="text-blue-60 ml-2">{{ item.value }}</span>
            </span>
          </div>
        </div>
      </cy-transition>
      <cy-button-icon
        icon="bx-bx-copy-alt"
        class="ml-auto shrink-0"
        @click="copyEnchantResultText"
      />
    </div>
    <div class="my-1 flex items-center">
      <div class="gap-icon text-primary-30 inline-flex items-center">
        <cy-icon icon="ic:round-numbers" class="text-primary-30" />
        {{ t('enchant-simulator.result.operation-steps-quantity') }}
      </div>
      <span class="text-violet-60 ml-3">
        {{ equipment.operationStepsQuantity }}
      </span>
    </div>
    <div v-for="(item, idx) in enchantResult" :key="item.iid" class="flex items-start">
      <div class="text-primary-30 my-1 mr-3 w-6 shrink-0 text-right">{{ idx + 1 }}.</div>
      <template v-if="item.type === 'normal'">
        <span class="my-1 mr-2 shrink-0">{{ item.parts[0] }}</span>
        <div class="flex flex-wrap items-center">
          <span
            v-for="part in item.parts.slice(1) as EnchantResultPart[]"
            :key="part.text"
            class="stat-scope"
            :class="
              part.negative
                ? ['text-orange-60', 'border-orange-60']
                : ['text-primary-60', 'border-primary-60']
            "
          >
            {{ part.text }}
          </span>
          <div class="gap-icon text-blue-60 ml-2 inline-flex items-center text-sm">
            <cy-icon icon="mdi-creation" small class="text-blue-60" />
            {{ item.remainingPotential }}
          </div>
        </div>
      </template>
      <div v-else>
        <template v-for="part in item.parts">
          <span
            v-if="typeof part !== 'string'"
            :key="part.text"
            class="stat-scope"
            :class="
              part.negative
                ? ['text-orange-60', 'border-orange-60']
                : ['text-primary-60', 'border-primary-60']
            "
          >
            {{ part.text }}
          </span>
          <span v-else :key="part" class="my-1 mr-2">
            {{ part }}
          </span>
        </template>
        <div class="gap-icon text-blue-60 my-1 ml-2 inline-flex items-center text-sm">
          <cy-icon icon="mdi-creation" small class="text-blue-60" />
          {{ item.remainingPotential }}
        </div>
      </div>
    </div>
    <div class="mt-4 flex cursor-pointer items-center px-2">
      <div class="ml-auto flex flex-wrap items-center justify-items-end">
        <div class="mr-4 inline-flex items-center">
          <div class="gap-icon text-primary-90 inline-flex items-center">
            <cy-icon icon="ant-design:star-outlined" class="text-blue-60" />
            {{ t('enchant-simulator.success-rate') }}
          </div>
          <span class="text-blue-60 ml-2">
            {{ successRate }}
          </span>
        </div>
        <div class="inline-flex items-center">
          <div class="gap-icon text-primary-90 inline-flex items-center">
            <cy-icon icon="ant-design:star-outlined" class="text-primary-60" />
            {{ t('enchant-simulator.expected-success-rate') }}
          </div>
          <span class="text-primary-60 ml-2">
            {{ expectedSuccessRate }}
          </span>
        </div>
      </div>
      <cy-popover placement="top-end" class="ml-3 flex">
        <template #default="{ shown }">
          <cy-button-icon icon="bx-bx-info-circle" :selected="shown" />
        </template>
        <template #popper>
          <div class="space-y-2 p-3">
            <div v-for="text in successRateDetailCaptions" :key="text" class="flex items-start">
              <cy-icon icon="ic-outline-near-me" class="mr-2" />
              <span v-html="text"></span>
            </div>
          </div>
        </template>
      </cy-popover>
    </div>
  </div>
  <div v-else class="flex w-full justify-center">
    <cy-default-tips icon="mdi-ghost">
      {{ t('enchant-simulator.tips.invalid-enchant-result') }}
    </cy-default-tips>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, toRefs } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useEnchantStore } from '@/stores/views/enchant'

import Notify from '@/shared/setup/Notify'
import { useToggle } from '@/shared/setup/State'
import CY from '@/shared/utils/Cyteria'
import { trimFloatStringZero } from '@/shared/utils/string'
import { markText } from '@/shared/utils/view'

import {
  EnchantEquipment,
  EnchantStepStat,
  EnchantStepTypes,
  enchantStates,
} from '@/lib/Enchant/Enchant'

import { getSuccessRateDisplay } from './utils'

interface Props {
  equipment: EnchantEquipment
}

const props = defineProps<Props>()
const { equipment } = toRefs(props)

const { t, tm } = useI18n()
const store = useEnchantStore()
const { config } = storeToRefs(store)
const { notify } = Notify()

const resultStatsVisible = ref(true)
const toggleResultStatsVisible = useToggle(resultStatsVisible)

interface EnchantResultPart {
  stat: EnchantStepStat
  text: string
  negative: boolean
}
const enchantResult = computed(() => {
  const validSteps = equipment.value.validSteps

  const insertOdd = (target: any[], src: any[]) => {
    let cur = 1,
      cnt = 0
    while (cnt < src.length || cur < target.length) {
      target.splice(cur, 0, src[cnt])
      cnt += 1
      cur += 2
    }
  }

  const result = validSteps.map((step, idx) => {
    let text = ''
    let parts: (EnchantResultPart | string)[] = []
    if (step.type === EnchantStepTypes.Each) {
      const stat = step.stats[0]
      const tparts = [
        {
          stat,
          text: stat.showEach(),
          negative: stat.value < 0,
        },
        {
          stat,
          text: stat.showCurrent(),
          negative: stat.value < 0,
        },
      ]
      const textParts = t('enchant-simulator.result.enchant-step-each', {
        stat: '{}',
        target: '{}',
      }).split('{}')
      insertOdd(textParts, tparts)
      parts = textParts
      text = parts.map(item => (typeof item !== 'string' ? item.text : item)).join('')
    } else {
      const tparts = step.stats.map(stat => ({
        stat,
        text: stat.showCurrent(),
        negative: stat.value < 0,
      }))
      parts = [t('enchant-simulator.result.enchant-step-normal'), ...tparts]
      text =
        t('enchant-simulator.result.enchant-step-normal') + tparts.map(item => item.text).join('｜')
    }
    const remainingPotential = step.remainingPotential
    text += '｜' + remainingPotential + 'pt'
    return {
      iid: idx,
      text,
      parts,
      remainingPotential,
      type: step.type === EnchantStepTypes.Each ? 'each' : 'normal',
    }
  })
  return result
})

const enchantResultStats = computed(() => {
  const eq = equipment.value
  return eq
    .stats(eq.lastStep!.index)
    .sort((item1, item2) => {
      const av = item1.stat.base.order + (item1.value < 0 ? 99999 : 0)
      const bv = item2.stat.base.order + (item2.value < 0 ? 99999 : 0)
      return av - bv
    })
    .map(stat => ({
      text: stat.showAmount(),
      stat,
      negative: stat.value < 0,
    }))
})

const enchantResultMaterials = computed(() => {
  const titleList = tm('enchant-simulator.material-point-type-list') as string[]
  return equipment.value.allMaterialPointCost.map((item, idx) => ({
    title: titleList[idx],
    value: item,
  }))
})

const successRate = computed(() => getSuccessRateDisplay(equipment.value))
const expectedSuccessRate = computed(() => {
  const rate = equipment.value.successRate
  if (rate === -1) {
    return t('enchant-simulator.success-rate-unlimited')
  }
  if (rate >= 100) {
    return '100%'
  }

  let positiveNums = enchantResultStats.value.filter(item => item.stat.value >= 0).length
  if (positiveNums > 1 && config.value.hasExpertsCustomization2Skill) {
    positiveNums -= 1
  }
  let res = Math.pow(Math.floor(rate) / 100, positiveNums) * 100
  res = Math.min(100, res)
  return trimFloatStringZero(res.toFixed(2)) + '%'
})

const successRateDetailCaptions = computed(() => {
  return (tm('enchant-simulator.result.success-rate-detail.captions') as string[]).map(text =>
    markText(text)
  )
})

const copyEnchantResultText = () => {
  const resultStatsText = enchantResultStats.value.map(item => item.text).join('｜')
  const materialsSkillText = config.value.materialSkillLevels
    .map((item, idx) => `${enchantResultMaterials.value[idx].title} Lv.${item}`)
    .join('｜')
  const materialsText = enchantResultMaterials.value
    .map(item => `${item.title} ${item.value}`)
    .join('｜')
  const stepsText = enchantResult.value.map((item, idx) => `${idx + 1}. ${item.text}`).join('\n')
  const basePotential =
    equipment.value.basePotential === enchantStates.EquipmentBasePotentialMinimum
      ? ''
      : `${t('enchant-simulator.equipment-base-potential')}｜${equipment.value.basePotential}\n`
  CY.copyToClipboard(
    `✩ ${t('enchant-simulator.equipment-types.' + equipment.value.fieldType)}\n` +
      `${t('enchant-simulator.equipment-original-potential')}｜${
        equipment.value.originalPotential
      }\n` +
      `${t('enchant-simulator.smith-level')}｜${config.value.smithLevel}\n` +
      basePotential +
      `✩ ${t('enchant-simulator.result.stats')}\n` +
      `${resultStatsText}\n` +
      `✩ ${t('enchant-simulator.result.materials-skill-levels')}\n` +
      `${materialsSkillText}\n` +
      `✩ ${t('enchant-simulator.result.materials')}\n` +
      `${materialsText}\n\n` +
      `${t('enchant-simulator.result.operation-steps-quantity')}｜${
        equipment.value.operationStepsQuantity
      }\n\n` +
      `${stepsText}\n\n` +
      `✩ ${t('enchant-simulator.success-rate')}｜${successRate.value}\n` +
      `✩ ${t('enchant-simulator.expected-success-rate')}｜${expectedSuccessRate.value}\n\n` +
      '｜cy-grimoire.netlify.app｜'
  )
  notify(t('enchant-simulator.tips.copy-result-text-success'))
}
</script>

<style scoped>
@reference "@/tailwind.css";

.stat-scope {
  display: inline-block;
  position: relative;
  margin-block: --spacing(1);
  margin-right: --spacing(3);
  border-bottom-width: 1px;
  padding-inline: --spacing(2);

  &::before {
    display: inline-block;
    position: absolute;
    right: --spacing(-1);
    bottom: --spacing(-1);
    border-radius: calc(infinity * 1px);
    background-color: currentcolor;
    width: --spacing(2);
    height: --spacing(2);
    content: '';
  }
}
</style>
