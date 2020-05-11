<template>
  <article>
    <div class="main">
      <cy-sticky-header>
        <template v-slot:buttons-scope>
          <cy-button :iconify-name="selectSkillTreeWindowState.visible ? 'ic-round-keyboard-arrow-up' : 'ic-round-keyboard-arrow-down'" type="icon-only" @click="selectSkillTreeWindowState.visible = !selectSkillTreeWindowState.visible" />
        </template>
        <template v-slot:float-menu>
          <div v-show="selectSkillTreeWindowState.visible" class="menu-container width-wide">
            <div>
              <cy-button v-for="(stc, i) in skillRoot.skillTreeCategorys" :key="stc.id" iconify-name="bx-bxs-book-content" :class="{ 'selected': selectSkillTreeWindowState.currentIndex_stc == i }" @click="selectSkillTreeCategory(i)">
                {{ stc.name }}
              </cy-button>
            </div>
            <div v-if="currentSkillTreeCategory != null">
              <cy-button v-for="(st, i) in currentSkillTreeCategory.skillTrees" :key="st.id" icon-id="rabbit-book" :class="{ 'selected': selectSkillTreeWindowState.currentIndex_st == i }" @click="selectSkillTree(i)">
                {{ st.name }}
              </cy-button>
            </div>
            <div class="skill-tree-container">
              <draw-skill-tree v-if="currentSkillTree != null" v-bind="drawSkillTreeOptions"
                :skill-tree="currentSkillTree" />
            </div>
          </div>
        </template>
      </cy-sticky-header>
      <div>
        <template v-if="currentSkillData">
          <skill-branch v-for="(branch, i) in currentSkillData.branchs" :key="branch.iid"
            :branch="branch" :skill-state="currentSkillState" />
        </template>
      </div>
      <div>
        <div class="equipment-container">
          <span v-if="equipmentState.mainList.length != 0" class="column">
            <cy-button iconify-name="mdi-sword" @click="toggleEquipmentType('main-weapon')">
              {{ equipmentState.main | getEquipmentText('main-weapon') }}
            </cy-button>
          </span>
          <span v-if="equipmentState.subList.length != 0" class="column">
            <cy-button iconify-name="mdi-shield" @click="toggleEquipmentType('sub-weapon')">
              {{ equipmentState.sub | getEquipmentText('sub-weapon') }}
            </cy-button>
          </span>
          <span v-if="equipmentState.bodyList.length != 0" class="column">
            <cy-button iconify-name="mdi-tshirt-crew" @click="toggleEquipmentType('body-armor')">
              {{ equipmentState.body | getEquipmentText('body-armor') }}
            </cy-button>
          </span>
        </div>
      </div>
    </div>
    <div class="window-container">
    </div>
  </article>
</template>
<script>
import Grimoire from "@Grimoire";
import GetLang from "@global-modules/LanguageSystem.js";

import init from "./init.js";

import vue_drawSkillTree from "@views/SkillSimulator/draw-skill-tree.vue";
import vue_skillBranch from "./skill-branch/skill-branch.vue";

import handleSkillState from "./module/handleSkillState.js";

function Lang(v, vs) {
  return GetLang('Skill Query/' + v, vs);
}

export default {
  data() {
    const self = this;

    return {
      skillRoot: Grimoire.SkillSystem.skillRoot,
      selectSkillTreeWindowState: {
        currentIndex_stc: -1, // Skill Tree Category
        currentIndex_st: -1, // Skill Tree
        visible: false
      },
      drawSkillTreeOptions: {
        skillTreeType: 'normal',
        skillCircleClickListener(e, skill) {
          self.selectSkill(skill);
        }
      },
      skillStates: {
        store: [],
        skillLevel: 10,
        characterLevel: 200,
        displayMode: 'normal'
      },
      equipmentState: {
        main: -1,
        sub: -1,
        body: -1,
        mainList: [],
        subList: [],
        bodyList: []
      }
    };
  },
  filters: {
    getEquipmentText(value, type) {
      if (value == -1)
        return Lang('equipment/no select');
      return Lang('equipment/' + type)[value];
    }
  },
  computed: {
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
      if (this.skillStates.store.length == 0)
        return null;
      return this.skillStates.store[this.skillStates.store.length - 1];
    },
    currentSkillData() {
      const p = this.currentSkillState;
      console.log(p);
      return p ? p.states.find(p => this.checkEquipment(p.equipment)) : null;
    }
  },
  methods: {
    checkEquipment(eq){
      const eqs = this.equipmentState;
      /* 通用 */
      if ([eq.main, eq.sub, eq.body].every(p => p == -1))
        return true;

      /* 非通用 */
      const for_dual_sword = eq.main === 0 && eqs.main === 9 && this.currentSkillState.states.find(a => a.equipment.main == 9) === void 0;

      // or
      if (eq.operator === 0) {
        if (eqs.main != -1 && eqs.main == eq.main || for_dual_sword)
          return true;
        if (eqs.sub != -1 && eqs.sub == eq.sub)
          return true;
        if (eqs.body != -1 && eqs.body == eq.body)
          return true;
        return false;
      }

      // and
      if (eq.operator === 1) {
        if (eqs.main != eq.main || for_dual_sword)
          return false;
        if (eqs.sub != eq.sub)
          return false;
        if (eqs.body != eq.body)
          return false;
        return true;
      }
    },
    toggleEquipmentType(type) {
      const p = {
        'main-weapon': 'main',
        'sub-weapon': 'sub',
        'body-armor': 'body'
      } [type];

      const state = this.equipmentState;
      const list = state[p + 'List'];
      const idx = list.indexOf(state[p]) + 1;
      state[p] = list[idx == list.length ? 0 : idx];
    },
    selectEquipment(target, id) {
      this.equipmentState[target] = id;
      this.updateSkillState();
    },
    updateSkillState(idx) {
      const state = this.skillStates;

      if (state.store.length == 0)
        return;

      idx = idx === void 0 ? state.store.length - 1 : idx;

      const skill = state.store[idx].skill;
      state.store[idx] = {
        skill,
        slv: state.skillLevel,
        clv: state.characterLevel,
        ...handleSkillState(skill, this.equipmentState)
      };
    },
    selectSkillTree(idx) {
      this.selectSkillTreeWindowState.currentIndex_st = idx;

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

      main.delete(-1);
      main.size != 0 && main.add(-1);
      sub.delete(-1);
      sub.size != 0 && sub.add(-1);
      body.delete(-1);
      body.size != 0 && body.add(-1);

      const state = this.equipmentState;
      state.mainList = [...main];
      state.subList = [...sub];
      state.bodyList = [...body];

      state.main = state.mainList.length != 0 ? 0 : -1;
      state.sub = state.subList.length != 0 ? 0 : -1;
      state.body = state.bodyList.length != 0 ? 0 : -1;

      this.updateSkillState();
    },
    selectSkillTreeCategory(idx) {
      this.selectSkillTreeWindowState.currentIndex_stc = idx;
      this.selectSkillTreeWindowState.currentIndex_st = -1;
    },
    selectSkill(skill){
      this.skillStates.store = [{
        skill
      }];
      this.updateSkillState();
    },
    appendSkillState(skill) {
      this.skillStates.store.push({
        skill
      });
      this.updateSkillState();
    },
    langText() {
      return Lang(...arguments);
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
</style>