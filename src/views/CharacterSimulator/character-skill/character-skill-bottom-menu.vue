<script lang="ts" setup>
import { SkillLevelMode, useSkillTreeLevelOptions } from './character-skill-preview-tab/setup'

const { skillLevelIncreaseMode, skillLevelIncreaseSign, skillLevelIncreaseStep } =
  useSkillTreeLevelOptions()

const tabsClass = 'pointer-events-auto rounded-sm border border-primary-20 bg-white mb-2'
</script>

<template>
  <div class="mt-2 flex grow flex-wrap items-center justify-end space-x-3 px-1">
    <cy-tabs v-model="skillLevelIncreaseMode" :class="tabsClass" plain>
      <cy-tab :value="SkillLevelMode.Level" class="flex px-2.5 py-2 hover:bg-primary-10">
        <cy-icon icon="mdi:star-four-points-outline" width="1.25rem" />
      </cy-tab>
      <cy-tab :value="SkillLevelMode.StarGem" class="flex px-2.5 py-2 hover:bg-primary-10">
        <cy-icon icon="mdi:star-four-points-circle-outline" width="1.25rem" />
      </cy-tab>
    </cy-tabs>
    <div class="flex items-center space-x-3">
      <cy-tabs v-model="skillLevelIncreaseSign" :class="tabsClass" plain>
        <cy-tab :value="1" class="flex px-2.5 py-2 hover:bg-primary-10">
          <cy-icon icon="ic:round-add" width="1.25rem" />
        </cy-tab>
        <cy-tab :value="-1" class="flex px-2.5 py-2 hover:bg-primary-10">
          <cy-icon icon="ic:round-remove" width="1.25rem" />
        </cy-tab>
      </cy-tabs>
      <cy-tabs v-model="skillLevelIncreaseStep" :class="tabsClass" plain>
        <cy-tab :value="1" class="flex px-2 py-1.5 hover:bg-primary-10">
          <cy-icon icon="mdi:number-1" width="1.5rem" />
        </cy-tab>
        <cy-tab :value="5" class="flex px-2 py-1.5 hover:bg-primary-10">
          <cy-icon icon="mdi:number-5" width="1.5rem" />
        </cy-tab>
        <cy-tab :value="10" class="flex px-2 py-1.5 hover:bg-primary-10">
          <cy-icon icon="mdi:numeric-10" width="1.5rem" />
        </cy-tab>
      </cy-tabs>
    </div>
  </div>
</template>
