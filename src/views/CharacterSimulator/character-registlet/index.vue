<script lang="ts" setup>
import { Ref, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import Notify from '@/shared/setup/Notify'
import ToggleService from '@/shared/setup/ToggleService'

import { RegistletBuild } from '@/lib/Character/RegistletBuild'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import CommonBuildPage from '../common/common-build-page.vue'
import CharacterRegistletEdit from './character-registlet-edit.vue'
import CharacterRegistletItem from './character-registlet-item.vue'

import { setupCharacterRegistletStore } from '../setup'

defineOptions({
  name: 'CharacterRegistlet',
})

const characterStore = useCharacterStore()
const {
  currentRegistletBuild,
  registletBuilds,
  store: registletStore,
} = setupCharacterRegistletStore()

const { t } = useI18n()
const { toggle, modals, controls } = ToggleService({
  modals: ['edit'] as const,
  controls: ['itemDetail'] as const,
})

const selectedBuild = ref(currentRegistletBuild.value) as Ref<RegistletBuild>

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
  if (registletBuilds.value.length <= 1) {
    notify(t('character-simulator.build-common.at-least-one-build-tips'))
    return
  }
  const idx = registletStore.removeRegistletBuild(selectedBuild.value)
  selectedBuild.value = registletStore.registletBuilds[idx] as RegistletBuild
}

const addRegistletBuild = () => {
  selectedBuild.value = registletStore.createRegistletBuild()
}
</script>

<template>
  <CommonBuildPage
    v-model:selected-build="selectedBuild"
    v-model:builds="registletBuilds"
    :current-build="currentRegistletBuild"
    @select-build="characterStore.setCharacterRegistletBuild"
    @add-build="addRegistletBuild"
    @copy-build="registletStore.appendRegistletBuild(selectedBuild.clone())"
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
      <div class="flex items-center space-x-2 py-3">
        <cy-button-action icon="ic:edit" @click="toggle('modals/edit', true)">
          {{ t('character-simulator.registlet-build.edit-registlet') }}
        </cy-button-action>
        <cy-button-check v-model:selected="controls.itemDetail">
          {{ t('character-simulator.registlet-build.show-detail') }}
        </cy-button-check>
      </div>
      <CardRowsWrapper class="mt-4 max-w-xl">
        <CardRows
          v-if="selectedBuild.items.length > 0"
          :class="{ 'opacity-50': disableAll }"
        >
          <CharacterRegistletItem
            v-for="item in selectedBuild.items"
            :key="item.base.id"
            :item="item"
            :detail-visible="controls.itemDetail"
          />
        </CardRows>
        <cy-default-tips v-else>
          {{ t('character-simulator.registlet-build.default-tips') }}
        </cy-default-tips>
      </CardRowsWrapper>
      <div class="space-y-1 pb-2 pt-6">
        <div>
          <cy-icon-text
            icon="ic-outline-info"
            text-color="primary-50"
            align-v="start"
            small
          >
            {{ t('character-simulator.registlet-build.main-tips-1') }}
          </cy-icon-text>
        </div>
        <div>
          <cy-icon-text
            icon="ic-outline-info"
            text-color="primary-50"
            align-v="start"
            small
          >
            {{ t('character-simulator.registlet-build.main-tips-2') }}
          </cy-icon-text>
        </div>
      </div>
    </template>
    <template #modals>
      <CharacterRegistletEdit
        :visible="modals.edit"
        :registlet-build="selectedBuild"
        @close="toggle('modals/edit', false)"
      />
    </template>
  </CommonBuildPage>
</template>
