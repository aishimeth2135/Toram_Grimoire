<template>
  <div style="min-width: 18rem" class="space-y-2 pr-2">
    <div v-if="currentCharacter" class="flex flex-start w-full">
      <div class="w-full">
        <div>
          <cy-icon-text icon="bx-bxs-face" text-color="light-2" small>
            {{ t('character-simulator.character-basic.title') }}
          </cy-icon-text>
        </div>
        <div>
          <cy-options>
            <template #title>
              <cy-list-item>
                <cy-icon-text icon="bx-bxs-face">
                  {{ currentCharacter.name }}
                </cy-icon-text>
              </cy-list-item>
            </template>
            <template #options>
              <cy-list-item
                v-for="(character, idx) in characters"
                :key="character.instanceId"
                :selected="character === currentCharacter"
                @click="store.setCurrentCharacter(idx)"
              >
                <cy-icon-text icon="bx-bx-face">
                  {{ character.name }}
                </cy-icon-text>
              </cy-list-item>
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
    <div v-if="currentCharacter" class="flex flex-start w-full">
      <div class="w-full">
        <div>
          <cy-icon-text icon="ant-design:build-outlined" text-color="light-2" small>
            {{ t('character-simulator.equipment-info.equipment') }}
          </cy-icon-text>
        </div>
        <div class="space-y-1 mt-1 px-1.5">
          <div
            v-for="field in currentCharacter.equipmentFields"
            :key="field.fieldId"
            class="border border-light-2"
            @click="editEquipmentFieldEquipment(field)"
          >
            <EquipmentItem
              v-if="field.equipment"
              :equipment="field.equipment"
            />
            <div v-else class="flex px-3 py-1.5 cursor-pointer">
              <cy-icon-text main-color="light-2">
                {{ t('common.Equipment.field.' + field.type) }}
              </cy-icon-text>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-shrink-0 flex flex-col space-y-2">
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
    <div v-if="currentSkillBuild" class="flex flex-start w-full">
      <div class="w-full">
        <div>
          <cy-icon-text icon="ant-design:build-outlined" text-color="light-2" small>
            {{ t('character-simulator.skill-build.title') }}
          </cy-icon-text>
        </div>
        <div>
          <cy-options>
            <template #title>
              <cy-list-item>
                <cy-icon-text icon="ant-design:build-outlined">
                  {{ currentSkillBuild.name }}
                </cy-icon-text>
              </cy-list-item>
            </template>
            <template #options>
              <cy-list-item
                v-for="(skillBuild, idx) in skillBuilds"
                :key="skillBuild.instanceId"
                :selected="skillBuild.instanceId === currentSkillBuild.instanceId"
                @click="skillBuildStore.setCurrentSkillBuild(idx)"
              >
                <cy-icon-text>
                  {{ skillBuild.name }}
                </cy-icon-text>
              </cy-list-item>
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
    <div v-if="currentFoodBuild" class="flex flex-start w-full">
      <div class="w-full">
        <div>
          <cy-icon-text icon="mdi-food-apple" text-color="light-2" small>
            {{ t('character-simulator.food-build.title') }}
          </cy-icon-text>
        </div>
        <div>
          <cy-options>
            <template #title>
              <cy-list-item>
                <cy-icon-text icon="bx-bxs-face">
                  {{ currentFoodBuild.name }}
                </cy-icon-text>
              </cy-list-item>
            </template>
            <template #options>
              <cy-list-item
                v-for="(foodBuild, idx) in foodBuilds"
                :key="foodBuild.instanceId"
                :selected="foodBuild.instanceId === currentFoodBuild.instanceId"
                @click="foodStore.setCurrentFoodBuild(idx)"
              >
                <cy-icon-text icon="mdi-food-apple">
                  {{ foodBuild.name }}
                </cy-icon-text>
              </cy-list-item>
              <cy-list-item @click="foodStore.createFoodBuild()">
                <cy-icon-text icon="ic-round-add-circle-outline">
                  {{ t('character-simulator.food-build.create-food-build') }}
                </cy-icon-text>
              </cy-list-item>
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
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

import EquipmentItem from '@/components/common/equipment-item.vue'

import { CharacterSimulatorInjectionKey } from './injection-keys'
import { setupCharacterFoodStore, setupCharacterSkillBuildStore, setupCharacterStore, TabIds } from './setup'

interface Emits {
  (evt: 'open-tab', tab: TabIds): void;
}

const emit = defineEmits<Emits>()

const { t } = useI18n()

const { store, characters, currentCharacter } = setupCharacterStore()
const { store: skillBuildStore, skillBuilds, currentSkillBuild } = setupCharacterSkillBuildStore()
const { store: foodStore, foodBuilds, currentFoodBuild } = setupCharacterFoodStore()

const { editEquipmentFieldEquipment } = inject(CharacterSimulatorInjectionKey)!
</script>
