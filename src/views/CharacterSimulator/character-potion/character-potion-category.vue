<template>
  <div class="border-1 border-primary-20 rounded-md overflow-hidden">
    <div
      class="border-b border-primary-20 text-primary-30 text-sm py-0.5 px-3 bg-white"
    >
      {{ category.base.name }}
    </div>
    <CardRows>
      <CharacterPotionItem
        v-for="item in category.items"
        :key="item.base.id"
        :item="item"
        :detail-visible="detailVisible"
      />
    </CardRows>
  </div>
</template>

<script lang="ts" setup>
import { PotionItemsCategory } from '@/lib/Character/PotionBuild/PotionBuild'

import CardRows from '@/components/card/card-rows.vue'

import CharacterPotionItem from './character-potion-item.vue'

interface Props {
  category: PotionItemsCategory
  detailVisible?: boolean
}

withDefaults(defineProps<Props>(), {
  detailVisible: false,
})
</script>
