<template>
  <cy-modal :visible="visible" footer @close="$emit('close')">
    <template #title>
      <cy-icon-text
        v-if="once"
        icon="fluent-list-16-filled"
        text-color="blue-60"
        icon-color="blue-60"
      >
        {{ t('enchant-simulator.step.select-one-stat-item') }}
      </cy-icon-text>
      <cy-icon-text
        v-else
        icon="fluent-list-16-filled"
        text-color="orange-60"
        icon-color="orange-60"
      >
        {{ t('enchant-simulator.step.select-multiple-stat-items') }}
      </cy-icon-text>
    </template>
    <div
      v-for="category in validCategorys"
      :key="category.origin.title"
      class="relative mb-2 p-1"
    >
      <div
        v-if="category.origin.weaponOnly && !isWeapon"
        class="absolute top-0 left-0 z-1 h-full w-full cursor-not-allowed bg-white opacity-50"
      />
      <cy-icon-text class="w-full" small text-color="fuchsia-60">
        {{ category.origin.title }}
      </cy-icon-text>
      <div>
        <cy-button-check
          v-for="item in category.items"
          :key="item.id"
          :selected="
            selectedItems.some(
              _item => item.origin === _item.origin && item.type === _item.type
            )
          "
          :disabled="
            disabledItems.some(
              _item => item.origin === _item.origin && item.type === _item.type
            )
          "
          @click="itemClick(item)"
        >
          <span>
            {{ item.origin.statBase.title(item.type) }}
          </span>
          <span class="ml-2 text-sm text-primary-30">
            {{ item.origin.getPotential(item.type, tmpEquipment) + 'pt' }}
          </span>
        </cy-button-check>
      </div>
    </div>
    <template #footer-actions>
      <cy-button-toggle
        v-if="!forPositive"
        v-model:selected="showNegativeSuggestedList"
        class="mr-auto"
      >
        {{ t('enchant-simulator.select-item.show-negative-suggested-list') }}
      </cy-button-toggle>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { StatNormalTypes, StatTypes } from '@/lib/Character/Stat/enums'
import { EnchantCategory, EnchantEquipment } from '@/lib/Enchant/Enchant'
import { EnchantEquipmentTypes } from '@/lib/Enchant/Enchant/enums'

import { EnchantStatOptionBase } from './setup'

interface Props {
  visible: boolean
  isWeapon: boolean
  selectedItems: EnchantStatOptionBase[]
  disabledItems?: EnchantStatOptionBase[]
  once?: boolean
  forPositive?: boolean
  defaultNegative?: boolean
}
interface Emits {
  (evt: 'close'): void
  (evt: 'select-item', item: EnchantStatOption): void
}

const props = withDefaults(defineProps<Props>(), {
  once: false,
  forPositive: false,
  defaultNegative: false,
  disabledItems: () => [],
})
const emit = defineEmits<Emits>()

const { t } = useI18n()

interface EnchantStatCategoryOption {
  origin: EnchantCategory
  items: EnchantStatOption[]
}

interface EnchantStatOption extends EnchantStatOptionBase {
  id: string
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

const tmpEquipment = computed(() => {
  const equip = new EnchantEquipment()
  if (!props.isWeapon) {
    equip.fieldType = EnchantEquipmentTypes.BodyArmor
  }
  return equip
})

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
    const newItems = category.items.filter(item =>
      negativeSuggestedList.value.includes(item.origin.statBase.baseId)
    )
    if (newItems.length > 0) {
      resultCategorys.push({
        origin: category.origin,
        items: newItems,
      })
    }
  })
  return resultCategorys
})

watch(
  () => props.visible,
  newValue => {
    if (newValue) {
      showNegativeSuggestedList.value = props.defaultNegative
    }
  }
)

const itemClick = (item: EnchantStatOption) => {
  emit('select-item', item)
  if (props.once) {
    emit('close')
  }
}
</script>
