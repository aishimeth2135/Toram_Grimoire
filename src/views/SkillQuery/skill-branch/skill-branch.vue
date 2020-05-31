<template>
  <div class="main--" :class="rootClassList">
    <cy-icon-text v-if="otherEquipmentBranchVisible" iconify-name="bx-bxs-moon"
      style="position: absolute; top: -0.3rem;
        left: -0.7rem; --icon-width: 1.8rem; z-index: 1;
        --icon-color: var(--primary-light-2)" />
    <fieldset v-if="type == 'other-equipment'" class="branch-type-title">
      <legend>
        <equipment-info :equipment="equipmentTitle" />
      </legend>
    </fieldset>
    <fieldset v-if="['damage', 'effect', 'next', 'passive', 'heal'].includes(branch.name)" :class="branchClass">
      <!-- [start] title -->
      <legend>
        <cy-icon-text v-if="showData['name']" class="name" :iconify-name="titleIconName">
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
      <div class="top-buttons">
        <cy-button v-if="branch.name == 'damage'"
          type="icon-only" :iconify-name="detailVisible ? 'bx-bxs-book-open' : 'bx-bxs-book-add'"
          @click="toggleVisible('detail')" />
        <cy-button v-if="type == 'main' && otherEquipmentBranchDatas" type="icon-only"
          :iconify-name="otherEquipmentBranchVisible ? 'bx-bxs-down-arrow-circle' : 'bx-bxs-right-arrow-circle'"
          @click="toggleVisible('otherEquipmentBranch')" />
        <cy-button type="icon-only" v-if="branch.history.length != 0"
          :iconify-name="historyVisible ? 'ic-round-history-toggle-off' : 'ic-round-history'"
          @click="toggleVisible('history')" />
      </div>
      <!-- == [end] buttons scope -->
      <!-- [end] title -->
      <!-- [start] branch detail -->
      <transition name="fade">
        <branch-detail v-if="detailVisible" :detail-show-data="detailShowData" />
      </transition>
      <cy-icon-text v-if="isMark" iconify-name="mdi-leaf" class="prefix-icon" />
      <cy-icon-text v-if="isMark" iconify-name="cib-overleaf" class="suffix-icon" />
      <!-- [end] branch detail -->
      <!-- [start] sub content -->
      <div class="content-line" v-if="subContentValid">
        <template v-if="branch.name == 'damage'">
          <cy-icon-text v-if="showData['title']" class="condition-scope text-small light-text"
            iconify-name="bx-bx-game">
            {{ showData['title'] }}
          </cy-icon-text>
          <cy-icon-text v-if="showData['element']" :iconify-name="elementIconName"
            class="condition-scope text-small light-text">
            {{ showData['element'] }}
          </cy-icon-text>
          <span class="condition-scope attr" v-if="showData['@proration: damage']">
            <cy-icon-text class="name text-small" iconify-name="ri-error-warning-line">
              {{ showData['@proration: damage: title'] }}
            </cy-icon-text>
            <span class="value light-text">{{ showData['@proration: damage'] }}</span>
          </span>
          <span class="condition-scope attr" v-if="showData['@proration: proration']">
            <cy-icon-text class="name text-small" iconify-name="ri-error-warning-line">
              {{ showData['@proration: proration: title'] }}
            </cy-icon-text>
            <span class="value light-text">{{ showData['@proration: proration'] }}</span>
          </span>
        </template>
        <template v-else-if="branch.name == 'effect' || branch.name == 'next'">
          <cy-icon-text v-if="showData['condition']" class="condition-scope text-small light-text" iconify-name="eva-checkmark-circle-2-outline">
            {{ showData['condition'] }}
          </cy-icon-text>
          <cy-icon-text v-if="showData['duration']" class="condition-scope text-small light-text" iconify-name="zmdi-time-interval">
            <span v-html="showData['duration']"></span>
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
            <cy-button v-if="isScoped" class="condition-scope text-small light-text no-border no-padding" iconify-name="bx-bx-target-lock" @click="toggleVisible('skillArea')">
            {{ langText('skill area/button text') }}
          </cy-button>
        </legend>
        <transition name="fade">
          <div v-if="skillAreaVisible" class="skill-area">
            <div class="graph">
              <skill-area :attrs="branch.attrs" />
              <div class="bottom">
                <cy-icon-text iconify-name="bx-bxs-circle" class="text-small mr-normal" style="--icon-color: var(--primary-water-blue)">
                  {{ langText('skill area/point: character') }}
                </cy-icon-text>
                <cy-icon-text iconify-name="bx-bxs-circle" class="text-small" style="--icon-color: var(--primary-red)">
                  {{ langText('skill area/point: target') }}
                </cy-icon-text>
              </div>
            </div>
            <div class="info">
              <table class="attrs-table">
                <tbody>
                  <tr>
                    <td>{{ showData['effective_area: title'] }}</td>
                    <td v-html="showData['effective_area']"></td>
                  </tr>
                  <tr v-if="branch.attrs['effective_area'] != 'sector'">
                    <td>{{ showData['radius: title'] }}</td>
                    <td v-html="showData['radius']"></td>
                  </tr>
                  <tr v-if="showData['move_distance']">
                    <td>{{ showData['move_distance: title'] }}</td>
                    <td v-html="showData['move_distance']"></td>
                  </tr>
                  <tr v-if="showData['angle']">
                    <td>{{ showData['angle: title'] }}</td>
                    <td v-html="showData['angle']"></td>
                  </tr>
                  <tr v-if="showData['start_position_offsets']">
                    <td>{{ showData['start_position_offsets: title'] }}</td>
                    <td v-html="showData['start_position_offsets']"></td>
                  </tr>
                  <tr v-if="showData['end_position_offsets']">
                    <td>{{ showData['end_position_offsets: title'] }}</td>
                    <td v-html="showData['end_position_offsets']"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </transition>
      </fieldset>
      <fieldset class="extra-column" v-if="branch.name == 'damage' && showData['ailment_name']">
        <legend>
          <cy-icon-text iconify-name="ri-plant-line" class="text-small">
            {{ langText('ailment title') }}
          </cy-icon-text>
        </legend>
        <div class="content-line">
          <div class="text-scope" v-html="ailmentText(showData)"></div>
        </div>
      </fieldset>
      <!-- [end] other -->
      <!-- [start] extra -->
      <fieldset class="extra-column" v-for="(suffixShowData, i) in suffixBranchShowDatas">
        <template v-if="suffixShowData['@parent-branch'].name == 'extra'">
          <legend>
            <cy-icon-text class="condition-scope text-small light-text" iconify-name="eva-checkmark-circle-2-outline">
              <span v-html="suffixShowData['condition']"></span>
            </cy-icon-text>
            <span class="bg-scope" v-if="suffixShowData['target']">{{ suffixShowData['target'] }}</span>
          </legend>
          <div class="text-scope" v-if="suffixShowData['caption']" v-html="suffixShowData['caption']"></div>
          <template v-else-if="branch.name == 'damage'">
            <div v-if="suffixShowData['ailment_name']" class="text-scope"
              v-html="ailmentText(suffixShowData)"></div>
            <div v-if="suffixShowData['element']" class="text-scope"
              v-html="extraElementCaption(suffixShowData['element'])"></div>
          </template>
          <stats v-else :stats="suffixShowData['@parent-branch'].stats"></stats>
        </template>
      </fieldset>
      <!-- [end] extra -->
    </fieldset>
    <div v-else-if="branch.name == 'list'" :class="branchClass">
      <!-- <cy-icon-text iconify-name="mdi-leaf" class="prefix-icon" /> -->
      <div v-for="(data, i) in showData['@list-datas']" class="leaf-list-item">
        <cy-icon-text iconify-name="mdi-leaf" class="prefix-icon" />
        <span v-html="data['text']"></span>
      </div>
    </div>
    <div v-else :class="branchClass">
      <cy-icon-text v-if="isMark" iconify-name="mdi-leaf" class="prefix-icon" />
      <cy-icon-text v-if="isMark" iconify-name="cib-overleaf" class="suffix-icon" />
      <template v-if="branch.name == 'proration'">
        <div class="content-line">
          <span class="attr-scope normal">
            <span class="title">{{ showData['damage: title'] }}</span>
            <span class="value">{{ showData['damage'] }}</span>
          </span>
          <span class="attr-scope normal">
            <span class="title">{{ showData['proration: title'] }}</span>
            <span class="value">{{ showData['proration'] }}</span>
          </span>
        </div>
      </template>
      <template v-else-if="branch.name == 'text'">
        <div class="content-line" :class="{ 'group-title': branch.group }">
          <cy-button v-if="branch.group" type="icon-only" @click="toggleGroup()" style="--icon-width: 1.6rem;"
            :iconify-name="branch.group.expansion ? 'mdi-flower-tulip' : 'eva-question-mark-circle-outline'" />
          <div class="text-scope" v-html="showData['text']"></div>
        </div>
      </template>
      <template v-else-if="branch.name == 'tips'">
        <div class="content-line">
          <cy-button v-if="branch.group" type="icon-only" @click="toggleGroup()" style="--icon-width: 1.3rem;"
            :iconify-name="branch.group.expansion ? 'mdi-flower-tulip' : 'eva-question-mark-circle-outline'" />
          <div class="text-scope tips">
            <cy-icon-text iconify-name="bx-bx-message-rounded" class="text-small">
              <span v-html="showData['text']"></span>
            </cy-icon-text>
          </div>
        </div>
      </template>
      <template v-else-if="branch.name == 'stack'">
        <div class="content-line">
          <cy-input-counter v-if="stackValue != null" :value="stackValue" @set-value="setStackValue"
            :range="stackValueRange">
            <template v-slot:title>
              <cy-icon-text iconify-name="ion-leaf">
                {{ showData['name'] }}
              </cy-icon-text>
            </template>
            <template v-if="showData['unit']">
              <span>{{ showData['unit'] }}</span>
            </template>
          </cy-input-counter>
        </div>
      </template>
    </div>
    <template v-if="type == 'main'">
      <template v-if="otherEquipmentBranchVisible && otherEquipmentBranchDatas">
        <transition-group name="fade" mode="out-in" appear>
          <skill-branch v-for="(data, i) in otherEquipmentBranchDatas"
            :branch="data.branch" :key="data.iid" type="other-equipment"
            :skill-state="skillState" class="extra-branch" />
        </transition-group>
      </template>
      <template v-if="historyVisible">
        <transition-group name="fade" mode="out-in" appear>
          <skill-branch v-for="(data, i) in historyDatas"
            :branch="data.branch" :key="data.iid" type="history"
            :skill-state="skillState" class="extra-branch" />
        </transition-group>
      </template>
    </template>
  </div>
</template>
<script>
import GetLang from "@global-modules/LanguageSystem.js";

import handleFormula from "../module/handleFormula.js";

import vue_damageFormula from "./damage-formula.vue";
import vue_healFormula from "./heal-formula.vue";
import vue_stats from "./stats.vue";
import vue_branchDetail from "./branch-detail.vue";
import vue_equipmentInfo from "./equipment-info.vue";
import vue_skillArea from "./skill-area.vue";

import { Fragment } from "vue-fragment";

export default {
  name: 'skill-branch',
  props: ['branch', 'skillState', 'type'],
  inject: ['handleTagButton', 'createTagButtons', 'tagButtonClassName'],
  data() {
    return {
      otherEquipmentBranchVisible: false,
      historyBranchVisible: false,
      stackValue: null,
      detailVisible: false,
      skillAreaVisible: false,
      historyVisible: false
    }
  },
  provide() {
    return {
      'langText': this.langText,
      'calcValueStr': this.calcValueStr,
      'highlightValueStr': this.highlightValueStr
    }
  },
  updated() {
    this.handleTagButton(this.$el);
  },
  mounted() {
    this.handleTagButton(this.$el);
  },
  computed: {
    elementIconName(v) {
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
        main: eq.main != -1 ? GetLang('Skill Query/equipment/main-weapon')[eq.main] : -1,
        sub: eq.sub != -1 ? GetLang('Skill Query/equipment/sub-weapon')[eq.sub] : -1,
        body: eq.body != -1 ? GetLang('Skill Query/equipment/body-armor')[eq.body] : -1,
        none: eq.main == -1 && eq.sub == -1 && eq.body == -1 ? GetLang('Skill Query/equipment/none') : void 0
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
      if (p == 'damage')
        return this.showData['title'] || this.isScoped || this.showData['element'];

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
        'other-equipment': this.type == 'other-equipment'
      };
    },
    isScoped() {
      if (this.branch.name == 'damage') {
        if (this.branch.attrs['type'] == 'AOE')
          return true;
      }
      return false;
    },
    isMark() {
      return this.branch.attrs['is_mark'] == '1';
    },
    suffixBranchShowDatas() {
      return this.branch.suffix
        .filter(p => p.name == 'extra')
        .map(p => this.handleShowData(p));
    },
    titleIconName() {
      if (this.branch.name == 'damage')
        return 'ri-sword-fill';
      return 'mdi-checkbox-multiple-blank-circle';
    },
    showData() {
      // console.log('[update show data] Branch Name: ' + this.branch.name);
      return this.handleShowData(this.branch);
    },
    otherEquipmentBranchDatas() {
      if (this.branch.id == '-')
        return null;

      const res = this.skillState.states
        .filter(p => p.branchs.find(b => b.id == this.branch.id))
        .map((p, i) => ({
          iid: i,
          branch: p.branchs.find(b => b.id == this.branch.id)
        }));

      return res.length == 0 ? null : res;
    }
  },
  methods: {
    extraElementCaption(v) {
      const s = `<span class="light-text">${this.langText('damage/element/' + v)}</span>`;
      return this.langText('apply element', [s]);
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
          name: ['range_damage', 'unsheathe_attack'],
          type: 'bool'
        });
        this.calcValueStr(attrs['frequency']) > 1 && handleList.push('judgment', 'frequency_judgment');
      }

      handleList.forEach(item => {
        const default_icon = 'ic-outline-info';
        if (typeof item == 'object') {
          let { name, type = 'normal', icon } = item;
          name = Array.isArray(name) ? name : [name];
          if (!icon) {
            icon = {
              'bool': {
                '1': 'eva-checkmark-circle-2-outline',
                '0': 'eva-close-circle-outline'
              }
            } [type] || { '@default': default_icon };
          }
          name.forEach(k => {
            const v = this.branchAttrToLangText(bch, attrs, k, { prefix: '-detail' });
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
          const v = this.branchAttrToLangText(bch, attrs, item, { prefix: '-detail' });
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

      console.log('toggle group...');
      console.log(g);

      let cur = bchs.findIndex(p => p == this.branch);
      let cnt = g.size;
      let cur_g = g;

      const len = bchs.length - 1;
      while (cnt != 0 && cur != len) {
        --cnt;
        cur += 1;

        const p = bchs[cur];
        if (cur_g.expandable)
          p.visible = !g.expansion ? false : cur_g.expansion;

        if (p.group) {
          cnt += p.group.size;
          cur_g = p.group;
        }
      }
    },
    ailmentText(showData) {
      return this.langText('damage/ailment text', [showData['ailment_chance'], `<span class="${this.tagButtonClassName}">${showData['ailment_name']}</span>`]);
    },
    updateStackValue(e) {
      this.setStackValue(parseInt(e.target.value, 10));
    },
    setStackValue(v) {
      const p = this.findStackState();
      if (p) {
        this.stackValue = v;
        p.value = v;
      }
    },
    findStackState(stack_id) {
      stack_id = stack_id === void 0 ? parseInt(this.branch.attrs['id'], 0) : stack_id;
      const p = this.branch['@parent-state'].stackStates.find(a => a.id == stack_id);
      return p ? p : null;
    },
    branchAttrToLangText(bch, data, key, { type='normal', prefix='' }={}) {
      if (type == 'value') {
        const v = this.calcValueStr(bch.attrs[key]);
        const p = this.isNumberStr(v) && parseFloat(v) < 0 ? 'negative' : 'positive';
        return this.langText(`${bch.name + prefix}/${key}/${p}`, [data[key]]);
      } else {
        let p = data[key];
        if (p == '1' || p == '0') // 轉換布林值
          p = p == '1' ? 'true' : 'false';
        let preName = bch.name + prefix;
        preName = bch.mainBranch ? bch.mainBranch.name + ': ' + preName : preName;
        return this.langText(`${preName}/${key}/${p}`);
      }
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

          handleValueList.push('constant', 'extra_constant', {
            name: ['multiplier', 'ailment_chance'],
            extraHandle: v => v + '%'
          }, {
            name: 'frequency',
            extraHandle: v => v + this.langText('global/times')
          });

          hiddenList.push({
            name: ['constant', 'multiplier', 'extra_constant', 'is_place'],
            validation: v => v != '0'
          }, {
            name: 'frequency',
            validation: v => parseInt(v) > 1 && data['title'] != 'normal' && data['title'] != 'normal_attack',
            valueOnly: true
          }, {
            name: 'name',
            validation: v => v,
            defaultValue: this.langText('damage/base name')
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

          // skill area
          handleValueList.push({
            name: 'angle',
            extraHandle: v => v + '°'
          }, {
            name: ['radius', 'move_distance', 'start_position_offsets', 'end_position_offsets'],
            extraHandle: v => v + 'm'
          });
          hiddenList.push({
            name: ['move_distance', 'angel'],
            validation: v => v
          }, {
            name: ['start_position_offsets', 'end_position_offsets'],
            validation: v => v != 0,
            valueOnly: true
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
          handleValueList.push({
            name: ['min', 'max', 'default'],
            calcOnly: true
          });
          hiddenList.push({
            name: 'name',
            validation: v => v,
            defaultValue: this.langText('stack/base name')
          });
        } else if (bch.name == 'effect') {
          handleValueList.push('radius', {
            name: 'duration',
            extraHandle: v => this.langText('display duration', [v])
          });
          handleTextList.push('caption');
          hiddenList.push({
            name: ['condition', 'type'],
            validation: v => v != 'none'
          }, {
            name: 'is_place',
            validation: v => v != '0'
          }, {
            name: 'name',
            validation: v => v,
            defaultValue: this.langText('effect/base name')
          });
          ['auto', 'hit'].includes(data['condition']) && langTextList.push('condition');
          langTextList.push('is_place', 'type');
        } else if (bch.name == 'next') {
          handleTextList.push('caption');
          hiddenList.push({
            name: 'condition',
            validation: v => v,
            defaultValue: this.langText('next/condition default')
          }, {
            name: 'name',
            validation: v => v,
            defaultValue: this.langText('effect/base name')
          });
        } else if (bch.name == 'passive') {
          handleTextList.push('caption');
          hiddenList.push({
            name: 'name',
            validation: v => v,
            defaultValue: this.langText('passive/base name')
          });
        } else if (bch.name == 'heal') {
          handleValueList.push('duration', 'frequency', 'cycle', 'constant');
          hiddenList.push({
            name: 'name',
            validation: v => v,
            defaultValue: this.langText('heal/base name')
          }, {
            name: 'constant',
            validation: v => v != 0
          });

          data['@extra-value-list'] = [];
          if (data['extra_value'] && data['extra_text']) {
            const vs = data['extra_value'].split(/\s*,\s*/)
              .map(p => this.handleValueStr(p, null, { toPercentage: true }));
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
            extraHandle: v => v + '%'
          });
          hiddenList.push({
            name: 'condition',
            validation: v => v,
            defaultValue: this.langText('global suffix: extra/condition default')
          });
          handleTextList.push('caption', 'condition');
        } else if ((mbch.name == 'effect' || mbch.name == 'next' || mbch.name == 'passive') && bch.name == 'extra') {
          hiddenList.push({
            name: 'condition',
            validation: v => v,
            defaultValue: this.langText('global suffix: extra/condition default')
          });
          handleTextList.push('caption', 'condition');
        }
      }

      hiddenList.forEach(({ name, validation, defaultValue, valueOnly }) => {
        name = Array.isArray(name) ? name : [name];
        name.forEach(p => {
          const t = !valueOnly ? data[p] : this.calcValueStr(attrs[p]);
          if (!validation(t))
            data[p] = defaultValue ? defaultValue : void 0;
        });
      });

      handleValueList.forEach(k => {
        if (typeof k == 'object') {
          let { name, extraHandle, calcOnly } = k;
          name = Array.isArray(name) ? name : [name];
          name.forEach(p => data[p] = !calcOnly ? this.handleValueStr(data[p], extraHandle) : this.calcValueStr(data[p]));
        } else
          data[k] = this.handleValueStr(data[k]);
      });

      handleTextList.forEach(k => data[k] = this.handleTextStr(data[k], data));

      langTextList.forEach(k => {
        if (typeof k == 'object') {
          let {name, type='normal' } = k;
          name = Array.isArray(name) ? name : [name];
          name.forEach(a => {
            let p = data[a];
            if (!p)
              return;
            data[a] = this.branchAttrToLangText(bch, data, a, { type });
          });
        } else {
          let p = data[k];
          if (!p)
            return;
          data[k] = this.branchAttrToLangText(bch, data, k);
        }
      });

      titleList.forEach(k => {
        const p = data[k];
        if (!p)
          return;
        data[k + ': title'] = this.langText(`${bch.name}/${k}: title`);
      });

      // console.log(this.branch.name, data);

      return data;
    },
    highlightValueStr(vstr, originalStr, {
      base = 'light-text',
      stack = 'light-text-1',
      extra = []
    } = {}) {
      const clist = [(originalStr.includes('stack') ? stack : base), ...extra];
      return `<span class="${clist.join(' ')}">${vstr}</span>`
    },
    handleTextStr(str, data) {
      if (!str)
        return str;

      str = str
        .replace(/\$\{([^\}]+)\}(%?)/g, (m, m1, m2) => this.highlightValueStr(this.handleValueStr(m1) + m2, m1))
        .replace(/\(\(((?:(?!\(\().)+)\)\)/g, (m, m1) => `<span class="multiple-values">${m1}</span>`);
      str = this.createTagButtons(str);

      data['mark'] && data['mark'].split(/\s*,\s*/)
        .forEach(p => str = str.replace(new RegExp(p, 'g'), m => `<span class="light-text">${m}</span>`));
      data['branch'] && data['branch'].split(/\s*,\s*/)
        .forEach(p => str = str.replace(new RegExp(p, 'g'), m => `<span class="light-text">${m}</span>`));
      data['skill'] && data['skill'].split(/\s*,\s*/)
        .forEach(p => str = str.replace(new RegExp(p, 'g'), m => `<span class="light-text">${m}</span>`));
      return str;
    },
    handleValueStr(str, extraHandle, { toPercentage = false } = {}) {
      if (!str) // str == '' || str == '0'
        return str;
      const originalStr = str;

      const numStrToPercentage = s => (100 * parseFloat(s)).toFixed(1).replace('.0', '') + '%';
      const replaceVarStr = s => {
        const list = [
          'BSTR', 'BINT', 'BAGI', 'BVIT', 'BDEX', 'TEC',
          'STR', 'INT', 'AGI', 'VIT', 'DEX', 'shield_refining',
          'dagger_atk', 'target_def', 'target_level', 'guard_power'
        ];
        list.forEach(cs => s = s.replace(new RegExp('\\$' + cs, 'g'), this.langText('formula replaced text/' + cs)));
        return s;
      };

      str = str.split(/\s*,,\s*/)
        .map(p => this.calcValueStr(p))
        .map(p => p.charAt(0) == '-' ? `(${p})` : p)
        .join('+')
        .replace(/([$_a-zA-Z][$_a-zA-Z0-9]*)(\*)(\d\.\d+)/g,
          (m, m1, m2, m3) => m1 + m2 + numStrToPercentage(m3))
        .replace('*', '×');

      const vstr = str;
      str = this.isNumberStr(vstr) && toPercentage ? numStrToPercentage(str) : str;
      str = !this.isNumberStr(vstr) ? replaceVarStr(str) : str;
      str = !this.isNumberStr(vstr) ? `<span class="multiple-values">${str}</span>` : str;

      extraHandle && (str = extraHandle(str));

      str = this.highlightValueStr(str, originalStr);

      return str;
    },
    calcValueStr(str) {
      const skillState = this.skillState;
      const effectState = this.branch['@parent-state'];

      return handleFormula(str, { skillState, effectState });
    },
    langText(v, vs) {
      return GetLang('Skill Query/Branch/' + v, vs);
    },
    isNumberStr(str) {
      return /^[\d.]+$/.test(str);
    }
  },
  watch: {
    branch: {
      immediate: true,
      handler(v, oldv) {
        if (this.branch.name == 'stack') {
          const p = this.findStackState();
          this.stackValue = p ? p.value : null;
        }
        if (this.branch.group) {
          this.toggleGroup(this.branch.group.expansion);
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
    'skill-area': vue_skillArea,
    'fragment': Fragment
  }
};
</script>
<style lang="less" scoped>
@deep-operator: ~'>>>';

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
  border-top: 2px solid var(--primary-light-2);
  padding-left: 1rem;
  margin: 0 0.6rem;
}

.branch.extra-branch {
  // opacity: 0.8;
  margin-left: 1.2rem;
}

div.branch {
  padding: 0.2rem 0.2rem;

  >.top {
    margin-bottom: 0.4rem;
    display: flex;
    align-items: center;

    >.name {
      margin-right: 0.8rem;
      color: var(--primary-purple);
    }

    >.detail {
      display: inline-block;
    }
  }

  >.content-line {
    padding: 0 0.3rem;
  }

  &.branch-mark {
    padding: 0.4rem 0.6rem;

    >.prefix-icon {
      top: -0.8rem;
    }
  }
}

fieldset.branch {
  border: 1px solid var(--primary-light);
  margin: 0.6rem 0;
  position: relative;
  transition: border-width 0.3s ease;

  >legend {
    margin-bottom: 0.3rem;
    display: flex;
    align-items: center;
    padding: 0 0.4rem;

    >.name {
      margin-right: 0.8rem;
      color: var(--primary-purple);
    }

    >.detail {
      display: inline-block;
      font-size: 0.9rem;
      align-self: flex-end;

      >.prop {
        display: inline-block;
        color: var(--primary-green);
        margin-right: 0.4rem;
        // border: 1px solid var(--primary-green);
        // padding: 0.1rem 0.2rem;
        // border-radius: 0.2rem;
      }
    }
  }

  >.top-buttons {
    position: absolute;
    right: 0.2rem;
    top: 0;
  }
}

.branch.branch-mark {
  border: 2px solid var(--primary-light-2);
  position: relative;
  margin-top: 0.9rem;
  margin-bottom: 0.9rem;

  >.prefix-icon {
    position: absolute;
    z-index: 1;
    left: -1rem;
    top: -0.4rem;
    --icon-width: 2rem;
    --icon-color: var(--primary-light-2);
  }

  >.suffix-icon {
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

  @{deep-operator} .name {
    margin-right: 0.5rem;
  }

  .unit {
    color: var(--primary-light-4);
  }
}

.branch.list {
  padding-left: 0.6rem;
  margin-bottom: 0.3rem;
  padding-top: 0.5rem;
}

.branch.proration {
  margin-top: 0.6rem;
}

.mr-normal {
  margin-right: 0.4rem;
}

.content-line {
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;

  &+.extra-column {
    margin-top: 0.8rem;
  }
}

.condition-scope {
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;

  &.attr {
    > .name {
      margin-right: 0.4rem;
      color: var(--primary-dark);
    }

    > .value {
      font-size: 0.9rem;
    }
  }
}

@{deep-operator} .bg-scope {
  background-color: var(--primary-dark);
  color: var(--white);
  display: inline-block;
  padding: 0.1rem 0.3rem;
  font-size: 0.9rem;
  border-radius: 0.2rem;
  margin-right: 0.3rem;
}


@{deep-operator} .inline-content {
  display: inline-flex;
  align-items: center;
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

    @{deep-operator} .light-text {
      color: var(--primary-purple);
    }
  }
}

.skill-area {
  /* border: 1px solid var(--primary-light);
  box-shadow: 0.1rem 0.1rem 0.6rem var(--primary-light); */
  margin: 0.6rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 0.6rem;

  > .graph {
    display: inline-block;

    > .bottom {
      text-align: center;
    }    
  }

  > .info {
    display: inline-block;
    padding-top: 1rem;
    padding-left: 1rem;

    .attrs-table {
      tr {
        td:nth-child(1) {
          text-align: right;
          padding-right: 0.6rem;
          border-right: 1px solid var(--primary-light);
        }
        td:nth-child(2) {
          padding-left: 0.6rem;
          color: var(--primary-light-4);
        }
      }
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

  >legend {
    display: flex;
    align-items: center;
    padding: 0 0.4rem;
  }

  &.other-equipment-detail {
    opacity: 0.8;
    padding-left: 1.2rem;
  }
}

@{deep-operator} .attr-scope {
  padding: 0.1rem 0.4rem;
  display: inline-flex;
  align-items: center;
  line-height: 1.3rem;

  // &.normal {
  //   //border-left: 2px solid var(--primary-light-3);
  //   padding: 0 0.5rem;
  //   margin-right: 0.4rem;
  //   border-bottom: 1px solid var(--primary-light-2);
  // }

  &.normal {
    border-left: 2px solid var(--primary-light-3);
    padding: 0.1rem 0.7rem;
    margin-right: 0.3rem;
  }

  >.title {
    font-size: 0.9rem;
    align-self: flex-end;
  }

  >.value {
    margin-left: 0.4rem;
    color: var(--primary-light-4);
  }
}
</style>