<template>
  <cy-modal :visible="visible" footer @close="emit('close')">
    <div class="sticky top-0 mb-3">
      <cy-title-input
        v-model:value="searchText"
        icon="ic:baseline-search"
        clearable
      />
    </div>
    <CardRows>
      <CardRow
        v-for="item in itemsResult"
        :key="item.id"
        class="flex items-center pl-3 pr-3 py-2 hover:!bg-primary-5 cursor-pointer duration-150"
        @click="potionBuild.toggleItem(item)"
      >
        <cy-icon-text
          icon="mdi:bottle-tonic-outline"
          :class="{ 'opacity-0': !potionBuild.itemSelected(item) }"
        />
        <span
          class="ml-3"
          :class="
            potionBuild.itemSelected(item) ? 'text-primary-70' : 'text-gray-50'
          "
        >
          {{ item.name }}
        </span>
      </CardRow>
    </CardRows>
  </cy-modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { PotionBuild } from '@/lib/Character/PotionBuild/PotionBuild'

import CardRow from '@/components/card/card-row.vue'
import CardRows from '@/components/card/card-rows.vue'

interface Props {
  visible: boolean
  potionBuild: PotionBuild
}
interface Emits {
  (evt: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const items = Grimoire.Items!.potionsRoot.allPotions.filter(
  potion => potion.stats.length > 0
)

const searchText = ref('')

const itemsResult = computed(() => {
  if (!searchText.value) {
    return items
  }
  return items.filter(item => item.name.includes(searchText.value))
})
</script>
