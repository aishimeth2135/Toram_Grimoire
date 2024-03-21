<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CardRow from '@/components/card/card-row.vue'

import CharacterEquipmentLabels from '../character-equipment-details/character-equipment-labels.vue'
import CommonEquipmentIcon from '../common/common-equipment-icon.vue'
import BrowseEquipmentsItemWrapper from './browse-equipments-item-wrapper.vue'
import EquipmentBrowseActions from './equipment-browse-actions.vue'
import EquipmentBrowseTitle from './equipment-browse-title.vue'

interface Props {
  equipment: CharacterEquipment
  selected?: boolean
  equipped?: boolean
  invalid?: boolean
  allowEquip?: boolean
}
interface Emits {
  (evt: 'equip', equipment: CharacterEquipment): void
  (evt: 'equip-cancel'): void
}

withDefaults(defineProps<Props>(), {
  selected: false,
  equipped: false,
  invalid: false,
  allowEquip: false,
})
const emit = defineEmits<Emits>()
</script>

<template>
  <BrowseEquipmentsItemWrapper :equipment="equipment" :equipped="equipped">
    <CardRow
      class="cursor-pointer rounded border"
      :class="[
        { 'opacity-25': invalid },
        selected ? 'border-primary-50' : 'border-transparent',
      ]"
      hover
    >
      <div class="flex px-3.5 py-2.5">
        <div
          class="relative mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-1"
          :class="equipped ? 'border-primary-40' : 'border-primary-10'"
        >
          <CommonEquipmentIcon :equipment="equipment" width="1.25rem" />
          <cy-icon
            v-if="equipped"
            icon="ic:round-check-circle"
            class="absolute -right-1.5 -top-1.5 bg-white text-red-60"
          />
        </div>
        <div class="flex-grow pt-0.5">
          <div class="mr-5 flex flex-wrap items-center">
            <EquipmentBrowseTitle class="mt-1" :equipment="equipment" />
            <div
              v-if="equipment.crystals.length > 0"
              class="ml-2.5 mt-1 flex flex-wrap items-center"
            >
              <div
                v-for="crystal in equipment.crystals"
                :key="crystal.id"
                class="mr-3 flex items-center"
              >
                <cy-icon :path="crystal.crystalIconPath" />
                <span class="ml-1 text-sm text-cyan-60">
                  {{ crystal.name }}
                </span>
              </div>
            </div>
          </div>
          <CharacterEquipmentLabels
            :equipment="equipment"
            class="mt-0.5 px-1 py-1.5"
          />
        </div>
      </div>
      <div v-if="selected" class="mt-3 border-t border-primary-10 px-4 py-2.5">
        <EquipmentBrowseActions
          :equipment="equipment"
          :equipped="equipped"
          :equip-disabled="!allowEquip"
        />
      </div>
    </CardRow>
  </BrowseEquipmentsItemWrapper>
</template>
