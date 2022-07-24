<template>
  <div>
    <div class="flex items-center justify-end py-1">
      <div class="flex mr-auto">
        <cy-button-circle
          icon="mdi:arrange-send-to-back"
          small
          color="blue-green"
          @click="autoArrange"
        />
      </div>
      <cy-button-action icon="ic:round-add-circle-outline" @click="createCustomEquipment">
        {{ t('character-simulator.custom-equipment.button-title') }}
      </cy-button-action>
      <cy-button-action icon="ci:table-add" @click="appendEquipments">
        {{ t('character-simulator.browse-equipments.append-equipments') }}
      </cy-button-action>
    </div>
    <div class="overflow-auto" style="height: calc(95vh - 6rem)">
      <Draggable
        v-model="equipments"
        class="divide-y divide-light"
        :item-key="getItemKey"
      >
        <template #item="{ element }">
          <CharacterEquipmentsItem :equipment="element" />
        </template>
      </Draggable>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CharacterEquipments',
}
</script>

<script lang="ts" setup>
import Draggable from 'vuedraggable'
import { useI18n } from 'vue-i18n'
import { inject, WritableComputedRef, computed } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentTypes, MainWeaponTypeList, SubArmorTypeList, SubWeaponTypeList } from '@/lib/Character/CharacterEquipment/enums'

import Notify from '@/setup/Notify'

import CharacterEquipmentsItem from './character-equipments-item.vue'

import { setupCharacterStore } from '../setup'
import { CharacterSimulatorInjectionKey } from '../injection-keys'

const { t } = useI18n()
const { notify } = Notify()

const { store } = setupCharacterStore()

const equipments: WritableComputedRef<CharacterEquipment[]> = computed<CharacterEquipment[]>({
  get() {
    return store.equipments as CharacterEquipment[]
  },
  set(value) {
    store.equipments = value
  },
})

const arrangeOrder = [
  ...MainWeaponTypeList,
  ...SubWeaponTypeList,
  ...SubArmorTypeList,
  EquipmentTypes.BodyNormal,
  EquipmentTypes.BodyDodge,
  EquipmentTypes.BodyDefense,
  EquipmentTypes.Additional,
  EquipmentTypes.Special,
  EquipmentTypes.Avatar,
]

const autoArrange = () => {
  const originalEquips = store.equipments.slice()
  const equips = store.equipments.slice() as CharacterEquipment[]
  equips.sort((eq1, eq2) => {
    let typeOrder1 = arrangeOrder.indexOf(eq1.type)
    typeOrder1 = typeOrder1 === -1 ? 999 : typeOrder1
    let typeOrder2 = arrangeOrder.indexOf(eq2.type)
    typeOrder2 = typeOrder2 === -1 ? 999 : typeOrder2
    if (typeOrder1 === typeOrder2) {
      return eq1.name.localeCompare(eq2.name)
    }
    return typeOrder1 - typeOrder2
  })
  store.equipments = equips
  notify(t('character-simulator.browse-equipments.auto-arrange-success-tips'), undefined, null, {
    buttons: [{
      text: t('global.recovery'),
      click: () => {
        store.equipments = originalEquips
      },
      removeMessageAfterClick: true,
    }],
  })
}

const { appendEquipments, createCustomEquipment } = inject(CharacterSimulatorInjectionKey)!

const getItemKey = (el: CharacterEquipment) => el.instanceId
</script>
