<template>
  <cy-list-item v-if="disabled" class="skill-item">
    <div class="line-content">
      <cy-icon-text icon-color="gray-light" text-color="gray" class="ml-3 my-1">
        <cy-icon :icon="skillIconPath" src="image" class="skill-icon" />
      </cy-icon-text>
      <div class="text-gray ml-4">
        {{ $lang('skill management/skill disabled') }}
      </div>
    </div>
  </cy-list-item>
  <cy-list-item
    v-else-if="branchStates.length === 1"
    class="skill-item"
    :class="{ 'state-disabled': levelSkillStateRoot.disabled }"
  >
    <div class="line-content">
      <cy-button
        text-color="purple"
        type="check"
        :selected="!levelSkillStateRoot.disabled"
        @click.stop="toggleStateRootDisable(levelSkillStateRoot)"
      >
        <cy-icon :icon="skillIconPath" src="image" class="skill-icon" />
      </cy-button>
      <div class="branch-content">
        <div
          v-if="firstBranchState.handler.infoType == 'caption'"
          class="caption"
          v-html="firstBranchState.handler.value.caption"
        />
        <show-stat-datas
          v-else-if="firstBranchState.handler.value.stats.length != 0"
          :stat-datas="firstBranchState.handler.value.stats"
        />
        <div v-else>
          NONE
        </div>
      </div>
      <span class="ml-auto">
        <cy-button
          v-if="firstBranchState.handler.hasUserSets"
          icon="ic-baseline-settings"
          type="icon"
          class="p-0"
          @click="openUserSetsWindow(firstBranchState.handler)"
        />
        <cy-button
          v-if="hasExtraContent"
          type="icon"
          class="p-0"
          :icon="'ic-round-keyboard-arrow-' + (extraContentVisible ? 'up' : 'down')"
          icon-color="purple"
          @click="toggleExtraContentVisible"
        />
      </span>
    </div>
    <cy-transition type="fade">
      <div
        v-if="hasExtraContent && extraContentVisible"
        class="extra-content"
      >
        <div
          v-for="state in firstBranchState.handler.value.conditionDatas"
          :key="state.iid"
          class="branch-content condition-container"
        >
          <cy-icon-text icon="ic-round-add" text-color="light-3" class="condition">
            {{ state.condition }}
          </cy-icon-text>
          <div v-if="state.caption" class="caption" v-html="state.caption" />
          <show-stat-datas v-else :stat-datas="state.stats" />
        </div>
      </div>
    </cy-transition>
  </cy-list-item>
  <cy-list-item
    v-else
    class="skill-item"
    :class="{ 'state-disabled': levelSkillStateRoot.disabled }"
  >
    <div class="line-content">
      <cy-button
        text-color="purple"
        type="check"
        :selected="!levelSkillStateRoot.disabled"
        @click.stop="toggleStateRootDisable(levelSkillStateRoot)"
      >
        <cy-icon :icon="skillIconPath" src="image" class="skill-icon" />
      </cy-button>
      <div class="branch-content">
        <div class="ml-1">
          {{ $lang('skill management/skill multiple effects') }}
        </div>
      </div>
      <cy-button
        class="p-0 ml-auto"
        type="icon"
        :icon="'ic-round-keyboard-arrow-' + (extraContentVisible ? 'up' : 'down')"
        icon-color="purple"
        @click="toggleExtraContentVisible"
      />
    </div>
    <cy-transition type="fade">
      <div
        v-if="extraContentVisible"
        class="extra-content"
      >
        <div
          v-for="branchState in branchStates"
          :key="branchState.iid"
          class="branch"
          :class="{ 'state-disabled': !levelSkillStateRoot.disabled && branchState.disabled }"
        >
          <div class="line-content">
            <cy-button
              text-color="purple"
              type="check"
              :selected="!branchState.disabled"
              @click.stop="toggleBranchStateDisable(branchState)"
            >
              {{ branchState.origin.attrs['name'] || $lang('skill management/default name of skill branch') }}
            </cy-button>
            <div class="branch-content">
              <div
                v-if="branchState.handler.infoType == 'caption'"
                class="caption"
                v-html="branchState.handler.value.caption"
              />
              <show-stat-datas
                v-else-if="branchState.handler.value.stats.length != 0"
                :stat-datas="branchState.handler.value.stats"
              />
            </div>
            <cy-button
              v-if="branchState.handler.hasUserSets"
              icon="ic-baseline-settings"
              type="icon"
              class="p-0 ml-auto"
              @click="openUserSetsWindow(branchState.handler)"
            />
          </div>
          <div
            v-for="state in branchState.handler.value.conditionDatas"
            :key="state.iid"
            class="branch-content condition-container"
          >
            <cy-icon-text icon="ic-round-add" text-color="light-3" class="condition">
              {{ state.condition }}
            </cy-icon-text>
            <div v-if="state.caption" class="caption" v-html="state.caption" />
            <show-stat-datas v-else :stat-datas="state.stats" />
          </div>
        </div>
      </div>
    </cy-transition>
  </cy-list-item>
</template>

<script>
import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree';

import vue_showStatDatas from './show-stat-datas.vue';

export default {
  RegisterLang: 'Character Simulator',
  components: {
    'show-stat-datas': vue_showStatDatas,
  },
  inject: ['openUserSetsWindow', 'getValidLevelSkillState'],
  props: ['levelSkillStateRoot'],
  data() {
    return {
      extraContentVisible: false,
    };
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
    disabled() {
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
    },
  },
  methods: {
    toggleExtraContentVisible() {
      this.extraContentVisible = !this.extraContentVisible;
    },
    toggleBranchStateDisable(state) {
      state.disabled = !state.disabled;
    },
    toggleStateRootDisable(state) {
      state.disabled = !state.disabled;
    },
  },
};
</script>

<style lang="less" scoped>
.skill-item {
  cursor: auto;
}

.state-disabled {
  opacity: 0.7;
}

.line-content {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;

  + .branch-content {
    margin-top: 0.4rem;
  }
}

.branch-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

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

.skill-icon {
  --icon-width: 1.6rem;
}
</style>
