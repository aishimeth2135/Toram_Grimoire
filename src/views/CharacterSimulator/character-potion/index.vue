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
        @update:value="characterStore.setCharacterRegistletBuild($event)"
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
      <div class="flex items-center space-x-2 ml-4">
        <cy-button-circle
          icon="bx:copy-alt"
          small
          @click="potionStore.copyCurrentPotionBuild()"
        />
        <cy-button-circle
          icon="ic-baseline-delete-outline"
          color="secondary"
          small
          @click="potionStore.removeCurrentPotionBuild()"
        />
      </div>
    </div>
    <div class="py-3 flex items-center space-x-2">
      <cy-button-action @click="toggle('modals/edit', true)">
        {{ t('character-simulator.potion-build.edit-potion') }}
      </cy-button-action>
      <cy-button-toggle v-model:selected="controls.itemDetail">
        {{ t('character-simulator.registlet-build.show-detail') }}
      </cy-button-toggle>
    </div>
    <div class="border-1 border-primary-20 rounded-md overflow-hidden">
      <CardRows v-if="currentPotionBuild.items.length > 0">
        <CharacterPotionItem
          v-for="item in currentPotionBuild.items"
          :key="item.base.id"
          :item="item"
          :detail-visible="controls.itemDetail"
        />
      </CardRows>
      <cy-default-tips v-else>
        {{ t('character-simulator.potion-build.default-tips') }}
      </cy-default-tips>
    </div>
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
import ToggleService from '@/setup/ToggleService'
import { useCharacterStore } from '@/stores/views/character'
import { useI18n } from 'vue-i18n'
import { setupCharacterPotionStore } from '../setup'
import CharacterPotionEdit from './character-potion-edit.vue'
import CharacterPotionItem from './character-potion-item.vue'
import CardRows from '@/components/card/card-rows.vue'

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
</script>
