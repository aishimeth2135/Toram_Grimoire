<template>
  <div>
    <template v-if="comparedStatsDatas.length != 0">
      <div v-for="data in comparedStatsDatas" :key="data.id" class="flex items-center">
        <template v-if="!data.isBoolStat">
          <cy-icon-text small>
            {{ data.text }}
          </cy-icon-text>
          <span
            class="text-sm ml-1 text-light-3"
            :class="{ 'text-gray': data.negative }"
          >{{ data.displayValue }}</span>
        </template>
        <cy-icon-text
          v-else
          small
          :text-color="data.negative ? 'gray' : 'light-3'"
        >
          {{ data.text }}
        </cy-icon-text>
      </div>
    </template>
    <cy-default-tips v-else icon="mdi-ghost">
      {{ t('character-simulator.main-tips.character-stats-compare-no-result') }}
    </cy-default-tips>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterStatCategoryResult, CharacterStatResultWithId } from '@/stores/views/character/setup'

interface Props {
  before: CharacterStatCategoryResult[];
  after: CharacterStatCategoryResult[];
}

const props = defineProps<Props>()

const { t } = useI18n()

const comparedStatsDatas = computed(() => {
  const before = props.before.map(result => result.stats).flat(),
    after = props.after.map(result => result.stats).flat()

  // const vFix = v => v.toString()
  //    .replace(/^(-?\d+\.)(\d{3,})$/, (m, m1, m2) => m1 + m2.slice(0, 3));
  const handle = (stat: CharacterStatResultWithId, value: number, hidden: boolean) => {
    const isBoolStat = stat.origin.isBoolStat
    return {
      id: stat.id,
      text: isBoolStat ? (value >= 0 ? '+' : '-') + stat.name : stat.name,
      value,
      displayValue: (value >= 0 ? '+' : '') + stat.origin.getDisplayValue(value),
      negative: value < 0,
      isBoolStat,
      hidden,
    }
  }

  const res = after.map(afterStat => {
    let value = afterStat.resultValue
    const idx = before.findIndex(stat => stat.id === stat.id)
    let hidden = afterStat.hidden
    if (idx !== -1) {
      const beforeStat = before[idx]
      value = value - beforeStat.resultValue
      before.splice(idx, 1)
      hidden = afterStat.hidden && beforeStat.hidden
    }
    return handle(afterStat, value, hidden)
  })

  res.push(...before.map(beforeStat => handle(beforeStat, -1 * beforeStat.value, beforeStat.hidden)))

  return res
    .filter(item => !item.hidden)
    .filter(item => item.value !== 0)
})
</script>
