<template>
  <div style="min-width: 20rem">
    <cy-list-item @click="toggle('contents/detail')">
      <div class="flex mr-2">
        <cy-icon-text icon="ic:baseline-drag-indicator" />
      </div>
      <EquipmentTitle :equipment="equipment" :text-color="contents.detail ? 'orange' : 'default'" />
      <span v-if="equipped" class="text-red text-sm ml-3">
        {{ t('character-simulator.browse-equipments.equipped') }}
      </span>
    </cy-list-item>
    <div v-if="contents.detail" class="pl-5 pr-2 pb-2">
      <CharacterEquipmentDetail :equipment="equipment" inner-item />
      <div class="flex items-center mt-3 space-x-2">
        <cy-button-circle
          icon="bx:copy-alt"
          small
          @click="copyEquipment"
        />
        <cy-button-circle
          icon="ic-baseline-delete-outline"
          main-color="gray"
          small
          @click="removeEquipment"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import ToggleService from '@/setup/ToggleService'
import Notify from '@/setup/Notify'

import EquipmentTitle from '@/components/common/equipment-title.vue'

import CharacterEquipmentDetail from '../character-equipment/character-equipment-detail.vue'

import { setupCharacterStore } from '../setup'

interface Props {
  equipment: CharacterEquipment;
}

const props = defineProps<Props>()

const { t } = useI18n()
const { contents, toggle } = ToggleService({ contents: ['detail'] as const })

const { currentCharacter } = setupCharacterStore()

const { notify } = Notify()

const { store, equipments } = setupCharacterStore()

const copyEquipment = () => {
  const newEquip = props.equipment.clone()
  newEquip.name = props.equipment.name + ' *'
  store.appendEquipments([newEquip], equipments.value.indexOf(props.equipment) + 1)
  notify(t('character-simulator.browse-equipments.copy-equipment-tips'), 'bx:copy-alt', 'copy-equipment-tips')
}

const removeEquipment = () => {
  const eq = props.equipment
  store.removeEquipment(eq)
  notify(t('character-simulator.browse-equipments.remove-equipment-tips', { name: eq.name }), 'ic-baseline-delete-outline', null, {
    buttons: [{
      text: t('global.recovery'),
      click: () => {
        store.appendEquipments([eq])
        notify(t('character-simulator.browse-equipments.removed-equipment-restore-tips', { name: eq.name }))
      },
      removeMessageAfterClick: true,
    }],
  })
}

const equipped = computed(() => !!currentCharacter.value?.equipmentFields.some(field => field.equipment === props.equipment))
</script>
