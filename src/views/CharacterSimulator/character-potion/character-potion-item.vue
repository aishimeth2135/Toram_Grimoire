<template>
  <CardRow
    class="py-2 pl-2 pr-4 relative"
    :class="item.enabled ? 'opacity-100' : 'opacity-60'"
  >
    <cy-button-icon
      icon="ic:round-delete-outline"
      color="gray"
      class="absolute top-3.5 right-3"
      @click="item.remove()"
    />
    <div class="flex items-center flex-wrap">
      <div class="flex items-center mr-auto" style="min-width: 14rem">
        <cy-button-check
          v-model:selected="
            // eslint-disable-next-line vue/no-mutating-props
            item.enabled
          "
        />
        <div class="ml-1 text-primary-80">{{ item.base.name }}</div>
      </div>
    </div>
    <div v-if="item.enabled && detailVisible" class="p-2 pl-10">
      <ShowStat
        v-for="stat in item.base.stats"
        :key="stat.statId"
        :stat="stat"
      />
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { PotionItem } from '@/lib/Character/PotionBuild/PotionBuild'

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
