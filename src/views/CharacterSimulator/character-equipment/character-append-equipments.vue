<template>
  <cy-modal
    :visible="visible"
    title-icon="bx-bx-search-alt"
    :title="t('character-simulator.append-equipments.title')"
    vertical-position="start"
    footer
    @close="emit('close')"
  >
    <template #default>
      <div ref="topElement"></div>
      <cy-title-input
        v-model:value="searchText"
        icon="ic-outline-category"
        class="sticky top-0 z-1 bg-white pb-2 pt-1"
        :placeholder="
          t(
            'character-simulator.append-equipments.search-equipment-placeholder'
          )
        "
        clearable
      />
      <div v-if="searchResults.length !== 0">
        <EquipmentItem
          v-for="item in currentResults"
          :key="item.instanceId"
          :equipment="item"
          @click="appendEquipment(item)"
        >
          <template #title-end>
            <span class="ml-4 text-sm text-primary-30">
              {{ getObtainText(item) }}
            </span>
            <cy-icon icon="ic-round-add" class="ml-auto" />
          </template>
        </EquipmentItem>
      </div>
      <cy-default-tips v-else icon="potum" icon-src="custom">
        {{ t('character-simulator.main-tips.no-result') }}
      </cy-default-tips>
      <div class="mt-3">
        <cy-pagination
          v-model:value="page"
          :max-page="maxPage"
          @changed="pageChanged"
        />
      </div>
    </template>
    <template #footer="{ closeModal }">
      <div class="flex w-full items-center justify-end">
        <cy-button-action
          icon="ic-round-done"
          class="ml-auto"
          :disabled="selectedEquipments.length === 0"
          @click="submit"
        >
          {{ t('global.confirm') }}
        </cy-button-action>
        <cy-button-action icon="ic-round-close" @click="closeModal">
          {{ t('global.close') }}
        </cy-button-action>
      </div>
    </template>
    <template #extra-content>
      <div class="border-1 border-primary-30 bg-white px-1">
        <div class="flex items-center px-3 py-2">
          <i18n-t
            keypath="character-simulator.append-equipments.search-equipment-selected-text"
            tag="div"
            class="flex-items-center"
            scope="global"
          >
            <template #num>
              <span
                class="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border-1 border-primary-50"
              >
                <span>{{ selectedEquipments.length }}</span>
              </span>
            </template>
          </i18n-t>
          <span
            class="ml-auto cursor-pointer text-primary-50"
            @click="clearSelectedEquipments"
          >
            {{ t('global.clear') }}
          </span>
        </div>
        <div v-if="selectedEquipments.length !== 0">
          <EquipmentItem
            v-for="item in selectedEquipments"
            :key="item.instanceId"
            :equipment="item"
            @click="removeEquipment(item)"
          >
            <template #title-end>
              <span class="ml-4 text-sm text-primary-30">
                {{ getObtainText(item) }}
              </span>
              <cy-icon icon="ic-round-close" class="ml-auto" />
            </template>
          </EquipmentItem>
        </div>
      </div>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { Ref, computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import Notify from '@/shared/setup/Notify'
import PageControl from '@/shared/setup/PageControl'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import EquipmentItem from '@/components/common/equipment-item.vue'

import { setupCharacterStore } from '../setup'

interface Props {
  visible: boolean
}
interface Emits {
  (evt: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { notify } = Notify()
const { store } = setupCharacterStore()

const topElement: Ref<HTMLElement | null> = ref(null)
const searchText = ref('')
const selectedEquipments: Ref<CharacterEquipment[]> = ref([])

const allEqupments = Grimoire.Items.equipments.slice().reverse()

const searchResults = computed(() => {
  return allEqupments.filter(
    equip =>
      (equip.category !== -1 &&
        equip.name.toLowerCase().includes(searchText.value.toLowerCase())) ||
      equip.name === searchText.value
  )
})

const { currentItems, page, maxPage } = PageControl({
  items: searchResults,
  step: 30,
})

const currentResults = computed(() =>
  currentItems.value.map(equip => CharacterEquipment.fromOriginEquipment(equip))
)

const getObtainText = (equip: CharacterEquipment) => {
  const origin = equip.origin
  if (!origin) {
    return ''
  }
  return t('common.Equipment.obtain.' + (origin.obtains[0]?.type ?? 'unknown'))
}

const appendEquipment = (equip: CharacterEquipment) => {
  selectedEquipments.value.push(equip.clone())
}
const removeEquipment = (equip: CharacterEquipment) => {
  const idx = selectedEquipments.value.indexOf(equip)
  if (idx > -1) {
    selectedEquipments.value.splice(idx, 1)
  }
}

const clearSelectedEquipments = () => {
  const original = selectedEquipments.value
  selectedEquipments.value = []
  notify(
    t('character-simulator.append-equipments.selected-equipments-cleared-tips'),
    'ic-round-done',
    null,
    {
      buttons: [
        {
          text: t('global.recovery'),
          click: () => {
            selectedEquipments.value = original
          },
          removeMessageAfterClick: true,
        },
      ],
    }
  )
}

const submit = () => {
  store.appendEquipments(selectedEquipments.value)

  // clear
  selectedEquipments.value = []

  emit('close')
}

const pageChanged = async () => {
  await nextTick()
  topElement.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
