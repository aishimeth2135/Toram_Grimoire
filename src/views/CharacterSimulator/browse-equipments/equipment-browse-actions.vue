<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import { useEquipmentActions } from './setup'

interface Props {
  equipment: CharacterEquipment
  equipped: boolean
  equipDisabled?: boolean
}
interface Emits {
  (evt: 'equip', equipment: CharacterEquipment): void
  (evt: 'equip-cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  equipDisabled: false,
})
const emit = defineEmits<Emits>()

const { t } = useI18n()

const current = computed(() => props.equipment)
const { copyEquipment, removeEquipment } = useEquipmentActions(current)
</script>

<template>
  <div class="flex items-center" @click.stop>
    <template v-if="!equipDisabled">
      <template v-if="!equipped">
        <div
          class="select-none flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary-20 text-primary-30 duration-150 hover:border-primary-50 hover:text-primary-60"
          @click="emit('equip', equipment)"
        >
          <cy-icon icon="ic:round-check-circle" class="text-inherit" />
        </div>
        <span class="ml-2 text-sm text-primary-30">
          {{ t('character-simulator.browse-equipments.equip-label') }}
        </span>
      </template>
      <template v-else>
        <div
          class="select-none flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary-20 text-primary-30 duration-150 hover:border-primary-50 hover:text-primary-60"
          @click="emit('equip-cancel')"
        >
          <cy-icon icon="mdi:close" class="text-inherit" />
        </div>
        <span class="ml-2 text-sm text-primary-30">
          {{ t('character-simulator.browse-equipments.equip-cancel-label') }}
        </span>
      </template>
    </template>
    <cy-button-icon
      icon="bx:copy-alt"
      class="ml-auto"
      small
      @click="copyEquipment"
    />
    <cy-button-icon
      class="ml-4"
      icon="mdi:delete-outline"
      @click="removeEquipment"
    />
  </div>
</template>
