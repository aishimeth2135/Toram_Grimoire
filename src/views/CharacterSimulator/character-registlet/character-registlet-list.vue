<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { RegistletItemBase } from '@/lib/Registlet/RegistletItem'

import RegistletCaption from '@/components/common/registlet-caption.vue'

import CommonSearchableItems from '../common/common-searchable-items.vue'

interface Props {
  registletBuild: RegistletBuild
}

interface RegistletOption {
  id: string
  name: string
  categoryId: string
  base: RegistletItemBase
}

const props = defineProps<Props>()

const { t } = useI18n()

const searchText = ref('')
const detailVisibleItemIds = ref(new Set<string>())

const registletOptions: RegistletOption[] = [
  Grimoire.Registlet.statCategory,
  Grimoire.Registlet.skillCategory,
  Grimoire.Registlet.specialCategory,
].flatMap(category =>
  category.items.map(item => ({
    id: item.id,
    name: item.name,
    categoryId: category.id,
    base: item,
  }))
)

const searchResults = computed(() => {
  if (!searchText.value) {
    return registletOptions
  }
  return registletOptions.filter(item => item.name.includes(searchText.value))
})

const selectedItemIds = computed(() => props.registletBuild.items.map(item => item.base.id))

const toggleItem = (item: RegistletOption) => {
  props.registletBuild.toggleItem(item.base)
}

const toggleDetailVisible = (itemId: string) => {
  if (detailVisibleItemIds.value.has(itemId)) {
    detailVisibleItemIds.value.delete(itemId)
  } else {
    detailVisibleItemIds.value.add(itemId)
  }
}
</script>

<template>
  <div class="max-h-128 flex flex-col">
    <CommonSearchableItems
      v-model:search-text="searchText"
      :placeholder="t('global.search')"
      :items="searchResults"
      :selected-item-ids="selectedItemIds"
      group-by="categoryId"
      @select-item="toggleItem"
    >
      <template #group="{ item }">
        {{ t(`registlet-query.category.${item.categoryId}`) }}
      </template>
      <template #item="{ item }">
        <div class="min-w-0 grow">
          <div class="flex items-center">
            <div>{{ item.name }}</div>
            <cy-button-icon
              :icon="
                detailVisibleItemIds.has(item.id)
                  ? 'mdi:chevron-up-circle-outline'
                  : 'mdi:chevron-down-circle-outline'
              "
              class="ml-auto"
              @click.stop="toggleDetailVisible(item.id)"
            />
          </div>
          <RegistletCaption
            v-if="detailVisibleItemIds.has(item.id)"
            :registlet-item="item.base"
            class="text-gray-60 mt-1 text-sm"
          />
        </div>
      </template>
    </CommonSearchableItems>
  </div>
</template>
