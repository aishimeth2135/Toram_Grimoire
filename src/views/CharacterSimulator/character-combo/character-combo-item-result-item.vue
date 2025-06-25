<template>
  <div>
    <div class="flex items-center">
      <div class="mr-3 flex shrink-0">
        <cy-button-toggle
          v-model:selected="branchItemState.enabled"
          :disabled="container.statContainers.length === 0"
        >
          {{ container.get('name') || t('skill-query.branch.effect.base-name') }}
        </cy-button-toggle>
      </div>
      <div v-if="container.branchItem.buffs" class="space-x-3">
        <div v-for="buff in container.branchItem.buffs.items" :key="buff" class="text-orange-60">
          {{ t(`skill-query.skill-buffs.${buff}.title`) }}
        </div>
      </div>
      <div>
        <CharacterSkillItemStats :stat-containers="container.statContainers" />
      </div>
    </div>
    <div class="pl-4">
      <div
        v-for="suffixContainer in result.suffixContainers"
        :key="suffixContainer.instanceId"
        :container="suffixContainer"
        class="flex items-center"
      >
        <div class="mr-3 flex shrink-0">
          <cy-button-toggle
            v-model:selected="
              characterStore.getDamageCalculationSkillBranchState(
                suffixContainer.branchItem.default
              ).enabled
            "
            :disabled="suffixContainer.statContainers.length === 0"
          >
            {{ suffixContainer.get('name') || t('skill-query.branch.effect.base-name') }}
          </cy-button-toggle>
        </div>
        <div>
          <CharacterSkillItemStats :stat-containers="suffixContainer.statContainers" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import type { SkillResult } from '@/stores/views/character/setup'

import CharacterSkillItemStats from '../character-skill/character-skill-tab/character-skill-item-stats.vue'

interface Props {
  result: SkillResult
}

const props = defineProps<Props>()

const characterStore = useCharacterStore()
const { t } = useI18n()

const container = computed(() => props.result.container)

const branchItemState = computed(() =>
  characterStore.getDamageCalculationSkillBranchState(container.value.branchItem.default)
)
</script>
