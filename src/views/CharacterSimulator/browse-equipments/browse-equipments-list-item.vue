<script lang="ts" setup>
import { useDevice } from '@/shared/setup/Device'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CardRow from '@/components/card/card-row.vue'

import CharacterEquipmentLabels from '../character-equipment-details/character-equipment-labels.vue'
import CommonEquipmentIconCircle from '../common/common-equipment-icon-circle.vue'
import BrowseEquipmentInfoSimplified from './browse-equipment-info-simplified.vue'
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

const { device } = useDevice()
</script>

<template>
  <BrowseEquipmentsItemWrapper :equipment="equipment" :equipped="equipped">
    <CardRow
      class="cursor-pointer rounded-sm border"
      :class="[{ 'opacity-25': invalid }, selected ? 'border-primary-50' : 'border-transparent']"
      hover
    >
      <div class="flex px-3.5 py-2.5">
        <CommonEquipmentIconCircle :equipment="equipment" :equipped="equipped" class="mr-2.5" />
        <div class="grow">
          <EquipmentBrowseTitle :equipment="equipment" class="mr-5" />
          <CharacterEquipmentLabels :equipment="equipment" class="px-1 pb-0.5" />
        </div>
      </div>
      <BrowseEquipmentInfoSimplified v-if="selected && device.isMobile" :equipment="equipment" />
      <div v-if="selected" class="border-primary-10 border-t py-1">
        <EquipmentBrowseActions
          :equipment="equipment"
          :equipped="equipped"
          :equip-disabled="!allowEquip"
          @equip="emit('equip', $event)"
          @equip-cancel="emit('equip-cancel')"
        />
      </div>
    </CardRow>
  </BrowseEquipmentsItemWrapper>
</template>
