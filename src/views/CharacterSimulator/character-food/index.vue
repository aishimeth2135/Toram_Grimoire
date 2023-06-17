<template>
  <section class="px-1.5">
    <div class="pb-4">
      <div class="flex flex-wrap items-center px-2">
        <div class="mr-2 mt-2 w-60">
          <cy-options
            :value="currentFoodBuild"
            :options="
              foodBuilds.map(foodBuild => ({
                id: foodBuild.instanceId,
                value: foodBuild,
              }))
            "
            addable
            @update:value="characterStore.setCharacterFoodBuild($event)"
            @add-item="
              characterStore.setCharacterFoodBuild(store.createFoodBuild())
            "
          >
            <template #item="{ value }">
              <cy-icon-text icon="mdi-food-apple">
                {{ value.name }}
              </cy-icon-text>
            </template>
          </cy-options>
        </div>
        <div class="mt-2 flex items-center space-x-2">
          <cy-button-circle
            icon="bx:copy-alt"
            small
            @click="copyCurrentFoodBuild"
          />
          <cy-button-circle
            icon="ic-baseline-delete-outline"
            color="secondary"
            small
            @click="removeCurrentFoodBuild"
          />
        </div>
      </div>
    </div>
    <div class="mb-2 pl-1">
      <div>
        <cy-icon-text
          icon="mdi-checkbox-multiple-blank-circle-outline"
          small
          text-color="fuchsia-60"
        >
          {{ t('character-simulator.food-build.food-build-name') }}
        </cy-icon-text>
      </div>
      <div class="pl-2">
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
          text-color="fuchsia-60"
        >
          {{ t('character-simulator.food-build.food-list') }}
        </cy-icon-text>
      </div>
      <div>
        <cy-button-toggle v-model:selected="disableAll">
          {{ t('character-simulator.food-build.disable-foods') }}
        </cy-button-toggle>
      </div>
      <div class="mt-1 pl-4">
        <cy-icon-text
          icon="ic-outline-info"
          text-color="primary-50"
          small
          class="mr-2"
        >
          {{ t('character-simulator.food-build.introduction.0') }}
        </cy-icon-text>
        <cy-icon-text icon="ic-outline-info" text-color="primary-50" small>
          {{ t('character-simulator.food-build.introduction.1') }}
        </cy-icon-text>
      </div>
    </div>
    <div class="mt-3 overflow-hidden rounded-md border-1 border-primary-20">
      <CardRows :class="{ 'opacity-50': disableAll }">
        <CharacterFoodItem
          v-for="food in currentFoodBuild.foods"
          :key="food.foodBase.foodBaseId"
          :food="food"
        />
      </CardRows>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: 'CharacterFood',
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import Notify from '@/shared/setup/Notify'

import CharacterFoodItem from './character-food-item.vue'

import { setupCharacterFoodStore } from './setup'

import CardRows from '@/components/card/card-rows.vue'

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
    notify(t('character-simulator.build-common.at-least-one-build-tips'))
    return
  }
  const from = currentFoodBuild.value
  store.removeFoodBuild(store.currentFoodBuildIndex)
  notify(
    t('character-simulator.food-build.remove-food-build-success-tips'),
    'ic-round-delete',
    null,
    {
      buttons: [
        {
          text: t('global.recovery'),
          click: () => {
            store.createFoodBuild({ foodBuild: from })
            notify(
              t(
                'character-simulator.food-build.restore-food-build-success-tips'
              )
            )
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
</script>
