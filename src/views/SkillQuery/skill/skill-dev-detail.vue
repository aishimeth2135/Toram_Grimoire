<template>
  <div class="text-sm divide-y divide-light bg-white">
    <div v-for="eft in skill.effects" :key="eft.effectId" class="py-2">
      <div class="space-y-3 border-l-2 border-light-3 px-3 py-2">
        <div>
          <SkillEquipmentButton :equipments="convertEffectEquipment(eft)" />
        </div>
        <div v-for="(bch, idx) in eft.branches" :key="idx">
          <code class="text-blue-purple">
            {{ `[${bch.id === -1 ? '-' : bch.id}] @${bch.name}` }}
          </code>
          <div class="pl-2 mt-1">
            <div v-for="([key, value]) in bch.props.entries()" :key="key">
              <code>{{ `$${key}:` }}</code>
              <code class="ml-2 text-light-3">{{ value }}</code>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div
          v-for="(history, historyIdx) in eft.historys"
          :key="historyIdx"
          class="border-l-2 border-l-water-blue border-t border-t-water-blue-light px-3 pt-2 pb-3"
        >
          <div class="text-water-blue">{{ `(history-${historyIdx})` }}</div>
          <div>
            <SkillEquipmentButton :equipments="convertEffectEquipment(eft)" />
          </div>
          <div class="mt-2">
            <div v-for="(bch, idx) in history.branches" :key="idx">
              <code class="text-blue-purple">
                {{ `[${bch.id === -1 ? '-' : bch.id}] @${bch.name}` }}
              </code>
              <div class="pl-2 mt-1">
                <div v-for="([key, value]) in bch.props.entries()" :key="key">
                  <code>{{ `$${key}:` }}</code>
                  <code class="ml-2 text-light-3">{{ value }}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Skill } from '@/lib/Skill/Skill'
import { convertEffectEquipment } from '@/lib/Skill/SkillComputingContainer/utils'

import SkillEquipmentButton from './skill-equipment-button.vue'

interface Props {
  skill: Skill;
}

defineProps<Props>()
</script>
