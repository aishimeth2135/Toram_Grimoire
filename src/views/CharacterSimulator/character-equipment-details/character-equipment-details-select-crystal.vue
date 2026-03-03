<script lang="ts" setup>
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

import CardRowsDelegation from '@/components/card/card-rows-delegation.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'

import CommonSearchInput from '../common/common-search-input.vue'
import CharacterEquipmentDetailsSelectCrystalOption from './character-equipment-details-select-crystal-option.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { t } = useI18n()

const searchText = ref('')
const showCrystalStats = ref(false)
const onlyshowLastCrystal = ref(true)

const allCrystalCategorys = (() => {
  const allCrystals = Grimoire.Items.crystals
  const categorys = Array(5)
    .fill(0)
    .map((_value, idx) => {
      return {
        id: idx,
        crystals: [] as BagCrystal[],
      }
    })
  allCrystals.forEach(crystal => {
    categorys[crystal.category].crystals.push(crystal)
  })
  return categorys
})()

const crystalCategoryAllCrystalEnhancers = new Map<number, Set<string>>()
allCrystalCategorys.forEach(category => {
  const enhancers = new Set<string>()
  category.crystals.forEach(crystal => {
    if (crystal.enhancer) {
      enhancers.add(crystal.enhancer)
    }
  })
  crystalCategoryAllCrystalEnhancers.set(category.id, enhancers)
})

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

const selectedCrystalIds = computed(() => {
  return props.equipment.crystals.map(crystal => crystal.id)
})
const checkCrystalSelected = (crystal: BagCrystal) => {
  return selectedCrystalIds.value.includes(crystal.id)
}

interface CategoryItem {
  id: number
  title: string
  crystals: BagCrystal[]
}

const getCrystalCategoryTitle = (categoryId: number): string => {
  switch (categoryId) {
    case 0:
      return t(`character-simulator.select-crystals.category-title.0`)
    case 1:
      return t(`character-simulator.select-crystals.category-title.1`)
    case 2:
      return t(`character-simulator.select-crystals.category-title.2`)
    case 3:
      return t(`character-simulator.select-crystals.category-title.3`)
    case 4:
      return t(`character-simulator.select-crystals.category-title.4`)
    default:
      return ''
  }
}

const currentCrystalCategorys: ComputedRef<CategoryItem[]> = computed(() => {
  return allCrystalCategorys
    .filter(category => availableCrystalCategoryIds.value.includes(category.id))
    .map(category => {
      const text = searchText.value.toLowerCase()
      const categoryAllCrystalEnhancers = crystalCategoryAllCrystalEnhancers.get(category.id)!

      const crystals = category.crystals.filter(crystal => {
        if (
          onlyshowLastCrystal.value &&
          !checkCrystalSelected(crystal) &&
          (crystal.stats.length <= 1 || categoryAllCrystalEnhancers.has(crystal.name))
        ) {
          return false
        }
        if (crystal.name.toLowerCase().includes(text)) {
          return true
        }
        const relatedCrystals = crystal.getRelatedCrystals(category.crystals)
        return [...relatedCrystals.enhancers, ...relatedCrystals.prependeds].some(item =>
          item.name.toLowerCase().includes(text)
        )
      })

      return {
        id: category.id,
        title: getCrystalCategoryTitle(category.id),
        crystals,
      }
    })
    .filter(category => category.crystals.length !== 0)
})

const toggleCrystal = (crystal: BagCrystal | null) => {
  if (!crystal) {
    return
  }
  if (checkCrystalSelected(crystal)) {
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
      return [...data.enhancers, ...data.prependeds]
    })
    .flat()
})
</script>

<template>
  <div class="wd-lg:max-h-none flex max-h-[24rem] min-h-0 max-w-[20rem] grow flex-col">
    <div class="flex justify-end pb-1">
      <cy-button-toggle v-model:selected="showCrystalStats">
        {{ t('character-simulator.select-crystals.show-crystal-stats') }}
      </cy-button-toggle>
    </div>
    <CardRowsWrapper class="flex grow flex-col">
      <div class="flex items-stretch pb-1">
        <CommonSearchInput
          v-model="searchText"
          :placeholder="t('character-simulator.select-crystals.search-placeholder')"
          is-header
          class="grow"
        />
        <cy-popover
          class="border-primary-5 flex items-center border-b border-l bg-white px-1.5"
          placement="bottom-end"
        >
          <cy-button-icon icon="mdi-filter" :selected="onlyshowLastCrystal" />
          <template #popper>
            <div class="flex flex-col px-2 py-1">
              <cy-button-check
                :selected="!onlyshowLastCrystal"
                @update:selected="onlyshowLastCrystal = !$event"
              >
                {{ t('character-simulator.select-crystals.filter-all-crystal') }}
              </cy-button-check>
              <cy-button-check v-model:selected="onlyshowLastCrystal">
                {{ t('character-simulator.select-crystals.filter-last-crystal') }}
              </cy-button-check>
            </div>
          </template>
        </cy-popover>
      </div>
      <div class="grow space-y-3 overflow-y-auto py-2">
        <div v-for="category in currentCrystalCategorys" :key="category.id">
          <div class="text-stone-60 pb-2 pl-3 text-sm">{{ category.title }}</div>
          <CardRowsDelegation @row-clicked="toggleCrystal">
            <CharacterEquipmentDetailsSelectCrystalOption
              v-for="option in category.crystals"
              :key="option.id"
              :crystal="option"
              :equipment-related-crystals="currentEquipmentRelatedCrystals"
              :selected="checkCrystalSelected(option)"
              :show-crystal-stats="showCrystalStats"
            />
          </CardRowsDelegation>
        </div>
      </div>
    </CardRowsWrapper>
  </div>
</template>
