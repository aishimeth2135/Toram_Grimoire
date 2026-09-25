<template>
  <div class="divide-primary-20 divide-y bg-white text-sm">
    <div v-for="eft in skill.effects" :key="eft.effectId" class="py-2">
      <div class="border-primary-50 space-y-3 border-l-4 px-3 py-2">
        <div>
          <SkillEquipmentButton :equipments="convertEffectEquipment(eft)" />
        </div>
        <div v-for="(bch, idx) in eft.branches" :key="idx">
          <code class="text-violet-60">
            {{
              `[${bch.overrideId === -1 ? '-' : bch.overrideId}] @${bch.name.replace(/\s/g, '_')}`
            }}
          </code>
          <div class="mt-1 space-y-1 pl-2">
            <div>
              <div v-for="[key, value] in bch.props.entries()" :key="key">
                <code>{{ `$${key}:` }}</code>
                <code class="text-primary-50 ml-2">{{ value }}</code>
              </div>
            </div>
            <div>
              <div v-for="stat in bch.stats" :key="stat.valueId">
                <code class="text-primary-70">
                  {{ `${stat.baseId}${getStatTypeShorthand(stat)}:` }}
                </code>
                <code class="text-primary-60 ml-2">{{ stat.value }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div
          v-for="(history, historyIdx) in eft.historys"
          :key="historyIdx"
          class="border-t-blue-30 border-l-blue-60 border-l-4 border-t px-3 pb-3 pt-2"
        >
          <div class="text-blue-60">{{ history.date }}</div>
          <div class="mt-2">
            <div v-for="(bch, idx) in history.branches" :key="idx">
              <code class="text-violet-60">
                {{
                  `[${bch.overrideId === -1 ? '-' : bch.overrideId}] @${bch.name.replace(/\s/g, '_')}`
                }}
              </code>
              <div class="mt-1 space-y-1 pl-2">
                <div>
                  <div v-for="[key, value] in bch.props.entries()" :key="key">
                    <code>{{ `$${key}:` }}</code>
                    <code class="text-primary-50 ml-2">{{ value }}</code>
                  </div>
                </div>
                <div>
                  <div v-for="stat in bch.stats" :key="stat.valueId">
                    <code class="text-primary-70">
                      {{ `${stat.baseId}${getStatTypeShorthand(stat)}:` }}
                    </code>
                    <code class="text-primary-60 ml-2">{{ stat.value }}</code>
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
import { StatTypes } from '@/lib/Character/Stat'
import { Skill } from '@/lib/Skill/Skill'
import { convertEffectEquipment } from '@/lib/Skill/SkillComputing'

import SkillEquipmentButton from '@/components/views/skill/branch/skill-equipment-button.vue'

interface Props {
  skill: Skill
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
