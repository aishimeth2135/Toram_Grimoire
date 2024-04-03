<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterPotionBuildStore } from '@/stores/views/character/potion-build'

import Notify from '@/shared/setup/Notify'
import ToggleService from '@/shared/setup/ToggleService'

import CommonBuildPage from '../common/common-build-page.vue'
import CharacterPotionCategory from './character-potion-category.vue'
import CharacterPotionEdit from './character-potion-edit.vue'

defineOptions({
  name: 'CharacterPotion',
})

const characterStore = useCharacterStore()
const potionStore = useCharacterPotionBuildStore()
const { currentPotionBuild: selectedBuild, potionBuilds } =
  storeToRefs(potionStore)

const currentPotionBuild = computed(
  () => characterStore.currentCharacterState.potionBuild
)

const { t } = useI18n()
const { toggle, modals, controls } = ToggleService({
  modals: ['edit'] as const,
  controls: [{ name: 'itemDetail', default: true }] as const,
})

const disableAll = computed<boolean>({
  get() {
    return !characterStore.setupOptions.handlePotion
  },
  set(value) {
    characterStore.setupOptions.handlePotion = !value
  },
})

const { notify } = Notify()

const removeSelectedPotionBuild = () => {
  if (!selectedBuild.value) {
    return
  }
  if (potionBuilds.value.length <= 1) {
    notify(t('character-simulator.build-common.at-least-one-build-tips'))
    return
  }
  const idx = potionStore.removePotionBuild(selectedBuild.value)
  selectedBuild.value = potionBuilds.value[idx]
}

const addPotionBuild = () => {
  selectedBuild.value = potionStore.createPotionBuild()
}
</script>

<template>
  <CommonBuildPage
    v-model:selected-build="selectedBuild"
    v-model:builds="potionBuilds"
    :current-build="currentPotionBuild"
    @select-build="characterStore.setCharacterPotionBuild"
    @add-build="addPotionBuild"
    @copy-build="potionStore.appendPotionBuild(selectedBuild!.clone(), false)"
    @remove-build="removeSelectedPotionBuild"
  >
    <template #header>
      <div class="mb-2">
        <cy-button-toggle v-model:selected="disableAll">
          {{ t('character-simulator.potion-build.disable-potion') }}
        </cy-button-toggle>
      </div>
    </template>
    <template #content>
      <div class="flex items-center space-x-2 py-3">
        <cy-button-action icon="ic:edit" @click="toggle('modals/edit', true)">
          {{ t('character-simulator.potion-build.edit-potion') }}
        </cy-button-action>
        <cy-button-check v-model:selected="controls.itemDetail">
          {{ t('character-simulator.registlet-build.show-detail') }}
        </cy-button-check>
      </div>
      <div
        v-if="selectedBuild && selectedBuild.items.length > 0"
        class="max-w-2xl space-y-4 pt-2"
        :class="{ 'opacity-50': disableAll }"
      >
        <CharacterPotionCategory
          v-for="category in selectedBuild.categorys"
          :key="category.base.id"
          :category="category"
          :detail-visible="controls.itemDetail"
        />
      </div>
      <cy-default-tips v-else>
        {{ t('character-simulator.potion-build.default-tips') }}
      </cy-default-tips>
    </template>
    <template #modals>
      <CharacterPotionEdit
        v-if="selectedBuild"
        :visible="modals.edit"
        :potion-build="selectedBuild"
        @close="toggle('modals/edit', false)"
      />
    </template>
  </CommonBuildPage>
</template>
