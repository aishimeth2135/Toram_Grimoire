<template>
  <article class="root--">
    <cy-sticky-header>
      <template v-slot:default>
        <cy-icon-text v-if="currentSkillState"
          icon="bx-bxs-book-alt">
          {{ currentSkillState.skill.name }}
        </cy-icon-text>
        <div class="w-full h-full"
          @mouseenter.stop="toggleSelectSkillTreeWindow(true)" />
      </template>
      <template v-slot:buttons-scope>
        <cy-button v-if="!selectSkillTreeWindowState.visible"
          key="invisible" class="p-0 border-0"
          icon="ic-round-keyboard-arrow-down"
          @mouseenter.stop="toggleSelectSkillTreeWindow(true)"
          @click="toggleSelectSkillTreeWindow(true)">
          {{ $lang('select skill') }}
        </cy-button>
        <cy-button v-else key="visible"
          icon="ic-round-keyboard-arrow-up"
          class="p-0 border-0 bg-white"
          @click="toggleSelectSkillTreeWindow(false)">
          {{ $lang('close select skill') }}
        </cy-button>
      </template>
      <template v-slot:float-menu
        v-if="selectSkillTreeWindowState.visible">
        <div @mouseleave.stop="toggleSelectSkillTreeWindow(false)" class="p-4 pt-8">
          <div>
            <cy-button v-for="(stc, i) in skillRoot.skillTreeCategorys"
              :key="stc.id" icon="bx-bxs-book-content"
              :selected="selectSkillTreeWindowState.currentIndex_stc === i"
              @click="selectSkillTreeCategory(i)">
              {{ stc.name }}
            </cy-button>
          </div>
          <div v-if="currentSkillTreeCategory != null"
            style="border-top: 1px solid var(--primary-light-2); margin-top: 0.6rem; padding-top: 0.3rem;">
            <cy-button v-for="(st, i) in currentSkillTreeCategory.skillTrees" :key="st.id"
              icon="rabbit-book" icon-src="custom"
              :selected="selectSkillTreeWindowState.currentIndex_st === i"
              @click="selectSkillTree(i)">
              {{ st.name }}
            </cy-button>
          </div>
          <div class="skill-tree-container">
            <draw-skill-tree v-if="currentSkillTree != null"
              v-bind="drawSkillTreeOptions"
              :skill-tree="currentSkillTree" />
          </div>
        </div>
      </template>
    </cy-sticky-header>
    <div class="main">
      <template v-if="currentSkillState">
        <template v-if="currentSkillData">
          <div class="top-content">
            <div class="effect-attrs" ref="effect-attrs">
              <table>
                <tr v-for="(data) in currentSkillAttrs" :key="data.id">
                  <td>
                    <cy-icon-text :icon="data.icon">{{ data.name }}</cy-icon-text>
                  </td>
                  <td v-html="data.value"></td>
                </tr>
              </table>
            </div>
            <!-- <fieldset v-if="currentSkillData && currentSkillData.historyList.length != 0"
              class="select-history unfold-fieldset" :class="{ unfold: selectHistoryVisble }">
              <legend>
                <cy-button icon="ic-round-history" class="inline"
                  @click="toggleSelectHistoryVisble">
                  {{ $lang('historical record') }}
                </cy-button>
              </legend>
              <transition name="fade">
                <div v-show="selectHistoryVisble" class="date-list">
                  <cy-button v-for="(his, i) in currentSkillData.historyList" type="line" icon="ic-round-history" :key="his" @click="selectHistory(i)">
                    {{ his }}
                  </cy-button>
                </div>
              </transition>
            </fieldset> -->
          </div>
          <div class="skill-branchs">
            <transition-group name="branch-fade" appear>
              <skill-branch v-for="(branch) in currentSkillBranchs"
                :key="branch.iid" type="main"
                :branch="branch"
                :skill-state="currentSkillState" />
            </transition-group>
          </div>
        </template>
        <cy-default-tips v-else icon="potum" icon-src="custom"
          @click="toggleSelectSkillTreeWindow">
          <div v-html="$lang('default message: equipment conditions')"></div>
        </cy-default-tips>
        <div class="bottom-menu">
          <div class="top-content">
            <cy-transition type="fade">
              <div class="content-container" v-if="!skillStates.optionsWindowVisible">
                <cy-button type="icon" key="switch-btn"
                  icon="heroicons-solid:switch-vertical"
                  icon-color="water-blue-light"
                  icon-color-hover="water-blue"
                  class="p-0 mr-2"
                  @click="skillStates.optionsMode = skillStates.optionsMode == 0 ? 1 : 0" />
                <cy-transition type="fade" mode="out-in">
                  <div v-if="skillStates.optionsMode === 0" class="container-content" key="mode-1">
                    <div class="inline-flex items-center">
                      <span class="column" v-for="(data) in equipmentCategoryList" :key="data.showName">
                        <cy-button :icon="data.icon" @click="toggleEquipmentType(data.shortName)"
                          class="p-0 mr-3 border-0">
                          {{ getEquipmentText(equipmentState[data.shortName], data.name) }}
                        </cy-button>
                      </span>
                    </div>
                    <span v-if="equipmentCategoryList.length !== 0"
                      class="border-l border-solid border-light pl-2 ml-1 inline-block h-6" />
                    <div class="inline-block">
                      <cy-button icon="mdi-order-numeric-descending"
                        class="p-0 border-0"
                        @click="toggleSkillLevel">
                        {{ 'Lv.' + skillStates.skillLevel }}
                      </cy-button>
                    </div>
                  </div>
                  <div class="container-content" v-else key="mode-2">
                    <cy-icon-text icon="heroicons-solid:switch-vertical"
                      text-size="small" text-color="purple"
                      display="block" class="mb-1">
                      {{ $lang('switch skill') }}
                    </cy-icon-text>
                    <div class="inline-flex items-center">
                      <cy-button icon="eva-arrow-circle-left-outline"
                        class="my-0 p-0 border-0 mr-3" @click="switchSkill('previous')">
                        {{ $lang('previous skill') }}
                      </cy-button>
                      <cy-button icon="eva-arrow-circle-right-outline"
                        class="my-0 p-0 border-0 mr-3" @click="switchSkill('next')">
                        {{ $lang('next skill') }}
                      </cy-button>
                      <cy-button icon="bx-bx-fast-forward-circle"
                        class="my-0 p-0 border-0 mr-3" @click="switchSkill('last')">
                        {{ $lang('last skill') }}
                      </cy-button>
                    </div>
                  </div>
                </cy-transition>
              </div>
            </cy-transition>
            <cy-button :icon="skillStates.optionsWindowVisible ? 'ic-round-unfold-less' : 'ic-round-unfold-more'"
              type="icon" class="ml-auto p-0"
              @click="skillStates.optionsWindowVisible = !skillStates.optionsWindowVisible" />
          </div>
          <cy-transition type="fade">
            <div class="p-3 pt-0" v-show="skillStates.optionsWindowVisible">
              <div v-for="(data) in equipmentCategoryList"
                class="equipment-column" :key="data.showName">
                <cy-icon-text :icon="data.icon"
                  text-size="small"
                  class="w-full mt-3">
                  {{ $lang(`equipment/${data.name}: title`) }}
                </cy-icon-text>
                <div class="px-2">
                  <cy-button v-for="(eq) in equipmentState[data.shortName + 'List']"
                    type="border" :key="eq"
                    :icon="data.icon"
                    @click="selectEquipment(data.shortName, eq)"
                    :selected="equipmentState[data.shortName] == eq">
                    {{ getEquipmentText(eq, data.name) }}
                  </cy-button>
                </div>
              </div>
              <div>
                <cy-drag-bar :range="ranges.skillLevel"
                  :value="skillStates.skillLevel"
                  @update:value="setSkillLevel">
                  <template v-slot:title>
                    <cy-icon-text icon="mdi-order-numeric-descending" text-size="small">
                      {{ $lang('skill level') }}
                    </cy-icon-text>
                  </template>
                </cy-drag-bar>
              </div>
              <div>
                <cy-input-counter style="--input-width: 2rem"
                  :value="skillStates.characterLevel"
                  @update:value="setCharacterLevel"
                  :range="ranges.characterLevel" :step="10">
                  <template v-slot:title>
                    <cy-icon-text icon="ant-design:user-outlined">
                      {{ $lang('character level') }}
                    </cy-icon-text>
                  </template>
                </cy-input-counter>
              </div>
              <div class="mt-4">
                <cy-button type="border" icon="heroicons-solid:switch-vertical"
                  @click="skillStates.formulaDisplayMode = skillStates.formulaDisplayMode == 0 ? 1 : 0">
                  {{ $lang('switch formula display mode') }}
                </cy-button>
              </div>
            </div>
          </cy-transition>
        </div>
      </template>
      <div v-else class="default-content">
        <div class="content-container" @click="toggleSelectSkillTreeWindow">
          <cy-icon-text icon="potum" icon-src="custom"
            style="--icon-width: 7rem;"
            class="mb-6" />
          <div>{{ $lang('default message') }}</div>
        </div>
      </div>
    </div>
    <cy-detail-window v-if="currentTag || tagState.windowVisible"
      :position-element="tagState.positionElement">
      <div class="tag-window-content" ref="tag-window-content" @click="closeTagWindow">
        <div class="title">
          <cy-button icon="jam-arrow-left" type="icon" v-if="tagState.tags.length > 1"
            class="inline" @click.stop="previousTag" />
          <cy-icon-text icon="ri-leaf-fill" text-color="purple">{{ currentTag.name }}</cy-icon-text>
          <span v-if="tagState.windowVisible" class="close-tip">{{ $lang('click anywhere to close') }}</span>
        </div>
        <template v-for="(fr) in currentTag.frames">
          <div v-if="fr.type == 'category'" class="category"
            :key="fr.type + fr.value">
            <cy-icon-text icon="bx-bx-message-rounded-detail" class="text-small">{{ fr.value }}</cy-icon-text>
          </div>
          <div v-else-if="fr.type === 'caption'"
            :key="fr.type + fr.value"
            class="caption" v-html="fr.value"></div>
          <div v-else-if="fr.type == 'list'"
            :key="fr.type + fr.value.join('|')" class="list">
            <div v-for="(v) in fr.value" class="leaf-list-item" :key="v">
              <cy-icon-text icon="mdi-leaf" class="prefix-icon" />
              <span v-html="v"></span>
            </div>
          </div>
        </template>
      </div>
    </cy-detail-window>
  </article>
</template>
<script>
import { mapState } from "vuex";

import init from "./init.js";

import vue_drawSkillTree from "@/views/SkillSimulator/draw-skill-tree.vue";
import vue_skillBranch from "./skill-branch/skill-branch.vue";

import createSkillState from "./utils/createSkillState.js";
import handleFormula from "./utils/handleFormula.js";

export default {
  RegisterLang: 'Skill Query',
  data() {
    const self = this;

    return {
      selectSkillTreeWindowState: {
        currentIndex_stc: -1, // Skill Tree Category
        currentIndex_st: -1, // Skill Tree
        visible: false
      },
      drawSkillTreeBaseOptions: {
        skillTreeType: 'normal',
        skillCircleClickListener(e, skill) {
          if (skill.name != '@lock')
            self.selectSkill(skill);
        }
      },
      skillStates: {
        store: [],
        currentStoreIndex: -1,
        skillLevel: 10,
        characterLevel: 220,
        displayMode: 'normal',
        optionsWindowVisible: false,
        optionsMode: 0,
        formulaDisplayMode: 0
      },
      equipmentState: {
        main: -1,
        sub: -1,
        body: -1,
        mainList: [],
        subList: [],
        bodyList: []
      },
      tagState: {
        tags: [],
        buttonClassName: 'click-button--tag',
        windowPosition: {},
        windowVisible: false
      },
      selectHistoryVisble: false,
      ranges: {
        characterLevel: [1, 230],
        skillLevel: [1, 10]
      }
    };
  },
  provide() {
    return {
      'handleTagButton': this.handleTagButton,
      'tagButtonClassName': this.tagState.buttonClassName,
      'createTagButtons': this.createTagButtons,
      'getFormulaDisplayMode': () => this.skillStates.formulaDisplayMode
    };
  },
  updated() {
    const tagWindow = this.$refs['tag-window-content'];
    if (tagWindow) {
      const self = this;
      const click = function(e) {
        e.stopPropagation();
        self.appendTag(this.innerText);
      };
      tagWindow.querySelectorAll('.' + this.tagState.buttonClassName)
        .forEach(p => {
          if (p.getAttribute('data-listener-ctr') == '1')
            return;
          p.addEventListener('click', click);
          p.setAttribute('data-listener-ctr', '1');
        });
    }
    if (this.$refs['effect-attrs'])
      this.handleTagButton(this.$refs['effect-attrs']);
  },
  computed: {
    ...mapState({
      'skillRoot': state => state.datas.skill.skillRoot,
      'tagList': state => state.datas.tag.tagList
    }),
    drawSkillTreeOptions() {
      return {
        currentSkill: this.currentSkillState ? this.currentSkillState.skill : null,
        ...this.drawSkillTreeBaseOptions
      };
    },
    equipmentCategoryList() {
      const list = [{
        name: 'main-weapon',
        shortName: 'main',
        icon: 'mdi-sword'
      }, {
        name: 'sub-weapon',
        shortName: 'sub',
        icon: 'mdi-shield'
      }, {
        name: 'body-armor',
        shortName: 'body',
        icon: 'mdi-tshirt-crew'
      }];

      return list.filter(p => this.equipmentState[p.shortName + 'List'].length != 0);
    },
    currentTag() {
      const idx = this.tagState.tags.length - 1;
      if (idx == -1)
        return null;

      const cur = this.tagState.tags[idx];
      console.log(cur.frames);
      const frs = cur.frames.map(fr => {
        const handle = v => {
          v = v.replace(/\(\(!((?:(?!\(\().)+)\)\)/g, (m, m1) => `<span class="text-light-3">${m1}</span>`)
          .replace(/\(\(((?:(?!\(\().)+)\)\)/g, (m, m1) => `<span class="multiple-values text-light-3">${m1}</span>`);
          return this.createTagButtons(v);
        };

        let value = fr.value;
        if (fr.type === 'list') {
          value = !Array.isArray(value) ? [value] : value;
          value = value.map(v => handle(v));
        } else {
          if (Array.isArray(value))
            value = value[0];
          value = handle(value);
        }
        return { type: fr.type, value };
      });

      return { name: cur.name, frames: frs };
    },
    currentSkillAttrs() {
      const datas = {
        'mp_cost': {
          type: 'value',
          icon: 'mdi-flask-round-bottom'
        },
        'range': {
          type: v => v != '-' && v != 'main' ? 'value' : 'text',
          icon: 'mdi-target-variant',
          extraHandle: (v, type) => {
            if (type == 'value')
              return v + 'm';
            return v == '-' ?
              this.$lang('effect attrs/range: no limit') :
              this.createTagButtons(this.$lang('effect attrs/range: main'));
          }
        },
        'skill_type': {
          type: 'list',
          icon: 'eva-question-mark-circle-outline'
        },
        'in_combo': {
          type: 'list',
          icon: ['mdi-selection-ellipse-arrow-inside', 'jam-stop-sign', 'mdi-numeric-1-circle-outline']
        },
        'action_time': {
          type: 'list',
          icon: 'bx-bx-timer'
        },
        'casting_time': {
          type: 'value',
          icon: 'zmdi-time-restore',
          extraHandle: v => v + 's'
        }
      };
      const p = this.currentSkillData;
      const options = { skillState: this.currentSkillState, effectState: p };
      return p ? Object.keys(p.attrs)
        .filter(k => p.attrs[k] || p.attrs[k] === 0)
        .map(k => {
          const q = p.attrs[k];
          let { type, icon, extraHandle } = datas[k];
          type = typeof type == 'function' ? type(q) : type;
          const name = this.$lang('effect attrs/' + k);
          let value;
          if (type == 'value')
            value = handleFormula(q, options);
          else if (type == 'list')
            value = this.$lang('effect attrs/' + k + ': list')[q];
          else if (type == 'text')
            value = q;
          value = extraHandle ? extraHandle(value, type) : value;
          icon = Array.isArray(icon) ? icon[q] : icon;
          return { name, value, icon };
        }) : null;
    },
    currentSkillTreeCategory() {
      const idx = this.selectSkillTreeWindowState.currentIndex_stc;
      return this.selectSkillTreeWindowState.currentIndex_stc != -1 ? this.skillRoot.skillTreeCategorys[idx] : null;
    },
    currentSkillTree() {
      const state = this.selectSkillTreeWindowState;
      if (state.currentIndex_stc == -1 || state.currentIndex_st == -1)
        return null;
      return this.skillRoot.skillTreeCategorys[state.currentIndex_stc].skillTrees[state.currentIndex_st];
    },
    currentSkillState() {
      if (this.skillStates.store.length === 0)
        return null;
      return this.skillStates.store[this.skillStates.currentStoreIndex];
    },
    currentSkillData() {
      const p = this.currentSkillState;
      return p ? p.states.find(p => this.checkEquipment(p.equipment)) : null;
    },
    currentSkillBranchs() {
      return this.currentSkillData ? this.currentSkillData.branchs.filter(p => p.visible) : [];
    }
  },
  methods: {
    switchSkill(type) {
      const state = this.skillStates;
      if (type == 'previous' && state.currentStoreIndex != 0)
        --state.currentStoreIndex;
      else if (type == 'next' && state.currentStoreIndex != state.store.length - 1)
        ++state.currentStoreIndex;
      else if (type == 'last' && state.currentStoreIndex != state.store.length - 1)
        state.currentStoreIndex = state.store.length - 1;
    },
    toggleSelectSkillTreeWindow(force) {
      force = force === void 0 ? !this.selectSkillTreeWindowState.visible : force
      this.selectSkillTreeWindowState.visible = force;
    },
    createTagButtons(str) {
      return str.replace(/#([^\s]+)\s(\w?)/g, (m, m1, m2) => {
        let res = `<span class="${this.tagState.buttonClassName}">${m1.replace(new RegExp('_', 'g'), ' ')}</span>`;
        if (m2 !== '')
          res += " " + m2;
        return res;
      });
    },
    previousTag() {
      this.tagState.tags.pop();
    },
    handleTagButton(el) {
      if (!el.querySelector)
        return;
      const self = this;
      const enter = function() {
        self.clearTag();
        self.appendTag(this.innerText);
        self.tagState.positionElement = this;
      };
      const leave = function() {
        if (!self.tagState.windowVisible)
          self.clearTag();
      };
      const click = function() {
        self.tagState.windowVisible = true;
      };
      el.querySelectorAll('.' + this.tagState.buttonClassName)
        .forEach(p => {
          if (!this.tagList.find(a => a.name == p.innerText))
            return;
          p.addEventListener('mouseenter', enter);
          p.addEventListener('mouseleave', leave);
          p.addEventListener('click', click);
        });
    },
    appendTag(name) {
      const p = this.tagList.find(p => p.name == name);
      if (p) {
        this.tagState.tags.push(p);
      }
    },
    closeTagWindow() {
      this.tagState.windowVisible = false;
      this.clearTag();
    },
    clearTag() {
      this.tagState.tags = [];
    },
    currentHistoryDate() {
      const p = this.currentSkillData;
      if (!p || p.currentHistoryIdx == -1)
        return null;
      return p.historyList[p.currentHistoryIdx];
    },
    selectHistory(idx) {
      this.currentSkillData.currentHistoryIdx = idx;
    },
    toggleSelectHistoryVisble() {
      this.selectHistoryVisble = !this.selectHistoryVisble;
    },
    /**
     * confirm the type of main-weapon and sub-weapon.is correct and fix.
     * (例如主手裝拳套，副手就不能裝拳套)
     * @param  {String} target ['main' | 'sub'] 會以target為主，並更改另一個武器來讓主副手都符合條件
     * @return {void}
     */
    confirmWeaponType(target) {
      if (target !== 'main' && target !== 'sub') {
        return;
      }
      /**
       * 0'空手', 1'單手劍', 2'雙手劍', 3'弓', 4'弩', 5'法杖',
       * 6'魔導具', 7'拳套', 8'旋風槍', 9'拔刀劍', 10'雙劍',
       *
       * 0'無裝備', 1'箭矢', 2'盾牌', 3'小刀', 4'魔導具',
       * 5'拳套', 6'拔刀劍', 7'忍術卷軸',
      */
      const check = () => {
        const main = this.equipmentState.main,
          sub = this.equipmentState.sub;
        if (main === -1 || sub === -1) {
          return true;
        }
        const t = new Set();
        switch (main) {
          case 0: case 1: case 5:
            t.add(7);
            /* falls through */
          case 4:
            t.add(5);
            /* falls through */
          case 7:
            t.add(2).add(3).add(4);
            break;
          case 9:
            t.add(3).add(7);
            break;
          case 8:
            t.add(1).add(3);
            break;
          case 3:
            t.add(1).add(6);
            break;
          case 6:
            t.add(7);
        }
        t.add(0);
        return t.has(sub);
      };
      while (!check()) {
        this.toggleEquipmentType(target === 'main' ? 'sub' : 'main', false);
      }
    },
    checkEquipment(eq) {
      const eqs = this.equipmentState;
      /* 通用 */
      if ([eq.main, eq.sub, eq.body].every(p => p === -1)) {
        return true;
      }

      /* 非通用 */
      const checkDualSword = eq.main === 0 && eqs.main === 10
        && !this.currentSkillState.states.find(a => a.equipment.main === 10);

      // or
      if (eq.operator === 0) {
        if (eqs.main !== -1 && eqs.main === eq.main || checkDualSword)
          return true;
        if (eqs.sub !== -1 && eqs.sub === eq.sub)
          return true;
        if (eqs.body !== -1 && eqs.body === eq.body)
          return true;
        return false;
      }

      // and
      if (eq.operator === 1) {
        if (eqs.main !== eq.main || checkDualSword)
          return false;
        if (eqs.sub !== eq.sub)
          return false;
        if (eqs.body !== eq.body)
          return false;
        return true;
      }
    },
    setCharacterLevel(v) {
      this.skillStates.characterLevel = v;
      if (this.currentSkillState){
        this.currentSkillState.clv = v;
      }
    },
    setSkillLevel(v) {
      this.skillStates.skillLevel = v;
      if (this.currentSkillState){
        this.currentSkillState.slv = v;
      }
    },
    toggleSkillLevel() {
      let res = this.skillStates.skillLevel;
      if (res == 1)
        res = 10;
      else {
        const list = [1, 5, 10];
        const idx = list.findIndex(p => res <= p);
        res = list[idx-1];
      }
      this.setSkillLevel(res);
    },
    toggleEquipmentType(type, flag=true) {
      const p = type;
      const state = this.equipmentState;
      const list = state[p + 'List'];
      const idx = list.indexOf(state[p]) + 1;
      state[p] = list[idx == list.length ? 0 : idx];

      flag && this.confirmWeaponType(p);
    },
    selectEquipment(target, id) {
      this.equipmentState[target] = id;
      this.updateSkillState();
      this.confirmWeaponType(target);
    },
    updateSkillState(idx) {
      const state = this.skillStates;

      if (state.store.length == 0)
        return;

      idx = idx === void 0 ? state.store.length - 1 : idx;

      const skill = state.store[idx].skill;
      state.store[idx] = createSkillState(skill, {
        defaultSkillLevel: state.skillLevel,
        defaultCharacterLevel: state.characterLevel
      });
    },
    selectSkillTree(idx) {
      this.selectSkillTreeWindowState.currentIndex_st = idx;
      this.skillStates.store = [];

      const main = new Set(),
        sub = new Set(),
        body = new Set();
      this.currentSkillTree.skills.forEach(skill => {
        skill.effects.forEach(sef => {
          main.add(sef.mainWeapon);
          sub.add(sef.subWeapon);
          body.add(sef.bodyArmor);
        });
      });

      /**
       * 1. 把0(無裝備)排到最後面。
       * 2. Set裡只有-1(無選取)時，把-1清除使Set為空。否則把-1加到尾端。
       *    * 空的Set就不會出現在裝備選項。
      */
      const after = target => {
        target.delete(-1);
        if (target.size !== 0) {
          if (target.has(0)) {
            target.delete(0);
            target.add(0);
          }
          target.add(-1);
        }
      };
      after(main);
      after(sub);
      after(body);

      const state = this.equipmentState;
      state.mainList = [...main];
      state.subList = [...sub];
      state.bodyList = [...body];

      state.main = state.mainList.length !== 0 ? state.mainList[0] : -1;
      state.sub = state.subList.length !== 0 ? state.subList[0] : -1;
      state.body = state.bodyList.length !== 0 ? state.bodyList[0] : -1;

      this.confirmWeaponType('main');
      this.updateSkillState();
    },
    selectSkillTreeCategory(idx) {
      this.selectSkillTreeWindowState.currentIndex_stc = idx;
      this.selectSkillTreeWindowState.currentIndex_st = -1;
    },
    selectSkill(skill) {
      if (this.currentSkillState && this.currentSkillState.skill == skill)
        return;
      const state = this.skillStates;
      if (state.currentStoreIndex != state.store.length - 1)
        state.store = state.store.slice(0, state.currentStoreIndex + 1);
      state.currentStoreIndex = state.store.length;
      state.store.push({
        skill
      });
      this.updateSkillState();
      this.selectSkillTreeWindowState.visible = false;
    },
    getEquipmentText(value, type) {
      return value === -1 ? this.$lang('equipment/no select') : this.$lang('equipment/' + type)[value];
    },
    appendSkillState(skill) {
      this.skillStates.store.push({
        skill
      });
      this.updateSkillState();
    }
  },
  beforeCreate() {
    init();
  },
  components: {
    'draw-skill-tree': vue_drawSkillTree,
    'skill-branch': vue_skillBranch
  }
};
</script>
<style lang="less" scoped>

.root-- {
  position: relative;
}

.main {
  > .top-content {
    @media screen and (min-width: 85rem) {
      position: fixed;
      top: 5rem;
      left: calc(50% + 27rem);
    }

    .effect-attrs {
      padding-left: 0.8rem;

      table {
        vertical-align: middle;
      }

      tr {
        > td:nth-child(1) {
          padding-right: 0.6rem;
          border-right: 1px solid var(--primary-light);
        }

        > td:nth-child(2) {
          padding-left: 0.6rem;
          color: var(--primary-light-4);
        }
      }
    }

    .select-history {
      border: 1px solid var(--primary-light-2);
      margin-top: 1rem;
      width: 100%;
    }
  }
}

.skill-tree-container {
  max-width: 100%;
  overflow-x: auto;
}

.default-content {
  width: 100%;
  height: calc(100vh - 15rem);
  display: flex;
  align-items: center;
  justify-content: center;
  > .content-container {
    cursor: pointer;
    padding: 1.3rem;
    transition: border-color 0.3s;
    border: 1px solid transparent;
    text-align: center;

    &:hover {
      border-color: var(--primary-light-3);
    }
  }
}

::v-deep(fieldset).unfold-fieldset {
  transition: 0.5s;

  &:not(.unfold) {
    padding-left: 0;
    border-color: transparent;

    > legend {
      padding-left: 0;
    }
  }
}

.skill-branchs {
  padding: 1rem 0.5rem;
}


.bottom-menu {
  position: sticky;
  bottom: 0.6rem;
  background-color: var(--white);
  border: 1px solid var(--primary-light-2);
  border-radius: 1.5rem;
  padding: 0.5rem 0.3rem;
  padding-right: 0.8rem;
  z-index: 9;
  margin: 0 0.6rem;

  > .top-content {
    display: flex;
    align-items: center;

    > .content-container {
      display: flex;
      align-items: center;
      overflow-y: auto;
      padding: 0 0.4rem;

      > .container-content {
        display: flex;
        align-items: center;
        overflow-y: auto;

        > div {
          flex-shrink: 0;
        }
      }
    }
  }
}

::v-deep(.click-button--tag) {
  color: var(--primary-orange);
  cursor: pointer;
}

.tag-window-content {
  > .title {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;

    > .close-tip {
      margin-left: auto;
      display: inline-block;
      font-size: 0.9rem;
      color: var(--primary-water-blue);
    }
  }

  > .category {
    border-left: 2px solid var(--primary-light-2);
    padding: 0.2rem 0.6rem;
    margin-bottom: 0.7rem;
  }
  > .caption {
    padding: 0 0.3rem;
  }
  > .list {
    margin-top: 0.6rem;
  }
}

::v-deep(.leaf-list-item) {
  padding: 0.4rem;
  padding-left: 1rem;
  position: relative;

  >.prefix-icon {
    position: absolute;
    top: 0;
    left: -0.4rem;

    ::v-deep(svg) {
      width: 1.2rem;
      height: 1.2rem;
      color: var(--primary-light-2);
    }
  }
}

::v-deep(.multiple-values) {
  border-left: 1px solid var(--primary-light-3);
  border-right: 1px solid var(--primary-light-3);
  margin: 0 0.3rem;
  display: inline-block;
  padding: 0 0.3rem;
}

.branch-fade-enter-from {
  transform: translateX(-20%);
  opacity: 0;
}

.branch-fade-leave-to {
  transform: translateX(20%);
  opacity: 0;
}

.branch-fade-enter-active,
.branch-fade-leave-active {
  transition: 0.3s ease;
}
</style>