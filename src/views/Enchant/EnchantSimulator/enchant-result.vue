<template>
  <div v-if="enchantResult.length !== 0">
    <div class="flex items-start">
      <cy-button-icon
        :icon="contents.resultStats ? 'ant-design:star-filled' : 'ant-design:star-outlined'"
        class="flex-shrink-0"
        icon-color="orange"
        :selected="contents.resultStats"
        @click="toggle('contents/resultStats')"
      />
      <cy-transition type="fade">
        <div v-if="contents.resultStats" class="mb-2">
          <div>
            <span
              v-for="item in enchantResultStats"
              :key="item.stat.statId"
              :class="item.negative ? ['text-orange', 'border-orange'] : ['text-light-4', 'border-light-4']"
              class="stat-scope"
            >
              {{ item.text }}
            </span>
          </div>
          <div class="mt-2">
            <span
              v-for="item in enchantResultMaterials"
              :key="item.title"
              class="stat-scope border-water-blue-light text-water-blue-light text-sm"
            >
              <span class="text-dark">{{ item.title }}</span>
              <span class="text-water-blue ml-2">{{ item.value }}</span>
            </span>
          </div>
        </div>
      </cy-transition>
      <cy-button-icon
        icon="bx-bx-copy-alt"
        class="ml-auto flex-shrink-0"
        @click="copyEnchantResultText"
      />
    </div>
    <div
      v-for="(item, idx) in enchantResult"
      :key="item.iid"
      class="flex items-start"
    >
      <div class="text-light-2 mr-3 my-1 w-6 text-right flex-shrink-0">
        {{ idx + 1 }}.
      </div>
      <template v-if="item.type === 'normal'">
        <span class="mr-2 my-1 flex-shrink-0">{{ item.parts[0] }}</span>
        <div class="flex items-center flex-wrap">
          <span
            v-for="part in (item.parts.slice(1) as EnchantResultPart[])"
            :key="part.text"
            class="stat-scope"
            :class="part.negative ? ['text-orange', 'border-orange'] : ['text-light-4', 'border-light-4']"
          >
            {{ part.text }}
          </span>
          <cy-icon-text
            icon="mdi-creation"
            size="small"
            icon-color="water-blue"
            text-color="water-blue"
            class="ml-2"
          >
            {{ item.remainingPotential }}
          </cy-icon-text>
        </div>
      </template>
      <div v-else>
        <template v-for="part in item.parts">
          <span
            v-if="(typeof part !== 'string')"
            :key="part.text"
            class="stat-scope"
            :class="part.negative ? ['text-orange', 'border-orange'] : ['text-light-4', 'border-light-4']"
          >
            {{ part.text }}
          </span>
          <span v-else :key="part" class="my-1 mr-2">
            {{ part }}
          </span>
        </template>
        <cy-icon-text
          icon="mdi-creation"
          size="small"
          icon-color="water-blue"
          text-color="water-blue"
          class="ml-2 my-1"
        >
          {{ item.remainingPotential }}
        </cy-icon-text>
      </div>
    </div>
    <div
      class="flex items-center mt-4 px-2 cursor-pointer"
      @click="toggle('windows/successRateDetail')"
    >
      <div class="flex items-center flex-wrap justify-items-end ml-auto">
        <div class="inline-flex items-center mr-4">
          <cy-icon-text icon="ant-design:star-outlined" icon-color="water-blue">
            {{ t('enchant-simulator.success-rate') }}
          </cy-icon-text>
          <span class="text-water-blue ml-2">
            {{ successRate }}
          </span>
        </div>
        <div class="inline-flex items-center">
          <cy-icon-text icon="ant-design:star-outlined" icon-color="light-4">
            {{ t('enchant-simulator.expected-success-rate') }}
          </cy-icon-text>
          <span class="text-light-4 ml-2">
            {{ expectedSuccessRate }}
          </span>
        </div>
      </div>
      <cy-icon-text icon="bx-bx-info-circle" class="ml-3" />
    </div>
  </div>
  <div v-else class="flex justify-center w-full">
    <cy-default-tips icon="mdi-ghost">
      {{ t('enchant-simulator.tips.invalid-enchant-result') }}
    </cy-default-tips>
  </div>
  <cy-modal
    footer
    :visible="windows.successRateDetail"
    :title="t('enchant-simulator.result.success-rate-detail.title')"
    title-icon="ant-design:star-outlined"
    @close="toggle('windows/successRateDetail', false)"
  >
    <div class="px-1 space-y-2">
      <div
        v-for="text in successRateDetailCaptions"
        :key="text"
        class="flex items-start"
      >
        <cy-icon-text icon="ic-outline-near-me" class="mr-2" />
        <span v-html="text"></span>
      </div>
    </div>
  </cy-modal>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { useEnchantStore } from '@/stores/views/enchant'

import CY from '@/shared/utils/Cyteria'
import { trimFloatStringZero } from '@/shared/utils/string'
import { markText } from '@/shared/utils/view'

import ENCHANT_STATE from '@/lib/Enchant/Enchant/state'
import { EnchantEquipment, EnchantStepStat } from '@/lib/Enchant/Enchant'
import { EnchantStepTypes } from '@/lib/Enchant/Enchant/enums'

import ToggleService from '@/setup/ToggleService'
import Notify from '@/setup/Notify'

interface Props {
  equipment: EnchantEquipment;
}

const props = defineProps<Props>()
const { equipment } = toRefs(props)

const { windows, contents, toggle } = ToggleService({
  windows: ['successRateDetail'],
  contents: [{ name: 'resultStats', default: true }],
})
const { t, tm } = useI18n()
const store = useEnchantStore()
const { config } = storeToRefs(store)
const { notify } = Notify()

interface EnchantResultPart {
  stat: EnchantStepStat;
  text: string;
  negative: boolean;
}
const enchantResult = computed(() => {
  const validSteps = equipment.value.validSteps

  const insertOdd = (target: any[], src: any[]) => {
    let cur = 1, cnt = 0
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
      const tparts = [{
        stat,
        text: stat.showEach(),
        negative: stat.value < 0,
      }, {
        stat,
        text: stat.showCurrent(),
        negative: stat.value < 0,
      }]
      const textParts = t('enchant-simulator.result.enchant-step-each').split(/\{[a-zA-Z]+\}/)
      insertOdd(textParts, tparts)
      parts = textParts
      text = parts.map(item => typeof item !== 'string' ? item.text : item).join('')
    } else {
      const tparts = step.stats.map(stat => ({
        stat,
        text: stat.showCurrent(),
        negative: stat.value < 0,
      }))
      parts = [t('enchant-simulator.result.enchant-step-normal'), ...tparts]
      text = t('enchant-simulator.result.enchant-step-normal') + tparts.map(item => item.text).join('｜')
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
  return eq.stats(eq.lastStep!.index)
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

const successRate = computed(() => {
  const rate = equipment.value.successRate
  return rate === -1 ?
    t('enchant-simulator.success-rate-unlimited') :
    Math.floor(rate) + '%'
})
const expectedSuccessRate = computed(() => {
  const rate = equipment.value.successRate
  if (rate === -1) {
    return t('enchant-simulator.success-rate-unlimited')
  }
  if (rate >= 100) {
    return '100%'
  }

  const positiveNums = enchantResultStats.value.filter(item => item.stat.value >= 0).length
  let res = Math.pow(Math.floor(rate) / 100, positiveNums) * 100
  res = Math.min(100, res)
  return trimFloatStringZero(res.toFixed(2)) + '%'
})

const successRateDetailCaptions = computed(() => {
  return (tm('enchant-simulator.result.success-rate-detail.captions') as string[]).map(text => markText(text))
})

const copyEnchantResultText = () => {
  const resultStatsText = enchantResultStats.value.map(item => item.text).join('｜')
  const materialsText = enchantResultMaterials.value.map(item => `${item.title} ${item.value}`).join('｜')
  const stepsText = enchantResult.value
    .map((item, idx) => `${idx + 1}. ${item.text}`)
    .join('\n')
  const basePotential = equipment.value.basePotential === ENCHANT_STATE.EquipmentBasePotentialMinimum ?
    '' :
    `${t('enchant-simulator.equipment-base-potential')}｜${equipment.value.basePotential}\n`
  CY.copyToClipboard(
    `✩ ${t('enchant-simulator.equipment-types.' + equipment.value.fieldType)}\n` +
    `${t('enchant-simulator.equipment-original-potential')}｜${equipment.value.originalPotential}\n` +
    `${t('enchant-simulator.smith-level')}｜${config.value.smithLevel}\n` +
    basePotential +
    `✩ ${t('enchant-simulator.result.stats')}\n` +
    `${resultStatsText}\n` +
    `✩ ${t('enchant-simulator.result.materials')}\n` +
    `${materialsText}\n\n` +
    `${stepsText}\n\n` +
    `✩ ${t('enchant-simulator.success-rate')}｜${successRate.value}\n` +
    `✩ ${t('enchant-simulator.expected-success-rate')}｜${expectedSuccessRate.value}\n` +
    '｜cy-grimoire.netlify.app｜',
  )
  notify(t('enchant-simulator.tips.copy-result-text-success'))
}
</script>

<style lang="postcss" scoped>
.stat-scope {
  border-bottom-width: 1px;
  display: inline-block;
  position: relative;

  @apply px-2 mr-3 my-1;

  &::before {
    content: '';
    display: inline-block;
    background-color: currentcolor;
    position: absolute;

    @apply w-2 h-2 rounded-full -right-1 -bottom-1;
  }
}
</style>
