<template>
  <CardRow class="px-1 py-2.5">
    <div class="flex h-full items-center">
      <div class="flex-shrink-0 self-stretch pl-2 pr-3">
        <div
          class="flex rounded-full border-1 border-primary-30 bg-white p-1.5"
        >
          <cy-icon :path="skillIconPath" width="1.5rem" />
        </div>
      </div>
      <div class="w-full pr-3 pt-1">
        <div class="text-primary-80">
          {{ skill.name }}
        </div>
        <div class="flex flex-wrap items-center">
          <div class="flex items-center" @click="skillLevelInput?.select()">
            <div class="mr-1 text-primary-40">Lv.</div>
            <div class="text-primary-70">{{ innerValue }}</div>
            <!-- <div>
              <input
                ref="skillLevelInput"
                v-model="innerValue"
                type="number"
                class="w-8 bg-transparent text-primary-70"
              />
            </div> -->
          </div>
          <!-- <div class="ml-3 flex items-center space-x-1">
            <cy-button-icon
              icon="ic-round-remove-circle-outline"
              @click="incValue(-1)"
            />
            <cy-button-icon
              icon="ic-round-add-circle-outline"
              @click="incValue(1)"
            />
          </div> -->
        </div>
      </div>
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Ref } from 'vue'
import { ref } from 'vue'

import { Skill } from '@/lib/Skill/Skill'
import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

import CardRow from '@/components/card/card-row.vue'

interface Props {
  skill: Skill
  skillLevel: number
}
interface Emits {
  (evt: 'update:skill-level', value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const skillLevelInput: Ref<HTMLInputElement | null> = ref(null)

const skillIconPath = computed(() => getSkillIconPath(props.skill))

const innerValue = computed<number>({
  get() {
    return props.skillLevel
  },
  set(value) {
    emit('update:skill-level', value)
  },
})

// const incValue = (inc: number) => {
//   innerValue.value = Math.min(Math.max(0, innerValue.value + inc), 10)
// }
</script>
