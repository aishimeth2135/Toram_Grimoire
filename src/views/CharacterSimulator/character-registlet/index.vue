<template>
  <div>
    <div class="px-2 flex items-center">
      <cy-options
        :value="currentRegistletBuild"
        :options="
          registletBuilds.map(build => ({
            id: build.instanceId,
            value: build,
          }))
        "
        addable
        placement="bottom-start"
        @update:value="characterStore.setCharacterRegistletBuild($event)"
        @add-item="registletStore.createRegistletBuild()"
      >
        <template #title>
          <cy-button-circle icon="ant-design:build-outlined" small />
        </template>
        <template #item="{ value }">
          <cy-icon-text icon="ant-design:build-outlined">
            {{ value.name }}
          </cy-icon-text>
        </template>
      </cy-options>
      <cy-title-input
        v-model:value="currentRegistletBuild.name"
        icon="ic:baseline-drive-file-rename-outline"
      />
    </div>
    <div class="py-2 flex items-center space-x-2">
      <cy-button-action @click="toggle('modals/edit', true)">
        {{ t('character-simulator.registlet-build.edit-registlet') }}
      </cy-button-action>
      <cy-button-toggle v-model:selected="controls.itemDetail">
        {{ t('character-simulator.registlet-build.show-detail') }}
      </cy-button-toggle>
    </div>
    <div class="space-y-2">
      <div v-for="item in currentRegistletBuild.items" :key="item.base.id">
        <CharacterRegistletItem
          :item="item"
          :detail-visible="controls.itemDetail"
        />
      </div>
    </div>
    <CharacterRegistletEdit
      :visible="modals.edit"
      :registlet-build="currentRegistletBuild"
      @close="toggle('modals/edit', false)"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'CharacterRegistlet',
}
</script>

<script lang="ts" setup>
import ToggleService from '@/setup/ToggleService'
import { useCharacterStore } from '@/stores/views/character'
import { useI18n } from 'vue-i18n'
import { setupCharacterRegistletStore } from '../setup'
import CharacterRegistletEdit from './character-registlet-edit.vue'
import CharacterRegistletItem from './character-registlet-item.vue'

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
</script>
