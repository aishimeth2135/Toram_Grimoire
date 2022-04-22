<template>
  <cy-modal :visible="visible" footer @close="emit('close')">
    <template #title>
      <cy-icon-text icon="gg-shape-square">
        {{ t('character-simulator.create-custom-equipment.title') }}
      </cy-icon-text>
    </template>
    <template #default>
      <div>
        <cy-button-border
          icon="gg-shape-square"
          @click="toggle('modals/selectType', true)"
        >
          {{ equipmentTypeText }}
        </cy-button-border>
      </div>
      <div v-if="equipment" class="mt-3">
        <CharacterEquipmentBasicEditor :equipment="equipment" />
      </div>
      <cy-default-tips>
        {{ t('character-simulator.equipment-basic-editor.no-equipment-type-selected-tips') }}
      </cy-default-tips>
      <cy-modal v-model:visible="modals.selectType" footer>
        <template #title>
          <cy-icon-text icon="gg-shape-square">
            {{ t('character-simulator.create-custom-equipment.select-equipment-type') }}
          </cy-icon-text>
        </template>
        <div class="equipment-type">
          <cy-button-drop-down
            v-for="category in equipmentTypeCategorys"
            :key="category.id"
            :icon="category.icon"
            :icon-src="category.iconSrc || 'image'"
            :menu-default-visible="true"
          >
            {{ t('common.Equipment.field.' + category.id) }}
            <template #menu>
              <template v-if="category.list !== null">
                <cy-list-item
                  v-for="item in category.list"
                  :key="item"
                  :selected="selectedEquipmentType.type === item"
                  @click="selectEquipmentType(category.id, item)"
                >
                  <cy-icon-text :icon="CharacterEquipment.getImagePath(item)" icon-src="image">
                    {{ t('common.Equipment.category.' + item) }}
                  </cy-icon-text>
                </cy-list-item>
              </template>
              <cy-list-item
                v-else
                :selected="selectedEquipmentType.category === category.id"
                @click="selectEquipmentType(category.id, null)"
              >
                <cy-icon-text icon="gg-shape-square">
                  {{ t(`common.Equipment.field.${category.id}`) }}
                </cy-icon-text>
              </cy-list-item>
            </template>
          </cy-button-drop-down>
        </div>
      </cy-modal>
    </template>
    <template #footer="{ closeModal }">
      <div class="flex items-center justify-end w-full">
        <cy-button-border
          icon="ic-round-done"
          :disabled="!equipment"
          @click="submit"
        >
          {{ t('global.confirm') }}
        </cy-button-border>
        <cy-button-border icon="ic-round-close" @click="closeModal">
          {{ t('global.cancel') }}
        </cy-button-border>
      </div>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, reactive, Ref, ref } from 'vue'

import { AdditionalGear, Avatar, BodyArmor, CharacterEquipment, MainWeapon, SpecialGear, SubArmor, SubWeapon } from '@/lib/Character/CharacterEquipment'
import { EquipmentCategorys, EquipmentTypes, MainWeaponTypeList, SubArmorTypeList, SubWeaponTypeList } from '@/lib/Character/CharacterEquipment/enums'

import ToggleService from '@/setup/ToggleService'

import CharacterEquipmentBasicEditor from './character-equipment-basic-editor.vue'

import { setupCharacterStore } from '../setup'

interface Props {
  visible: boolean;
}
interface Emits {
  (evt: 'close'): void;
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { modals, toggle } = ToggleService({ modals: ['selectType'] as const })
const { store } = setupCharacterStore()

const equipment: Ref<CharacterEquipment | null> = ref(null)

const equipmentTypeText = computed(() => {
  if (!equipment.value) {
    return t('character-simulator.create-custom-equipment.select-equipment-type')
  }
  return equipment.value.categoryText
})

interface EquipmentTypeCategoryItem {
  id: EquipmentCategorys;
  icon: string;
  iconSrc?: string;
  list: EquipmentTypes[] | null;
}

const equipmentTypeCategorys: EquipmentTypeCategoryItem[] = [{
  id: EquipmentCategorys.MainWeapon,
  icon: CharacterEquipment.getImagePath(EquipmentTypes.OneHandSword),
  list: MainWeaponTypeList,
}, {
  id: EquipmentCategorys.SubWeapon,
  icon: CharacterEquipment.getImagePath(EquipmentTypes.Arrow),
  list: SubWeaponTypeList,
}, {
  id: EquipmentCategorys.SubArmor,
  icon: CharacterEquipment.getImagePath(EquipmentTypes.Shield),
  list: SubArmorTypeList,
}, {
  id: EquipmentCategorys.BodyArmor,
  icon: CharacterEquipment.getImagePath(EquipmentTypes.BodyNormal),
  list: null,
}, {
  id: EquipmentCategorys.Additional,
  icon: CharacterEquipment.getImagePath(EquipmentTypes.Additional),
  list: null,
}, {
  id: EquipmentCategorys.Special,
  icon: CharacterEquipment.getImagePath(EquipmentTypes.Special),
  list: null,
}, {
  id: EquipmentCategorys.Avatar,
  icon: 'eva-star-outline',
  iconSrc: 'iconify',
  list: null,
}]

const selectedEquipmentType = reactive({
  category: null,
  type: null,
}) as {
  category: EquipmentCategorys | null;
  type: EquipmentTypes | null;
}

const updateEquipment = () => {
  const stats = equipment.value?.stats ?? []
  const name = equipment.value?.name ?? null
  const originalDefaultName = equipment.value ? t('character-simulator.create-custom-equipment.equipment-default-name', { type: equipment.value.categoryText }) : null
  const equip = (() => {
    const category = selectedEquipmentType.category
    const type = selectedEquipmentType.type
    if (category === EquipmentCategorys.MainWeapon) {
      return new MainWeapon(null, '', stats, type!)
    }
    if (category === EquipmentCategorys.SubWeapon) {
      return new SubWeapon(null, '', stats, type!)
    }
    if (category === EquipmentCategorys.SubArmor) {
      return new SubArmor(null, '', stats, type!)
    }
    if (category === EquipmentCategorys.BodyArmor) {
      return new BodyArmor(null, '', stats)
    }
    if (category === EquipmentCategorys.Additional) {
      return new AdditionalGear(null, '', stats)
    }
    if (category === EquipmentCategorys.Special) {
      return new SpecialGear(null, '', stats)
    }
    return new Avatar(null, '', [])
  })()
  equip.name = name === originalDefaultName ? t('character-simulator.create-custom-equipment.equipment-default-name', { type: equip.categoryText }) : name!
  equipment.value = equip
}

const selectEquipmentType = (category: EquipmentCategorys, type: EquipmentTypes | null) => {
  selectedEquipmentType.category = category
  selectedEquipmentType.type = type
  updateEquipment()
  toggle('modals/selectType', false)
}

const submit = () => {
  store.appendEquipments([equipment.value!])

  // clear
  equipment.value = null
  selectedEquipmentType.category = null
  selectedEquipmentType.type = null

  emit('close')
}
</script>
