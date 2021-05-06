<template>
  <section v-if="currentBuild">
    <div class="sticky top-0 border-b border-purple mb-4 z-10 bg-white">
      <div class="cursor-pointer px-4 py-1.5 flex items-center border-purple"
        @click="toggle('contents/top')">
        <cy-icon-text icon="ant-design:build-outlined">
          {{ currentBuild.name }}
        </cy-icon-text>
        <cy-button type="icon" class="ml-auto"
          :icon="contents.top ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
          :selected="contents.top" />
      </div>
    </div>
    <div class="p-4 top-12 border-1 border-light-2 rounded-xl mx-4 mb-4 z-10 bg-white duration-300"
      :class="{ sticky: contents.top, 'border-purple': contents.top }">
      <div class="flex items-center">
        <cy-title-input icon="ant-design:build-outlined"
          v-model:value="currentBuild.name"
          class="w-full" />
        <cy-options inline>
          <template #title>
            <cy-button type="border" icon="ant-design:build-outlined" />
          </template>
          <template #options>
            <cy-list-item v-for="buildData in buildDatas"
              :key="buildData.iid"
              @click="setCurrentBuild(buildData)">
              <cy-icon-text icon="ant-design:build-outlined">
                {{ buildData.origin.name }}
              </cy-icon-text>
            </cy-list-item>
            <cy-list-item @click="createBuild">
              <cy-icon-text icon="ic-round-add-circle-outline" text-color="light-3">
                {{ $lang('append build') }}
              </cy-icon-text>
            </cy-list-item>
          </template>
        </cy-options>
      </div>
      <div class="flex items-center flex-wrap">
        <div class="mx-2">
          <cy-button type="border" icon="bx-bx-copy"
            @click="copyBuild">
            {{ $globalLang('global/copy') }}
          </cy-button>
          <cy-button type="border" icon="mdi-export"
            main-color="blue-green"
            @click="exportBuild">
            {{ $globalLang('global/export') }}
          </cy-button>
          <cy-button type="border" icon="mdi-import"
            main-color="blue-green"
            @click="importBuild">
            {{ $globalLang('global/import') }}
          </cy-button>
          <cy-button type="border" icon="ic-baseline-delete-outline"
            main-color="gray"
            @click="removeBuild">
            {{ $globalLang('global/delete') }}
          </cy-button>
        </div>
      </div>
      <cy-icon-text text-size="small" text-color="purple" class="mt-4">
        {{ $lang('base options') }}
      </cy-icon-text>
      <div class="flex items-center p-2">
        <cy-input-counter v-model:value="currentEquipment.originalPotential">
          <template #title>
            <cy-icon-text>{{ $lang('equipment original potential') }}</cy-icon-text>
          </template>
        </cy-input-counter>
        <cy-button type="icon" icon="jam-hammer" class="ml-4"
          icon-color="water-blue-light" icon-color-hover="water-blue"
          :selected="contents.setEquipmentBasePotential"
          @click="toggle('contents/setEquipmentBasePotential')" />
      </div>
      <cy-transition type="fade">
        <div v-if="contents.setEquipmentBasePotential">
          <cy-icon-text text-size="small" text-color="water-blue" icon-color="water-blue" class="mt-4">
            {{ $lang('advanced options') }}
          </cy-icon-text>
          <div v-if="contents.setEquipmentBasePotential" class="p-2">
            <cy-input-counter v-model:value="currentEquipment.basePotential"
              main-color="water-blue-light">
              <template #title>
                <cy-icon-text>{{ $lang('equipment base potential') }}</cy-icon-text>
              </template>
            </cy-input-counter>
          </div>
          <cy-icon-text v-if="contents.setEquipmentBasePotential"
            text-size="small" text-color="water-blue" icon-color="water-blue" class="mt-4">
            {{ $lang('common options') }}
          </cy-icon-text>
          <div class="p-2">
            <cy-input-counter v-model:value="characterLevel" :step="10"
              main-color="water-blue-light">
              <template #title>
                <cy-icon-text>{{ $lang('character level') }}</cy-icon-text>
              </template>
            </cy-input-counter>
            <cy-input-counter v-model:value="smithLevel" :step="10"
              class="mt-3" main-color="water-blue-light">
              <template #title>
                <cy-icon-text>{{ $lang('smith level') }}</cy-icon-text>
              </template>
            </cy-input-counter>
          </div>
        </div>
      </cy-transition>
      <cy-icon-text text-size="small" text-color="purple" class="mt-3">
        {{ $lang('equipment type') }}
      </cy-icon-text>
      <div class="py-0.5 px-2">
        <cy-button v-for="option in equipmentTypeOptions" :key="option.id"
          type="border" @click="currentEquipmentType = option"
          :selected="currentEquipmentType === option.id">
          {{ option.text }}
        </cy-button>
      </div>
    </div>
    <div class="steps-content-container">
      <div class="steps-content">
        <div v-for="step in currentEquipment.allSteps"
          :key="step.index"
          class="step-container">
          <enchant-step :step="step" />
        </div>
        <cy-button icon="ic-round-add-circle-outline"
          class="step-container border flex items-center justify-center"
          style="--icon-width: 3.5rem; height: 12rem"
          @click="appendStep" />
      </div>
    </div>
    <div>
      <select-item :visible="windows.selectItem"
        :once="selectItemTarget.once"
        @close="toggle('windows/selectItem', false)"
        @select-item="selectItem" />
    </div>
    <div class="border-1 border-light-2 pt-2 pb-4 pl-2 pr-4 mx-3 mt-4 rounded-2xl bg-white duration-300"
      style="bottom: 4.75rem"
      :class="{
        sticky: contents.result,
        'animate-slide-up': contents.result,
        'border-purple': contents.result
      }">
      <template v-if="enchantResult.length !== 0">
        <div class="flex items-start">
          <cy-button type="icon" icon="ant-design:star-outlined"
            class="flex-shrink-0"
            @click="toggle('contents/resultStats')"
            :selected="contents.resultStats" />
          <cy-transition type="fade">
            <div v-if="contents.resultStats" class="mb-2">
              <div>
                <span v-for="item in enchantResultStats" :key="item.stat.baseName"
                  :class="item.negative ? ['text-orange', 'border-orange'] : ['text-light-4', 'border-light-4']"
                  class="stat-scope">
                  {{ item.text }}
                </span>
              </div>
              <div class="mt-2">
                <span v-for="item in enchantResultMaterials" :key="item.title"
                  class="stat-scope border-water-blue-light text-water-blue-light text-sm">
                  <span class="text-dark">{{ item.title }}</span>
                  <span class="text-water-blue ml-2">{{ item.value }}</span>
                </span>
              </div>
            </div>
          </cy-transition>
          <cy-button type="icon" icon="bx-bx-copy-alt"
            class="ml-auto flex-shrink-0"
            @click="copyEnchantResultText" />
        </div>
        <div v-for="(item, i) in enchantResult" :key="item.iid"
          class="flex items-start">
          <div class="text-light-2 mr-3 my-1 w-6 text-right flex-shrink-0">{{ i + 1 }}.</div>
          <template v-if="item.type === 'normal'">
            <span class="mr-2 my-1 flex-shrink-0">{{ item.parts[0] }}</span>
            <div class="flex items-center flex-wrap">
              <span v-for="part in item.parts.slice(1)" :key="part.text"
                class="stat-scope"
                :class="part.negative ? ['text-orange', 'border-orange'] : ['text-light-4', 'border-light-4']">
                {{ part.text }}
              </span>
              <cy-icon-text icon="mdi-creation" text-size="small"
                icon-color="water-blue" text-color="water-blue"
                class="ml-2">
                {{ item.remainingPotential }}
              </cy-icon-text>
            </div>
          </template>
          <div v-else>
            <template v-for="part in item.parts">
              <span v-if="(typeof part !== 'string')" :key="part.text"
                class="stat-scope"
                :class="part.negative ? ['text-orange', 'border-orange'] : ['text-light-4', 'border-light-4']">
                {{ part.text }}
              </span>
              <span v-else class="my-1 mr-2" :key="part">
                {{ part }}
              </span>
            </template>
            <cy-icon-text icon="mdi-creation" text-size="small"
              icon-color="water-blue" text-color="water-blue"
              class="ml-2 my-1">
              {{ item.remainingPotential }}
            </cy-icon-text>
          </div>
        </div>
      </template>
      <div v-else class="flex justify-center w-full">
        <cy-default-tips icon="mdi-ghost">
          {{ $lang('tips/invalid enchant result') }}
        </cy-default-tips>
      </div>
    </div>
    <div class="border-1 border-light-2 py-2 pl-4 pr-6 mx-3 mt-3 rounded-full flex items-center bg-white sticky bottom-4">
      <cy-button icon="potum" icon-src="custom" type="inline"
        @click="toggle('contents/result')">
        {{ $lang('result/show result') }}
      </cy-button>
      <cy-icon-text icon="bx-bx-star" class="ml-auto mr-3">
        {{ $lang('success rate') }}
      </cy-icon-text>
      <span class="text-light-4">
        {{ successRate }}
      </span>
    </div>
  </section>
  <div v-else>
    Loading...
  </div>
</template>
<script>
import { mapState } from "vuex";
import init from "./init.js";

import vue_EnchantStep from "./enchant-step";
import vue_selectItem from "./select-item";

import ToggleService from "@/setup/ToggleService";

import { EnchantBuild, EnchantStep, EnchantEquipment, /* EnchantItem */ } from "@/lib/Enchant/Enchant";
import ENCHANT_STATE from "@/lib/Enchant/Enchant/state";
import CY from "@utils/Cyteria";

/** */
export default {
  RegisterLang: "Enchant Simulator",
  setup() {
    const { windows, contents, toggle } = ToggleService({
      windows: ['selectItem'],
      contents: ['top', 'setEquipmentBasePotential', 'result', 'resultStats']
    });
    return { windows, contents, toggle };
  },
  data() {
    return {
      /** @type {SelectItemTarget} */
      selectItemTarget: {},

      buildCount: 0,
      equipmentTypeOptions: [{
        id: 0,
        text: this.$lang('equipment types/main-weapon'),
        type: EnchantEquipment.TYPE_MAIN_WEAPON,
        isOriginalElement: false
      }, {
        id: 1,
        text: this.$lang('equipment types/body-armor'),
        type: EnchantEquipment.TYPE_BODY_ARMOR,
        isOriginalElement: false
      }, {
        id: 2,
        text: this.$lang('equipment types/main-weapon|original-element'),
        type: EnchantEquipment.TYPE_MAIN_WEAPON,
        isOriginalElement: true
      }],

      listeners: {
        windowBeforeUnload: null,
        documentVisibilityChange: null
      }
    }
  },
  provide() {
    return {
      openSelectItem: this.openSelectItem
    };
  },
  beforeCreate() {
    init();
  },
  created() {
    this.$store.commit('enchant/load');
    this.$notify(this.$lang('save/tips/auto load successfully'));

    ENCHANT_STATE.Character.smithLevel = this.config.smithLevel;
    ENCHANT_STATE.Character.characterLevel = this.config.characterLevel;

    const evt_autoSave = () => this.autoSave();
    const evt_autoSave_2 = () => document.visibilityState === 'hidden' && this.autoSave();
    window.addEventListener('beforeunload', evt_autoSave);
    document.addEventListener('visibilitychange', evt_autoSave_2);
    this.listeners.windowBeforeUnload = evt_autoSave;
    this.listeners.documentVisibilityChange = evt_autoSave_2;
  },
  mounted() {
    if (this.currentBuildIndex === -1) {
      this.createBuild();
    }
  },
  unmounted() {
    window.removeEventListener('beforeunload', this.listeners.windowBeforeUnload);
    document.removeEventListener('visibilitychange', this.listeners.documentVisibilityChange);
    this.autoSave();
  },
  computed: {
    ...mapState('enchant', ['builds', 'currentBuildIndex', 'config']),

    buildDatas() {
      return this.builds.map((build, i) => ({
        origin: build,
        iid: i
      }));
    },

    /** @return {EnchantBuild} */
    currentBuild() {
      return this.builds[this.currentBuildIndex];
    },

    /** @return {EnchantEquipment} */
    currentEquipment() {
      if (!this.currentBuild) {
        return null;
      }
      return this.currentBuild.equipment;
    },

    enchantResult() {
      /** @type {EnchantStep[]} */
      const validSteps = this.currentEquipment.validSteps;

      /**
       * @param {any[]} target
       * @param {any[]} src
       */
      const insertOdd = (target, src) => {
        let cur = 1, cnt = 0;
        while (cnt < src.length || cur < target.length) {
          target.splice(cur, 0, src[cnt]);
          ++cnt;
          cur += 2;
        }
      };

      const result = validSteps.map((step, i) => {
        let text = '';
        let parts = [];
        if (step.type === EnchantStep.TYPE_EACH) {
          const stat = step.stats[0];
          const tparts = [{
            stat,
            text: stat.show('each'),
            negative: stat.value < 0
          }, {
            stat,
            text: stat.show('current'),
            negative: stat.value < 0
          }];
          const textParts = this.$lang('result/enchant: each').split(/\$\d+/);
          insertOdd(textParts, tparts);
          parts = textParts;
          text = parts.map(p => typeof p !== 'string' ? p.text : p).join('');
        } else {
          const tparts = step.stats.map(stat => ({
            stat,
            text: stat.show('current'),
            negative: stat.value < 0
          }));
          parts = [this.$lang('result/enchant: normal'), ...tparts];
          text = this.$lang('result/enchant: normal') + tparts.map(p => p.text).join('｜');
        }
        const remainingPotential = step.remainingPotential;
        text += '｜' + remainingPotential + 'pt';
        return {
          iid: i,
          text,
          parts,
          remainingPotential,
          type: step.type === EnchantStep.TYPE_EACH ? 'each' : 'normal'
        }
      });
      return result;
    },
    enchantResultStats() {
      /** @type {EnchantEquipment} */
      const eq = this.currentEquipment;
      return eq.stats(eq.lastStep.index)
        .sort((a, b) => {
          const av = a.stat.base.order + (a.value < 0 ? -99999 : 0);
          const bv = b.stat.base.order + (b.value < 0 ? -99999 : 0);
          return bv - av;
        })
        .map(stat => ({
          text: stat.show(),
          stat,
          negative: stat.value < 0
        }));
    },
    enchantResultMaterials() {
      const titleList = this.$lang('material point type list');
      return this.currentEquipment.allMaterialPointCost.map((p, i) => ({
        title: titleList[i],
        value: p
      }));
    },

    successRate() {
      if (!this.currentEquipment) {
        return 0;
      }
      const rate = this.currentEquipment.successRate;
      return rate === -1 ?
        this.$lang('success rate: unlimited') :
        (rate.toFixed(1).replace('.0', '') + '%');
    },

    currentEquipmentType: {
      get() {
        const eq = this.currentEquipment;
        if (eq.fieldType === EnchantEquipment.TYPE_MAIN_WEAPON) {
          return eq.isOriginalElement ? 2 : 0;
        }
        return 1;
      },
      set(v) {
        this.currentEquipment.fieldType = v.type;
        this.currentEquipment.isOriginalElement = v.isOriginalElement;
      }
    },

    characterLevel: {
      set(v) {
        this.$store.commit('enchant/setConfig', { characterLevel: v });
        ENCHANT_STATE.Character.level = v;
      },
      get() {
        return this.config.characterLevel;
      }
    },
    smithLevel: {
      set(v) {
        this.$store.commit('enchant/setConfig', { smithLevel: v });
        ENCHANT_STATE.Character.smithLevel = v;
      },
      get() {
        return this.config.smithLevel;
      }
    }
  },
  methods: {
    autoSave() {
      this.$store.commit('enchant/save');
      this.$notify(this.$lang('save/tips/auto save successfully'));
    },
    setCurrentBuild(data) {
      this.$store.commit('enchant/setCurrentBuild', { index: data.iid });
    },
    createBuild() {
      const name = this.$lang('build') + ' ' + (this.buildCount + 1).toString();
      const build = new EnchantBuild(name);
      this.$store.commit('enchant/appendBuild', build);
      ++this.buildCount;
    },
    removeBuild() {
      if (this.builds.length === 1) {
        this.$notify(this.$lang('tips/keep at least one build'));
        return;
      }
      this.$confirm({
        message: this.$lang('tips/confirm: remove build'),
        confirm: () => this.$store.commit('enchant/removeBuild', this.currentBuild)
      });
    },
    copyBuild() {
      this.$store.commit('enchant/copyBuild', this.currentBuild);
      this.$notify(this.$lang('tips/copy build successfully'));
    },
    exportBuild() {
      /** @type {EnchantBuild} */
      const build = this.currentBuild;
      const odata = build.save();
      const data = JSON.stringify(odata);
      CY.file.save({
        data,
        fileName: build.name.replace(/\s/g, '_') + '.txt'
      });
    },
    importBuild() {
      CY.file.load({
        succeed: res => {
          const build = EnchantBuild.load(JSON.parse(res));
          this.$store.commit('enchant/appendBuild', build);
          this.$notify(this.$lang('save/tips/import successfully', [`「${build.name}」`]));
        },
        error: () => this.$lang('save/tips/import: error'),
        checkFileType: fileType => {
          if (fileType !== 'txt') {
            this.$notify(this.$lang('save/tips/import: wrong file type'));
            return false;
          }
          return true;
        }
      });
    },

    appendStep() {
      this.currentEquipment.appendStep();
    },

    openSelectItem(type, target, once = false) {
      this.selectItemTarget = { type, target, once };
      this.toggle('windows/selectItem', true);
    },

    /** @param {EnchantItemData} item */
    selectItem(item) {
      const { type, target } = this.selectItemTarget;
      if (type === 'step' && target instanceof EnchantStep) {
        if (target.hasStat(item.origin, item.type)) {
          this.$notify(this.$lang('tips/step stat repeated'));
          return;
        }
        const stat = target.appendStat(item.origin, item.type);
        if (!stat) {
          this.$notify(this.$lang('tips/number of stats of equipment has reached the upper limit'));
          return;
        }
        const eq = stat.belongEquipment;
        const min = stat.limit;
        const pot = stat.itemBase.getPotential(stat.type, eq);
        stat.value = pot > stat.itemBase.basePotential(stat.type) ?
          (min - Math.min(eq.stat(stat.itemBase, stat.type, eq.lastStep.index).value, 0)) : 0;
      }
    },

    copyEnchantResultText() {
      const resultStatsText = this.enchantResultStats.map(item => item.text).join('｜');
      const materialsText = this.enchantResultMaterials.map(item => `${item.title} ${item.value}`).join('｜');
      const stepsText = this.enchantResult
        .map((p, i) => `${i+1}. ${p.text}`)
        .join('\n');
      CY.copyToClipboard(
        `✩ ${this.$lang('result/stats')}\n` +
        `${resultStatsText}\n` +
        `✩ ${this.$lang('result/materials')}\n` +
        `${materialsText}\n\n` +
        `${stepsText}\n\n` +
        `✩ ${this.$lang('success rate')}｜${this.successRate}\n` +
        '｜cy-grimore.netlify.app｜'
      );
      this.$notify(this.$lang('tips/copy result text successfully'));
    }
  },
  components: {
    'enchant-step': vue_EnchantStep,
    'select-item': vue_selectItem
  }
};

/**
 * @typedef {object} SelectItemTarget
 * @property {("step"|"doll")} type
 * @property {object} target
 * @property {boolean} once
 */
/**
 * @typedef {object} EnchantItemData
 * @property {string} id
 * @property {symbol} type
 * @property {EnchantItem} origin
 */
</script>

<style lang="postcss" scoped>
div.steps-content-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 60vh;

  & > .steps-content {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    width: calc(46rem + 5px);

    & > .step-container {
      width: 22rem;
      @apply m-2;
    }
  }
}

.stat-scope {
  border-bottom-width: 1px;
  display: inline-block;
  position: relative;

  @apply px-2 mr-3 my-1;

  &::before {
    content: '';
    display: inline-block;
    background-color: currentcolor;
    position: absolute;

    @apply w-2 h-2 rounded-full -right-1 -bottom-1;
  }
}
</style>