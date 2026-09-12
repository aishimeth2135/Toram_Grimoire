<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterPotionBuildStore } from '@/stores/views/character/potion-build'

import { useNotify } from '@/shared/setup/Notify'

import CommonBuildPage from '../common/common-build-page.vue'
import CharacterPotionList from './character-potion-list.vue'
import CharacterPotionSettings from './character-potion-settings.vue'

defineOptions({
  name: 'CharacterPotion',
})

const characterStore = useCharacterStore()
const potionStore = useCharacterPotionBuildStore()
const { currentPotionBuild: selectedBuild, potionBuilds } = storeToRefs(potionStore)

const currentPotionBuild = computed(() => characterStore.currentCharacterState.potionBuild)

const { t } = useI18n()

const currentTab = ref(0)

const disableAll = computed<boolean>({
  get() {
    return !characterStore.setupOptions.handlePotion
  },
  set(value) {
    characterStore.setupOptions.handlePotion = !value
  },
})

const notify = useNotify()

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
  const build = potionStore.createPotionBuild()
  if (build) {
    selectedBuild.value = build
  }
}
</script>

<template>
  <CommonBuildPage
    v-model:selected-build="selectedBuild"
    v-model:builds="potionBuilds"
    :current-build="currentPotionBuild"
    @select-build="characterStore.setCharacterPotionBuild"
    @add-build="addPotionBuild"
    @copy-build="potionStore.appendPotionBuild(selectedBuild!.clone(), { updateIndex: false })"
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
      <cy-tabs v-model="currentTab">
        <cy-tab :value="0">
          {{ t('character-simulator.potion-build.potion-settings') }}
        </cy-tab>
        <cy-tab :value="1">
          {{ t('character-simulator.potion-build.potion-list') }}
        </cy-tab>
      </cy-tabs>
      <div v-if="selectedBuild" class="min-w-90 overflow-x-auto py-4">
        <CharacterPotionSettings
          v-if="currentTab === 0"
          :potion-build="selectedBuild"
          :disabled="disableAll"
        />
        <CharacterPotionList v-else :potion-build="selectedBuild" />
      </div>
    </template>
  </CommonBuildPage>
</template>
