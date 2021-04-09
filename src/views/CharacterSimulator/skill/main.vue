<template>
  <section v-if="skillBuilds.length != 0">
    <div class="top">
      <cy-options>
        <template #title>
          <cy-list-item>
            <cy-icon-text iconify-name="ant-design:build-outlined">
              {{ currentSkillBuild ? currentSkillBuild.name : 'NONE' }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <template #options>
          <cy-list-item v-for="(build, i) in skillBuilds" :key="build.stateId"
            :selected="i == currentSkillBuildIndex"
            @click="selectCurrentBuild(i)">
            <cy-icon-text iconify-name="gg-shape-rhombus">
              {{ build.name }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
    </div>
    <div class="top-sub">
      <cy-button type="border" iconify-name="mdi-rhombus-outline"
        :selected="mode == 'passive'"
        @click="setMode('passive')">
        {{ langText('skill management/passive skills') }}
      </cy-button>
      <cy-button type="border" iconify-name="mdi-rhombus-outline"
        :selected="mode == 'active'"
        @click="setMode('active')">
        {{ langText('skill management/active skills') }}
      </cy-button>
    </div>
    <div class="content">
      <template v-if="mode == 'passive' && passiveSkillStates.length != 0">
        <skill-item v-for="state in passiveSkillStates"
          :level-skill-state-root="state"
          :key="state.levelSkill.base.id + '#' + state.levelSkill.base.name" />
      </template>
      <template v-else-if="mode == 'active' && activeSkillStates.length != 0">
        <skill-item v-for="state in activeSkillStates"
          :level-skill-state-root="state"
          :key="state.levelSkill.base.id + '#' + state.levelSkill.base.name" />
      </template>
      <cy-default-tips v-else iconify-name="mdi-ghost">
        {{ langText('skill management/there are no skills yet') }}
      </cy-default-tips>
    </div>
    <cy-window v-if="userSetsWindow.handler && userSetsWindow.handler.hasUserSets"
      :visible="userSetsWindow.visible"
      @close-window="toggleUserSetsWindowVisible">
      <template #title>
        <cy-icon-text iconify-name="mdi-numeric">
          {{ langText('skill management/user sets: window title') }}
        </cy-icon-text>
      </template>
      <cy-input-counter v-for="p in userSetsWindow.handler.validUserSets"
        :key="p.variableName" :value="p.value" class="counter"
        @set-value="userSetValue(p, $event)">
        <template #title>
          <cy-icon-text iconify-name="gg-shape-rhombus">
            {{ p.text }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
      <cy-input-counter v-for="p in userSetsWindow.handler.stackStates"
        :key="p.id" :value="p.value" :range="p.range" class="counter"
        @set-value="userSetValue(p, $event)">
        <template #title>
          <cy-icon-text iconify-name="gg-shape-rhombus">
            {{ p.name }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
    </cy-window>
  </section>
  <section v-else>
    <cy-default-tips iconify-name="mdi-ghost">
      {{ langText('skill management/no build has been created') }}
    </cy-default-tips>
  </section>
</template>
<script>
import Vuex from "vuex";

import vue_skillItem from "./skill-item.vue";

export default {
  props: ['characterState', 'passiveSkillStates', 'activeSkillStates'],
  inject: ['langText'],
  data() {
    return {
      mode: 'passive',
      userSetsWindow: {
        visible: false,
        handler: null
      }
    };
  },
  provide() {
    return {
      'openUserSetsWindow': this.openUserSetsWindow
    };
  },
  created() {
    if (this.skillBuilds.length != 0)
      this.selectCurrentBuild(0);
  },
  updated() {
    if (this.skillBuilds.length != 0 && this.currentSkillBuildIndex < 0)
      this.selectCurrentBuild(0);
  },
  computed: {
    ...Vuex.mapState('character', {
      'skillBuilds': 'skillBuilds',
      'currentSkillBuildIndex': 'currentSkillBuildIndex'
    }),
    ...Vuex.mapGetters('character', {
      'currentSkillBuild': 'currentSkillBuild'
    })
  },
  methods: {
    setMode(mode) {
      this.mode = mode;
    },
    selectCurrentBuild(idx) {
      this.$store.commit('character/setCurrentSkillBuild', { index: idx })
    },
    toggleUserSetsWindowVisible() {
      this.userSetsWindow.visible = !this.userSetsWindow.visible;
    },
    openUserSetsWindow(handler) {
      this.userSetsWindow.handler = handler;
      this.toggleUserSetsWindowVisible();
    },
    userSetValue(state, value) {
      state.value = value;
      // this.userSetsWindow.handler.notifyValueUpdate();
    }
  },
  components: {
    'skill-item': vue_skillItem
  }
};
</script>
<style lang="less" scoped>
.top-sub {
  margin: 0.8rem 0;
}
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