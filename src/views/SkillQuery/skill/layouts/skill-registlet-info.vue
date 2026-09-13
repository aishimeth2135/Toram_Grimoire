<template>
  <div class="relative rounded-sm border-2 border-l-4 border-emerald-30 bg-white pt-2.5">
    <div class="flex items-start pb-3 pl-2.5">
      <IconCircle icon="game-icons:beveled-star" color="emerald" />
      <div class="pt-1 pr-2 pl-3">
        <div class="flex items-center">
          <div class="text-emerald-60">{{ item.name }}</div>
          <div class="ml-3 text-sm text-emerald-30">
            {{ t('common.Registlet.title') }}
          </div>
        </div>
        <div class="mt-1 flex flex-wrap items-center space-y-2" style="min-height: 2rem">
          <template v-for="row in item.rows" :key="row.type + row.value">
            <RegistletCaptionValue
              v-if="row.type === 'caption'"
              :text="row.value"
              :handle-value="handleValue"
            />
            <div v-else-if="row.type === 'remark'" class="text-sm text-primary-40">
              {{ row.value }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <cy-transition>
      <div v-show="registletItemState.enabled" class="border-t border-emerald-20 px-4 pt-4 pb-3">
        <div>
          <cy-input-counter
            v-model:value="registletItemState.level /* eslint-disable-line vue/no-mutating-props */"
            :title="t('skill-query.registlet-level')"
            :range="[0, registletItemState.item.maxLevel]"
          />
          <div class="mt-3 flex items-center pl-0.5 text-sm text-primary-30">
            <cy-icon icon="mdi:arrow-up-bold-outline" class="mr-1 text-inherit" small />
            {{ t('skill-query.registlet-max-level-title') }}
            <div class="ml-2 text-primary-50">
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
      class="absolute top-1.5 right-0"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import RegistletCaptionValue from '@/components/common/registlet-caption-value.vue'

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
</script>
