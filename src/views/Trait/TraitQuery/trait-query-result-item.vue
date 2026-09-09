<template>
  <CardRow :selected="detailVisible">
    <div class="z-1 sticky top-0 min-w-max">
      <div
        class="hover:bg-primary-5 flex cursor-pointer items-center px-3.5 py-2.5 duration-150"
        :class="{ 'bg-white': detailVisible }"
        @click="detailVisible = !detailVisible"
      >
        <div class="flex w-60 shrink-0">
          <cy-icon-text
            icon="mdi:book-outline"
            :text-color="detailVisible ? 'red-70' : 'primary-90'"
          >
            {{ item.name }}
          </cy-icon-text>
        </div>
        <div class="text-primary-40 text-sm">
          {{ t(`trait-query.category.${item.category}`) }}
        </div>
      </div>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="pl-9.5 max-w-full bg-white pb-3.5 pr-3">
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
