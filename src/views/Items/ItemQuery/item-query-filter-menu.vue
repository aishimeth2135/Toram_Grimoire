<script lang="ts" setup>
import { reactive, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import { EquipmentFieldTypes } from '@/lib/Character/Character'
import { getEquipmentFieldTypeText } from '@/lib/Character/Character/utils'
import {
  CharacterEquipment,
  EquipmentTypes,
  MainWeaponTypeList,
  SubArmorTypeList,
  SubWeaponTypeList,
} from '@/lib/Character/CharacterEquipment'

import { type CommonOption, handleOptions } from './setup'

interface Props {
  equipments: CharacterEquipment[]
}
interface Emits {
  (evt: 'filter', filteredEquipments: CharacterEquipment[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// common option
const toggleAll = (list: CommonOption[], value: boolean) => {
  list.forEach(item => {
    item.selected = value
  })
}

const isAllOptionsSelected = (options: CommonOption[]) => {
  return options.every(option => option.selected)
}

// filters
interface EquipmentTypeFilterOption extends CommonOption<EquipmentTypes> {
  text: string
  imagePath: string
}

interface EquipmentFieldFilterOption {
  id: EquipmentFieldTypes
  types: EquipmentTypeFilterOption[]
}

const handleEquipmentTypes = (options: EquipmentTypes[]): EquipmentTypeFilterOption[] => {
  const newOpts = handleOptions(options)
  const finalOpts = newOpts.map(option => ({
    ...option,
    text: CharacterEquipment.getTypeText(option.value),
    imagePath: CharacterEquipment.getImagePath(option.value),
  }))
  return finalOpts
}

const equipmentFieldOptions: EquipmentFieldFilterOption[] = reactive([
  {
    id: EquipmentFieldTypes.MainWeapon,
    types: handleEquipmentTypes(MainWeaponTypeList),
  },
  {
    id: EquipmentFieldTypes.SubWeapon,
    types: [...handleEquipmentTypes(SubWeaponTypeList), ...handleEquipmentTypes(SubArmorTypeList)],
  },
  {
    id: EquipmentFieldTypes.BodyArmor,
    types: handleEquipmentTypes([EquipmentTypes.BodyNormal]),
  },
  {
    id: EquipmentFieldTypes.Additional,
    types: handleEquipmentTypes([EquipmentTypes.Additional]),
  },
  {
    id: EquipmentFieldTypes.Special,
    types: handleEquipmentTypes([EquipmentTypes.Special]),
  },
])

const toggleAllEquipmentFilters = (value: boolean) => {
  equipmentFieldOptions.forEach(fieldOption => {
    toggleAll(fieldOption.types, value)
  })
}

const obtainOptions = reactive(
  handleOptions([
    'smith',
    'boss',
    'mini_boss',
    'mobs',
    'quest',
    'box',
    'exchange',
    'other',
    'unknown',
    'ex_skill',
  ])
)

watchEffect(() => {
  const validTypes: EquipmentTypes[] = []
  equipmentFieldOptions.forEach(fieldOption => {
    fieldOption.types.forEach(option => {
      if (option.selected) {
        validTypes.push(option.value)
      }
    })
  })

  const hasUnknownObtain = obtainOptions.find(
    obtain => obtain.value === 'unknown' && obtain.selected
  )
  const validObtainOptions = obtainOptions.filter(
    obtain => obtain.value !== 'unknown' && obtain.selected
  )

  if (validTypes.length === 0 && validObtainOptions.length === 0 && !hasUnknownObtain) {
    validTypes.push(EquipmentTypes.Avatar)
  }

  const filteredEquipments = props.equipments.filter(equip => {
    if (!validTypes.includes(equip.type)) {
      return false
    }
    // 彩蛋
    if (equip.type === EquipmentTypes.Avatar) {
      return true
    }
    if (hasUnknownObtain && equip.origin!.obtains.length === 0) {
      return true
    }
    return validObtainOptions.some(option =>
      equip.origin!.obtains.find(obtain => obtain['type'] === option.value)
    )
  })

  emit('filter', filteredEquipments)
})
</script>

<template>
  <div>
    <div class="space-y-2 px-3 py-2.5">
      <div v-for="fieldOption in equipmentFieldOptions" :key="fieldOption.id">
        <template v-if="fieldOption.types.length > 1">
          <div>
            <cy-button-check
              :selected="isAllOptionsSelected(fieldOption.types)"
              color="orange"
              @update:selected="toggleAll(fieldOption.types, $event)"
            >
              {{ getEquipmentFieldTypeText(fieldOption.id, t) }}
            </cy-button-check>
          </div>
          <div>
            <cy-button-check
              v-for="typeOption in fieldOption.types"
              :key="typeOption.value"
              v-model:selected="typeOption.selected"
            >
              <div class="flex items-center">
                <cy-icon :icon="typeOption.imagePath" class="mr-1" />
                {{ typeOption.text }}
              </div>
            </cy-button-check>
          </div>
        </template>
        <div v-else-if="fieldOption.types.length === 1" class="mt-0.5">
          <cy-button-check v-model:selected="fieldOption.types[0].selected">
            <div class="flex items-center">
              <cy-icon :icon="fieldOption.types[0].imagePath" class="mr-1" />
              {{ getEquipmentFieldTypeText(fieldOption.id, t) }}
            </div>
          </cy-button-check>
        </div>
      </div>
      <div class="flex justify-end px-2">
        <span
          class="mr-3 inline-flex cursor-pointer text-sm text-primary-50"
          @click="toggleAllEquipmentFilters(true)"
        >
          <cy-icon icon="ic:round-refresh" class="mr-1" />
          {{ t('global.reset') }}
        </span>
        <span
          class="inline-flex cursor-pointer text-sm text-primary-50"
          @click="toggleAllEquipmentFilters(false)"
        >
          <cy-icon icon="ic:round-clear" class="mr-1" />
          {{ t('global.clear') }}
        </span>
      </div>
    </div>
    <div class="border-t-1 border-primary-10 px-3 py-2.5">
      <div>
        <cy-button-check
          :selected="isAllOptionsSelected(obtainOptions)"
          color="orange"
          @update:selected="toggleAll(obtainOptions, $event)"
        >
          {{ t('item-query.equipment-detail.content-titles.obtains') }}
        </cy-button-check>
      </div>
      <div class="mt-0.5">
        <cy-button-check
          v-for="obtain in obtainOptions"
          :key="obtain.value"
          v-model:selected="obtain.selected"
          class="mr-1"
        >
          {{ t('common.Equipment.obtain.' + obtain.value) }}
        </cy-button-check>
      </div>
    </div>
  </div>
</template>
