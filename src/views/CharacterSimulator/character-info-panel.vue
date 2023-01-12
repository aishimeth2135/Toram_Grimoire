<template>
  <div style="min-width: 18rem" class="space-y-2">
    <div v-if="currentCharacter" class="flex-start flex w-full">
      <div class="w-full">
        <div>
          <cy-icon-text icon="bx-bxs-face" text-color="primary-30" small>
            {{ t('character-simulator.character-basic.title') }}
          </cy-icon-text>
        </div>
        <div class="px-1.5">
          <cy-options
            :value="currentCharacter"
            :options="
              characters.map(chara => ({
                id: chara.instanceId,
                value: chara,
              }))
            "
            @update:value="store.setCurrentCharacter($event)"
          >
            <template #item="{ value }">
              <cy-icon-text icon="bx-bxs-face">
                {{ value.name }}
              </cy-icon-text>
            </template>
          </cy-options>
        </div>
      </div>
      <div class="flex-shrink-0">
        <cy-button-circle
          icon="ic:round-mode-edit"
          small
          @click="emit('open-tab', TabIds.Basic)"
        />
      </div>
    </div>
    <div v-if="currentCharacter" class="flex-start flex w-full">
      <div class="w-full">
        <div>
          <cy-icon-text
            icon="ant-design:build-outlined"
            text-color="primary-30"
            small
          >
            {{ t('character-simulator.equipment-info.equipment') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 space-y-1 px-1.5">
          <div
            v-for="field in currentCharacter.equipmentFields"
            :key="field.fieldId"
            class="border border-primary-30"
            @click="editEquipmentFieldEquipment(field)"
          >
            <EquipmentItem
              v-if="field.equipment"
              :equipment="field.equipment"
            />
            <div v-else class="flex cursor-pointer px-3 py-1.5">
              <cy-icon-text color="primary-30">
                {{ t('common.Equipment.field.' + field.type) }}
              </cy-icon-text>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-shrink-0 flex-col space-y-2">
        <cy-button-circle
          icon="ic:round-mode-edit"
          small
          @click="emit('open-tab', TabIds.EquipmentFields)"
        />
        <cy-button-circle
          icon="mdi:sack"
          small
          @click="emit('open-tab', TabIds.Equipments)"
        />
      </div>
    </div>
    <div v-if="currentSkillBuild" class="flex-start flex w-full">
      <div class="w-full">
        <div>
          <cy-icon-text
            icon="ant-design:build-outlined"
            text-color="primary-30"
            small
          >
            {{ t('character-simulator.skill-build.title') }}
          </cy-icon-text>
        </div>
        <div class="px-1.5">
          <cy-options
            :value="currentSkillBuild"
            :options="
              skillBuilds.map(skillBuild => ({
                id: skillBuild.instanceId,
                value: skillBuild,
              }))
            "
            @update:value="store.setCharacterSkillBuild($event)"
          >
            <template #item="{ value }">
              <cy-icon-text icon="ant-design:build-outlined">
                {{ value.name }}
              </cy-icon-text>
            </template>
          </cy-options>
        </div>
      </div>
      <div class="flex-shrink-0">
        <cy-button-circle
          icon="ic:round-mode-edit"
          small
          @click="emit('open-tab', TabIds.Skill)"
        />
      </div>
    </div>
    <div v-if="currentFoodBuild" class="flex-start flex w-full">
      <div class="w-full">
        <div>
          <cy-icon-text icon="mdi-food-apple" text-color="primary-30" small>
            {{ t('character-simulator.food-build.title') }}
          </cy-icon-text>
        </div>
        <div class="px-1.5">
          <cy-options
            :value="currentFoodBuild"
            :options="
              foodBuilds.map(foodBuild => ({
                id: foodBuild.instanceId,
                value: foodBuild,
              }))
            "
            @update:value="store.setCharacterFoodBuild($event)"
          >
            <template #item="{ value }">
              <cy-icon-text icon="mdi-food-apple">
                {{ value.name }}
              </cy-icon-text>
            </template>
          </cy-options>
        </div>
      </div>
      <div class="flex-shrink-0">
        <cy-button-circle
          icon="ic:round-mode-edit"
          small
          @click="emit('open-tab', TabIds.Food)"
        />
      </div>
    </div>
    <div v-if="currentRegistletBuild" class="flex-start flex w-full">
      <div class="w-full">
        <div>
          <cy-icon-text
            icon="game-icons:beveled-star"
            text-color="primary-30"
            small
          >
            {{ t('character-simulator.registlet-build.title') }}
          </cy-icon-text>
        </div>
        <div class="px-1.5">
          <cy-options
            :value="currentRegistletBuild"
            :options="
              registletBuilds.map(build => ({
                id: build.instanceId,
                value: build,
              }))
            "
            @update:value="store.setCharacterRegistletBuild($event)"
          >
            <template #item="{ value }">
              <cy-icon-text icon="game-icons:beveled-star">
                {{ value.name }}
              </cy-icon-text>
            </template>
          </cy-options>
        </div>
      </div>
      <div class="flex-shrink-0">
        <cy-button-circle
          icon="ic:round-mode-edit"
          small
          @click="emit('open-tab', TabIds.Registlet)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

import EquipmentItem from '@/components/common/equipment-item.vue'

import { CharacterSimulatorInjectionKey } from './injection-keys'
import {
  TabIds,
  setupCharacterFoodStore,
  setupCharacterRegistletStore,
  setupCharacterSkillBuildStore,
  setupCharacterStore,
} from './setup'

interface Emits {
  (evt: 'open-tab', tab: TabIds): void
}

const emit = defineEmits<Emits>()

const { t } = useI18n()

const { store, characters, currentCharacter } = setupCharacterStore()
const { skillBuilds, currentSkillBuild } = setupCharacterSkillBuildStore()
const { foodBuilds, currentFoodBuild } = setupCharacterFoodStore()
const { registletBuilds, currentRegistletBuild } =
  setupCharacterRegistletStore()

const { editEquipmentFieldEquipment } = inject(CharacterSimulatorInjectionKey)!
</script>
