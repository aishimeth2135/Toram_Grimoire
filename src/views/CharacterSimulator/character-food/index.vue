<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterFoodStore } from '@/stores/views/character/food-build'

import Notify from '@/shared/setup/Notify'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import CommonBuildPage from '../common/common-build-page.vue'
import CharacterFoodItem from './character-food-item.vue'

defineOptions({
  name: 'CharacterFood',
})

const { t } = useI18n()
const { notify } = Notify()

const characterStore = useCharacterStore()
const foodStore = useCharacterFoodStore()

const { currentFoodBuild: selectedBuild, foodBuilds } = storeToRefs(foodStore)

const currentFoodBuild = computed(() => characterStore.currentCharacterState.foodBuild)

const copySelectedFoodBuild = () => {
  if (!selectedBuild.value) {
    return
  }
  foodStore.appendFoodBuild(selectedBuild.value.clone(), false)
  notify(t('character-simulator.food-build.copy-food-build-success-tips'))
}

const removeSelectedFoodBuild = () => {
  if (!selectedBuild.value) {
    return
  }
  if (foodBuilds.value.length <= 1) {
    notify(t('character-simulator.build-common.at-least-one-build-tips'))
    return
  }
  const from = selectedBuild.value
  const idx = foodStore.removeFoodBuild(from)
  selectedBuild.value = foodBuilds.value[idx]
  notify(
    t('character-simulator.food-build.remove-food-build-success-tips'),
    'ic-round-delete',
    null,
    {
      buttons: [
        {
          text: t('global.recovery'),
          click: () => {
            foodStore.appendFoodBuild(from)
            notify(t('character-simulator.food-build.restore-food-build-success-tips'))
          },
          removeMessageAfterClick: true,
        },
      ],
    }
  )
}

const disableAll = computed<boolean>({
  get() {
    return !characterStore.setupOptions.handleFood
  },
  set(value) {
    characterStore.setupOptions.handleFood = !value
  },
})

const addFoodBuild = () => {
  selectedBuild.value = foodStore.createFoodBuild()
}
</script>

<template>
  <CommonBuildPage
    v-model:selected-build="selectedBuild"
    v-model:builds="foodBuilds"
    :current-build="currentFoodBuild"
    @select-build="characterStore.setCharacterFoodBuild"
    @add-build="addFoodBuild"
    @copy-build="copySelectedFoodBuild"
    @remove-build="removeSelectedFoodBuild"
  >
    <template #header>
      <div>
        <cy-button-toggle v-model:selected="disableAll">
          {{ t('character-simulator.food-build.disable-foods') }}
        </cy-button-toggle>
      </div>
    </template>
    <template #content>
      <div>
        <div class="mt-1 pl-2">
          <cy-icon-text icon="ic-outline-info" text-color="primary-50" small class="mr-2">
            {{ t('character-simulator.food-build.introduction.0') }}
          </cy-icon-text>
          <cy-icon-text icon="ic-outline-info" text-color="primary-50" small>
            {{ t('character-simulator.food-build.introduction.1') }}
          </cy-icon-text>
        </div>
      </div>
      <CardRowsWrapper v-if="selectedBuild" class="mt-3 max-w-xl">
        <CardRows :class="{ 'opacity-50': disableAll }">
          <CharacterFoodItem
            v-for="food in selectedBuild.foods"
            :key="food.foodBase.foodBaseId"
            :food-build="selectedBuild"
            :food="food"
          />
        </CardRows>
      </CardRowsWrapper>
    </template>
  </CommonBuildPage>
</template>
