<script lang="ts" setup>
import { computed } from 'vue'
import { ref } from 'vue'
import { Ref } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CharacterEquipmentDetail from '../character-equipment/character-equipment-detail.vue'
import EquipmentBrowseItem from './equipment-browse-item.vue'

import { setupCharacterStore } from '../setup'

const { store } = setupCharacterStore()

const equipments = computed<CharacterEquipment[]>({
  get() {
    return store.equipments as CharacterEquipment[]
  },
  set(value) {
    store.equipments = value
  },
})

const current: Ref<CharacterEquipment | null> = ref(null)

const visible = ref(true)
</script>

<template>
  <div>
    <cy-button-circle icon="mdi:folder-open-outline" @click="visible = true" />
    <cy-modal v-model:visible="visible" width="auto" height-full>
      <div class="cp:flex cp:h-full">
        <div class="mb-6 cp:mb-0 cp:w-full cp:pr-4">
          <EquipmentBrowseItem
            v-for="equip in equipments"
            :key="equip.id"
            :equipment="equip"
            class="m-1.5"
            @click="current = equip"
          />
        </div>
        <div
          v-if="current"
          class="cp:h-full cp:w-96 cp:flex-shrink-0 cp:border-l-1 cp:border-primary-20 cp:pl-6"
        >
          <CharacterEquipmentDetail :equipment="current" />
        </div>
      </div>
    </cy-modal>
  </div>
</template>
