<script lang="ts" setup>
import type { PotionItemsCategory } from '@/lib/Character/PotionBuild'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
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

<template>
  <CardRowsWrapper>
    <div class="border-primary-20 text-primary-30 border-b bg-white px-3 py-0.5 text-sm">
      {{ category.base.name }}
    </div>
    <CardRows class="pb-2.5 pt-1.5">
      <CharacterPotionItem
        v-for="item in category.items"
        :key="item.base.id"
        :item="item"
        :detail-visible="detailVisible"
      />
    </CardRows>
  </CardRowsWrapper>
</template>
