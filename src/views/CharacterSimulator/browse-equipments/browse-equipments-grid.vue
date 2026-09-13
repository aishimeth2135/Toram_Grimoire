<script lang="ts" setup>
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import BrowseEquipmentsGridItem from './browse-equipments-grid-item.vue'

interface Props {
  equipments: CharacterEquipment[]
  selectedEquipment: CharacterEquipment | null
  currentEquipment: CharacterEquipment | null
  checkEquipmentValid: (equipment: CharacterEquipment) => boolean
}
interface Emits {
  (evt: 'select', equipment: CharacterEquipment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const equipmentsContainer = useTemplateRef('equipmentsContainer')
const columnCount = ref(1)
const rowCount = computed(() => Math.ceil(props.equipments.length / columnCount.value))
const equipmentsVirtualizer = useVirtualizer(
  computed(() => ({
    count: rowCount.value,
    getScrollElement: () => equipmentsContainer.value,
    estimateSize: () => 84,
    overscan: 5,
  }))
)

let containerResizeObserver: ResizeObserver | null = null

onMounted(async () => {
  const container = equipmentsContainer.value
  if (!container) {
    return
  }

  const updateColumnCount = () => {
    columnCount.value = Math.max(1, Math.floor((container.clientWidth - 12) / 84))
  }

  updateColumnCount()
  containerResizeObserver = new ResizeObserver(updateColumnCount)
  containerResizeObserver.observe(container)

  if (!props.selectedEquipment) {
    return
  }

  const selectedIndex = props.equipments.indexOf(props.selectedEquipment)
  if (selectedIndex === -1) {
    return
  }

  await nextTick()
  const selectedRowIndex = Math.floor(selectedIndex / columnCount.value)
  equipmentsVirtualizer.value.scrollToIndex(selectedRowIndex, { align: 'center' })
})

onBeforeUnmount(() => {
  containerResizeObserver?.disconnect()
})
</script>

<template>
  <div ref="equipmentsContainer" class="min-h-0 grow overflow-y-auto">
    <div class="relative w-full" :style="{ height: `${equipmentsVirtualizer.getTotalSize()}px` }">
      <div
        v-for="virtualRow in equipmentsVirtualizer.getVirtualItems()"
        :key="virtualRow.index"
        class="absolute left-0 top-0 flex w-full px-1.5"
        :style="{
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <BrowseEquipmentsGridItem
          v-for="equipment in equipments.slice(
            virtualRow.index * columnCount,
            (virtualRow.index + 1) * columnCount
          )"
          :key="equipment.id"
          :equipment="equipment"
          :selected="selectedEquipment === equipment"
          :equipped="currentEquipment === equipment"
          :invalid="!checkEquipmentValid(equipment)"
          @click="emit('select', equipment)"
        />
      </div>
    </div>
  </div>
</template>
