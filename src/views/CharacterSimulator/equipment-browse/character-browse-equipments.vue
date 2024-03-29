<template>
  <cy-modal
    :visible="visible"
    :title="
      t('character-simulator.browse-equipments.action.select-field-equipment')
    "
    title-icon="mdi:checkbox-blank-badge-outline"
    footer
    @close="closeModal"
  >
    <template #default>
      <div class="mb-3 flex items-center justify-end">
        <cy-button-action
          icon="ic:round-add-circle-outline"
          @click="createCustomEquipment"
        >
          {{ t('character-simulator.custom-equipment.button-title') }}
        </cy-button-action>
        <cy-button-action icon="ci:table-add" @click="appendEquipments">
          {{ t('character-simulator.browse-equipments.append-equipments') }}
        </cy-button-action>
      </div>
      <transition-group v-if="displayEquipments.length > 0" tag="div">
        <EquipmentItem
          v-for="equip in displayEquipments"
          :key="equip.id"
          :equipment="equip"
          :current="!!targetField && targetField.equipment === equip"
          :selected="selectedEquipment === equip"
          :disabled="showAll && !equipmentAvailable(equip)"
          @click="selectedEquipment = equip"
        >
          <template
            v-if="selectedEquipment === equip || equip === movingEquipment"
            #content
          >
            <div v-if="controls.edit" class="pb-2 pt-2.5">
              <CharacterEquipmentDetail :equipment="equip" inner-item />
            </div>
            <div
              class="mt-1 flex items-center justify-end space-x-2"
              @click.stop
            >
              <template v-if="movingEquipment">
                <div
                  v-if="equip === movingEquipment"
                  class="ml-1 mr-auto self-end"
                >
                  <cy-icon-text
                    icon="mdi:cursor-move"
                    text-color="primary-50"
                    small
                  >
                    {{
                      t(
                        'character-simulator.browse-equipments.move-equipment-title'
                      )
                    }}
                  </cy-icon-text>
                </div>
                <template v-if="equip !== movingEquipment">
                  <cy-button-circle
                    icon="ic:baseline-move-up"
                    small
                    color="blue"
                    @click="
                      store.moveEquipment(movingEquipment!, -1, equip),
                        (movingEquipment = null)
                    "
                  />
                  <cy-button-circle
                    icon="ic:baseline-move-down"
                    small
                    color="blue"
                    @click="
                      store.moveEquipment(movingEquipment!, 1, equip),
                        (movingEquipment = null)
                    "
                  />
                </template>
                <cy-button-circle
                  icon="ic:baseline-stop"
                  small
                  color="cyan"
                  @click="movingEquipment = null"
                />
              </template>
              <template v-else>
                <div class="mr-auto">
                  <cy-button-circle
                    icon="ic:round-format-list-bulleted"
                    small
                    toggle
                    :selected="controls.edit"
                    @click="toggle('controls/edit')"
                  />
                </div>
                <template v-if="!controls.edit">
                  <template v-if="showAll">
                    <cy-button-circle
                      icon="mdi:cursor-move"
                      small
                      color="cyan"
                      @click="movingEquipment = equip"
                    />
                    <cy-button-circle
                      icon="ic:round-arrow-upward"
                      small
                      color="blue"
                      @click="store.moveEquipment(equip, -1)"
                    />
                    <cy-button-circle
                      icon="ic:round-arrow-downward"
                      small
                      color="blue"
                      @click="store.moveEquipment(equip, 1)"
                    />
                  </template>
                  <template v-else>
                    <cy-button-circle
                      icon="ic:outline-tips-and-updates"
                      small
                      color="emerald"
                      @click="
                        notify(
                          t(
                            'character-simulator.browse-equipments.equipment-item-actions-tips'
                          )
                        )
                      "
                    />
                  </template>
                </template>
                <cy-button-circle
                  icon="bx:copy-alt"
                  small
                  @click="copySelectedEquipment"
                />
                <cy-button-circle
                  icon="ic-baseline-delete-outline"
                  color="secondary"
                  small
                  @click="removeSelectedEquipment"
                />
              </template>
            </div>
          </template>
        </EquipmentItem>
      </transition-group>
      <cy-default-tips v-else class="px-4 py-6">
        {{ t('character-simulator.browse-equipments.no-any-equipment-tips') }}
      </cy-default-tips>
    </template>
    <template #footer="{ closeModal }">
      <div class="flex w-full items-center">
        <cy-button-toggle v-model:selected="showAll">
          {{ t('global.all') }}
        </cy-button-toggle>
        <div class="ml-auto flex items-center">
          <cy-button-action
            v-if="targetField"
            icon="ic-round-done"
            :disabled="!selectedEquipmentAvailable"
            @click="submit"
          >
            {{ t('global.confirm') }}
          </cy-button-action>
          <cy-button-action icon="ic-round-close" @click="closeModal">
            {{ t('global.close') }}
          </cy-button-action>
        </div>
      </div>
    </template>
    <template v-if="selectedEquipment" #extra-content>
      <div
        v-if="compareCharacter"
        class="mt-3 border-1 border-primary-30 bg-white p-3"
      >
        <CharacterStatCompare
          :before="characterStatCategoryResults"
          :after="comparedCharacterStatCategoryResults"
        />
      </div>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import Notify from '@/shared/setup/Notify'
import ToggleService from '@/shared/setup/ToggleService'

import { EquipmentField, EquipmentFieldTypes } from '@/lib/Character/Character'
import {
  AdditionalGear,
  Avatar,
  BodyArmor,
  CharacterEquipment,
  MainWeapon,
  SpecialGear,
  SubArmor,
  SubWeapon,
} from '@/lib/Character/CharacterEquipment'

import EquipmentItem from '@/components/common/equipment-item.vue'

import CharacterEquipmentDetail from '../character-equipment/character-equipment-detail.vue'
import CharacterStatCompare from '../character-stats/character-stat-compare.vue'

import { CharacterSimulatorInjectionKey } from '../injection-keys'
import { setupCharacterStore } from '../setup'

interface Props {
  visible: boolean
  targetField?: EquipmentField
}
interface Emits {
  (evt: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { notify } = Notify()

const { store, equipments, currentCharacter, characterStatCategoryResults } =
  setupCharacterStore()

const showAll = ref(false)
const selectedEquipment: Ref<CharacterEquipment | null> = ref(null)
const movingEquipment: Ref<CharacterEquipment | null> = ref(null)

const { controls, toggle } = ToggleService({
  controls: [{ name: 'edit', default: true }] as const,
})

const equipmentAvailable = (eq: CharacterEquipment) => {
  if (!props.targetField) {
    return true
  }
  const type = props.targetField.type
  if (type === EquipmentFieldTypes.MainWeapon) {
    return eq instanceof MainWeapon
  }
  if (type === EquipmentFieldTypes.SubWeapon) {
    if (
      eq instanceof MainWeapon ||
      eq instanceof SubWeapon ||
      eq instanceof SubArmor
    ) {
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

const availableEquipments = computed(() =>
  equipments.value.filter(equip => equipmentAvailable(equip))
)

const displayEquipments = computed(() =>
  showAll.value ? equipments.value : availableEquipments.value
)

const selectedEquipmentAvailable = computed(
  () => selectedEquipment.value && equipmentAvailable(selectedEquipment.value)
)

const compareCharacter = computed(() => {
  if (
    !currentCharacter.value ||
    !props.targetField ||
    !selectedEquipment.value ||
    selectedEquipment.value === props.targetField.equipment ||
    !equipmentAvailable(selectedEquipment.value)
  ) {
    return null
  }
  const newCharacter = currentCharacter.value.clone()
  newCharacter
    .equipmentField(props.targetField.type, props.targetField.index)
    .setEquipment(selectedEquipment.value)
  return newCharacter
})

const { comparedCharacterStatCategoryResults } =
  store.setupCharacterComparedStatCategoryResults(compareCharacter)

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
  store.appendEquipments(
    [newEquip],
    equipments.value.indexOf(selectedEquipment.value) + 1
  )
  notify(
    t('character-simulator.browse-equipments.copy-equipment-tips'),
    'bx:copy-alt',
    'copy-equipment-tips'
  )
}

const removeSelectedEquipment = () => {
  if (!selectedEquipment.value) {
    return
  }
  const eq = selectedEquipment.value
  selectedEquipment.value = null
  store.removeEquipment(eq)
  notify(
    t('character-simulator.browse-equipments.remove-equipment-tips', {
      name: eq.name,
    }),
    'ic-baseline-delete-outline',
    null,
    {
      buttons: [
        {
          text: t('global.recovery'),
          click: () => {
            store.appendEquipments([eq])
            notify(
              t(
                'character-simulator.browse-equipments.removed-equipment-restore-tips',
                { name: eq.name }
              )
            )
          },
          removeMessageAfterClick: true,
        },
      ],
    }
  )
}

watch(
  () => props.targetField,
  newValue => {
    if (newValue?.equipment) {
      selectedEquipment.value = newValue.equipment
    }
  }
)

const { appendEquipments, createCustomEquipment } = inject(
  CharacterSimulatorInjectionKey
)!
</script>
