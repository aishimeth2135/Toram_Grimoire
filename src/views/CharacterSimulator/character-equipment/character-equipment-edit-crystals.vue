<template>
  <cy-modal
    :visible="!!equipment"
    title-icon="bx-bx-cube-alt"
    :title="t('character-simulator.select-crystals.title')"
    footer
    @close="emit('close')"
  >
    <template #default>
      <div class="sticky top-0">
        <cy-title-input
          v-model:value="searchText"
          icon="ic-outline-category"
          class="mb-4"
          :placeholder="
            t('character-simulator.select-crystals.search-placeholder')
          "
        />
      </div>
      <div>
        <div v-for="category in currentCrystalCategorys" :key="category.id">
          <div>
            <cy-icon-text icon="bx-bx-cube-alt" small text-color="fuchsia-60">
              {{
                t(
                  `character-simulator.select-crystals.category-title.${category.id}`
                )
              }}
            </cy-icon-text>
            <div class="mt-2 px-2">
              <template v-for="crystal in category.crystals" :key="crystal.id">
                <cy-list-item
                  v-if="checkEnchaner(crystal)"
                  :selected="selectedCrystalIds.includes(crystal.id)"
                  @click="toggleCrystalSelected(crystal)"
                >
                  <cy-icon-text
                    :icon="crystal.crystalIconPath"
                    icon-src="image"
                  >
                    {{ crystal.name }}
                  </cy-icon-text>
                </cy-list-item>
                <cy-list-item v-else>
                  <cy-icon-text
                    :icon="crystal.crystalIconPath"
                    icon-src="image"
                    class="opacity-60"
                  >
                    {{ crystal.name }}
                  </cy-icon-text>
                </cy-list-item>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #extra-content>
      <div class="space-y-3">
        <div
          v-for="crystal in equipment?.crystals ?? []"
          :key="crystal.id"
          class="border border-primary-30 bg-white p-3"
        >
          <div>
            <cy-icon-text icon="bx-bx-cube-alt" color="fuchsia">
              {{ crystal.name }}
            </cy-icon-text>
          </div>
          <div class="mt-1 px-2">
            <ShowStat
              v-for="stat in crystal.stats"
              :key="stat.statId"
              :stat="stat"
              :negative-value="stat.value < 0"
            />
          </div>
        </div>
      </div>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { ComputedRef, computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import {
  AdditionalGear,
  BodyArmor,
  CharacterEquipment,
  MainWeapon,
  SpecialGear,
} from '@/lib/Character/CharacterEquipment'
import { Crystal } from '@/lib/Items/Item'

import ShowStat from '@/components/common/show-stat.vue'

interface Props {
  equipment: CharacterEquipment | null
}
interface Emits {
  (evt: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { equipment } = toRefs(props)

const { t } = useI18n()

const searchText = ref('')

const crystalCategorys = (() => {
  const crystals = Grimoire.Items.crystals
  const categorys = Array(5)
    .fill(0)
    .map((_value, idx) => {
      return {
        id: idx,
        crystals: crystals.filter(crystal => crystal.category === idx),
      }
    })
  return categorys
})()

const availableCrystalCategoryIds = computed(() => {
  if (!equipment.value) {
    return []
  }
  if (equipment.value instanceof MainWeapon) {
    return [0, 4]
  }
  if (equipment.value instanceof BodyArmor) {
    return [1, 4]
  }
  if (equipment.value instanceof AdditionalGear) {
    return [2, 4]
  }
  if (equipment.value instanceof SpecialGear) {
    return [3, 4]
  }
  return [4]
})

interface CategoryItem {
  id: number
  crystals: Crystal[]
}

const currentCrystalCategorys: ComputedRef<CategoryItem[]> = computed(() => {
  return crystalCategorys
    .filter(category => availableCrystalCategoryIds.value.includes(category.id))
    .map(category => {
      const crystals = category.crystals.filter(crystal =>
        crystal.name.includes(searchText.value)
      )
      return {
        id: category.id,
        crystals,
      }
    })
    .filter(category => category.crystals.length !== 0)
})

const selectedCrystalIds = computed(() => {
  if (!equipment.value || !equipment.value.hasCrystal) {
    return []
  }
  return equipment.value.crystals.map(crystal => crystal.id)
})

const toggleCrystalSelected = (crystal: Crystal) => {
  if (!equipment.value) {
    return
  }
  if (selectedCrystalIds.value.includes(crystal.id)) {
    equipment.value.removeCrystal(
      equipment.value.crystals.find(_crystal => _crystal.id === crystal.id)!
    )
  } else if (equipment.value.crystals.length < 2) {
    equipment.value.appendCrystal(crystal)
  }
}

const currentEquipmentRelatedCrystals = computed(() => {
  if (!equipment.value) {
    return []
  }
  return equipment.value.crystals
    .map(crystal => {
      const data = crystal.origin.getRelatedCrystals(Grimoire.Items.crystals)
      return [...data.enhancers, ...data.prependeds].map(item => item.name)
    })
    .flat()
})

const checkEnchaner = (crystal: Crystal) =>
  !currentEquipmentRelatedCrystals.value.includes(crystal.name)
</script>
