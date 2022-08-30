<template>
  <div class="py-3 px-1 flex items-center space-x-5">
    <div v-if="loading">
      loading...
    </div>
    <div v-else class="w-full">
      <EquipmentItem
        v-for="equip in equipments"
        :key="equip.id"
        :equipment="equip"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, shallowRef } from 'vue'

import { useDatasStore } from '@/stores/app/datas'
import { DataStoreIds } from '@/stores/app/datas/enums'


import Grimoire from '@/shared/Grimoire'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import EquipmentItem from '@/components/common/equipment-item.vue'

import { BookPageSection } from '../setup/Book'


interface Props {
  section: BookPageSection;
}

const props = defineProps<Props>()
const datasStore = useDatasStore()

const loading = ref(false)
const equipments: Ref<CharacterEquipment[]> = shallowRef([])

const updateEquipments = async () => {
  const query = props.section.cells[0][0]
  if (!query) {
    return
  }
  loading.value = true
  await datasStore.waitLoaded(DataStoreIds.Items)
  if (query.startsWith('-')) {
    const num = parseInt(query, 10)
    if (!Number.isNaN(num)) {
      equipments.value = Grimoire.Items.equipments.slice(num).map(equip => CharacterEquipment.fromOriginEquipment(equip))
    }
  }
  loading.value = false
}

updateEquipments()
</script>
