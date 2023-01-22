<template>
  <CardRow :selected="detailVisible">
    <div class="sticky top-0 z-1 min-w-max">
      <div
        class="flex cursor-pointer items-center py-2.5 px-3.5 duration-150 hover:bg-primary-5"
        :class="{ 'bg-white': detailVisible }"
        @click="detailVisible = !detailVisible"
      >
        <div class="flex w-60 flex-shrink-0">
          <cy-icon-text
            icon="mdi:book-outline"
            :text-color="detailVisible ? 'red-70' : 'primary-90'"
          >
            {{ item.name }}
          </cy-icon-text>
        </div>
        <div
          v-if="registletQueryState.displayMode === 'category'"
          class="text-primary-40"
        >
          {{ t(`registlet-query.category.${item.category.id}`) }}
        </div>
        <template
          v-else-if="registletQueryState.displayMode === 'obtain-levels'"
        >
          <div
            v-if="item.obtainLevels.length > 0"
            class="flex items-center space-x-2"
          >
            <div
              v-for="level in item.obtainLevels"
              :key="level"
              class="rounded bg-emerald-5 px-2 text-emerald-60"
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
      <div
        v-if="detailVisible"
        class="max-w-full bg-white pt-1.5 pb-3 pl-4 pr-3"
      >
        <div
          class="mt-1 mb-2 rounded border border-l-2 border-red-10 py-3 px-4"
        >
          <!-- prettier-ignore-attribute v-if -->
          <div v-if="(item.link instanceof StatBase)" class="flex items-center">
            <div>{{ item.link.text }}</div>
            <div>+</div>
            <div class="ml-2 border-x border-primary-20 px-2 text-primary-60">
              {{ handleValue(item.rows[0].value) }}
            </div>
          </div>
          <div v-else class="space-y-2">
            <template v-for="row in item.rows" :key="row.type + row.value">
              <RenderCaptionValue
                v-if="row.type === 'caption'"
                :text="row.value"
              />
              <div
                v-else-if="row.type === 'remark'"
                class="text-sm text-primary-40"
              >
                {{ row.value }}
              </div>
            </template>
          </div>
        </div>
        <div>
          <table class="border-separate border-spacing-y-2 border-spacing-x-4">
            <tr>
              <td class="text-right text-sm text-stone-40">
                {{ t('registlet-query.detail.obtain-levels') }}
              </td>
              <td class="text-primary-60">
                <div
                  v-if="item.obtainLevels.length > 0"
                  class="flex items-center space-x-2"
                >
                  <div
                    v-for="level in item.obtainLevels"
                    :key="level"
                    class="rounded bg-emerald-5 px-2 text-emerald-60"
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
              <td class="text-right text-sm text-stone-40">
                {{ t('registlet-query.detail.max-level') }}
              </td>
              <td class="text-primary-60">
                {{ item.maxLevel }}
              </td>
            </tr>
            <tr>
              <td class="text-right text-sm text-stone-40">
                {{ t('registlet-query.detail.powder-cost') }}
              </td>
              <td class="text-primary-60">
                <span>{{ item.powderCost }}</span>
                <span class="ml-3 text-blue-40">
                  {{ `(${item.powderCostAdditional})` }}
                </span>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </cy-transition>
  </CardRow>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { StatBase } from '@/lib/Character/Stat'
import { RegistletItemBase } from '@/lib/Registlet/Registlet'

import CardRow from '@/components/card/card-row.vue'

import { getRegistletCaptionRender, useRegistletQueryState } from './setup'

interface Props {
  item: RegistletItemBase
}

defineProps<Props>()

const { t } = useI18n()
const registletQueryState = useRegistletQueryState()

const detailVisible = ref(registletQueryState.itemDefaultVisible)

watch(
  () => registletQueryState.itemDefaultVisible,
  value => {
    detailVisible.value = value
  }
)

const handleValue = (str: string) =>
  str
    .replace(/Lv/g, t('registlet-query.detail.registlet-level'))
    .replace(/\*/g, '×')

const RenderCaptionValue = getRegistletCaptionRender(handleValue)
</script>
