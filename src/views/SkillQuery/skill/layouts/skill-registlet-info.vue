<template>
  <div
    class="relative rounded border-1 border-l-2 border-emerald-30 bg-white pb-2 pt-2.5"
  >
    <div class="flex items-start pb-0.5 pl-2.5">
      <IconCircle icon="game-icons:beveled-star" icon-color="emerald-30" />
      <div class="pl-3 pr-2 pt-1">
        <div class="flex items-center">
          <div class="text-emerald-60">{{ item.name }}</div>
          <div class="ml-3 text-sm text-emerald-30">
            {{ t('common.Registlet.title') }}
          </div>
        </div>
        <div
          class="flex flex-wrap items-center space-y-2"
          style="min-height: 2rem"
        >
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
    </div>
    <cy-transition>
      <div
        v-show="registletItemState.enabled"
        class="mt-2 border-t border-emerald-20 px-4 pb-2 pt-4"
      >
        <div>
          <cy-input-counter
            v-model:value="
              registletItemState.level /* eslint-disable-line vue/no-mutating-props */
            "
            :title="t('skill-query.registlet-level')"
            :range="[0, registletItemState.item.maxLevel]"
          />
          <div class="mt-3 inline-flex items-center pl-0.5">
            <cy-icon-text
              icon="mdi:arrow-up-bold-outline"
              color="primary-30"
              single-color
              small
            >
              {{ t('skill-query.registlet-max-level-title') }}
            </cy-icon-text>
            <div class="ml-2 text-sm text-primary-50">
              {{ registletItemState.item.maxLevel }}
            </div>
          </div>
        </div>
      </div>
    </cy-transition>
    <cy-button-toggle
      v-model:selected="
        // eslint-disable-next-line vue/no-mutating-props
        registletItemState.enabled
      "
      color="emerald"
      class="absolute right-0 top-1.5"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { getRegistletCaptionRender } from '@/views/Registlet/RegistletQuery/setup'

import IconCircle from './skill-branch-layout-icon-circle.vue'

import type { SkillRegistletItemState } from '../../setup'

interface Props {
  registletItemState: SkillRegistletItemState
}

const props = defineProps<Props>()

const item = computed(() => props.registletItemState.item)

const { t } = useI18n()

const handleValue = (str: string) =>
  str.replace(/Lv/g, t('skill-query.registlet-level-abbreviation'))

const RenderCaptionValue = getRegistletCaptionRender(handleValue)
</script>
