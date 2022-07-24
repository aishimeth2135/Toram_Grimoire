<template>
  <cy-modal
    :visible="!!equipment"
    footer
    @close="emit('close')"
  >
    <template #title>
      <cy-icon-text icon="bx-bx-cube-alt">
        {{ t('character-simulator.select-crystals.title') }}
      </cy-icon-text>
    </template>
    <template #default>
      <div class="sticky top-0">
        <cy-title-input
          v-model:value="searchText"
          icon="ic-outline-category"
          class="mb-4"
          :placeholder="t('character-simulator.select-crystals.search-placeholder')"
        />
      </div>
      <div>
        <div v-for="category in currentCrystalCategorys" :key="category.id">
          <div>
            <cy-icon-text icon="bx-bx-cube-alt" small text-color="purple">
              {{ t(`character-simulator.select-crystals.category-title.${category.id}`) }}
            </cy-icon-text>
            <div class="mt-2 px-2">
              <template v-for="crystal in category.crystals" :key="crystal.id">
                <cy-list-item
                  v-if="checkEnchaner(category, crystal)"
                  :selected="selectedCrystalIds.includes(crystal.id)"
                  @click="toggleCrystalSelected(crystal)"
                >
                  <cy-icon-text :icon="crystal.crystalIconPath" icon-src="image">
                    {{ crystal.name }}
                  </cy-icon-text>
                </cy-list-item>
                <cy-list-item v-else>
                  <cy-icon-text :icon="crystal.crystalIconPath" icon-src="image" class="opacity-60">
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
          v-for="crystal in (equipment?.crystals ?? [])"
          :key="crystal.id"
          class="p-4 bg-white border border-light-2"
        >
          <div>
            <cy-icon-text icon="bx-bx-cube-alt">
              {{ crystal.name }}
            </cy-icon-text>
          </div>
          <div class="mt-2 px-2">
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
import { useI18n } from 'vue-i18n'
import { computed, ComputedRef, ref, toRefs } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { AdditionalGear, BodyArmor, CharacterEquipment, MainWeapon, SpecialGear } from '@/lib/Character/CharacterEquipment'
import { Crystal } from '@/lib/Items/Item'

import ShowStat from '@/components/common/show-stat.vue'

interface Props {
  equipment: CharacterEquipment | null;
}
interface Emits {
  (evt: 'close'): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { equipment } = toRefs(props)

const { t } = useI18n()

const searchText = ref('')

const crystalCategorys = (() => {
  const crystals = Grimoire.Items.crystals
  const categorys = Array(5).fill(0).map((_value, idx) => {
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
  id: number;
  crystals: Crystal[];
}

const currentCrystalCategorys: ComputedRef<CategoryItem[]> = computed(() => {
  return crystalCategorys
    .filter(category => availableCrystalCategoryIds.value.includes(category.id))
    .map(category => {
      const crystals = category.crystals.filter(crystal => crystal.name.includes(searchText.value))
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
    equipment.value.removeCrystal(equipment.value.crystals.find(_crystal => _crystal.id === crystal.id)!)
  } else if (equipment.value.crystals.length < 2) {
    equipment.value.appendCrystal(crystal)
  }
}

const checkEnchaner = (category: CategoryItem, crystal: Crystal) => {
  const findByName = (name: string) => category.crystals.find(_crystal => _crystal.name === name)
  const check1 = equipment.value && (equipment.value.crystals ?? []).every(equipCrystal => {
    let cur = equipCrystal.origin
    while (cur.enhancer) {
      const _cur = findByName(cur.enhancer)
      if (!_cur) {
        break
      }
      cur = _cur
      if (cur.name === crystal.name) {
        return false
      }
    }
    return true
  })
  const findByEnhancer = (name: string) => category.crystals.find(_crystal => _crystal.enhancer === name)
  const check2 = equipment.value && (equipment.value.crystals ?? []).every(equipCrystal => {
    let cur = equipCrystal.origin
    while (true) { // eslint-disable-line
      const _cur = findByEnhancer(cur.name)
      if (!_cur) {
        break
      }
      cur = _cur
      if (cur.name === crystal.name) {
        return false
      }
    }
    return true
  })

  return check1 && check2
}
</script>
