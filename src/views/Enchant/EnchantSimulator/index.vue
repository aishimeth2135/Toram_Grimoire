<template>
  <section v-if="currentBuild">
    <div class="sticky top-0 border-b border-purple mb-4 z-10 bg-white">
      <div
        class="cursor-pointer px-4 py-1.5 flex items-center border-purple"
        @click="toggle('contents/top')"
      >
        <cy-icon-text icon="ant-design:build-outlined">
          {{ currentBuild.name }}
        </cy-icon-text>
        <cy-button-icon
          class="ml-auto"
          :icon="contents.top ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'"
          :selected="contents.top"
        />
      </div>
    </div>
    <div
      class="p-4 top-12 border-1 border-light-2 rounded-xl mx-4 mb-4 z-10 bg-white duration-300"
      :class="{ sticky: contents.top, 'border-purple': contents.top }"
    >
      <div class="flex items-center">
        <cy-title-input
          v-model:value="currentBuild.name"
          icon="ant-design:build-outlined"
          class="w-full"
        />
        <cy-options inline>
          <template #title>
            <cy-button-border icon="ant-design:build-outlined" />
          </template>
          <template #options>
            <cy-list-item
              v-for="buildData in buildDatas"
              :key="buildData.iid"
              @click="setCurrentBuild(buildData)"
            >
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
          <cy-button-border
            icon="bx-bx-copy"
            @click="copyBuild"
          >
            {{ $rootLang('global/copy') }}
          </cy-button-border>
          <cy-button-border
            icon="mdi-export"
            main-color="blue-green"
            @click="exportBuild"
          >
            {{ $rootLang('global/export') }}
          </cy-button-border>
          <cy-button-border
            icon="mdi-import"
            main-color="blue-green"
            @click="importBuild"
          >
            {{ $rootLang('global/import') }}
          </cy-button-border>
          <cy-button-border
            icon="ic-baseline-delete-outline"
            main-color="gray"
            @click="removeBuild"
          >
            {{ $rootLang('global/delete') }}
          </cy-button-border>
        </div>
      </div>
      <cy-icon-text size="small" text-color="purple" class="mt-4">
        {{ $lang('base options') }}
      </cy-icon-text>
      <div class="flex items-center flex-wrap p-2 mr-2">
        <cy-input-counter v-model:value="currentEquipment.originalPotential">
          <template #title>
            <cy-icon-text>{{ $lang('equipment original potential') }}</cy-icon-text>
          </template>
        </cy-input-counter>
        <cy-button-icon
          icon="jam-hammer"
          class="ml-2 my-2"
          icon-color="water-blue-light"
          icon-color-hover="water-blue"
          :selected="contents.extraOptions"
          @click="toggle('contents/extraOptions')"
        />
      </div>
      <cy-transition type="fade">
        <div v-if="contents.extraOptions">
          <cy-icon-text size="small" text-color="water-blue" icon-color="water-blue" class="mt-4">
            {{ $lang('advanced options') }}
          </cy-icon-text>
          <div class="p-2">
            <cy-input-counter
              v-model:value="currentEquipment.basePotential"
              main-color="water-blue-light"
            >
              <template #title>
                <cy-icon-text>{{ $lang('equipment base potential') }}</cy-icon-text>
              </template>
            </cy-input-counter>
          </div>
          <cy-icon-text size="small" text-color="water-blue" icon-color="water-blue" class="mt-4">
            {{ $lang('common options') }}
          </cy-icon-text>
          <div class="p-2">
            <cy-input-counter
              v-model:value="characterLevel"
              :step="10"
              main-color="water-blue-light"
            >
              <template #title>
                <cy-icon-text>{{ $lang('character level') }}</cy-icon-text>
              </template>
            </cy-input-counter>
            <cy-input-counter
              v-model:value="smithLevel"
              :step="10"
              class="mt-3"
              main-color="water-blue-light"
            >
              <template #title>
                <cy-icon-text>{{ $lang('smith level') }}</cy-icon-text>
              </template>
            </cy-input-counter>
          </div>
        </div>
      </cy-transition>
      <cy-icon-text size="small" text-color="purple" class="mt-3">
        {{ $lang('equipment type') }}
      </cy-icon-text>
      <div class="py-0.5 px-2">
        <cy-button-check
          v-for="option in equipmentTypeOptions"
          :key="option.id"
          :selected="currentEquipmentType === option.id"
          @click="currentEquipmentType = option"
        >
          {{ option.text }}
        </cy-button-check>
      </div>
    </div>
    <div class="steps-content-container">
      <div class="steps-content">
        <div
          v-for="step in currentEquipment.allSteps"
          :key="step.index"
          class="step-container"
        >
          <enchant-step :step="step" />
        </div>
        <cy-button
          icon="ic-round-add-circle-outline"
          class="step-container border flex items-center justify-center"
          style="--icon-width: 3.5rem; height: 12rem"
          @click="appendStep"
        />
      </div>
    </div>
    <div>
      <select-item
        :visible="windows.selectItem"
        :once="selectItemTarget.once"
        :is-weapon="isWeapon"
        @close="toggle('windows/selectItem', false)"
        @select-item="selectItem"
      />
    </div>
    <div
      class="border-1 border-light-2 pt-2 pb-4 pl-2 pr-4 mx-3 mt-4 rounded-2xl bg-white duration-300"
      style="bottom: 4.75rem"
      :class="{
        sticky: contents.result,
        'animate-slide-up': contents.result,
        'border-purple': contents.result,
      }"
    >
      <enchant-result :equipment="currentEquipment" />
    </div>
    <div class="sticky bottom-4">
      <div
        v-if="currentEquipment.allSteps.length === 0 && !contents.result"
        class="border-1 border-light-2 py-4 px-5 mx-3 mt-3 rounded-2xl bg-white"
      >
        <div class="text-center">
          <cy-button
            icon="ic-round-add-circle-outline"
            type="border"
            @click="appendStep"
          >
            {{ $lang('append enchant step') }}
          </cy-button>
        </div>
        <div class="text-sm text-water-blue pt-1 text-center">
          {{ $lang('footer guide/title: close') }}
        </div>
        <div class="pt-3">
          <cy-icon-text size="small" text-color="purple">
            {{ $lang('footer guide/title') }}
          </cy-icon-text>
        </div>
        <div class="pt-1">
          <cy-icon-text
            icon="akar-icons:circle-chevron-down"
            text-color="purple"
            size="small"
            class="mr-3"
          >
            {{ $lang('footer guide/toggle result/titles')[0] }}
          </cy-icon-text>
          <cy-icon-text
            icon="akar-icons:circle-chevron-up"
            text-color="purple"
            size="small"
          >
            {{ $lang('footer guide/toggle result/titles')[1] }}
          </cy-icon-text>
        </div>
        <div class="pl-3 text-sm">
          {{ $lang('footer guide/toggle result/caption') }}
        </div>
        <div class="mt-3">
          <cy-icon-text
            icon="mdi-cube-outline"
            text-color="purple"
            icon-color="water-blue"
            size="small"
            class="mr-3"
          >
            {{ $lang('footer guide/toggle display mode/titles')[0] }}
          </cy-icon-text>
          <cy-icon-text
            icon="mdi-cube-off-outline"
            text-color="purple"
            icon-color="water-blue"
            size="small"
          >
            {{ $lang('footer guide/toggle display mode/titles')[1] }}
          </cy-icon-text>
        </div>
        <div class="pl-3 text-sm">
          {{ $lang('footer guide/toggle display mode/caption') }}
        </div>
      </div>
      <div class="border-1 border-light-2 py-2 pl-4 pr-6 mx-3 mt-3 rounded-full flex items-center flex-wrap bg-white">
        <cy-button-icon
          :icon="contents.result ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
          :selected="contents.result"
          @click="toggle('contents/result')"
        />
        <cy-button-icon
          class="ml-2"
          :icon="state.statDisplayMode === 1 ? 'mdi-cube-outline' : 'mdi-cube-off-outline'"
          main-color="water-blue"
          :selected="state.statDisplayMode === 1"
          @click="state.statDisplayMode = state.statDisplayMode === 1 ? 0 : 1"
        />
        <!-- <cy-button-icon @click="optimizeSteps" /> -->
        <cy-icon-text icon="bx-bx-star" class="ml-auto mr-3">
          {{ $lang('success rate') }}
        </cy-icon-text>
        <span class="text-light-4">
          {{ successRate }}
        </span>
      </div>
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
import vue_enchantResult from "./enchant-result";

import ToggleService from "@/setup/ToggleService";

import { EnchantBuild, EnchantStep, EnchantEquipment /* EnchantItem */ } from "@/lib/Enchant/Enchant";
import CY from "@utils/Cyteria";

/** */
export default {
  RegisterLang: "Enchant Simulator",
  provide() {
    return {
      openSelectItem: this.openSelectItem,
      rootState: this.state,
    };
  },
  setup() {
    const { windows, contents, toggle } = ToggleService({
      windows: ['selectItem'],
      contents: ['top', 'extraOptions', 'result'],
    });
    return { windows, contents, toggle };
  },
  data() {
    return {
      state: {
        statDisplayMode: 0,
      },

      /** @type {SelectItemTarget} */
      selectItemTarget: {},

      buildCount: 0,
      equipmentTypeOptions: [{
        id: 0,
        text: this.$lang('equipment types/main-weapon'),
        type: EnchantEquipment.TYPE_MAIN_WEAPON,
        isOriginalElement: false,
      }, {
        id: 1,
        text: this.$lang('equipment types/body-armor'),
        type: EnchantEquipment.TYPE_BODY_ARMOR,
        isOriginalElement: false,
      }, {
        id: 2,
        text: this.$lang('equipment types/main-weapon|original-element'),
        type: EnchantEquipment.TYPE_MAIN_WEAPON,
        isOriginalElement: true,
      }],

      listeners: {
        windowBeforeUnload: null,
        documentVisibilityChange: null,
      },
    }
  },
  beforeCreate() {
    init();
  },
  created() {
    this.$store.dispatch('enchant/init');
    this.$notify(this.$lang('save/tips/auto load successfully'));

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
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.listeners.windowBeforeUnload);
    document.removeEventListener('visibilitychange', this.listeners.documentVisibilityChange);
    this.autoSave();
  },
  computed: {
    ...mapState('enchant', ['builds', 'currentBuildIndex', 'config']),

    buildDatas() {
      return this.builds.map((build, i) => ({
        origin: build,
        iid: i,
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
    successRate() {
      if (!this.currentEquipment) {
        return 0;
      }
      const rate = this.currentEquipment.successRate;
      return rate === -1 ?
        this.$lang('success rate: unlimited') :
        Math.floor(rate) + '%';
    },
    isWeapon() {
      return this.currentEquipmentType !== 1;
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
      },
    },

    characterLevel: {
      set(v) {
        this.$store.commit('enchant/setConfig', { characterLevel: v });
      },
      get() {
        return this.config.characterLevel;
      },
    },
    smithLevel: {
      set(v) {
        this.$store.commit('enchant/setConfig', { smithLevel: v });
      },
      get() {
        return this.config.smithLevel;
      },
    },
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
    async removeBuild() {
      if (this.builds.length === 1) {
        this.$notify(this.$lang('tips/keep at least one build'));
        return;
      }
      if (await this.$confirm(this.$lang('tips/confirm: remove build'))) {
        this.$store.commit('enchant/removeBuild', this.currentBuild);
      }
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
        fileName: build.name.replace(/\s/g, '_') + '.txt',
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
        },
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
        const min = stat.limit[0];
        const pot = stat.itemBase.getPotential(stat.type, eq);
        stat.value = pot > stat.originalPotential ?
          (min - Math.min(eq.stat(stat.itemBase, stat.type, eq.lastStep.index).value, 0)) : 0;
      }
    },

    // optimizeSteps() {
    //   /** @type {EnchantEquipment} */
    //   const eq = this.currentEquipment;
    //   console.log('=====================================');
    //   eq.steps(eq.lastStep.index).forEach(step => console.log(step, step.optimizeType()));
    // }
  },
  components: {
    'enchant-step': vue_EnchantStep,
    'select-item': vue_selectItem,
    'enchant-result': vue_enchantResult,
  },
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

    @media screen and (max-width: 50rem) {
      @apply w-full;
    }

    & > .step-container {
      width: 22rem;
      @apply m-2 max-w-full;
    }
  }
}
</style>
