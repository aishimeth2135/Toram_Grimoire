<template>
  <section v-if="skillBuilds.length != 0">
    <div class="top">
      <cy-options>
        <template #title>
          <cy-list-item>
            <cy-icon-text icon="ant-design:build-outlined">
              {{ currentSkillBuild ? currentSkillBuild.name : 'NONE' }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <template #options>
          <cy-list-item
            v-for="(build, i) in skillBuilds"
            :key="build.stateId"
            :selected="i === currentSkillBuildIndex"
            @click="selectCurrentBuild(i)"
          >
            <cy-icon-text>
              {{ build.name }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
    </div>
    <div class="my-3">
      <cy-button-border
        icon="mdi-rhombus-outline"
        :selected="mode === 'passive'"
        @click="setMode('passive')"
      >
        {{ $lang('skill management/passive skills') }}
      </cy-button-border>
      <cy-button-border
        icon="mdi-rhombus-outline"
        :selected="mode === 'active'"
        @click="setMode('active')"
      >
        {{ $lang('skill management/active skills') }}
      </cy-button-border>
    </div>
    <div class="content">
      <template v-if="mode === 'passive' && passiveSkillStates.length !== 0">
        <skill-item
          v-for="state in passiveSkillStates"
          :key="state.levelSkill.base.id + '#' + state.levelSkill.base.name"
          :level-skill-state-root="state"
        />
      </template>
      <template v-else-if="mode === 'active' && activeSkillStates.length !== 0">
        <skill-item
          v-for="state in activeSkillStates"
          :key="state.levelSkill.base.id + '#' + state.levelSkill.base.name"
          :level-skill-state-root="state"
        />
      </template>
      <cy-default-tips v-else icon="mdi-ghost">
        {{ $lang('skill management/there are no skills yet') }}
      </cy-default-tips>
    </div>
    <cy-window
      v-if="userSetsWindow.handler && userSetsWindow.handler.hasUserSets"
      v-model:visible="userSetsWindow.visible"
    >
      <template #title>
        <cy-icon-text icon="mdi-numeric">
          {{ $lang('skill management/user sets: window title') }}
        </cy-icon-text>
      </template>
      <cy-input-counter
        v-for="p in userSetsWindow.handler.validUserSets"
        :key="p.variableName"
        class="counter"
        :value="p.value"
        @update:value="userSetValue(p, $event)"
      >
        <template #title>
          <cy-icon-text>
            {{ p.text }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
      <cy-input-counter
        v-for="p in userSetsWindow.handler.stackStates"
        :key="p.id"
        :range="p.range"
        class="counter"
        :value="p.value"
        @update:value="userSetValue(p, $event)"
      >
        <template #title>
          <cy-icon-text>
            {{ p.name }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
    </cy-window>
  </section>
  <section v-else>
    <cy-default-tips icon="mdi-ghost">
      {{ $lang('skill management/no build has been created') }}
    </cy-default-tips>
  </section>
</template>
<script>
import { mapState, mapGetters } from "vuex";

import vue_skillItem from "./skill-item.vue";

export default {
  RegisterLang: 'Character Simulator',
  provide() {
    return {
      'openUserSetsWindow': this.openUserSetsWindow,
    };
  },
  props: ['characterState', 'passiveSkillStates', 'activeSkillStates'],
  data() {
    return {
      mode: 'passive',
      userSetsWindow: {
        visible: false,
        handler: null,
      },
    };
  },
  created() {
    if (this.skillBuilds.length !== 0)
      this.selectCurrentBuild(0);
  },
  updated() {
    if (this.skillBuilds.length !== 0 && this.currentSkillBuildIndex < 0)
      this.selectCurrentBuild(0);
  },
  computed: {
    ...mapState('character/skill', {
      'skillBuilds': 'skillBuilds',
      'currentSkillBuildIndex': 'currentSkillBuildIndex',
    }),
    ...mapGetters('character/skill', {
      'currentSkillBuild': 'currentSkillBuild',
    }),
  },
  methods: {
    setMode(mode) {
      this.mode = mode;
    },
    selectCurrentBuild(idx) {
      this.$store.commit('character/skill/setCurrentSkillBuild', { index: idx })
    },
    openUserSetsWindow(handler) {
      this.userSetsWindow.handler = handler;
      this.userSetsWindow.visible = true;
    },
    userSetValue(state, value) {
      state.value = value;
      // this.userSetsWindow.handler.notifyValueUpdate();
    },
  },
  components: {
    'skill-item': vue_skillItem,
  },
};
</script>
<style lang="less" scoped>
.top {
  border-bottom: 0.1rem solid var(--primary-light);
  padding: 0.5rem 0.6rem;

  > .select-build {
    padding-left: 0.7rem;
    margin-top: 0.6rem;
    padding-bottom: 0.4rem;
  }
}
</style>
