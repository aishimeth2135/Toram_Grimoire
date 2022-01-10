<template>
  <teleport to="body">
    <cy-transition type="fade" appear>
      <div class="w-full h-full bg-black bg-opacity-50 fixed top-0 left-0 z-100" @click="emit('close')">
        <div style="max-width: 40rem;" class="py-5 mx-auto bg-opacity-100" @click.stop>
          <div>
            <cy-title-input
              ref="searchInputComponent"
              v-model:value="searchText"
              icon="bx:bx-search"
              @keyup.enter="selectSkillFromKeyup"
              @keyup.up="selectedSearchResultIdx -= 1"
              @keyup.down="selectedSearchResultIdx += 1"
              @keyup.esc="emit('close')"
            />
          </div>
          <div
            v-if="searchResult.length !== 0"
            class="bg-white overflow-y-auto mx-2"
            style="max-height: 70vh;"
          >
            <cy-list-item
              v-for="(skill, idx) in searchResult"
              :key="skill.skillId"
              :selected="selectedSearchResultIdx === idx"
              @click="emit('submit', skill)"
            >
              <SkillTitle :skill="skill" />
            </cy-list-item>
          </div>
        </div>
      </div>
    </cy-transition>
  </teleport>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { Ref, ComputedRef, WritableComputedRef } from 'vue';

import { useDatasStore } from '@/stores/app/datas';

import { Skill, SkillRoot } from '@/lib/Skill/Skill';

import SkillTitle from './skill/skill-title.vue';

interface Emits {
  (evt: 'submit', skill: Skill): void;
  (evt: 'close'): void;
}

const emit = defineEmits<Emits>();

const datasStore = useDatasStore();
const skillRoot: ComputedRef<SkillRoot> = computed(() => datasStore.Skill!.skillRoot);

const searchText = ref('');

const searchResult: ComputedRef<Skill[]> = computed(() => {
  if (searchText.value === '') {
    return [];
  }
  const result: Skill[] = [];
  skillRoot.value.skillTreeCategorys.forEach(stc => {
    stc.skillTrees.forEach(st => {
      const matchedSkills = st.skills.filter(skill => skill.name.includes(searchText.value));
      result.push(...matchedSkills);
    });
  });
  return result;
});

const _selectedSearchResultIdx = ref(-1);
const selectedSearchResultIdx: WritableComputedRef<number> = computed({
  get() {
    return _selectedSearchResultIdx.value;
  },
  set(value) {
    if (value >= searchResult.value.length) {
      value = searchResult.value.length - 1;
    }
    if (value < 0) {
      value = 0;
    }
    _selectedSearchResultIdx.value = value;
  },
});

watch(searchResult, () => {
  selectedSearchResultIdx.value = 0;
});

const selectSkillFromKeyup = () => {
  const skill = searchResult.value[selectedSearchResultIdx.value];
  if (skill) {
    emit('submit', skill);
  }
};

const searchInputComponent: Ref<{ focus: Function } | null> = ref(null);

onMounted(async () => {
  await nextTick();
  searchInputComponent.value?.focus();
});
</script>