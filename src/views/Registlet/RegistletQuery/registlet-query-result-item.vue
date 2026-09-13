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
        <div v-if="registletQueryState.displayMode === 'category'" class="text-sm text-primary-40">
          {{ t(`registlet-query.category.${item.category.id}`) }}
        </div>
        <template v-else-if="registletQueryState.displayMode === 'obtain-level'">
          <div v-if="item.obtainLevels.length > 0" class="flex items-center space-x-2 text-sm">
            <div
              v-for="level in item.obtainLevels"
              :key="level"
              class="rounded-sm bg-emerald-5 px-2 text-emerald-60"
            >
              {{ level }}
            </div>
          </div>
          <div v-else class="text-sm text-emerald-50">
            {{ t('registlet-query.detail.obtain-levels-all') }}
          </div>
        </template>
      </div>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="max-w-full bg-white pt-1.5 pr-3 pb-3 pl-4">
        <div class="mt-1 mb-2 rounded-sm border border-l-4 border-red-10 px-4 py-3">
          <RegistletCaption :registlet-item="item" rows-class="space-y-2" />
        </div>
        <div>
          <table class="border-separate border-spacing-x-4 border-spacing-y-2">
            <tbody>
              <tr>
                <td class="text-right text-sm text-gray-40">
                  {{ t('registlet-query.detail.obtain-levels') }}
                </td>
                <td class="text-primary-60">
                  <div v-if="item.obtainLevels.length > 0" class="flex items-center space-x-2">
                    <div
                      v-for="level in item.obtainLevels"
                      :key="level"
                      class="rounded-sm bg-emerald-5 px-2 text-emerald-60"
                    >
                      {{ level }}
                    </div>
                  </div>
                  <template v-else>
                    {{ t('registlet-query.detail.obtain-levels-all') }}
                  </template>
                </td>
              </tr>
              <tr>
                <td class="text-right text-sm text-gray-40">
                  {{ t('registlet-query.detail.max-level') }}
                </td>
                <td class="text-primary-60">
                  {{ item.maxLevel }}
                </td>
              </tr>
              <tr>
                <td class="text-right text-sm text-gray-40">
                  {{ t('registlet-query.detail.powder-cost') }}
                </td>
                <td class="text-primary-60">
                  <span>{{ item.powderCost }}</span>
                  <span class="ml-3 text-blue-40">
                    {{ `(${item.powderCostAdditional})` }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </cy-transition>
  </CardRow>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { RegistletItemBase } from '@/lib/Registlet/RegistletItem'

import CardRow from '@/components/card/card-row.vue'
import RegistletCaption from '@/components/common/registlet-caption.vue'

import { useRegistletQueryState } from './setup'

interface Props {
  item: RegistletItemBase
}

defineProps<Props>()

const { t } = useI18n()
const { registletQueryState } = useRegistletQueryState()

const detailVisible = ref(registletQueryState.itemDefaultVisible)

watch(
  () => registletQueryState.itemDefaultVisible,
  value => {
    detailVisible.value = value
  }
)
</script>
