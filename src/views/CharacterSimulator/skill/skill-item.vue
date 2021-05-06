<template>
  <cy-list-item v-if="disable" class="skill-item">
    <cy-flex-layout class="line-content">
      <cy-icon-text icon="gg-shape-rhombus"
        icon-color="gray-light" text-color="gray">
        <span class="skill-icon-container">
          <img :src="skillIconPath" class="skill-icon">
        </span>
      </cy-icon-text>
      <div class="skill-disable-tips">
        {{ $lang('skill management/skill disable') }}
      </div>
    </cy-flex-layout>
  </cy-list-item>
  <cy-list-item v-else-if="branchStates.length == 1"
    class="skill-item" :class="{ 'state-disable': levelSkillStateRoot.disable }">
    <cy-flex-layout class="line-content">
      <cy-icon-text text-color="purple" class="name skill-name"
        :icon="'ic-round-check-box' + (levelSkillStateRoot.disable ? '-outline-blank' : '')"
        @click.stop="toggleStateRootDisable(levelSkillStateRoot)">
        <span class="skill-icon-container">
          <img :src="skillIconPath" class="skill-icon">
        </span>
      </cy-icon-text>
      <div class="branch-content">
        <div v-if="firstBranchState.handler.infoType == 'caption'"
          class="caption" v-html="firstBranchState.handler.value.caption"></div>
        <show-stat-datas v-else-if="firstBranchState.handler.value.stats.length != 0"
          :statDatas="firstBranchState.handler.value.stats" />
        <div v-else>NONE</div>
      </div>
      <template #right-content>
        <cy-button v-if="firstBranchState.handler.hasUserSets"
          icon="ic-baseline-settings"
          type="icon" class="p-0"
          @click="openUserSetsWindow(firstBranchState.handler)" />
        <cy-button v-if="hasExtraContent"
          type="icon" class="p-0"
          :icon="'ic-round-keyboard-arrow-' + (extraContentVisible ? 'up' : 'down')"
          @click="toggleExtraContentVisible" />
      </template>
    </cy-flex-layout>
    <template #extra v-if="hasExtraContent && extraContentVisible">
      <cy-transition type="fade" appear>
        <div class="extra-content">
          <div v-for="state in firstBranchState.handler.value.conditionDatas"
            :key="state.iid" class="branch-content condition-container">
            <cy-icon-text icon="ic-round-add" text-color="light-3" class="condition">
              {{ state.condition }}
            </cy-icon-text>
            <div v-if="state.caption" class="caption" v-html="state.caption"></div>
            <show-stat-datas v-else :statDatas="state.stats" />
          </div>
        </div>
      </cy-transition>
    </template>
  </cy-list-item>
  <cy-list-item v-else class="skill-item" :class="{ 'state-disable': levelSkillStateRoot.disable }">
    <cy-flex-layout class="line-content">
      <cy-icon-text text-color="purple" class="skill-name"
        :icon="'ic-round-check-box' + (levelSkillStateRoot.disable ? '-outline-blank' : '')"
        @click.stop="toggleStateRootDisable(levelSkillStateRoot)">
        <span class="skill-icon-container">
          <img :src="skillIconPath" class="skill-icon">
        </span>
      </cy-icon-text>
      <div class="branch-content">
        <div class="caption">
          {{ $lang('skill management/skill multiple effects') }}
        </div>
      </div>
      <template #right-content>
        <cy-button class="p-0" type="icon"
          :icon="'ic-round-keyboard-arrow-' + (extraContentVisible ? 'up' : 'down')"
          @click="toggleExtraContentVisible" />
      </template>
    </cy-flex-layout>
    <template #extra v-if="extraContentVisible">
      <cy-transition type="fade" appear>
        <div class="extra-content">
          <div v-for="branchState in branchStates" :key="branchState.iid" class="branch"
            :class="{ 'state-disable': !levelSkillStateRoot.disable && branchState.disable }">
            <cy-flex-layout class="line-content">
              <cy-icon-text text-color="purple" class="name skill-name"
                :icon="'ic-round-check-box' + (branchState.disable ? '-outline-blank' : '')"
                @click="toggleBranchStateDisable(branchState)">
                {{ branchState.origin.attrs['name'] || $lang('skill management/default name of skill branch') }}
              </cy-icon-text>
              <div class="branch-content">
                <div v-if="branchState.handler.infoType == 'caption'"
                  class="caption" v-html="branchState.handler.value.caption"></div>
                <show-stat-datas v-else-if="branchState.handler.value.stats.length != 0"
                  :statDatas="branchState.handler.value.stats" />
              </div>
              <template #right-content v-if="branchState.handler.hasUserSets">
                <cy-button icon="ic-baseline-settings" type="icon"
                  class="p-0" @click="openUserSetsWindow(branchState.handler)" />
              </template>
            </cy-flex-layout>
            <div v-for="state in branchState.handler.value.conditionDatas"
              class="branch-content condition-container" :key="state.iid">
              <cy-icon-text icon="ic-round-add" text-color="light-3" class="condition">
                {{ state.condition }}
              </cy-icon-text>
              <div v-if="state.caption" class="caption" v-html="state.caption"></div>
              <show-stat-datas v-else :statDatas="state.stats" />
            </div>
          </div>
        </div>
      </cy-transition>
    </template>
  </cy-list-item>
</template>
<script>
import vue_showStatDatas from "./show-stat-datas.vue";
import { getSkillIconPath } from "@/lib/Skill/utils/DrawSkillTree";

export default {
  RegisterLang: 'Character Simulator',
  props: ['levelSkillStateRoot'],
  inject: ['openUserSetsWindow', 'getValidLevelSkillState'],
  data() {
    return {
      extraContentVisible: false
    }
  },
  computed: {
    skillIconPath() {
      return getSkillIconPath(this.levelSkill.base);
    },
    hasExtraContent() { // only for if (branchStates.length == 1)
      return this.firstBranchState.handler.value.conditionDatas.length !== 0;
    },
    levelSkillState() {
      return this.getValidLevelSkillState(this.levelSkillStateRoot);
    },
    disable() {
      return this.levelSkillState && this.firstBranchState ? false : true;
    },
    levelSkill() {
      return this.levelSkillStateRoot.levelSkill;
    },
    branchStates() {
      return this.levelSkillState.branchStates;
    },
    firstBranchState() {
      return this.branchStates[0];
    }
  },
  methods: {
    toggleExtraContentVisible() {
      this.extraContentVisible = !this.extraContentVisible;
    },
    toggleBranchStateDisable(state) {
      state.disable = !state.disable;
    },
    toggleStateRootDisable(state) {
      state.disable = !state.disable;
    }
  },
  components: {
    'show-stat-datas': vue_showStatDatas
  }
};
</script>
<style lang="less" scoped>

.skill-item {
  cursor: auto;
}

.state-disable {
  opacity: 0.7;
}

.line-content {
  flex-wrap: nowrap;
  align-items: flex-start;
  width: 100%;

  > .name {
    flex-shrink: 0;
  }

  ::v-deep(.right-content) {
    margin-top: 0.15rem;
  }

  + .branch-content {
    margin-top: 0.4rem;
  }
}

.skill-name {
  cursor: pointer;
}

.branch-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  > .caption {
    margin-left: 1rem;
  }

  ::v-deep(.light-text) {
   color: var(--primary-light-4);
    &.text-dark {
      color: var(--primary-gray);
    }
  }
  ::v-deep(.light-text-1) {
    color: var(--primary-water-blue);
    &.text-dark {
      color: var(--primary-blue-green);
    }
  }
  ::v-deep(.light-text-2) {
    color: var(--primary-orange);
  }
  ::v-deep(.multiple-values) {
    border-left: 1px solid var(--primary-light-3);
    border-right: 1px solid var(--primary-light-3);
    margin: 0 0.3rem;
    display: inline-block;
    padding: 0 0.3rem;
  }
}

.counter {
  margin-top: 0.6rem;
}

.extra-content {
  padding: 0.3rem 0.6rem;
}

.branch {
  padding: 0.3rem 0;
}

.condition-container {
  padding: 0.2rem 0;
  padding-left: 0.4rem;
}

.skill-icon-container {
  margin-left: 0.3rem;
  .skill-icon {
    width: 1.6rem;
    height: 1.6rem;
    display: block;
  }
}

.skill-disable-tips {
  padding-left: 0.8rem;
  color: var(--primary-gray);
}
</style>