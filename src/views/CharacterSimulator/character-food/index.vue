<template>
  <section class="px-1.5">
    <div class="pb-4">
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
            @click="store.setCurrentFoodBuild(idx)"
          >
            <cy-icon-text icon="mdi-food-apple">
              {{ foodBuild.name }}
            </cy-icon-text>
          </cy-list-item>
          <cy-list-item @click="characterStore.setCharacterFoodBuild(store.createFoodBuild)()">
            <cy-icon-text icon="ic-round-add-circle-outline">
              {{ t('character-simulator.food-build.create-food-build') }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
      <div class="pt-1">
        <cy-button-border
          icon="bx:copy-alt"
          @click="copyCurrentFoodBuild"
        >
          {{ t('global.copy') }}
        </cy-button-border>
        <cy-button-border
          icon="ic-baseline-delete-outline"
          main-color="gray"
          @click="removeCurrentFoodBuild"
        >
          {{ t('global.remove') }}
        </cy-button-border>
      </div>
    </div>
    <div class="mb-2 pl-1">
      <div>
        <cy-icon-text
          icon="mdi-checkbox-multiple-blank-circle-outline"
          small
          text-color="purple"
        >
          {{ t('character-simulator.food-build.food-build-name') }}
        </cy-icon-text>
      </div>
      <div class="pl-4">
        <cy-title-input
          v-model:value="currentFoodBuild.name"
          icon="mdi-clipboard-text-outline"
        />
      </div>
    </div>
    <div>
      <div class="mt-4 pl-1">
        <cy-icon-text
          icon="mdi-checkbox-multiple-blank-circle-outline"
          small
          text-color="purple"
        >
          {{ t('character-simulator.food-build.food-list') }}
        </cy-icon-text>
      </div>
      <div>
        <cy-button-switch v-model:selected="disableAll">
          {{ t('character-simulator.food-build.disable-foods') }}
        </cy-button-switch>
      </div>
      <div class="pl-4 mt-1">
        <cy-icon-text icon="ic-outline-info" text-color="light-3" small class="mr-2">
          {{ t('character-simulator.food-build.introduction.0') }}
        </cy-icon-text>
        <cy-icon-text icon="ic-outline-info" text-color="light-3" small>
          {{ t('character-simulator.food-build.introduction.1') }}
        </cy-icon-text>
      </div>
    </div>
    <div class="mt-1" :class="{ 'opacity-50': disableAll }">
      <CharacterFoodItem
        v-for="food in currentFoodBuild.foods"
        :key="food.foodBase.foodBaseId"
        :food="food"
      />
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: 'CharacterFood',
}
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import { useCharacterStore } from '@/stores/views/character'

import Notify from '@/setup/Notify'

import CharacterFoodItem from './character-food-item.vue'

import { setupCharacterFoodStore } from './setup'

const { t } = useI18n()
const { notify } = Notify()

const characterStore = useCharacterStore()
const { store, foodBuilds, currentFoodBuild } = setupCharacterFoodStore()

const copyCurrentFoodBuild = () => {
  store.createFoodBuild({
    foodBuild: currentFoodBuild.value.clone(),
  })
  notify(t('character-simulator.food-build.copy-food-build-success-tips'))
}

const removeCurrentFoodBuild = () => {
  if (foodBuilds.value.length <= 1) {
    notify(t('character-simulator.food-build.at-least-one-food-build-tips'))
    return
  }
  const from = currentFoodBuild.value
  store.removeFoodBuild(store.currentFoodBuildIndex)
  notify(t('character-simulator.food-build.remove-food-build-success-tips'),
    'ic-round-delete', null, {
      buttons: [{
        text: t('global.recovery'),
        click: () => {
          store.createFoodBuild({ foodBuild: from })
          notify(t('character-simulator.food-build.restore-food-build-success-tips'))
        },
        removeMessageAfterClick: true,
      }],
    })
}

const disableAll = computed<boolean>({
  get() {
    return !characterStore.setupOptions.handleFood
  },
  set(value) {
    characterStore.setupOptions.handleFood = !value
  },
})
</script>
