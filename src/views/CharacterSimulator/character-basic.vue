<template>
  <section v-if="currentCharacter" class="px-2">
    <div class="py-2">
      <cy-options>
        <template #title>
          <cy-list-item>
            <cy-icon-text icon="bx-bxs-face">
              {{ currentCharacter.name }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <template #options>
          <cy-list-item
            v-for="(character, idx) in characters"
            :key="character.instanceId"
            :selected="character === currentCharacter"
            @click="store.setCurrentCharacter(idx)"
          >
            <cy-icon-text icon="bx-bx-face">
              {{ character.name }}
            </cy-icon-text>
          </cy-list-item>
          <cy-list-item @click="store.createCharacter()">
            <cy-icon-text icon="ic-round-add-circle-outline" text-color="light-3">
              {{ t('character-simulator.character-basic.create-character') }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
      <div class="flex items-center">
        <cy-button-border
          icon="bx:copy-alt"
          @click="copyCurrentCharacter"
        >
          {{ t('global.copy') }}
        </cy-button-border>
        <cy-button-border
          icon="ic-baseline-delete-outline"
          main-color="gray"
          @click="removeCurrentCharacter"
        >
          {{ t('global.remove') }}
        </cy-button-border>
      </div>
    </div>
    <div class="mt-3">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ t('character-simulator.character-basic.character-name') }}
      </cy-icon-text>
    </div>
    <div class="mt-2 px-2" style="max-width: 25rem">
      <cy-title-input
        v-model:value="currentCharacter.name"
        icon="mdi-clipboard-text-outline"
      />
    </div>
    <div class="content-title">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ t('character-simulator.character-basic.character-level') }}
      </cy-icon-text>
    </div>
    <div class="mt-2 px-2">
      <cy-input-counter
        v-model:value="currentCharacter.level"
        class="counter"
        :range="[0, 300]"
      >
        <template #title>
          <cy-icon-text icon="bx-bxs-user">
            {{ t('character-simulator.character-basic.character-level') }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
    </div>
    <div class="mt-3">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ t('character-simulator.character-basic.character-stat-points') }}
      </cy-icon-text>
    </div>
    <div class="space-y-2 px-2 mt-2">
      <div
        v-for="baseStat in currentCharacter.normalBaseStats"
        :key="baseStat.name"
      >
        <cy-input-counter
          v-model:value="baseStat.value"
          :range="baseStatRange"
        >
          <template #title>
            <cy-icon-text icon="mdi-rhombus-outline">
              {{ baseStat.name }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </div>
      <cy-transition type="fade-slide-right" mode="out-in">
        <div>
          <cy-input-counter
            v-if="currentCharacter.optionalBaseStat"
            :key="currentCharacter.optionalBaseStat.name"
            v-model:value="currentCharacter.optionalBaseStat.value"
            :range="optionalBaseStatRange"
          >
            <template #title>
              <cy-icon-text icon="mdi-rhombus-outline">
                {{ currentCharacter.optionalBaseStat.name }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </cy-transition>
    </div>
    <div class="mt-3">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ t('character-simulator.character-basic.character-optional-base-stat') }}
      </cy-icon-text>
    </div>
    <div class="mt-2 px-2">
      <div class="flex items-center flex-wrap">
        <cy-button-radio
          :selected="!currentCharacter.optionalBaseStat"
          @click="currentCharacter!.clearOptinalBaseStat()"
        >
          {{ t('global.none') }}
        </cy-button-radio>
        <cy-button-radio
          v-for="option in characterOptionalBaseStatOptions"
          :key="option"
          :selected="currentCharacter.baseStat(option) ? true : false"
          @click="currentCharacter!.setOptionalBaseStat(option)"
        >
          {{ option }}
        </cy-button-radio>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterOptionalBaseStatTypes } from '@/lib/Character/Character/enums'

import Notify from '@/setup/Notify'

import { setupCharacterStore } from './setup'

const { store, characters, currentCharacter } = setupCharacterStore()

const { t } = useI18n()
const { notify } = Notify()

const baseStatRange = [1, 500]
const optionalBaseStatRange = [0, 255]

const characterOptionalBaseStatOptions = computed(() => {
  return Object.values(CharacterOptionalBaseStatTypes)
})

const copyCurrentCharacter = () => {
  if (currentCharacter.value) {
    store.createCharacter(currentCharacter.value.clone())
  }
}

const removeCurrentCharacter = () => {
  if (characters.value.length <= 1) {
    notify(t('character-simulator.character-basic.at-least-one-character'))
    return
  }
  const from = currentCharacter.value!
  store.removeCharacter()
  notify(t('character-simulator.character-basic.remove-character-success', { name: from.name }),
    'ic-round-delete', null, {
      buttons: [{
        text: t('global.recovery'),
        click: () => {
          store.createCharacter(from)
          notify(t('character-simulator.character-basic.restore-character-success', { name: from.name }))
        },
        removeMessageAfterClick: true,
      }],
    })
}
</script>
