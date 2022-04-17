<template>
  <div>
    <div class="flex items-center w-full">
      <div class="border border-orange rounded-sm py-0.5 px-2 mr-2 bg-white text-orange text-sm">
        {{ result.container.get('name') }}
      </div>
      <div class="flex items-center space-x-0.5">
        <div class="text-light-3">
          {{ valid ? expectedResult : '--' }}
        </div>
        <cy-icon-text
          v-if="frequencyVisible && result.container.get('frequency')"
          icon="ic-round-close"
        />
        <span
          v-if="frequencyVisible"
          class="attr-item"
          v-html="result.container.get('frequency')"
        />
      </div>
      <cy-button-icon icon="majesticons:checkbox-list-detail-line" class="ml-auto" @click="toggle('contents/detail')" />
    </div>
    <div v-if="contents.detail" class="text-sm px-4 py-2 border-1 border-light mt-2">
      <div
        v-for="item in calculationItems"
        :key="item.item.base.id"
        class="flex items-center space-x-2"
        :class="{ 'opacity-50': item.hidden }"
      >
        <div v-html="markText(t('damage-calculation.item-base-titles.' + item.item.base.id))"></div>
        <div class="text-light-3">{{ item.item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResult } from '@/stores/views/character/setup'

import { markText } from '@/shared/utils/view'

import { CalcItem } from '@/lib/Calculation/Damage/Calculation'
import { ContainerTypes } from '@/lib/Calculation/Damage/Calculation/enums'

import ToggleService from '@/setup/ToggleService'

import { setupCharacterStore } from '../setup'

interface Props {
  result: SkillResult;
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()
const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['detail'] as const,
})

const { valid, calculation, expectedResult } = store.setupDamageCalculationExpectedResult(
  computed(() => props.result),
  computed(() => store.targetProperties),
  computed(() => store.calculationOptions),
)

const frequencyVisible = computed(() => {
  return props.result.container.branchItem.attr('title') === 'each'
})

const calculationItems = computed(() => {
  const containers = [...calculation.value.containers.values()]
  const items: {
    item: CalcItem;
    hidden: boolean;
  }[] = []
  containers.forEach(container => {
    const hidden = container.hidden
    if (container.base.type === ContainerTypes.Options) {
      items.push({
        item: container.currentItem,
        hidden,
      })
    } else {
      items.push(...[...container.items.values()].map(item => ({
        item,
        hidden,
      })))
    }
  })
  return items
})
</script>
