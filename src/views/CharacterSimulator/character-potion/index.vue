<template>
  <div class="px-2">
    <div class="flex items-center">
      <cy-options
        :value="currentPotionBuild"
        :options="
          potionBuilds.map(build => ({
            id: build.instanceId,
            value: build,
          }))
        "
        addable
        placement="bottom-start"
        @update:value="characterStore.setCharacterPotionBuild($event)"
        @add-item="potionStore.createPotionBuild()"
      >
        <template #title>
          <cy-button-circle
            icon="ant-design:build-outlined"
            small
            color="blue"
          />
        </template>
        <template #item="{ value }">
          <cy-icon-text icon="ant-design:build-outlined">
            {{ value.name }}
          </cy-icon-text>
        </template>
      </cy-options>
      <cy-title-input
        v-model:value="currentPotionBuild.name"
        icon="ic:baseline-drive-file-rename-outline"
      />
      <div class="ml-4 flex items-center space-x-2">
        <cy-button-circle
          icon="bx:copy-alt"
          small
          @click="potionStore.copyCurrentPotionBuild()"
        />
        <cy-button-circle
          icon="ic-baseline-delete-outline"
          color="secondary"
          small
          @click="removeCurrentPotionBuild"
        />
      </div>
    </div>
    <div class="flex items-center space-x-2 py-3">
      <cy-button-action @click="toggle('modals/edit', true)">
        {{ t('character-simulator.potion-build.edit-potion') }}
      </cy-button-action>
      <cy-button-toggle v-model:selected="controls.itemDetail">
        {{ t('character-simulator.registlet-build.show-detail') }}
      </cy-button-toggle>
    </div>
    <div>
      <cy-button-toggle v-model:selected="disableAll">
        {{ t('character-simulator.potion-build.disable-potion') }}
      </cy-button-toggle>
    </div>
    <div
      v-if="currentPotionBuild.items.length > 0"
      class="space-y-4"
      :class="{ 'opacity-50': disableAll }"
    >
      <CharacterPotionCategory
        v-for="category in currentPotionBuild.categorys"
        :key="category.base.id"
        :category="category"
        :detail-visible="controls.itemDetail"
      />
    </div>
    <cy-default-tips v-else>
      {{ t('character-simulator.potion-build.default-tips') }}
    </cy-default-tips>
    <CharacterPotionEdit
      :visible="modals.edit"
      :potion-build="currentPotionBuild"
      @close="toggle('modals/edit', false)"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'CharacterPotion',
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import Notify from '@/setup/Notify'
import ToggleService from '@/setup/ToggleService'

import CharacterPotionCategory from './character-potion-category.vue'
import CharacterPotionEdit from './character-potion-edit.vue'

import { setupCharacterPotionStore } from '../setup'

const characterStore = useCharacterStore()
const {
  currentPotionBuild,
  potionBuilds,
  store: potionStore,
} = setupCharacterPotionStore()

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

const removeCurrentPotionBuild = () => {
  if (potionBuilds.value.length <= 1) {
    notify(t('character-simulator.build-common.at-least-one-build-tips'))
    return
  }
  potionStore.removeCurrentPotionBuild()
}
</script>
