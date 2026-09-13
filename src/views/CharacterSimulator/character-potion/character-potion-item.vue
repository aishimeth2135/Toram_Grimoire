<template>
  <CardRow class="relative py-1 pl-2 pr-4" :class="item.enabled ? 'opacity-100' : 'opacity-60'">
    <cy-button-icon
      icon="ic:round-delete-outline"
      color="gray"
      class="absolute right-3 top-3.5"
      @click="item.remove()"
    />
    <div class="flex flex-wrap items-center">
      <div class="mr-auto flex items-center" style="min-width: 14rem">
        <cy-button-check
          v-model:selected="
            // eslint-disable-next-line vue/no-mutating-props
            item.enabled
          "
        />
        <div class="text-primary-70 ml-1">{{ item.base.name }}</div>
      </div>
    </div>
    <div v-if="detailVisible" class="px-2 pl-10 pt-1">
      <PotionCaption :potion="item.base" />
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import type { PotionItem } from '@/lib/Character/PotionBuild'

import CardRow from '@/components/card/card-row.vue'

import PotionCaption from './potion-caption.vue'

interface Props {
  item: PotionItem
  detailVisible?: boolean
}

withDefaults(defineProps<Props>(), {
  detailVisible: false,
})
</script>
