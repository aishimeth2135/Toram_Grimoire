<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import type { PotionBuild } from '@/lib/Character/PotionBuild'
import type { BagPotion } from '@/lib/Items/BagItem'

import CommonSearchableItems from '../common/common-searchable-items.vue'
import PotionCaption from './potion-caption.vue'

interface Props {
  potionBuild: PotionBuild
}

interface PotionOption {
  id: string
  name: string
  categoryId: string
  categoryName: string
  base: BagPotion
}

const props = defineProps<Props>()

const { t } = useI18n()

const searchText = ref('')
const detailVisibleItemIds = ref(new Set<string>())

const potionOptions: PotionOption[] = Grimoire.Items.potionsRoot.categorys.flatMap(category =>
  category.obtainCategorys.flatMap(obtainCategory =>
    obtainCategory.potions
      .filter(potion => potion.stats.length > 0)
      .map(potion => ({
        id: potion.id,
        name: potion.name,
        categoryId: category.id,
        categoryName: category.name,
        base: potion,
      }))
  )
)

const searchResults = computed(() => {
  if (!searchText.value) {
    return potionOptions
  }
  return potionOptions.filter(item => item.name.includes(searchText.value))
})

const selectedItemIds = computed(() => props.potionBuild.items.map(item => item.base.id))

const toggleItem = (item: PotionOption) => {
  props.potionBuild.toggleItem(item.base)
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
        {{ item.categoryName }}
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
          <PotionCaption
            v-if="detailVisibleItemIds.has(item.id)"
            :potion="item.base"
            class="text-gray-60 mt-1 text-sm"
          />
        </div>
      </template>
    </CommonSearchableItems>
  </div>
</template>
