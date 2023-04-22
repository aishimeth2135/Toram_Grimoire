<template>
  <CardRow
    class="relative py-2 pl-2 pr-4"
    :class="item.enabled ? 'opacity-100' : 'opacity-60'"
  >
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
        <div class="ml-1 text-primary-70">{{ item.base.name }}</div>
      </div>
    </div>
    <div v-if="detailVisible" class="px-2 py-1 pl-10">
      <ShowStat
        v-for="stat in item.base.stats"
        :key="stat.statId"
        :stat="stat"
      />
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { PotionItem } from '@/lib/Character/PotionBuild'

import CardRow from '@/components/card/card-row.vue'
import ShowStat from '@/components/common/show-stat.vue'

interface Props {
  item: PotionItem
  detailVisible?: boolean
}

withDefaults(defineProps<Props>(), {
  detailVisible: false,
})
</script>
