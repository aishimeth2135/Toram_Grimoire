<template>
  <CardRow class="relative py-2 pl-2 pr-4" :class="item.enabled ? 'opacity-100' : 'opacity-60'">
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
        <div class="text-primary-80 ml-1">{{ item.base.name }}</div>
      </div>
      <div v-if="item.enabled" class="ml-10 mr-6 flex items-center">
        <span class="text-primary-30">Lv.</span>
        <cy-input-counter
          v-model:value="
            // eslint-disable-next-line vue/no-mutating-props
            item.level
          "
          inline
          class="flex!"
        />
      </div>
    </div>
    <div v-if="item.enabled && detailVisible" class="text-gray-60 pl-10 pr-2 pt-1">
      <RegistletCaption :registlet-item="item.base" />
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import type { RegistletItem } from '@/lib/Character/RegistletBuild'

import CardRow from '@/components/card/card-row.vue'
import RegistletCaption from '@/components/common/registlet-caption.vue'

interface Props {
  item: RegistletItem
  detailVisible?: boolean
}

withDefaults(defineProps<Props>(), {
  detailVisible: false,
})
</script>
