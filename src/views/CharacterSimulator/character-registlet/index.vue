<template>
  <div class="px-2">
    <div class="flex items-center">
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
        v-model:value="currentRegistletBuild.name"
        icon="ic:baseline-drive-file-rename-outline"
      />
      <div class="flex items-center space-x-2 ml-4">
        <cy-button-circle
          icon="bx:copy-alt"
          small
          @click="registletStore.copyCurrentRegistletBuild()"
        />
        <cy-button-circle
          icon="ic-baseline-delete-outline"
          color="secondary"
          small
          @click="registletStore.removeCurrentRegistletBuild()"
        />
      </div>
    </div>
    <div class="py-3 flex items-center space-x-2">
      <cy-button-action @click="toggle('modals/edit', true)">
        {{ t('character-simulator.registlet-build.edit-registlet') }}
      </cy-button-action>
      <cy-button-toggle v-model:selected="controls.itemDetail">
        {{ t('character-simulator.registlet-build.show-detail') }}
      </cy-button-toggle>
    </div>
    <div class="border-1 border-primary-20 rounded-md overflow-hidden">
      <CardRows v-if="currentRegistletBuild.items.length > 0">
        <CharacterRegistletItem
          v-for="item in currentRegistletBuild.items"
          :key="item.base.id"
          :item="item"
          :detail-visible="controls.itemDetail"
        />
      </CardRows>
      <cy-default-tips v-else>
        {{ t('character-simulator.registlet-build.default-tips') }}
      </cy-default-tips>
    </div>
    <div class="space-y-1 pt-6 pb-2">
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
import CardRows from '@/components/card/card-rows.vue'

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
