<template>
  <div>
    <div class="flex items-center">
      <cy-icon-text
        class="mr-2"
        text-color="purple"
        :icon="(equipment.isAvatar() as boolean) ? equipment.categoryIcon : equipment.getCategoryImagePath()"
        :icon-src="equipment.isAvatar() ? 'iconify' : 'image'"
      >
        <span>{{ equipment.name }}</span>
        <span
          v-if="equipment.hasRefining && equipment.refining! > 0"
          class="ml-1 text-water-blue"
        >
          +{{ equipment.refining }}
        </span>
      </cy-icon-text>
      <span class="flex-shrink-0 text-light-3 text-sm mr-2">
        {{ equipment.categoryText }}
      </span>
      <cy-button-icon
        class="ml-auto"
        :icon="mode === Modes.Info ? 'ic-round-edit' : 'majesticons:checkbox-list-detail-line'"
        @click="mode = mode === Modes.Editor ? Modes.Info : Modes.Editor"
      />
    </div>
    <div>
      <cy-transition type="fade" mode="out-in">
        <CharacterSimulatorEquipmentPreview
          v-if="mode === Modes.Info"
          :equipment="equipment"
          :stats-disabled="statsDisabled"
        />
        <CharacterSimulatorEquipmentEditor
          v-else-if="mode === Modes.Editor"
          :equipment="equipment"
        />
      </cy-transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CharacterSimulatorEquipmentPreview from './character-equipment-preview.vue'
import CharacterSimulatorEquipmentEditor from './character-equipment-editor.vue'

interface Props {
  equipment: CharacterEquipment;
  statsDisabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  statsDisabled: false,
})

const enum Modes {
  Info = 1,
  Editor = 2,
}

const mode = ref<Modes>(Modes.Info)
</script>
