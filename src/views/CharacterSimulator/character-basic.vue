<script lang="tsx" setup>
import { storeToRefs } from 'pinia'
import { Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import Notify from '@/shared/setup/Notify'

import { Character } from '@/lib/Character/Character'

import CommonBuildPage from './common/common-build-page.vue'
import CommonPropInput from './common/common-prop-input.vue'

const characterStore = useCharacterStore()
const { characters, currentCharacter } = storeToRefs(characterStore)

const { t } = useI18n()
const { notify } = Notify()

const baseStatRange = [1, 500]
const optionalBaseStatRange = [0, 255]

const characterOptionalBaseStatOptions = Character.optionalBaseStatTypeList

const selectedCharacter = ref(currentCharacter.value) as Ref<Character>

const copySelectedCharacter = () => {
  characterStore.cloneCharacter(selectedCharacter.value)
}

const removeSelectedCharacter = () => {
  if (characters.value.length <= 1) {
    notify(t('character-simulator.character-basic.at-least-one-character'))
    return
  }
  const from = selectedCharacter.value!
  const nextIdx = characterStore.removeCharacter(from)
  selectedCharacter.value = characterStore.characters[nextIdx]
  notify(
    t('character-simulator.character-basic.remove-character-success', {
      name: from.name,
    }),
    'ic-round-delete',
    null,
    {
      buttons: [
        {
          text: t('global.recovery'),
          click: () => {
            characterStore.appendCharacter(from)
            notify(
              t(
                'character-simulator.character-basic.restore-character-success',
                { name: from.name }
              )
            )
          },
          removeMessageAfterClick: true,
        },
      ],
    }
  )
}

const RenderContentTitie = (attrs: { title: string }) => {
  return (
    <div class="mt-6 flex w-full max-w-lg items-center">
      <div class="flex flex-shrink-0 items-center text-sm text-gray-40">
        {attrs.title}
      </div>
      <div class="ml-2 w-full border-b border-stone-20"></div>
    </div>
  )
}
</script>

<template>
  <CommonBuildPage
    v-if="currentCharacter"
    v-model:selected-build="selectedCharacter"
    v-model:builds="characters"
    :current-build="currentCharacter"
    @select-build="characterStore.setCurrentCharacter"
    @add-build="characterStore.createCharacter"
    @copy-build="copySelectedCharacter"
    @remove-build="removeSelectedCharacter"
  >
    <template #header>
      <div class="pb-4">
        <cy-icon-text
          icon="ic-outline-info"
          text-color="primary-50"
          small
          align-v="start"
        >
          {{ t('character-simulator.character-basic.character-builds-tip') }}
        </cy-icon-text>
      </div>
    </template>
    <template #content>
      <div class="px-2">
        <RenderContentTitie
          :title="t('character-simulator.character-basic.character-level')"
        />
        <div class="mt-2">
          <CommonPropInput
            v-model:value="selectedCharacter.level"
            :title="t('character-simulator.character-basic.character-level')"
            :range="[0, 300]"
            type="number"
          />
        </div>
        <RenderContentTitie
          :title="
            t('character-simulator.character-basic.character-stat-points')
          "
        />
        <div class="mt-2 space-y-2">
          <div
            v-for="baseStat in selectedCharacter.normalBaseStats"
            :key="baseStat.name"
          >
            <CommonPropInput
              v-model:value="baseStat.value"
              :range="baseStatRange"
              :title="baseStat.name"
              type="number"
            />
          </div>
          <cy-transition>
            <div>
              <CommonPropInput
                v-if="selectedCharacter.optionalBaseStat"
                :key="selectedCharacter.optionalBaseStat.name"
                v-model:value="selectedCharacter.optionalBaseStat.value"
                :range="optionalBaseStatRange"
                :title="selectedCharacter.optionalBaseStat.name"
                type="number"
              />
            </div>
          </cy-transition>
        </div>
        <RenderContentTitie
          :title="
            t(
              'character-simulator.character-basic.character-optional-base-stat'
            )
          "
        />
        <div class="mt-3">
          <div class="flex flex-wrap items-center">
            <cy-button-radio
              :selected="!selectedCharacter.optionalBaseStat"
              @click="selectedCharacter!.clearOptinalBaseStat()"
            >
              {{ t('global.none') }}
            </cy-button-radio>
            <cy-button-radio
              v-for="option in characterOptionalBaseStatOptions"
              :key="option"
              :selected="!!selectedCharacter!.baseStat(option)"
              @click="selectedCharacter!.setOptionalBaseStat(option)"
            >
              {{ option }}
            </cy-button-radio>
          </div>
        </div>
      </div>
    </template>
  </CommonBuildPage>
</template>
