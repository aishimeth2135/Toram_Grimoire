<template>
  <cy-modal :visible="visible" footer @close="$emit('close')">
    <template #title>
      <cy-icon-text
        v-if="once"
        icon="fluent-list-16-filled"
        text-color="water-blue"
        icon-color="water-blue"
      >
        {{ t('enchant-simulator.step.select-one-stat-item') }}
      </cy-icon-text>
      <cy-icon-text
        v-else
        icon="fluent-list-16-filled"
        text-color="red"
        icon-color="red"
      >
        {{ t('enchant-simulator.step.select-multiple-stat-items') }}
      </cy-icon-text>
    </template>
    <div
      v-for="category in validCategorys"
      :key="category.origin.title"
      class="p-1 mb-2 relative"
    >
      <div
        v-if="category.origin.weaponOnly && !isWeapon"
        class="absolute w-full h-full top-0 left-0 z-1 bg-white opacity-50 cursor-not-allowed"
      />
      <cy-icon-text
        class="w-full"
        small
        text-color="purple"
      >
        {{ category.origin.title }}
      </cy-icon-text>
      <div>
        <cy-button-check
          v-for="item in category.items"
          :key="item.id"
          :selected="selectedItems.some(_item => item.origin === _item.origin && item.type === _item.type)"
          @click="itemClick(item)"
        >
          {{ item.origin.statBase.title(item.type) }}
        </cy-button-check>
      </div>
    </div>
    <template #footer-actions>
      <cy-button-switch v-if="!forPositive" v-model:selected="showNegativeSuggestedList" class="mr-auto">
        {{ t('enchant-simulator.select-item.show-negative-suggested-list') }}
      </cy-button-switch>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { StatNormalTypes, StatTypes } from '@/lib/Character/Stat/enums'
import { EnchantCategory } from '@/lib/Enchant/Enchant'

import { EnchantStatOptionBase } from './setup'

interface Props {
  visible: boolean;
  once?: boolean;
  isWeapon?: boolean;
  forPositive?: boolean;
  defaultNegative?: boolean;
  selectedItems?: EnchantStatOptionBase[];
}
interface Emits {
  (evt: 'close'): void;
  (evt: 'select-item', item: EnchantStatOption): void;
}

const props = withDefaults(defineProps<Props>(), {
  once: false,
  isWeapon: true,
  forPositive: false,
  defaultNegative: false,
  selectedItems: () => [],
})
const emit = defineEmits<Emits>()

const { visible } = toRefs(props)
const { t } = useI18n()

interface EnchantStatCategoryOption {
  origin: EnchantCategory;
  items: EnchantStatOption[];
}

interface EnchantStatOption extends EnchantStatOptionBase {
  id: string;
}

const categorys = (() => {
  const types = [StatTypes.Constant, StatTypes.Multiplier] as StatNormalTypes[]
  const originalCategorys = Grimoire.Enchant.categorys

  return originalCategorys.map(category => {
    const items: EnchantStatOption[] = []
    category.items.forEach(item => {
      types.forEach(type => {
        if (type === StatTypes.Multiplier && !item.statBase.hasMultiplier) {
          return
        }
        items.push({
          id: item.statBase.statId(type),
          type: type,
          origin: item,
        })
      })
    })
    return {
      origin: category,
      items,
    }
  })
})()

const showNegativeSuggestedList = ref(false)

const negativeSuggestedList = computed(() => {
  if (props.isWeapon) {
    return ['def', 'mdef', 'dodge', 'natural_hp_regen', 'natural_mp_regen']
  }
  return ['atk', 'matk', 'physical_pierce', 'magic_pierce', 'accuracy']
})

const validCategorys = computed(() => {
  if (!showNegativeSuggestedList.value) {
    return categorys
  }
  const resultCategorys: EnchantStatCategoryOption[] = []
  categorys.forEach(category => {
    const newItems = category.items
      .filter(item => negativeSuggestedList.value.includes(item.origin.statBase.baseName))
    if (newItems.length > 0) {
      resultCategorys.push({
        origin: category.origin,
        items: newItems,
      })
    }
  })
  return categorys
})

watch(visible, newValue => {
  if (newValue) {
    showNegativeSuggestedList.value = props.defaultNegative
  }
})

const itemClick = (item: EnchantStatOption) => {
  emit('select-item', item)
  if (props.once) {
    emit('close')
  }
}
</script>
