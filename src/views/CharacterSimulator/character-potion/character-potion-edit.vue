<template>
  <cy-modal :visible="visible" footer @close="emit('close')">
    <div class="sticky top-0 mb-3">
      <cy-title-input
        v-model:value="searchText"
        icon="ic:baseline-search"
        clearable
      />
    </div>
    <div v-for="category in categoryResults" :key="category.id" class="pb-3">
      <div class="pb-1.5 text-sm text-primary-30">{{ category.name }}</div>
      <CardRows>
        <CardRow
          v-for="item in category.items"
          :key="item.id"
          class="flex cursor-pointer items-center py-2 pl-3 pr-3 duration-150 hover:!bg-primary-5"
          @click="potionBuild.toggleItem(item)"
        >
          <cy-icon-text
            icon="mdi:bottle-tonic-outline"
            :class="{ 'opacity-0': !potionBuild.itemSelected(item) }"
          />
          <span
            class="ml-3"
            :class="
              potionBuild.itemSelected(item)
                ? 'text-primary-70'
                : 'text-gray-50'
            "
          >
            {{ item.name }}
          </span>
        </CardRow>
      </CardRows>
    </div>
  </cy-modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { PotionBuild } from '@/lib/Character/PotionBuild'
import { BagPotion } from '@/lib/Items/BagItem'

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

const searchText = ref('')

const categorys = Grimoire.Items!.potionsRoot.categorys.map(category => {
  const items: BagPotion[] = []
  category.obtainCategorys.forEach(obtainCategory => {
    const potions = obtainCategory.potions.filter(
      potion => potion.stats.length > 0
    )
    items.push(...potions)
  })
  return {
    id: category.id,
    items,
    name: category.name,
  }
}).filter(item => item.items.length > 0)

const categoryResults = computed(() => {
  if (!searchText.value) {
    return categorys
  }
  return categorys
    .map(category => ({
      id: category.id,
      items: category.items.filter(item =>
        item.name.includes(searchText.value)
      ),
      name: category.name,
    }))
    .filter(item => item.items.length > 0)
})
</script>
