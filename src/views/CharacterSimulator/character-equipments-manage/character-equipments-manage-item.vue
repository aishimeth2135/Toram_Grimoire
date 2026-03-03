<script lang="ts" setup>
import { useDevice } from '@/shared/setup/Device'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CardRow from '@/components/card/card-row.vue'

import BrowseEquipmentInfoSimplified from '../browse-equipments/browse-equipment-info-simplified.vue'
import BrowseEquipmentsItemWrapper from '../browse-equipments/browse-equipments-item-wrapper.vue'
import EquipmentBrowseTitle from '../browse-equipments/equipment-browse-title.vue'
import CharacterEquipmentLabels from '../character-equipment-details/character-equipment-labels.vue'
import CommonEquipmentIconCircle from '../common/common-equipment-icon-circle.vue'

interface Props {
  equipment: CharacterEquipment
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
})

const { device } = useDevice()
</script>

<template>
  <BrowseEquipmentsItemWrapper :equipment="equipment" :equipped="false">
    <CardRow
      class="cursor-pointer rounded-sm border"
      :class="selected ? 'border-primary-50' : 'border-transparent'"
      hover
    >
      <div class="flex">
        <slot name="current-action" />
        <div>
          <div class="flex px-3.5 py-2.5">
            <CommonEquipmentIconCircle :equipment="equipment" :equipped="false" class="mr-2.5" />
            <div class="grow">
              <EquipmentBrowseTitle :equipment="equipment" class="mr-5" />
              <CharacterEquipmentLabels :equipment="equipment" class="px-1 pb-0.5" />
            </div>
          </div>
          <BrowseEquipmentInfoSimplified
            v-if="selected && device.isMobile"
            :equipment="equipment"
          />
        </div>
      </div>
    </CardRow>
  </BrowseEquipmentsItemWrapper>
</template>
