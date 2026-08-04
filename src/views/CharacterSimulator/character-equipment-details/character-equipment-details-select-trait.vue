<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import type { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import type { EquipmentTraitItem } from '@/lib/EquipmentTrait'

import CardRowsDelegation from '@/components/card/card-rows-delegation.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'

import CommonSearchInput from '../common/common-search-input.vue'
import CharacterEquipmentDetailsSelectTraitOption from './character-equipment-details-select-trait-option.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { t } = useI18n()
const allTraitItems = Grimoire.EquipmentTrait.equipmentTraitItems

const searchText = ref('')

const isTraitSelected = (item: EquipmentTraitItem) => {
  return props.equipment.trait?.base.id === item.id
}

const toggleTrait = (item: EquipmentTraitItem) => {
  props.equipment.setTrait(item)
}
</script>

<template>
  <div class="wd-lg:max-h-none flex max-h-[24rem] min-h-0 max-w-[20rem] grow flex-col">
    <CardRowsWrapper class="flex grow flex-col">
      <div class="pb-1">
        <CommonSearchInput v-model="searchText" :placeholder="t('global.search')" is-header />
      </div>
      <div class="grow overflow-y-auto py-2">
        <CardRowsDelegation @row-clicked="toggleTrait">
          <CharacterEquipmentDetailsSelectTraitOption
            v-for="item in allTraitItems"
            :key="item.id"
            :trait-item="item"
            :selected="isTraitSelected(item)"
          />
        </CardRowsDelegation>
      </div>
    </CardRowsWrapper>
  </div>
</template>
