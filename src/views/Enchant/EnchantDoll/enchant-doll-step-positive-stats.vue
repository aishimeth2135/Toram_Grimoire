<template>
  <EnchantDollStepWrapper :step-id="StepIds.SelectPositiveStat">
    <div>
      <div class="gap-icon text-fuchsia-60 inline-flex items-center">
        <cy-icon icon="gg-menu-left-alt" class="text-primary-30" />
        {{ t('enchant-doll.select-positives.title') }}
      </div>
    </div>
    <div class="mt-1 pl-4 text-sm">
      {{ t('enchant-doll.select-positives.caption') }}
    </div>
    <div class="my-4 flex justify-center">
      <div class="border-fuchsia-60 mt-2 max-w-xs border">
        <template v-if="doll.positiveStats.length !== 0">
          <cy-list-item v-for="stat in doll.positiveStats" :key="stat.statId">
            <div
              class="gap-icon inline-flex w-full items-center"
              :class="stat.value >= 0 ? 'text-primary-90' : 'text-orange-60'"
            >
              <cy-icon class="text-primary-30" />
              {{ stat.showAmount() }}
            </div>
            <div class="mt-1 flex w-full items-center">
              <cy-input-counter
                v-model:value="stat.value"
                inline
                max-button
                min-button
                :range="[1, stat.limit.max]"
              />
              <cy-button-icon
                icon="jam-close-circle"
                class="text-gray-60 ml-auto"
                @click="doll.removePositiveStat(stat)"
              />
            </div>
          </cy-list-item>
        </template>
        <cy-default-tips v-else icon="fluent-leaf-two-16-regular" class="mx-6 my-4">
          {{ t('enchant-doll.tips.no-stat-selected') }}
        </cy-default-tips>
      </div>
    </div>
    <div class="text-center">
      <cy-button-action
        icon="ic-round-add-circle-outline"
        @click="openSelectItem(SelectItemModes.Positive)"
      >
        {{ t('enchant-doll.select-item') }}
      </cy-button-action>
    </div>
    <div class="mt-4 flex justify-center">
      <cy-button-check v-model:selected="positiveStatsState.autoFill">
        {{ t('enchant-doll.select-positives.auto-fill') }}
      </cy-button-check>
    </div>
    <div class="flex justify-center pt-4">
      <cy-button-plain
        v-model:selected="useShorthand"
        :icon="useShorthand ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
        color="secondary"
      >
        {{ t('enchant-doll.select-positives.use-shorthand') }}
      </cy-button-plain>
    </div>
    <div v-if="useShorthand" class="flex justify-center">
      <div class="inline-block">
        <div class="flex items-center justify-center">
          <cy-title-input
            v-model:value="statsShorthand"
            class="max-w-sm"
            icon="ic:round-text-format"
            @keyup.enter="appendShortHandStats"
          />
          <cy-button-circle
            icon="ic-round-done"
            small
            class="ml-1.5"
            :disabled="statsShorthand === ''"
            @click="appendShortHandStats"
          />
        </div>
        <div v-if="shortHandStatItems.length > 0" class="text-primary-50 px-1 pt-1">
          <div
            v-for="{ origin, type, value } in shortHandStatItems"
            :key="origin.statBase.getStatId(type)"
          >
            {{ origin.statBase.show(type, value) }}
          </div>
        </div>
        <div v-else class="text-primary-30 text-center">ex: AD3CD%CDC</div>
      </div>
    </div>
  </EnchantDollStepWrapper>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import EnchantDollStepWrapper from './enchant-doll-step-wrapper.vue'

import { EnchantDollInjectionKey } from './injection-keys'
import { SelectItemModes, StepIds, setupParseEnchantShorthand } from './setup'

const { doll, openSelectItem, positiveStatsState } = inject(EnchantDollInjectionKey)!
const { t } = useI18n()

const useShorthand = ref(false)
const statsShorthand = ref('')

const { enchantShortHandStatItems: shortHandStatItems } = setupParseEnchantShorthand(statsShorthand)

const appendShortHandStats = () => {
  shortHandStatItems.value.forEach(({ origin, type, value }) => {
    if (doll.value.hasPositiveStat(origin, type)) {
      return
    }
    const _value = value === null ? origin.getLimit(type).max : value
    doll.value.appendPositiveStat(origin, type, _value) // ignore failed
  })
  statsShorthand.value = ''
}
</script>
