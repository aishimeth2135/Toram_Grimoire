<script lang="ts" setup>
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, nextTick, onMounted, useTemplateRef } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CardRows from '@/components/card/card-rows.vue'

import BrowseEquipmentsListItem from './browse-equipments-list-item.vue'

interface Props {
  equipments: CharacterEquipment[]
  selectedEquipment: CharacterEquipment | null
  currentEquipment: CharacterEquipment | null
  allowEquip: boolean
  checkEquipmentValid: (equipment: CharacterEquipment) => boolean
}

interface Emits {
  (evt: 'select', equipment: CharacterEquipment): void
  (evt: 'equip', equipment: CharacterEquipment): void
  (evt: 'equip-cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const equipmentsContainer = useTemplateRef('equipmentsContainer')
const equipmentsVirtualizer = useVirtualizer(
  computed(() => ({
    count: props.equipments.length,
    getScrollElement: () => equipmentsContainer.value,
    estimateSize: () => 72,
    overscan: 5,
  }))
)

onMounted(async () => {
  if (!props.selectedEquipment) {
    return
  }

  const selectedIndex = props.equipments.indexOf(props.selectedEquipment)
  if (selectedIndex === -1) {
    return
  }

  await nextTick()
  equipmentsVirtualizer.value.scrollToIndex(selectedIndex, { align: 'center' })
})
</script>

<template>
  <div ref="equipmentsContainer" class="min-h-0 grow overflow-y-auto">
    <CardRows
      class="relative w-full"
      :style="{ height: `${equipmentsVirtualizer.getTotalSize()}px` }"
    >
      <div
        v-for="virtualItem in equipmentsVirtualizer.getVirtualItems()"
        :key="equipments[virtualItem.index]!.id"
        :ref="element => equipmentsVirtualizer.measureElement(element as Element)"
        :data-index="virtualItem.index"
        class="absolute left-0 top-0 w-full"
        :class="{ 'bg-primary-5/50': virtualItem.index % 2 !== 0 }"
        :style="{ transform: `translateY(${virtualItem.start}px)` }"
      >
        <BrowseEquipmentsListItem
          :equipment="equipments[virtualItem.index]!"
          :selected="selectedEquipment === equipments[virtualItem.index]"
          :equipped="currentEquipment === equipments[virtualItem.index]"
          :invalid="!checkEquipmentValid(equipments[virtualItem.index]!)"
          :allow-equip="allowEquip"
          @click="emit('select', equipments[virtualItem.index]!)"
          @equip="emit('equip', $event)"
          @equip-cancel="emit('equip-cancel')"
        />
      </div>
    </CardRows>
  </div>
</template>
