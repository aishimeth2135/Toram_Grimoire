<template>
  <CardRow class="px-1 py-3">
    <div class="flex h-full items-center">
      <div class="flex-shrink-0 self-stretch pl-2 pr-3">
        <div
          class="flex rounded-full border-1 border-primary-30 bg-white p-1.5"
        >
          <cy-icon :icon="getSkillIconPath(skill)" width="1.5rem" />
        </div>
      </div>
      <div class="w-full pr-3">
        <div class="text-primary-80">
          {{ skill.name }}
        </div>
        <div class="flex flex-wrap items-center">
          <div class="flex items-center" @click="skillLevelInput?.select()">
            <div class="mr-1 text-primary-40">Lv.</div>
            <div>
              <input
                ref="skillLevelInput"
                v-model="editedSkillLevel"
                type="number"
                class="w-8 bg-transparent text-primary-70"
              />
            </div>
          </div>
          <div class="ml-3 flex items-center space-x-1">
            <cy-button-icon
              icon="ic-round-remove-circle-outline"
              @click="incValue(-1)"
            />
            <cy-button-icon
              icon="ic-round-add-circle-outline"
              @click="incValue(1)"
            />
          </div>
        </div>
        <div v-if="skillLevelChanged" class="mt-2 flex items-center">
          <div class="mr-1 text-gray-40">Lv.</div>
          <span class="text-gray-50">{{ skillLevel }}</span>
          <cy-icon
            icon="ic:round-arrow-forward"
            class="mx-1.5 text-primary-20"
          />
          <div class="mr-1 text-primary-40">Lv.</div>
          <span class="text-primary-60">{{ editedSkillLevel }}</span>
        </div>
        <div v-if="skillLevelChanged" class="my-2">
          <div class="mb-4 space-x-3">
            <cy-button-circle
              icon="mdi:done-outline"
              small
              @click="applySkillLevel"
            />
            <cy-button-circle
              icon="mdi:close"
              color="gray"
              small
              @click="cancelEditingSkillLevel"
            />
          </div>
          <div v-if="effectedSkills.length > 0">
            <div class="text-sm text-red-60">
              {{
                t('character-simulator.skill-build.apply-skill-level-tips.0')
              }}
            </div>
            <div class="mt-1 text-sm text-primary-40">
              {{
                t('character-simulator.skill-build.apply-skill-level-tips.1')
              }}
            </div>
            <div class="mt-3 rounded border border-primary-10 p-3">
              <div class="mb-3 text-sm text-gray-50">
                {{ t('character-simulator.skill-build.effected-skills-title') }}
              </div>
              <div
                v-for="effected in effectedSkills"
                :key="effected.skill.id"
                class="flex items-center py-2"
              >
                <div class="flex-shrink-0 self-stretch pr-3">
                  <div
                    class="flex rounded-full border-1 border-primary-20 bg-white p-1.5"
                  >
                    <cy-icon :icon="effected.icon" width="1.5rem" />
                  </div>
                </div>
                <div class="w-full pr-3">
                  <div class="text-primary-80">
                    {{ effected.skill.name }}
                  </div>
                  <div class="flex items-center">
                    <div class="mr-1 text-gray-40">Lv.</div>
                    <span class="text-gray-50">{{ effected.oldLevel }}</span>
                    <cy-icon
                      icon="ic:round-arrow-forward"
                      class="mx-1.5 text-primary-20"
                    />
                    <div class="mr-1 text-primary-40">Lv.</div>
                    <span class="text-primary-60">{{ effected.newLevel }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { Ref, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBuild } from '@/lib/Character/SkillBuild'
import { Skill } from '@/lib/Skill/Skill'
import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

import CardRow from '@/components/card/card-row.vue'

interface Props {
  skillBuild: SkillBuild
  skill: Skill
}

const props = defineProps<Props>()

const { t } = useI18n()

const skillLevelInput: Ref<HTMLInputElement | null> = ref(null)

const skillLevel = computed(() => props.skillBuild.getSkillLevel(props.skill))

const editedSkillLevel = ref(skillLevel.value)
const skillLevelChanged = ref(false)

watch(skillLevel, value => {
  editedSkillLevel.value = value
})

const effectedSkills = computed(() => {
  if (skillLevel.value === editedSkillLevel.value) {
    return []
  }

  return props.skillBuild
    .checkLevelEffectedSkills(props.skill, editedSkillLevel.value)
    .map(({ skill, newLevel }) => ({
      skill,
      icon: getSkillIconPath(skill),
      oldLevel: props.skillBuild.getSkillState(skill).level,
      newLevel,
    }))
})

const applySkillLevel = () => {
  props.skillBuild.setSkillLevel(
    props.skill,
    editedSkillLevel.value,
    effectedSkills.value
  )
  skillLevelChanged.value = false
}

const cancelEditingSkillLevel = () => {
  editedSkillLevel.value = skillLevel.value
  skillLevelChanged.value = false
}

const incValue = (inc: number) => {
  editedSkillLevel.value = Math.min(
    Math.max(0, editedSkillLevel.value + inc),
    10
  )
  skillLevelChanged.value = true

  if (skillLevelChanged.value && effectedSkills.value.length === 0) {
    applySkillLevel()
  }
}
</script>
