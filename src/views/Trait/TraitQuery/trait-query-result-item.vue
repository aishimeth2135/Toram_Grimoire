<template>
  <CardRow :selected="detailVisible">
    <div class="sticky top-0 z-1 min-w-max">
      <div
        class="flex cursor-pointer items-center px-3.5 py-2.5 duration-150 hover:bg-primary-5"
        :class="{ 'bg-white': detailVisible }"
        @click="detailVisible = !detailVisible"
      >
        <div class="flex w-60 shrink-0">
          <div
            class="inline-flex items-center gap-icon"
            :class="detailVisible ? 'text-red-70' : 'text-primary-90'"
          >
            <cy-icon icon="mdi:book-outline" class="text-primary-30" />
            {{ item.name }}
          </div>
        </div>
        <div class="text-sm text-primary-40">
          {{ t(`trait-query.category.${item.category}`) }}
        </div>
      </div>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="max-w-full bg-white pr-3 pb-3.5 pl-9.5">
        <EquipmentTraitCaption :trait-item="item" />
      </div>
    </cy-transition>
  </CardRow>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { EquipmentTraitItem } from '@/lib/EquipmentTrait'

import CardRow from '@/components/card/card-row.vue'
import EquipmentTraitCaption from '@/components/common/equipment-trait-caption.vue'

const props = defineProps<{
  item: EquipmentTraitItem
  defaultVisible: boolean
}>()

const { t } = useI18n()
const detailVisible = ref(props.defaultVisible)

watch(
  () => props.defaultVisible,
  value => {
    detailVisible.value = value
  }
)
</script>
