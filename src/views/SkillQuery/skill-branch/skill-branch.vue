<template>
  <div class="main-- relative" :class="rootClassList">
    <cy-icon-text v-if="otherEquipmentBranchVisible || historyVisible"
      icon="bx-bxs-moon"
      class="absolute -top-1 -left-3 z-1"
      text-color="light-2" />
    <fieldset v-if="type === 'other-equipment'" class="branch-type-title">
      <legend>
        <equipment-info :equipment="equipmentTitle" />
      </legend>
    </fieldset>
    <fieldset v-if="type === 'history'" class="branch-type-title">
      <legend>
        <cy-icon-text icon="ic-round-history" text-size="small">
          {{ branch.attrs['@history-date'] }}
        </cy-icon-text>
      </legend>
    </fieldset>
    <fieldset v-if="['damage', 'effect', 'next', 'passive', 'heal'].includes(branch.name)"
      :class="branchClass">
      <!-- [start] title -->
      <legend>
        <cy-icon-text v-if="showData['name']" class="mr-3" :icon="titleIconName"
          text-color="purple">
          {{ showData['name'] }}
        </cy-icon-text>
        <div class="detail">
          <template v-if="branch.name == 'damage'">
            <span class="prop">{{ showData['damage_type'] }}</span>
          </template>
          <span v-if="showData['type']" class="prop">{{ showData['type'] }}</span>
        </div>
      </legend>
      <!-- == [start] buttons scope -->
      <div class="relative">
        <div class="absolute" style="right: -0.6rem; top: -2.1rem;"
          @mouseenter.stop="toggleVisible('topMenu', true)"
          @mouseleave.stop="toggleVisible('topMenu', false)">
          <transition-group name="top-menu-slide" appear>
            <cy-button v-for="(data) in topButtons" :key="data.name"
              type="icon" class="bg-white rounded-full"
              :icon="data.icon"
              @click="toggleVisible(data.name)" />
          </transition-group>
          <cy-button v-if="topButtons"
            type="icon" class="bg-white rounded-full"
            :selected="topMenuVisible"
            :icon="topMenuVisible ? 'ic-round-menu-open' : 'ic-round-menu'" />
        </div>
      </div>
      <!-- == [end] buttons scope -->
      <!-- [end] title -->
      <!-- [start] branch detail -->
      <branch-detail v-if="detailVisible" :detail-show-data="detailShowData" />
      <cy-icon-text v-if="isMark" icon="mdi-leaf" class="prefix-icon" />
      <cy-icon-text v-if="isMark" icon="cib-overleaf" class="suffix-icon" />
      <!-- [end] branch detail -->
      <!-- [start] sub content -->
      <div class="content-line" v-if="subContentValid">
        <template v-if="branch.name == 'damage'">
          <cy-icon-text v-if="showData['title']"
            class="condition-scope"
            text-size="small" text-color="light-3"
            icon="bx-bx-game">
            {{ showData['title'] }}
          </cy-icon-text>
          <cy-icon-text v-if="showData['element']" :icon="elementIconName"
            class="condition-scope"
            text-size="small" text-color="purple">
            {{ showData['element'] }}
          </cy-icon-text>
          <cy-icon-text v-if="showData['frequency'] && showData['@parent-branch'].attrs['title'] != 'each'"
            class="condition-scope"
            text-size="small" text-color="light-3"
            icon="bi-circle-square">
            <span v-html="showData['frequency']"></span>
          </cy-icon-text>
          <cy-icon-text v-if="showData['duration'] && showData['cycle']"
            icon="ic-round-timer" class="condition-scope"
            text-size="small" text-color="purple">
            <span v-html="$lang('damage/caption of duration and cycle', [showData['duration'], showData['cycle']])">
            </span>
          </cy-icon-text>
          <span class="condition-scope attr" v-if="showData['@proration: damage']">
            <cy-icon-text class="name text-small" icon="ri-error-warning-line">
              {{ showData['@proration: damage: title'] }}
            </cy-icon-text>
            <span class="value text-light-3">{{ showData['@proration: damage'] }}</span>
          </span>
          <span class="condition-scope attr" v-if="showData['@proration: proration']">
            <cy-icon-text class="name text-small" icon="ri-error-warning-line">
              {{ showData['@proration: proration: title'] }}
            </cy-icon-text>
            <span class="value text-light-3">{{ showData['@proration: proration'] }}</span>
          </span>
        </template>
        <template v-else-if="branch.name === 'effect' || branch.name === 'next'">
          <cy-icon-text v-if="showData['condition']"
            class="condition-scope"
            text-size="small" text-color="purple"
            icon="eva-checkmark-circle-2-outline">
            <span v-html="showData['condition']"></span>
          </cy-icon-text>
          <cy-icon-text v-if="showData['duration']"
            class="condition-scope"
            text-size="small" text-color="purple"
            icon="zmdi-time-interval">
            <span v-html="showData['duration']"></span>
          </cy-icon-text>
          <cy-icon-text v-else-if="showData['end_condition']"
            class="condition-scope"
            text-size="small" text-color="purple"
            icon="zmdi-time-interval">
            <span v-html="showData['end_condition']"></span>
          </cy-icon-text>
          <cy-icon-text v-if="showData['is_place']"
            class="condition-scope"
            text-size="small" text-color="purple"
            icon="emojione-monotone:heavy-large-circle">
            {{ showData['is_place'] }}
          </cy-icon-text>
        </template>
        <template v-if="branch.name == 'heal'">
          <cy-icon-text v-if="showData['frequency']"
            class="condition-scope"
            text-size="small" text-color="purple"
            icon="bi-circle-square">
            <span v-html="showData['frequency']"></span>
          </cy-icon-text>
          <cy-icon-text v-if="showData['duration'] && showData['cycle']"
            icon="ic-round-timer" class="condition-scope"
            text-size="small" text-color="purple">
            <span v-html="$lang('heal/caption of duration and cycle',
              [showData['duration'], showData['cycle']])">
            </span>
          </cy-icon-text>
        </template>
      </div>
      <!-- [end] start -->
      <!-- [start] main -->
      <template v-if="branch.name == 'damage'">
        <div class="content-line">
          <damage-formula :show-data="showData" />
        </div>
      </template>
      <template v-else-if="branch.name == 'effect' || branch.name == 'next'">
        <div class="content-line">
          <div v-if="showData['caption']" class="text-scope" v-html="showData['caption']"></div>
          <template v-else-if="showData['@parent-branch'].stats">
            <stats :stats="showData['@parent-branch'].stats" />
          </template>
        </div>
      </template>
      <template v-else-if="branch.name == 'passive'">
        <div class="content-line">
          <div v-if="showData['caption']" class="text-scope" v-html="showData['caption']"></div>
          <template v-else-if="showData['@parent-branch'].stats">
            <stats :stats="showData['@parent-branch'].stats"></stats>
          </template>
        </div>
      </template>
      <template v-else-if="branch.name == 'heal'">
        <heal-formula :show-data="showData" />
      </template>
      <!-- [end] main -->
      <!-- [start] other -->
      <fieldset class="extra-column unfold-fieldset" v-if="isScoped" :class="{ unfold: skillAreaVisible }">
        <legend>
            <cy-button class="condition-scope border-0 p-0"
              text-size="small" text-color="purple"
              icon="bx-bx-target-lock" @click="toggleVisible('skillArea')">
            {{ $lang('skill area/button text') }}
          </cy-button>
        </legend>
        <skill-area-info v-if="skillAreaVisible"
          :branch="branch" :show-data="showData" />
      </fieldset>
      <fieldset class="extra-column" v-if="branch.name == 'damage' && showData['ailment_name']">
        <legend>
          <cy-icon-text icon="ri-plant-line" text-size="small">
            {{ $lang('ailment title') }}
          </cy-icon-text>
        </legend>
        <div class="content-line">
          <div class="text-scope" v-html="ailmentText(showData)"></div>
        </div>
      </fieldset>
      <!-- [end] other -->
      <!-- [start] extra -->
      <fieldset v-for="(suffixShowData) in suffixBranchShowDatas"
        class="extra-column"
        :key="suffixShowData['@--key']">
        <template v-if="suffixShowData['@parent-branch'].name === 'extra'">
          <legend>
            <cy-icon-text class="condition-scope"
              text-size="small" text-color="light-3"
              icon="eva-checkmark-circle-2-outline">
              <span v-html="suffixShowData['condition']"></span>
            </cy-icon-text>
            <span class="bg-scope" v-if="suffixShowData['target']">{{ suffixShowData['target'] }}</span>
          </legend>
          <div class="text-scope" v-if="suffixShowData['caption']" v-html="suffixShowData['caption']"></div>
          <template v-else-if="branch.name === 'damage' && suffixShowData['ailment_name']">
            <div class="text-scope" v-html="ailmentText(suffixShowData)"></div>
          </template>
          <template v-else-if="branch.name === 'damage' && suffixShowData['element']">
            <div class="text-scope" v-html="extraElementCaption(suffixShowData['element'])"></div>
          </template>
          <stats v-else :stats="suffixShowData['@parent-branch'].stats"></stats>
        </template>
      </fieldset>
      <!-- [end] extra -->
    </fieldset>
    <div v-else-if="branch.name === 'list'" :class="branchClass">
      <!-- <cy-icon-text icon="mdi-leaf" class="prefix-icon" /> -->
      <div v-for="data in showData['@list-datas']"
        class="leaf-list-item" :key="data['text']">
        <cy-icon-text icon="mdi-leaf" class="prefix-icon" />
        <span v-html="data['text']"></span>
      </div>
    </div>
    <div v-else :class="branchClass">
      <cy-icon-text v-if="isMark" icon="mdi-leaf" class="prefix-icon" />
      <cy-icon-text v-if="isMark" icon="cib-overleaf" class="suffix-icon" />
      <template v-if="branch.name === 'proration'">
        <div class="content-line">
          <span class="proration-column">
            <span class="title">{{ showData['damage: title'] }}</span>
            <span class="value">{{ showData['damage'] }}</span>
          </span>
          <span class="proration-column">
            <span class="title">{{ showData['proration: title'] }}</span>
            <span class="value">{{ showData['proration'] }}</span>
          </span>
        </div>
      </template>
      <template v-else-if="branch.name === 'text'">
        <div class="content-line group-title" :class="{ 'gropu-unfold': branch.group.expansion }"
          v-if="branch.group" @click="toggleGroup()">
          <cy-icon-text class="title-btn" style="--icon-width: 1.6rem;"
            :icon="branch.group.expansion ? 'mdi-leaf-maple' : 'mdi-leaf-maple-off'" />
          <div class="text-scope" v-html="showData['text']"></div>
        </div>
        <div class="content-line" v-else>
          <div class="text-scope" v-html="showData['text']"></div>
        </div>
      </template>
      <template v-else-if="branch.name === 'tips'">
        <div class="content-line group-title" :class="{ 'gropu-unfold': branch.group.expansion }"
          v-if="branch.group" @click="toggleGroup()">
          <cy-icon-text class="title-btn" style="--icon-width: 1.3rem;"
            :icon="branch.group.expansion ? 'mdi-leaf-maple' : 'mdi-leaf-maple-off'" />
          <div class="text-scope tips">
            <cy-icon-text icon="bx-bx-message-rounded" text-size="small" text-color="light-3">
              <span v-html="showData['text']"></span>
            </cy-icon-text>
          </div>
        </div>
        <div class="content-line" v-else>
          <div class="text-scope tips">
            <cy-icon-text icon="bx-bx-message-rounded"
              text-size="small" text-color="light-3">
              <span v-html="showData['text']"></span>
            </cy-icon-text>
          </div>
        </div>
      </template>
      <template v-else-if="branch.name === 'stack'">
        <div class="content-line" v-if="stackValue !== null">
          <cy-input-counter
            v-model:value="stackValue"
            :range="stackValueRange"
            :style="showData['@stack-input-width-wide'] || {}">
            <template v-slot:title>
              <cy-icon-text icon="ion-leaf">
                {{ showData['name'] }}
              </cy-icon-text>
            </template>
            <template v-if="showData['unit']" v-slot:unit>
              <span class="text-light-3">{{ showData['unit'] }}</span>
            </template>
          </cy-input-counter>
        </div>
        <cy-default-tips v-else icon="mdi-ghost">
          Doll Not Found
        </cy-default-tips>
      </template>
      <template v-else-if="branch.name === 'reference'">
        <div class="content-line">
          <cy-icon-text class="condition-scope"
            icon="entypo-link"
            text-size="small" text-color="purple">
            {{ $lang('reference/base title') }}
          </cy-icon-text>
          <div class="text-scope" v-if="showData['text']">
            {{ showData['text'] }}
          </div>
          <div class="text-scope">
            <a target="_blank" :href="showData['url']">{{ showData['url_text'] }}</a>
          </div>
        </div>
      </template>
    </div>
    <template v-if="type === 'main'">
      <template v-if="otherEquipmentBranchVisible && otherEquipmentBranchDatas">
        <cy-transition-group type="fade" mode="out-in" appear>
          <skill-branch v-for="(data) in otherEquipmentBranchDatas"
            :branch="data.branch" :key="data.iid" type="other-equipment"
            :skill-state="skillState" class="extra-branch" />
        </cy-transition-group>
      </template>
      <template v-if="historyVisible">
        <cy-transition-group type="fade" mode="out-in" appear>
          <skill-branch v-for="(data) in historyDatas"
            :branch="data.branch" :key="data.iid" type="history"
            :skill-state="skillState" class="extra-branch" />
        </cy-transition-group>
      </template>
    </template>
    <div v-if="branch.isGroupTail" class="group-tail">
      <cy-icon-text icon="bx-bxs-square" class="prefix-icon" />
    </div>
  </div>
</template>
<script>
import vue_damageFormula from "./damage-formula.vue";
import vue_healFormula from "./heal-formula.vue";
import vue_stats from "./stats.vue";
import vue_branchDetail from "./branch-detail.vue";
import vue_equipmentInfo from "./equipment-info.vue";
import vue_skillAreaInfo from "./skill-area-info";


import handleFormula from "../utils/handleFormula.js";
import DataContainer from "../utils/DataContainer.js";

export default {
  name: 'skill-branch',
  RegisterLang: {
    root: 'Skill Query/Branch',
    extra: {
      parent: 'Skill Query'
    }
  },
  props: ['branch', 'skillState', 'type'],
  inject: ['handleTagButton', 'createTagButtons', 'tagButtonClassName', 'getFormulaDisplayMode'],
  data() {
    return {
      otherEquipmentBranchVisible: false,
      historyBranchVisible: false,
      detailVisible: false,
      skillAreaVisible: false,
      historyVisible: false,
      topMenuVisible: false
    }
  },
  provide() {
    return {
      'calcValueStr': this.calcValueStr,
      'handleDataContainer': this.handleDataContainer
    }
  },
  updated() {
    this.handleTagButton(this.$el);
  },
  mounted() {
    this.handleTagButton(this.$el);
  },
  computed: {
    topButtons() {
      const list = [{
        name: 'detail',
        valid: this.branch.name === 'damage' && this.showData['detail_display'] === '1',
        icon: {
          'true': 'bx-bxs-book-open',
          'false': 'bx-bxs-book-add'
        }
      }, {
        name: 'otherEquipmentBranch',
        valid: this.type === 'main' && this.otherEquipmentBranchDatas,
        icon: {
          'true': 'bx-bxs-down-arrow-circle',
          'false': 'bx-bxs-right-arrow-circle'
        }
      }, {
        name: 'history',
        valid: this.branch.history.length !== 0,
        icon: {
          'true': 'ic-round-history-toggle-off',
          'false': 'ic-round-history'
        }
      }];

      const res = list.filter(p => p.valid);
      res.forEach(p => p.icon = p.icon[this[p.name + 'Visible'] ? 'true' : 'false']);

      return res.length > 0 ? (this.topMenuVisible ? res : []) : null;
    },
    // confirmHistoryDate() {
    //   return this.branch.suffix.find(p => p.name === 'history');
    // },
    elementIconName() {
      return {
        'neutral': 'bx-bx-circle',
        'fire': 'fa-brands:gripfire',
        'water': 'ion-water',
        'earth': 'bx-bx-cube-alt',
        'wind': 'simple-icons:tailwindcss',
        'light': 'carbon-light',
        'dark': 'bx-bx-moon'
      }[this.branch.attrs['element']] || 'bx-bx-circle';
    },
    rootClassList() {
      return {
        'left-line': this.otherEquipmentBranchVisible || this.historyVisible
      };
    },
    historyDatas() {
      return this.branch.history.map((p, i) => ({
        iid: i,
        branch: p.branch
      }));
    },
    equipmentTitle() {
      const eq = this.branch['@parent-state'].equipment;

      return {
        main: eq.main != -1 ? this.$lang.extra('parent', 'equipment/main-weapon')[eq.main] : -1,
        sub: eq.sub != -1 ? this.$lang.extra('parent', 'equipment/sub-weapon')[eq.sub] : -1,
        body: eq.body != -1 ? this.$lang.extra('parent', 'equipment/body-armor')[eq.body] : -1,
        none: eq.main == -1 && eq.sub == -1 && eq.body == -1 ? this.$lang.extra('parent', '/equipment/none') : void 0,
        operator: eq.operator
      };
    },
    stackValueRange() {
      let min = parseInt(this.showData['min'], 10),
        max = parseInt(this.showData['max'], 10);

      max = !Number.isNaN(max) ? max : null;
      min = !Number.isNaN(min) ? min : null;

      return [min, max];
    },
    subContentValid() {
      const p = this.branch.name;
      if (p === 'damage')
        return this.showData['title'] || this.isScoped || this.showData['element'] || this.showData['frequency'];
      if (p === 'heal')
        return this.showData['frequency'];

      return true;
    },
    detailShowData() {
      return this.handleDetailShowData(this.branch);
    },
    branchClass() {
      return {
        'branch': true,
        [this.branch.name]: true,
        'branch-mark': this.isMark,
        'other-equipment': this.type === 'other-equipment'
      };
    },
    isScoped() {
      if (this.branch.name === 'damage') {
        if (this.branch.attrs['type'] === 'AOE')
          return true;
      }
      if (this.branch.name === 'effect') {
        if (this.branch.attrs['type'] === 'aura')
          return true;
      }
      return false;
    },
    isMark() {
      return this.branch.attrs['is_mark'] === '1';
    },
    suffixBranchShowDatas() {
      return this.branch.suffix
        .filter(p => p.name == 'extra')
        .map((p, i) => {
          const t = this.handleShowData(p);
          t['@--key'] = p.name + i;
          return t;
        });
    },
    titleIconName() {
      if (this.branch.name == 'damage')
        return 'ri-sword-fill';
      return 'mdi-checkbox-multiple-blank-circle';
    },
    showData() {
      return this.handleShowData(this.branch);
    },
    otherEquipmentBranchDatas() {
      if (this.branch.id === '-')
        return null;

      const res = this.skillState.states
        .filter(p => p.branchs.find(b => b.id == this.branch.id))
        .map((p, i) => ({
          iid: i,
          branch: p.branchs.find(b => b.id == this.branch.id)
        }));

      return res.length == 0 ? null : res;
    },
    formulaDisplayMode() {
      return this.getFormulaDisplayMode();
    },
    stackValue: {
      get() {
        return this.stackState ? this.stackState.value : null;
      },
      set(v) {
        if (this.stackState) {
          this.stackState.value = v;
        }
      }
    },
    stackState() {
      if (this.branch.name !== 'stack') {
        return null;
      }
      const stack_id = this.branch.attrs['id'];
      const p = this.branch['@parent-state'].stackStates.find(a => a.id == stack_id);
      return p ? p : null;
    }
  },
  methods: {
    extraElementCaption(v) {
      const s = `<span class="text-light-3">${this.$lang('damage/element/' + v)}</span>`;
      return this.$lang('apply element', [s]);
    },
    toggleVisible(name, force) {
      force = force === void 0 ? !this[name + 'Visible'] : force;

      if (name == 'history' && force)
        this.otherEquipmentBranchVisible = false;
      else if (name == 'otherEquipmentBranch' && force)
        this.historyVisible = false;

      this[name + 'Visible'] = force;
    },
    handleDetailShowData(bch) {
      const attrs = bch.attrs;
      // const data = Object.assign({}, attrs);
      const data = {
        '@data-list': []
      };
      const handleList = [];

      if (bch.name == 'damage') {
        attrs['is_place'] == '1' && handleList.push('is_place');
        handleList.push({
          name: ['range_damage', 'unsheathe_damage'],
          type: 'bool'
        });
        this.calcValueStr(attrs['frequency']) > 1 && handleList.push('judgment', {
          name: 'frequency_judgment',
          convert: v => {
            if (v == 'auto')
              return bch.attrs['title'] != 'each' ? 'single' : 'multiple';
            return v;
          }
        });
      }

      handleList.forEach(item => {
        const default_icon = 'ic-outline-info';
        if (typeof item == 'object') {
          let { name, type = 'normal', icon, convert } = item;
          name = Array.isArray(name) ? name : [name];
          if (!icon) {
            icon = {
              'bool': {
                '1': 'ic-round-check',
                '0': 'ic-round-close',
                'none': 'mdi-help'
              }
            } [type] || { '@default': default_icon };
          }
          name.forEach(k => {
            const tmp = new DataContainer(bch.attrs[k], bch, k);
            convert && tmp.handle(v => convert(v));

            this.handleDataContainerLangText(tmp, { prefix: '-detail' });
            const v = tmp.result();
            let classList = null;
            if (type == 'bool') {
              classList = attrs[k] == '1' ? null : ['dark'];
            }
            data['@data-list'].push({
              id: k,
              icon: icon[attrs[k]] || icon['@default'],
              value: v,
              classList
            });
          });
        } else {
          const tmp = new DataContainer(bch.attrs[item], bch, item);
          this.handleDataContainerLangText(tmp, { prefix: '-detail' });
          const v = tmp.result();
          data['@data-list'].push({
            id: item,
            icon: default_icon,
            value: v
          });
        }
      });

      return data;
    },
    toggleGroup(force) {
      const bchs = this.branch['@parent-state'].branchs;

      const g = this.branch.group;
      g.expansion = force === void 0 ? !g.expansion : force;

      let cur = bchs.findIndex(p => p == this.branch),
        cnt = g.size,
        cur_g = g,
        last = null;

      const len = bchs.length - 1;
      while (cnt != 0 && cur != len) {
        --cnt;
        cur += 1;

        const p = bchs[cur];
        if (cur_g.expandable) {
          p.visible = !g.expansion ? false : cur_g.expansion;
          last = p;
        }

        if (p.group) {
          cnt += p.group.size;
          cur_g = p.group;
        }
      }

      if (last) {
        last.isGroupTail = last.visible;
      }
    },
    ailmentText(showData) {
      return this.$lang('damage/ailment text', [showData['ailment_chance'], `<span class="${this.tagButtonClassName}">${showData['ailment_name']}</span>`]);
    },
    handleShowData(bch) {
      const attrs = bch.attrs;
      const data = Object.assign({}, attrs);

      // 四個清單。會按照步驟對data內的資料做轉換。
      const hiddenList = []; // 1. 驗證是否隱藏
      const handleValueList = []; // 2-1. 需計算公式的數值
      const handleTextList = []; // 2-2. 需計算內行公式的文字
      const langTextList = []; // 3. 需轉換語言的
      const titleList = []; // 4. 需從語言清單獲取標題的

      if (bch.name == 'proration') {
        if (data['proration'] == 'auto')
          data['proration'] = data['damage'];
        langTextList.push('damage', 'proration');
        titleList.push('damage', 'proration');
      } else if (bch.name == 'list') {
        if (!bch.mainBranch) {
          const suffixList = bch.suffix
            .filter(p => p.name == 'list')
            .map(p => this.handleShowData(p));
          data['@list-datas'] = [data, ...suffixList];
        }
        handleTextList.push('text');
      } else if (!bch.mainBranch) {
        if (bch.name == 'damage') {
          // base
          if (data['base'] == 'auto')
            data['base'] = data['damage_type'] == 'physical' ? 'atk' : 'matk';
          if (data['detail_display'] == 'auto')
            data['detail_display'] = data['title'] == 'normal_attack' ? '0' : '1';

          handleValueList.push('constant', 'extra_constant', 'duration', 'cycle', {
            name: ['multiplier', 'ailment_chance'],
            beforeColorText: v => v + '%'
          }, {
            name: 'frequency',
            beforeColorText: v => v + this.$lang('global/times')
          });

          hiddenList.push({
            name: ['constant', 'multiplier', 'extra_constant', 'is_place'],
            validation: v => v != '0'
          }, {
            name: 'frequency',
            validation: v => parseInt(v, 10) != 1,
            validationType: 'value'
          }, {
            name: 'name',
            validation: v => v,
            defaultValue: this.$lang('damage/base name')
          }, {
            name: ['base', 'element'],
            validation: v => v != 'none'
          }, {
            name: 'type',
            validation: v => v != 'single'
          }, {
            name: 'title',
            validation: v => v == 'normal_attack'
          });
          langTextList.push('base', 'damage_type', 'type', 'title', 'element');
          data['title'] != 'each' && langTextList.push({ name: 'frequency', type: 'value' });

          // skill area
          handleValueList.push({
            name: 'angle',
            beforeColorText: v => v + '°'
          }, {
            name: ['radius', 'move_distance', 'start_position_offsets', 'end_position_offsets'],
            beforeColorText: v => v + 'm'
          });
          hiddenList.push({
            name: ['move_distance', 'angel'],
            validation: v => v
          }, {
            name: ['start_position_offsets', 'end_position_offsets'],
            validation: v => v != 0,
            validationType: 'value'
          });
          langTextList.push('effective_area', {
            name: ['start_position_offsets', 'end_position_offsets'],
            type: 'value'
          });
          titleList.push('effective_area', 'radius', 'move_distance', 'angle',
            'start_position_offsets', 'end_position_offsets');
          {
            const prorationBch = bch.suffix.find(suf => suf.name == 'proration');
            if (prorationBch) {
              const _data = this.handleShowData(prorationBch);
              ['damage', 'proration', 'damage: title', 'proration: title'].forEach(k => {
                data['@proration: ' + k] = _data[k];
              });
            }
          }
        } else if (bch.name == 'text' || bch.name == 'tips') {
          handleTextList.push('text');
        } else if (bch.name == 'stack') {
          if (data['default'] == 'auto')
            data['default'] = data['min'];
          handleValueList.push({
            name: ['min', 'max', 'default'],
            calcOnly: true
          });
          const stkIdx = bch['@parent-state'].branchs
            .filter(p => p.name == 'stack')
            .indexOf(bch);
          hiddenList.push({
            name: 'name',
            validation: v => v && v != 'auto',
            defaultValue: this.$lang('stack/base name') + (stkIdx + 1)
          });
        } else if (bch.name == 'effect') {
          handleValueList.push({
            name: 'radius',
            beforeColorText: v => v + 'm'
          }, {
            name: 'duration',
            beforeColorText: v => this.$lang('display duration', [v])
          });
          handleTextList.push('caption', 'condition', 'end_condition');
          hiddenList.push({
            name: ['condition', 'type'],
            validation: v => v != 'none'
          }, {
            name: 'is_place',
            validation: v => v != '0'
          }, {
            name: 'name',
            validation: v => v,
            defaultValue: this.$lang('effect/base name')
          });
          ['auto', 'hit'].includes(data['condition']) && langTextList.push('condition');
          langTextList.push('is_place', 'type');

          // skill area
          hiddenList.push({
            name: ['start_position_offsets', 'end_position_offsets'],
            validation: v => v != 0,
            validationType: 'value'
          });
          langTextList.push('effective_area');
          titleList.push('effective_area', 'radius');
        } else if (bch.name == 'next') {
          handleTextList.push('caption');
          hiddenList.push({
            name: 'condition',
            validation: v => v && v != 'none',
            defaultValue: this.$lang('next/condition default')
          }, {
            name: 'name',
            validation: v => v,
            defaultValue: this.$lang('effect/base name')
          });
        } else if (bch.name == 'passive') {
          handleTextList.push('caption');
          hiddenList.push({
            name: 'name',
            validation: v => v,
            defaultValue: this.$lang('passive/base name')
          });
        } else if (bch.name == 'heal') {
          handleValueList.push('duration', 'cycle', 'constant', {
            name: 'frequency',
            beforeColorText: v => v + this.$lang('global/times')
          });
          hiddenList.push({
            name: 'name',
            validation: v => v,
            defaultValue: this.$lang('heal/base name')
          }, {
            name: 'constant',
            validation: v => v != 0
          }, {
            name: 'frequency',
            validation: v => parseInt(v) > 1,
            validationType: 'value'
          });

          data['@extra-value-list'] = [];
          if (data['extra_value'] && data['extra_text']) {
            const vs = data['extra_value'].split(/\s*,,\s*/)
              .map(p => {
                const dc = new DataContainer(p, 'extra_value', bch);
                this.handleDataContainer(dc, { toPercentage: true });
                return dc.result();
              });
            const ts = data['extra_text'].split(/\s*,\s*/);
            data['@extra-value-list'].push(...vs.map((p, i) => ({
              text: ts[i] || 'None',
              value: p
            })));
          }

          langTextList.push('type');
        }

        // siffix
        data['@suffix'] = bch.suffix.map(p => this.handleShowData(p));
      } else {
        const mbch = bch.mainBranch;
        if (mbch.name == 'damage' && bch.name == 'extra') {
          handleValueList.push({
            name: 'ailment_chance',
            beforeColorText: v => v + '%'
          });
          hiddenList.push({
            name: 'condition',
            validation: v => v,
            defaultValue: this.$lang('global suffix: extra/condition default')
          });
          handleTextList.push('caption', 'condition');
        } else if ((mbch.name == 'effect' || mbch.name == 'next' || mbch.name == 'passive') && bch.name == 'extra') {
          hiddenList.push({
            name: 'condition',
            validation: v => v,
            defaultValue: this.$lang('global suffix: extra/condition default')
          });
          handleTextList.push('caption', 'condition');
        }
      }

      // convert data to DataContainer
      Object.keys(data).forEach(k => data[k] = new DataContainer(data[k], bch, k));

      hiddenList.forEach(({ name, validation, defaultValue, validationType='normal' }={}) => {
        name = Array.isArray(name) ? name : [name];
        name.forEach(p => {
          if (data[p] === void 0) {
            if (defaultValue)
              data[p] = new DataContainer(defaultValue, p, bch);
            return;
          }
          const dc = data[p];
          const t = validationType == 'value' ? this.calcValueStr(dc.origin) : dc.origin;
          if (!validation(t)) {
            if (defaultValue) {
              data[p].set(defaultValue);
            } else
              delete data[p];
          }
        });
      });

      handleValueList.forEach(k => {
        if (typeof k === 'object') {
          let { name, beforeColorText, calcOnly } = k;
          name = Array.isArray(name) ? name : [name];
          name.forEach(p => {
            const dc = data[p];
            if (!dc) return;
            !calcOnly ?
              this.handleDataContainer(dc, { beforeColorText }) :
              dc.handle(v => this.calcValueStr(v));
          });
        } else if (data[k]) {
          this.handleDataContainer(data[k]);
        }
      });

      handleTextList.forEach(k => data[k] && data[k].handleResult(v => this.handleTextData(v, bch)));

      langTextList.forEach(k => {
        if (typeof k == 'object') {
          let { name, type='normal' } = k;
          name = Array.isArray(name) ? name : [name];
          name.forEach(a => {
            const dc = data[a];
            if (!dc)
              return;
            this.handleDataContainerLangText(dc, { type });
          });
        } else {
          const dc = data[k];
          if (!dc)
            return;
          this.handleDataContainerLangText(dc);
        }
      });

      const dataContainers = []
      Object.keys(data).forEach(k => {
        if (data[k] instanceof DataContainer) {
          dataContainers.push(data[k]);
          data[k] = data[k].result();
        }
      });
      data['@--data-container-records'] = dataContainers;

      titleList.forEach(k => {
        data[k + ': title'] = this.$lang(`${bch.name}/${k}: title`);
      });

      if (this.branch.name == 'stack') {
        const tmpv = parseInt(data['max'] || data['default'], 10);
        if (!Number.isNaN(tmpv) && tmpv > 999)
          data['@stack-input-width-wide'] = { '--input-width': '3rem' };
      }

      return data;
    },
    calcValueStr(str) {
      if (!str) {
        return '0';
      }
      const skillState = this.skillState;
      const effectState = this.branch['@parent-state'];

      return str.split(/\s*,,\s*/)
        .map(p => handleFormula(p, { skillState, effectState, branch: this.branch }))
        //.map(p => p.charAt(0) == '-' ? `(${p})` : p)
        .join('+')
        .replace(/\+-/g, '-');
    },
    handleDataContainerLangText(dc, { type='normal', prefix='' }={}) {
      dc.handle(v => this.formulaPretreatment(v));

      const bch = dc.branch, key = dc.key;
      if (type == 'value') {
        dc.handle(v => this.calcValueStr(v));
        const p = dc.isNumberValue() && parseFloat(dc.value()) < 0 ? 'negative' : 'positive';
        p == 'negative' && dc.handle(v => (-1 * v).toString());
        dc.handleResult(v => this.$lang(`${bch.name + prefix}/${key}/${p}`, [v]))
      } else {
        let p = dc.value();
        if (p == '1' || p == '0') // 轉換布林值
          p = p == '1' ? 'true' : 'false';
        let preName = bch.name + prefix;
        preName = bch.mainBranch ? bch.mainBranch.name + ': ' + preName : preName;
        dc.handleResult(() => this.$lang(`${preName}/${key}/${p}`));
      }
    },
    handleTextData(str, bch) {
      if (!str)
        return str;

      str = str
        .replace(/\$\{([^}]+)\}(%?)/g, (m, m1, m2) => {
          const dc = new DataContainer(m1);
          this.handleDataContainer(dc, { beforeColorText: v => v + m2 });
          return dc.result();
        })
        .replace(/\(\(((?:(?!\(\().)+)\)\)/g, (m, m1) => `<span class="multiple-values">${m1}</span>`);
      str = this.createTagButtons(str);

      const data = bch.attrs;

      data['mark'] && data['mark'].split(/\s*,\s*/)
        .forEach(p => str = str.replace(new RegExp(p, 'g'), m => `<span class="text-light-3">${m}</span>`));
      data['branch'] && data['branch'].split(/\s*,\s*/)
        .forEach(p => str = str.replace(new RegExp(p, 'g'), m => `<span class="text-light-3">${m}</span>`));
      data['skill'] && data['skill'].split(/\s*,\s*/)
        .forEach(p => str = str.replace(new RegExp(p, 'g'), m => `<span class="text-light-3">${m}</span>`));
      return str;
    },
    handleDataContainer(dc, { beforeColorText, toPercentage=false }={}) {
      dc.handle(v => this.formulaPretreatment(v));

      const numStrToPercentage = s => (100 * parseFloat(s)).toFixed(1).replace('.0', '') + '%';

      dc.handle(v => this.calcValueStr(v));
      dc.handleResult(v => v
        .replace(/([$_a-zA-Z][$_a-zA-Z0-9]*)(\*)(\d\.\d+)/g,
          (m, m1, m2, m3) => m1 + m2 + numStrToPercentage(m3))
        .replace(/\*/g, '×')
      );

      dc.handleResult(v => v.replace(/(\d+\.)(\d{4,})/g, (m, m1, m2) => m1 + m2.slice(0, 4)));

      dc.isNumberValue() && toPercentage && dc.handleResult(v => numStrToPercentage(v));
      this.handleReplacedVariable(dc);

      this.dataResultHighlight(dc, { beforeColorText });
    },
    dataResultHighlight(dc, {
      base = 'text-light-3',
      stack = 'text-water-blue',
      extra = [],
      beforeColorText = null
      //   <span class="...">
      //     extraHandle(v = "<span class="multiple-values"></span>")
      //   </span>
    } = {}) {
      const clist = [(dc.origin.includes('stack') ? stack : base), ...extra];
      dc.isNumberValue() && parseFloat(dc.value()) < 0 && clist.push('text-dark');
      !dc.isNumberValue() && dc.handleResult(v => `<span class="multiple-values">${v}</span>`);

      beforeColorText && dc.handleResult(v => beforeColorText(v));
      dc.handleResult(v => `<span class="${clist.join(' ')}">${v}</span>`);
    },
    handleReplacedVariable(dc) {
      if (dc.isNumberValue())
        return;
      const list = [
        'BSTR', 'BINT', 'BAGI', 'BVIT', 'BDEX', 'TEC',
        'STR', 'INT', 'AGI', 'VIT', 'DEX', 'shield_refining',
        'dagger_atk', 'target_def', 'target_level', 'guard_power'
      ];
      list.forEach(cs => dc.handleResult(v => v
          .replace(new RegExp('\\$' + cs, 'g'), this.$lang('formula replaced text/' + cs))
        )
      );
      if (this.formulaDisplayMode == 1) {
        const stack = [];
        if (this.branch.attrs['stack_id']) {
          const ss = this.branch['@parent-state'].stackStates;
          const tstack = this.branch.attrs['stack_id'].split(/\s*,\s*/)
            .map(p => parseInt(p, 10))
            .map(p => {
              const t = ss.find(a => a.id == p);
              return t ?
                (t.branch.attrs['name'] != 'auto' ? t.branch.attrs['name'] : this.$lang('stack/base name')) :
                this.$lang('unknow variable');
            });
          stack.push(...tstack);
        }

        let v = dc.result();
        v = v
          .replace(/\$__TEXT_SLV__/g, this.$lang.extra('parent', 'skill level'))
          .replace(/\$__TEXT_CLV__/g, this.$lang.extra('parent', 'character level'))
          .replace(/\$__TEXT_STACK_(\d+)__/g, (m, m1) => stack[parseInt(m1, 10)]);

        let list = [], offset = 0;
        v.split('').forEach((c, i) => {
          if (c == '(') {
            if (i == 0 || !/[_a-zA-Z0-9]/.test(v[i - 1 + offset])) {
              v = v.slice(0, i + offset) + '#left~' + v.slice(i + offset +1);
              offset += 5;
              list.push('normal');
            }
            else
              list.push('function');
          }
          if (c == ')') {
            if (list[list.length - 1] == 'normal') {
              v = v.slice(0, i + offset) + '~right#' + v.slice(i + offset +1);
              offset += 6;
            }
            list.pop();
          }
        });

        const createFormulaText = (n, v) => `<span class="formula--fix key--${n}"><span class="name">${n.toUpperCase()}</span><span class="value">${v}</span></span>`;

        const funList = [
          {
            name: 'floor', reg: /Math\.floor\(([^()]+)\)/g,
            target: (m, m1) => '[' + m1 + ']'
          },
          { name: 'min', reg: /Math\.min\(([^()]+)\)/g },
          { name: 'max', reg: /Math\.max\(([^()]+)\)/g }
        ];
        while (funList.find(p => v.match(p.reg)))
          funList.forEach(p => v = v.replace(p.reg, p.target || ((m, m1) => createFormulaText(p.name, m1))));

        v = v
          .replace(/#left~/g, '(')
          .replace(/~right#/g, ')');

        v = v.replace(/,/g, '<span class="arg-separate"></span>');

        dc.handleResult(() => v);
      }
    },
    formulaPretreatment(str) {
      if (this.formulaDisplayMode == 1)
        return str
          .replace(/CLv/g, '$__TEXT_CLV__')
          .replace(/SLv/g, '$__TEXT_SLV__')
          .replace(/stack\[(\d+)\]/g, (m, m1) => '$__TEXT_STACK_' + m1 + '__')
          .replace(/stack/g, '$__TEXT_STACK_0__');
      return str;
    }
  },
  watch: {
    branch: {
      immediate: true,
      handler() {
        if (this.branch.group) {
          this.$nextTick(() => this.toggleGroup(this.branch.group.expansion));
        }
      }
    }
  },
  components: {
    'damage-formula': vue_damageFormula,
    'stats': vue_stats,
    'heal-formula': vue_healFormula,
    'branch-detail': vue_branchDetail,
    'equipment-info': vue_equipmentInfo,
    'skill-area-info': vue_skillAreaInfo
  }
};
</script>
<style lang="postcss" scoped>

.main-- {
  position: relative;

  &.left-line {
    border-left: 3px solid var(--primary-light-2);
    padding-bottom: 0.3rem;
  }
}

.branch-type-title {
  padding-left: 0.4rem;
  border: 0;
  padding: 0;
  margin: 0;
  border-top: 2px solid var(--primary-green);
  padding-left: 1rem;
  margin: 0 0.6rem;

  & > legend {
    padding: 0 0.4rem;
  }
}

.branch.extra-branch {
  // opacity: 0.8;
  margin-left: 1.2rem;
}

div.branch {
  padding: 0.2rem 0.2rem;

  & > .content-line {
    padding: 0 0.3rem;

    &.group-title {
      border: 0.1rem var(--primary-light) solid;
      border-radius: 1rem;
      padding: 0.6rem;
      cursor: pointer;
      transition: 0.3s;
      background-color: var(--white);

      &.gropu-unfold {
        border-color: var(--primary-light-2);
      }

      &:hover {
        border-color: var(--primary-light-3);
      }

      & > .title-btn {
        margin: 0 0.3rem;
      }
    }
  }

  &.branch-mark {
    padding: 0.4rem 0.6rem;

    & > .prefix-icon {
      top: -0.8rem;
    }
  }
}

fieldset.branch {
  border: 1px solid var(--primary-light);
  margin: 0.6rem 0;
  transition: border-width 0.3s ease;
  background-color: var(--white);
  padding: 0.4rem 1rem;

  & > legend {
    margin-bottom: 0.2rem;
    display: flex;
    align-items: center;
    padding: 0 0.4rem;

    & > .detail {
      display: inline-block;
      font-size: 0.9rem;
      align-self: flex-end;

      & > .prop {
        display: inline-block;
        color: var(--primary-green);
        margin-right: 0.4rem;
      }
    }
  }
}

.branch.branch-mark {
  border: 2px solid var(--primary-light-2);
  position: relative;
  margin-top: 0.9rem;
  margin-bottom: 0.9rem;
  background-color: var(--white);

  & > .prefix-icon {
    position: absolute;
    z-index: 1;
    left: -1rem;
    top: -2rem;
    --icon-width: 2rem;
    --icon-color: var(--primary-light-2);
  }

  & > .suffix-icon {
    position: absolute;
    z-index: 1;
    right: -0.8rem;
    bottom: -0.3rem;
    --icon-width: 2rem;
    --icon-color: var(--primary-light-2);
  }
}

.branch.text {
  padding-top: 0.3rem;
}

.branch.stack {
  margin-top: 0.6rem;

  &::v-deep(.name) {
    margin-right: 0.5rem;
  }
}

.branch.list {
  padding-left: 0.6rem;
  margin-bottom: 0.3rem;
  padding-top: 0.5rem;
}

.branch.reference {
  border: 1px solid var(--primary-light);
  padding: 0.3rem;
}

.branch.proration {
  margin-top: 0.6rem;
}

.content-line {
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  & + .extra-column {
    margin-top: 0.3rem;
  }
}

.condition-scope {
  margin: 0.1rem 0;
  margin-right: 0.7rem;
  display: inline-flex;
  align-items: center;

  &.attr {
    & > .name {
      margin-right: 0.4rem;
      color: var(--primary-dark);
    }

    & > .value {
      font-size: 0.9rem;
    }
  }
}

::v-deep(.bg-scope) {
  background-color: var(--primary-dark);
  color: var(--white);
  display: inline-block;
  padding: 0.1rem 0.3rem;
  font-size: 0.9rem;
  border-radius: 0.2rem;
  margin-right: 0.3rem;
}


::v-deep(.inline-content) {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
}

.line-button {
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--primary-light);
    border-radius: 0.2rem;
  }
}

.text-scope {
  padding: 0.2rem 0;
  padding-left: 0.3rem;
  display: inline-block;

  &.tips {
    color: var(--primary-light-3);

    &::v-deep(svg) {
      align-self: flex-start;
      margin-top: 0.2rem;
    }
    &::v-deep(.text-light-3) {
      color: var(--primary-purple);
    }
  }
}

fieldset.extra-column {
  border: 0;
  border-top: 1px solid var(--primary-light);
  padding-top: 0.3rem;
  padding-bottom: 0.2rem;
  margin-top: 0.3rem;
  padding-left: 0.4rem;

  & > legend {
    display: flex;
    align-items: center;
    padding: 0 0.4rem;
  }

  &.other-equipment-detail {
    opacity: 0.8;
    padding-left: 1.2rem;
  }
}

.proration-column {
  @apply inline-flex items-center relative border-b border-light border-solid px-2 mr-3;

  & > .value {
    @apply text-light-3 ml-3;
  }
  &::before {
    content: '';
    @apply bg-light rounded-full w-2 h-2 absolute -bottom-1 -right-1 block;
  }
}

::v-deep(.attr-scope) {
  padding: 0.1rem 0.4rem;
  display: inline-flex;
  align-items: center;
  line-height: 1.3rem;
  margin: 0.2rem 0;

  & > .title {
    font-size: 0.9rem;
    align-self: flex-end;
  }

  & > .value {
    margin-left: 0.4rem;
    color: var(--primary-light-4);
  }
}

.group-tail {
  border-top: 0.1rem var(--primary-light-2) solid;
  position: relative;
  margin: 0 0.2rem;
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;

  & > .prefix-icon {
    position: absolute;
    right: -0.2rem;
    top: -0.7rem;
  }
}

::v-deep(.formula--fix) {
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
  padding-left: 0.4rem;

  &.key--floor {
    background-color: var(--primary-light);
    > .name {
      color: var(--primary-light-4);
    }
  }
  &.key--min {
    background-color: var(--primary-water-blue-light);
    > .name {
      color: var(--primary-water-blue);
    }
  }
  &.key--max {
    background-color: var(--primary-blue-green-light);
    > .name {
      color: var(--primary-blue-green);
    }
  }
  & > .value {
    background-color: var(--white);
    border-radius: 0.3rem;
    margin-left: 0.3rem;
    margin-right: 0.2rem;
    padding: 0 0.4rem;

    & > .arg-separate {
      display: inline-block;
      height: 0.7em;
      border-left: 1px solid var(--primary-light-4);
      margin: 0 0.4rem;
      margin-top: 0.15rem;
    }
  }
}

::v-deep(.text-dark) {
  &.text-light-3 {
    color: var(--primary-red);
  }
  &.text-water-blue {
    color: var(--primary-blue-green);
  }
}


.top-menu-slide-enter-from, .top-menu-slide-leave-to {
  margin-right: -1.8rem!important;
}
.top-menu-slide-enter-active, .top-menu-slide-leave-active {
  transition: margin-right 0.5s;
}
</style>