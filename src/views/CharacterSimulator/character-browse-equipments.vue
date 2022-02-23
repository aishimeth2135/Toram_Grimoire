<template>
  <cy-modal
    :visible="visible"
    footer
    @close="closeModal"
  >
    <template #default>
      <cy-icon-text icon="fluent:apps-list-detail-20-regular">
        {{ t('character-simulator.browse-equipments.action.select-field-equipment') }}
      </cy-icon-text>
      <div class="flex items-center justify-end mb-3">
        <cy-button-border icon="ic:round-add-circle-outline" @click="createCustomEquipment">
          {{ t('character-simulator.custom-equipment.button-title') }}
        </cy-button-border>
        <cy-button-border icon="ci:table-add" @click="appendEquipments">
          {{ t('character-simulator.browse-equipments.append-equipments') }}
        </cy-button-border>
      </div>
      <div>
        <EquipmentItem
          v-for="equip in displayEquipments"
          :key="equip.id"
          :equipment="equip"
          :current="!!targetField && !!selectedEquipment && targetField.equipment === equip"
          :selected="selectedEquipment === equip"
          :disabled="showAll && !equipmentAvailable(equip)"
          @click="selectedEquipment = equip"
        >
          <template v-if="selectedEquipment === equip" #content>
            <div class="flex items-center justify-end mt-0.5 space-x-2" @click.stop>
              <cy-button-circle
                icon="bx:copy-alt"
                size="small"
                @click="copySelectedEquipment"
              />
              <cy-button-circle
                icon="ic-baseline-delete-outline"
                main-color="gray"
                size="small"
                @click="removeSelectedEquipment"
              />
            </div>
          </template>
        </EquipmentItem>
      </div>
    </template>
    <template #footer="{ closeModal }">
      <div class="flex items-center w-full">
        <cy-button-switch v-model:selected="showAll">
          {{ t('global.all') }}
        </cy-button-switch>
        <div class="flex items-center ml-auto">
          <cy-button-border
            v-if="targetField"
            icon="ic-round-done"
            :disabled="!selectedEquipmentAvailable"
            @click="submit"
          >
            {{ t('global.confirm') }}
          </cy-button-border>
          <cy-button-border icon="ic-round-close" @click="closeModal">
            {{ t('global.close') }}
          </cy-button-border>
        </div>
      </div>
    </template>
    <template v-if="selectedEquipment" #extra-content>
      <div v-if="selectedEquipment" class="bg-white border-1 border-light-2 p-3">
        <CharacterEquipmentInfo :equipment="selectedEquipment" />
      </div>
      <div v-if="compareCharacter" class="bg-white border-1 border-light-2 p-3 mt-3">
        <CharacterStatCompare
          :before="characterStatCategoryResults"
          :after="comparedCharacterStatCategoryResults"
        />
      </div>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { computed, inject, Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { EquipmentField } from '@/lib/Character/Character'
import { AdditionalGear, Avatar, BodyArmor, CharacterEquipment, MainWeapon, SpecialGear, SubArmor, SubWeapon } from '@/lib/Character/CharacterEquipment'
import { EquipmentFieldTypes } from '@/lib/Character/Character/enums'

import Notify from '@/setup/Notify'

import EquipmentItem from '@/components/common/equipment-item.vue'

import CharacterEquipmentInfo from './character-equipment/character-equipment-info.vue'
import CharacterStatCompare from './character-stats/character-stat-compare.vue'

import { setupCharacterStore } from './setup'
import { CharacterSimulatorInjectionKey } from './injection-keys'

interface Props {
  visible: boolean;
  targetField?: EquipmentField;
}
interface Emits {
  (evt: 'close'): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { notify } = Notify()

const { store, equipments, currentCharacter, characterStatCategoryResults } = setupCharacterStore()

const showAll = ref(false)
const selectedEquipment: Ref<CharacterEquipment | null> = ref(null)

const equipmentAvailable = (eq: CharacterEquipment) => {
  if (!props.targetField) {
    return true
  }
  const type = props.targetField.type
  if (type === EquipmentFieldTypes.MainWeapon) {
    return eq instanceof MainWeapon
  }
  if (type === EquipmentFieldTypes.SubWeapon) {
    if (eq instanceof MainWeapon || eq instanceof SubWeapon || eq instanceof SubArmor) {
      return currentCharacter.value!.subWeaponValid(eq.type)
    }
    return false
  }
  if (type === EquipmentFieldTypes.BodyArmor) {
    return eq instanceof BodyArmor
  }
  if (type === EquipmentFieldTypes.Additional) {
    return eq instanceof AdditionalGear
  }
  if (type === EquipmentFieldTypes.Special) {
    return eq instanceof SpecialGear
  }
  if (type === EquipmentFieldTypes.Avatar) {
    return eq instanceof Avatar
  }
  return true
}

const availableEquipments = computed(() => equipments.value.filter(equip => equipmentAvailable(equip)))

const displayEquipments = computed(() => showAll.value ? equipments.value : availableEquipments.value)

const selectedEquipmentAvailable = computed(() => selectedEquipment.value && equipmentAvailable(selectedEquipment.value))

const compareCharacter = computed(() => {
  if (!currentCharacter.value || !props.targetField || !selectedEquipment.value || selectedEquipment.value === props.targetField.equipment || !equipmentAvailable(selectedEquipment.value)) {
    return null
  }
  const newCharacter = currentCharacter.value.clone()
  newCharacter.equipmentField(props.targetField.type).setEquipment(selectedEquipment.value)
  return newCharacter
})

const { comparedCharacterStatCategoryResults } = store.setupCharacterComparedStatCategoryResults(compareCharacter)

const submit = () => {
  if (!props.targetField || !selectedEquipment.value) {
    return
  }
  props.targetField.setEquipment(selectedEquipment.value)
  emit('close')
}

const closeModal = () => {
  emit('close')
  // clear
  selectedEquipment.value = null
}

const copySelectedEquipment = () => {
  if (!selectedEquipment.value) {
    return
  }
  const newEquip = selectedEquipment.value.clone()
  newEquip.name = selectedEquipment.value.name + ' *'
  store.appendEquipments([newEquip], equipments.value.indexOf(selectedEquipment.value) + 1)
  notify(t('character-simulator.browse-equipments.copy-equipment-tips'), 'bx:copy-alt', 'copy-equipment-tips')
}

const removeSelectedEquipment = () => {
  if (!selectedEquipment.value) {
    return
  }
  const eq = selectedEquipment.value
  selectedEquipment.value = null
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

const { appendEquipments, createCustomEquipment } = inject(CharacterSimulatorInjectionKey)!
</script>
