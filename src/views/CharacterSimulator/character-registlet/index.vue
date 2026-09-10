<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterRegistletBuildStore } from '@/stores/views/character/registlet-build'

import Notify from '@/shared/setup/Notify'

import { RegistletBuild } from '@/lib/Character/RegistletBuild'

import CommonBuildPage from '../common/common-build-page.vue'
import CharacterRegistletList from './character-registlet-list.vue'
import CharacterRegistletSettings from './character-registlet-settings.vue'

defineOptions({
  name: 'CharacterRegistlet',
})

const characterStore = useCharacterStore()
const registletStore = useCharacterRegistletBuildStore()
const { currentRegistletBuild: selectedBuild, registletBuilds } = storeToRefs(registletStore)

const { t } = useI18n()

const currentTab = ref(0)

const currentRegistletBuild = computed(() => characterStore.currentCharacterState.registletBuild)

const disableAll = computed<boolean>({
  get() {
    return !characterStore.setupOptions.handleRegistlet
  },
  set(value) {
    characterStore.setupOptions.handleRegistlet = !value
  },
})

const { notify } = Notify()

const removeSelectedBuild = () => {
  if (!selectedBuild.value) {
    return
  }
  if (registletBuilds.value.length <= 1) {
    notify(t('character-simulator.build-common.at-least-one-build-tips'))
    return
  }
  const idx = registletStore.removeRegistletBuild(selectedBuild.value)
  selectedBuild.value = registletStore.registletBuilds[idx] as RegistletBuild
}

const addRegistletBuild = () => {
  const build = registletStore.createRegistletBuild()
  if (build) {
    selectedBuild.value = build
  }
}
</script>

<template>
  <CommonBuildPage
    v-model:selected-build="selectedBuild"
    v-model:builds="registletBuilds"
    :current-build="currentRegistletBuild"
    @select-build="characterStore.setCharacterRegistletBuild"
    @add-build="addRegistletBuild"
    @copy-build="
      registletStore.appendRegistletBuild(selectedBuild!.clone(), { updateIndex: false })
    "
    @remove-build="removeSelectedBuild"
  >
    <template #header>
      <div class="mb-2">
        <cy-button-toggle v-model:selected="disableAll">
          {{ t('character-simulator.registlet-build.disable-registlet') }}
        </cy-button-toggle>
      </div>
    </template>
    <template #content>
      <cy-tabs v-model="currentTab">
        <cy-tab :value="0">
          {{ t('character-simulator.registlet-build.registlet-settings') }}
        </cy-tab>
        <cy-tab :value="1">
          {{ t('character-simulator.registlet-build.registlet-list') }}
        </cy-tab>
      </cy-tabs>
      <div v-if="selectedBuild" class="min-w-90 overflow-x-auto py-4">
        <CharacterRegistletSettings
          v-if="currentTab === 0"
          :registlet-build="selectedBuild"
          :disabled="disableAll"
        />
        <CharacterRegistletList v-else :registlet-build="selectedBuild" />
      </div>
    </template>
  </CommonBuildPage>
</template>
