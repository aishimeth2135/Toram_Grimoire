<template>
  <div class="text-sm divide-y divide-light bg-white">
    <div v-for="eft in skill.effects" :key="eft.effectId" class="py-2">
      <div class="space-y-3 border-l-2 border-primary-50 px-3 py-2">
        <div>
          <SkillEquipmentButton :equipments="convertEffectEquipment(eft)" />
        </div>
        <div v-for="(bch, idx) in eft.branches" :key="idx">
          <code class="text-violet-60">
            {{ `[${bch.id === -1 ? '-' : bch.id}] @${bch.name}` }}
          </code>
          <div class="pl-2 mt-1 space-y-1">
            <div>
              <div v-for="([key, value]) in bch.props.entries()" :key="key">
                <code>{{ `$${key}:` }}</code>
                <code class="ml-2 text-primary-50">{{ value }}</code>
              </div>
            </div>
            <div>
              <div v-for="stat in bch.stats" :key="stat.valueId">
                <code class="text-primary-70">{{ `${stat.baseId}${getStatTypeShorthand(stat)}:` }}</code>
                <code class="ml-2 text-primary-60">{{ stat.value }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div
          v-for="(history, historyIdx) in eft.historys"
          :key="historyIdx"
          class="border-l-2 border-l-blue-60 border-t border-t-blue-30 px-3 pt-2 pb-3"
        >
          <div class="text-blue-60">{{ history.date }}</div>
          <div class="mt-2">
            <div v-for="(bch, idx) in history.branches" :key="idx">
              <code class="text-violet-60">
                {{ `[${bch.id === -1 ? '-' : bch.id}] @${bch.name}` }}
              </code>
              <div class="pl-2 mt-1 space-y-1">
                <div>
                  <div v-for="([key, value]) in bch.props.entries()" :key="key">
                    <code>{{ `$${key}:` }}</code>
                    <code class="ml-2 text-primary-50">{{ value }}</code>
                  </div>
                </div>
                <div>
                  <div v-for="stat in bch.stats" :key="stat.valueId">
                    <code class="text-primary-70">{{ `${stat.baseId}${getStatTypeShorthand(stat)}:` }}</code>
                    <code class="ml-2 text-primary-60">{{ stat.value }}</code>
                  </div>
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
import { StatComputed } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat/enums'
import { Skill } from '@/lib/Skill/Skill'
import { convertEffectEquipment } from '@/lib/Skill/SkillComputingContainer/utils'

import SkillEquipmentButton from './skill-equipment-button.vue'

interface Props {
  skill: Skill;
}

defineProps<Props>()

const getStatTypeShorthand = (stat: StatComputed) => {
  if (stat.type === StatTypes.Multiplier) {
    return '%'
  }
  if (stat.type === StatTypes.Total) {
    return '~'
  }
  return ''
}
</script>
