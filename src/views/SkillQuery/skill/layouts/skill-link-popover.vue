<template>
  <cy-popover
    v-if="currentSkill"
    tag="span"
    class="inline-block px-0.5"
    triggers="click hover"
    popper-content-class="rounded-md"
  >
    <span class="cursor-pointer text-red-60 underline">
      {{ currentSkill.name }}
    </span>
    <template #popper>
      <div class="flex items-center px-5 py-1">
        <SkillTitle :skill="currentSkill" />
        <cy-button-plain
          icon="carbon:location-current"
          class="ml-4"
          @click="skillQueryState.currentSkill.value = currentSkill"
        >
          {{ t('skill-query.go-to-skill') }}
        </cy-button-plain>
      </div>
    </template>
  </cy-popover>
  <span v-else class="text-red-60">
    {{ name }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import SkillTitle from './skill-title.vue'

import { useSkillQueryState } from '../../setup'

interface Props {
  name: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const currentSkill = computed(() => Grimoire.Skill.skillRoot.findSkillByName(props.name))

const skillQueryState = useSkillQueryState()
</script>
