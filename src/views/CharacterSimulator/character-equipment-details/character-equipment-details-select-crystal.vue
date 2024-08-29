<script lang="tsx" setup>
import { type ComputedRef, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import {
  AdditionalGear,
  BodyArmor,
  CharacterEquipment,
  MainWeapon,
  SpecialGear,
} from '@/lib/Character/CharacterEquipment'
import { BagCrystal } from '@/lib/Items/BagItem'

import CardRow from '@/components/card/card-row.vue'
import CardRowsDelegation from '@/components/card/card-rows-delegation.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'

import CommonSearchInput from '../common/common-search-input.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { t } = useI18n()

const searchText = ref('')

const { crystalCategorys } = (() => {
  const crystals = Grimoire.Items.crystals
  const categorys = Array(5)
    .fill(0)
    .map((_value, idx) => {
      return {
        id: idx,
        crystals: [] as BagCrystal[],
      }
    })
  crystals.forEach(crystal => {
    categorys[crystal.category].crystals.push(crystal)
  })
  return { crystalCategorys: categorys }
})()

const availableCrystalCategoryIds = computed(() => {
  if (props.equipment instanceof MainWeapon) {
    return [0, 4]
  }
  if (props.equipment instanceof BodyArmor) {
    return [1, 4]
  }
  if (props.equipment instanceof AdditionalGear) {
    return [2, 4]
  }
  if (props.equipment instanceof SpecialGear) {
    return [3, 4]
  }
  return [4]
})

interface CategoryItem {
  id: number
  title: string
  crystals: BagCrystal[]
}

const currentCrystalCategorys: ComputedRef<CategoryItem[]> = computed(() => {
  return crystalCategorys
    .filter(category => availableCrystalCategoryIds.value.includes(category.id))
    .map(category => {
      const text = searchText.value

      const crystals = category.crystals.filter(crystal => {
        if (crystal.name.toLowerCase().includes(text)) {
          return true
        }
        const categoryCrystals = category.crystals
        if (categoryCrystals) {
          const relatedCrystals = crystal.getRelatedCrystals(categoryCrystals)
          return [
            ...relatedCrystals.enhancers,
            ...relatedCrystals.prependeds,
          ].some(item => item.name.toLowerCase().includes(text))
        }
        return false
      })

      return {
        id: category.id,
        title: t(
          `character-simulator.select-crystals.category-title.${category.id}`
        ),
        crystals,
      }
    })
    .filter(category => category.crystals.length !== 0)
})

const selectedCrystalIds = computed(() => {
  return props.equipment.crystals.map(crystal => crystal.id)
})

const toggleCrystal = (crystal: BagCrystal | null) => {
  if (!crystal) {
    return
  }
  if (selectedCrystalIds.value.includes(crystal.id)) {
    props.equipment.removeCrystal(
      props.equipment.crystals.find(_crystal => _crystal.id === crystal.id)!
    )
  } else if (props.equipment.crystals.length < 2) {
    props.equipment.appendCrystal(crystal)
  }
}

const currentEquipmentRelatedCrystals = computed(() => {
  return props.equipment.crystals
    .map(crystal => {
      const data = crystal.origin.getRelatedCrystals(Grimoire.Items.crystals)
      return [...data.enhancers, ...data.prependeds].map(item => item.name)
    })
    .flat()
})

const checkEnchaner = (crystal: BagCrystal) =>
  !currentEquipmentRelatedCrystals.value.includes(crystal.name)

const RenderOption = (attrs: { option: BagCrystal; key: string }) => {
  const crystal = attrs.option
  const selected = selectedCrystalIds.value.includes(crystal.id)

  return (
    <CardRow
      class={[
        { 'opacity-50': !checkEnchaner(crystal) },
        'flex cursor-pointer items-center px-4 py-2',
      ]}
      item={crystal}
      hover
    >
      <cy-icon
        icon={selected ? 'ic:round-check-circle' : 'mdi:circle-outline'}
        class={[{ 'opacity-50': !selected }, 'mr-3']}
      />
      <cy-icon icon={crystal.crystalIconPath} class="mr-1.5" />
      {crystal.name}
    </CardRow>
  )
}
</script>

<template>
  <CardRowsWrapper
    class="flex h-full max-h-[24rem] max-w-[20rem] flex-col wd-lg:max-h-none"
  >
    <div class="pb-1">
      <CommonSearchInput
        v-model="searchText"
        :placeholder="
          t('character-simulator.select-crystals.search-placeholder')
        "
        is-header
      />
    </div>
    <div class="h-full space-y-3 overflow-y-auto py-2">
      <div v-for="category in currentCrystalCategorys" :key="category.id">
        <div class="pb-2 pl-3 text-sm text-stone-60">{{ category.title }}</div>
        <CardRowsDelegation @row-clicked="toggleCrystal">
          <RenderOption
            v-for="option in category.crystals"
            :key="option.id"
            :option="option"
          />
        </CardRowsDelegation>
      </div>
    </div>
  </CardRowsWrapper>
</template>
