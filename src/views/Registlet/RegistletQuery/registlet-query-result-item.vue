<template>
  <CardRow :selected="detailVisible">
    <div class="z-1 sticky top-0 min-w-max">
      <div
        class="hover:bg-primary-5 flex cursor-pointer items-center px-3.5 py-2.5 duration-150"
        :class="{ 'bg-white': detailVisible }"
        @click="detailVisible = !detailVisible"
      >
        <div class="flex w-60 shrink-0">
          <div
            class="gap-icon inline-flex items-center"
            :class="detailVisible ? 'text-red-70' : 'text-primary-90'"
          >
            <cy-icon icon="mdi:book-outline" class="text-primary-30" />
            {{ item.name }}
          </div>
        </div>
        <div v-if="registletQueryState.displayMode === 'category'" class="text-primary-40 text-sm">
          {{ t(`registlet-query.category.${item.category.id}`) }}
        </div>
        <template v-else-if="registletQueryState.displayMode === 'obtain-level'">
          <div v-if="item.obtainLevels.length > 0" class="flex items-center space-x-2 text-sm">
            <div
              v-for="level in item.obtainLevels"
              :key="level"
              class="bg-emerald-5 text-emerald-60 rounded-sm px-2"
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
      <div v-if="detailVisible" class="max-w-full bg-white pb-3 pl-4 pr-3 pt-1.5">
        <div class="border-red-10 mb-2 mt-1 rounded-sm border border-l-4 px-4 py-3">
          <RegistletCaption :registlet-item="item" rows-class="space-y-2" />
        </div>
        <div>
          <table class="border-separate border-spacing-x-4 border-spacing-y-2">
            <tbody>
              <tr>
                <td class="text-gray-40 text-right text-sm">
                  {{ t('registlet-query.detail.obtain-levels') }}
                </td>
                <td class="text-primary-60">
                  <div v-if="item.obtainLevels.length > 0" class="flex items-center space-x-2">
                    <div
                      v-for="level in item.obtainLevels"
                      :key="level"
                      class="bg-emerald-5 text-emerald-60 rounded-sm px-2"
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
                <td class="text-gray-40 text-right text-sm">
                  {{ t('registlet-query.detail.max-level') }}
                </td>
                <td class="text-primary-60">
                  {{ item.maxLevel }}
                </td>
              </tr>
              <tr>
                <td class="text-gray-40 text-right text-sm">
                  {{ t('registlet-query.detail.powder-cost') }}
                </td>
                <td class="text-primary-60">
                  <span>{{ item.powderCost }}</span>
                  <span class="text-blue-40 ml-3">
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
