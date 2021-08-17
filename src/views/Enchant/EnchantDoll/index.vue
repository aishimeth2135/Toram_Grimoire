<template>
  <section class="main--enchant-doll">
    <div ref="first-step" class="step-content">
      <div>
        <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
          {{ $lang('equipment/select type/title') }}
        </cy-icon-text>
      </div>
      <div class="mt-1 text-sm pl-4">
        {{ $lang('equipment/select type/caption') }}
      </div>
      <div class="py-4 pl-2 flex justify-center flex-wrap">
        <cy-button
          v-for="option in equipmentTypeOptions"
          :key="option.id"
          type="check"
          :selected="currentEquipmentType === option.id"
          @click="currentEquipmentType = option"
        >
          {{ option.text }}
        </cy-button>
      </div>
      <div class="mt-4">
        <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
          {{ $lang('equipment/original potential/title') }}
        </cy-icon-text>
      </div>
      <div class="mt-1 text-sm pl-4">
        {{ $lang('equipment/original potential/caption') }}
      </div>
      <div class="mt-4 flex justify-center flex-wrap">
        <cy-button-check v-model:selected="equipmentState.autoFindPotentialMinimum">
          {{ $lang('equipment/original potential/auto find minimum') }}
        </cy-button-check>
      </div>
      <div
        v-if="!equipmentState.autoFindPotentialMinimum"
        class="py-4 pl-4 flex justify-center"
      >
        <cy-input-counter
          v-model:value="currentEquipment.originalPotential"
          class="mt-2"
          :range="[1, 200]"
        >
          <template #title>
            <cy-icon-text icon="mdi-creation">
              {{ $lang.extra('simulator', 'equipment original potential') }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </div>
      <div class="flex justify-center pt-2">
        <cy-button-inline
          :icon="contents.setConfig ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'"
          :selected="contents.setConfig"
          text-color="light-2"
          @click="toggle('contents/setConfig')"
        >
          {{ $lang('equipment/set config/title') }}
        </cy-button-inline>
      </div>
      <template v-if="contents.setConfig">
        <div class="flex justify-center pt-2">
          <cy-input-counter
            v-model:value="characterLevel"
            :step="10"
            main-color="water-blue-light"
          >
            <template #title>
              <cy-icon-text>{{ $lang.extra('simulator', 'character level') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div class="pt-2 flex justify-center">
          <cy-input-counter
            v-model:value="smithLevel"
            :step="10"
            main-color="water-blue-light"
          >
            <template #title>
              <cy-icon-text>{{ $lang.extra('simulator', 'smith level') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </template>
      <cy-transition type="fade">
        <div
          v-if="stepCounter > stepContents.equipment"
          class="disabled-mask"
          @click="maskClick"
        />
      </cy-transition>
    </div>
    <div v-if="stepCounter > stepContents.equipment" class="flex justify-center mb-4">
      <cy-button-border
        icon="mdi-leaf"
        main-color="orange"
        @click="backToStep(stepContents.equipment)"
      >
        {{ $lang('back to step') }}
      </cy-button-border>
    </div>
    <cy-transition type="fade" @after-enter="stepAfterEnter">
      <div
        v-if="stepCounter >= stepContents.selectPositiveStat"
        class="step-content"
      >
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
            {{ $lang('select positive stats/title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4">
          {{ $lang('select positive stats/caption') }}
        </div>
        <div class="flex justify-center my-4">
          <div class="mt-2 border border-purple max-w-xs">
            <template v-if="doll.positiveStats.length !== 0">
              <cy-list-item v-for="stat in doll.positiveStats" :key="stat.statId">
                <cy-icon-text
                  :text-color="stat.value >= 0 ? 'dark' : 'orange'"
                  class="w-full"
                >
                  {{ stat.showAmount() }}
                </cy-icon-text>
                <div class="flex items-center w-full mt-1">
                  <cy-input-counter
                    inline
                    max-button
                    min-button
                    :value="stat.value"
                    :range="[1, stat.limit[1]]"
                    @update:value="setStatValue(stat, $event)"
                  />
                  <cy-button-icon
                    icon="jam-close-circle"
                    icon-color="gray"
                    class="ml-auto"
                    @click="removePositiveStat(stat)"
                  />
                </div>
              </cy-list-item>
            </template>
            <cy-default-tips
              v-else
              icon="fluent-leaf-two-16-regular"
              class="my-4 mx-6"
            >
              {{ $lang('tips/no stat selected') }}
            </cy-default-tips>
          </div>
        </div>
        <div class="text-center">
          <cy-button-border
            icon="ic-round-add-circle-outline"
            @click="openSelectItem('positiveStats')"
          >
            {{ $lang('select item') }}
          </cy-button-border>
        </div>
        <div class="flex justify-center mt-4">
          <cy-button-check v-model:selected="selectPositiveStatState.autoFill">
            {{ $lang('select positive stats/auto fill') }}
          </cy-button-check>
        </div>
        <cy-transition type="fade">
          <div
            v-if="stepCounter > stepContents.selectPositiveStat"
            class="disabled-mask"
            @click="maskClick"
          />
        </cy-transition>
      </div>
    </cy-transition>
    <div v-if="stepCounter > stepContents.selectPositiveStat" class="flex justify-center mb-4">
      <cy-button-border
        icon="mdi-leaf"
        main-color="orange"
        @click="backToStep(stepContents.selectPositiveStat)"
      >
        {{ $lang('back to step') }}
      </cy-button-border>
    </div>
    <cy-transition type="fade" @after-enter="stepAfterEnter">
      <div
        v-if="stepCounter >= stepContents.selectNegativeStat"
        class="step-content"
      >
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
            {{ $lang('select negative stats/title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4">
          {{ $lang('select negative stats/caption') }}
        </div>
        <div class="mt-2 ml-4 mr-2">
          <cy-icon-text
            icon="ic-outline-info"
            size="small"
            text-color="water-blue"
            icon-color="water-blue-light"
          >
            {{ $lang('select negative stats/tips 1') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 ml-4 mr-2">
          <cy-icon-text
            icon="ic-outline-info"
            size="small"
            text-color="water-blue"
            icon-color="water-blue-light"
          >
            {{ $lang('tips/performance of auto find negative stats') }}
          </cy-icon-text>
        </div>
        <div v-if="equipmentState.autoFindPotentialMinimum" class="mt-1 ml-4 mr-2">
          <cy-icon-text
            icon="ic-outline-info"
            size="small"
            text-color="water-blue"
            icon-color="water-blue-light"
          >
            {{ $lang('tips/performance of auto find minimum of original potential and auto find negative stats') }}
          </cy-icon-text>
        </div>
        <div class="mt-4 mb-6 flex justify-center flex-wrap">
          <cy-button-check v-model:selected="selectNegativeStatState.auto">
            {{ $lang('select negative stats/auto select') }}
          </cy-button-check>
        </div>
        <template v-if="selectNegativeStatState.auto">
          <template v-if="currentEquipmentType === 1">
            <div>
              <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
                {{ $lang('select negative stats/select config: base type/title') }}
              </cy-icon-text>
            </div>
            <div class="mt-1 text-sm pl-4">
              {{ $lang('select negative stats/select config: base type/caption') }}
            </div>
            <div class="py-4 pl-2 flex justify-center flex-wrap">
              <cy-button
                v-for="option in dollConfigOptions.baseType"
                :key="option"
                type="check"
                :selected="doll.config.baseType === option"
                @click="doll.config.baseType = option"
              >
                {{ $lang('select negative stats/select config: base type/option texts/' + option) }}
              </cy-button>
            </div>
          </template>
          <div>
            <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
              {{ $lang('select negative stats/select config: auto find negative stats type/title') }}
            </cy-icon-text>
          </div>
          <div class="mt-1 text-sm pl-4">
            {{ $lang('select negative stats/select config: auto find negative stats type/caption') }}
          </div>
          <div class="py-4 pl-2 flex justify-center flex-wrap">
            <cy-button
              v-for="option in dollConfigOptions.autoFindNegaitveStatsType"
              :key="option"
              type="check"
              :selected="doll.config.autoFindNegaitveStatsType === option"
              @click="doll.config.autoFindNegaitveStatsType = option"
            >
              {{ $lang('select negative stats/select config: auto find negative stats type/option texts/' + option) }}
            </cy-button>
          </div>
        </template>
        <div
          v-if="selectNegativeStatState.auto && autoNegativeStats.length < doll.numNegativeStats"
          class="flex justify-center mt-4"
        >
          <div>
            <cy-icon-text size="small" icon-color="water-blue" class="mr-4">
              {{ $lang('select negative stats/auto selected') }}
            </cy-icon-text>
            <cy-icon-text size="small">
              {{ $lang('select negative stats/manually selected') }}
            </cy-icon-text>
          </div>
        </div>
        <div class="flex justify-center mb-4">
          <div class="mt-2 border border-purple max-w-xs">
            <template v-if="negativeStats.length !== 0">
              <cy-list-item v-for="stat in negativeStats" :key="stat.statId">
                <cy-icon-text
                  :text-color="stat.value >= 0 ? 'dark' : 'orange'"
                  :icon-color="autoNegativeStats.includes(stat) ? 'water-blue' : 'light-2'"
                  class="w-full"
                >
                  {{ stat.showAmount() }}
                </cy-icon-text>
                <div class="flex items-center flex-wrap w-full mt-1">
                  <cy-input-counter
                    :disabled="autoNegativeStats.includes(stat)"
                    inline
                    max-button
                    min-button
                    :value="stat.value"
                    :range="[stat.limit[0], -1]"
                    @update:value="setStatValue(stat, $event)"
                  />
                  <cy-button
                    :disabled="autoNegativeStats.includes(stat)"
                    type="icon"
                    icon="jam-close-circle"
                    icon-color="gray"
                    class="ml-auto"
                    @click="removeNegativeStat(stat)"
                  />
                </div>
              </cy-list-item>
            </template>
            <cy-default-tips
              v-else
              icon="fluent-leaf-two-16-regular"
              class="my-4 mx-6"
            >
              {{ $lang('tips/no stat selected') }}
            </cy-default-tips>
          </div>
        </div>
        <div
          v-if="!selectNegativeStatState.auto || negativeStats.length < doll.numNegativeStats"
          class="text-center"
        >
          <cy-button-border
            icon="ic-round-add-circle-outline"
            @click="openSelectItem('negativeStats')"
          >
            {{ $lang('select item') }}
          </cy-button-border>
          <div v-if="selectNegativeStatState.auto && autoNegativeStats.length < doll.numNegativeStats" class="mt-2">
            <div>
              <cy-icon-text
                icon="ic-outline-info"
                size="small"
                text-color="water-blue"
                icon-color="water-blue-light"
              >
                {{ $lang('select negative stats/stats from auto not enough')[0] }}
              </cy-icon-text>
            </div>
            <div class="text-water-blue text-sm">
              {{ $lang('select negative stats/stats from auto not enough')[1] }}
            </div>
          </div>
        </div>
        <cy-transition type="fade">
          <div
            v-if="stepCounter > stepContents.selectNegativeStat"
            class="disabled-mask"
            @click="maskClick"
          />
        </cy-transition>
      </div>
    </cy-transition>
    <div v-if="stepCounter > stepContents.selectNegativeStat" class="flex justify-center mb-4">
      <cy-button-border
        icon="mdi-leaf"
        main-color="orange"
        @click="backToStep(stepContents.selectNegativeStat)"
      >
        {{ $lang('back to step') }}
      </cy-button-border>
    </div>
    <cy-transition type="fade" @after-enter="stepAfterEnter">
      <div
        v-if="stepCounter >= stepContents.result && resultEquipment"
        class="step-content"
      >
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
            {{ $lang('result/title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4">
          {{ $lang('result/caption')[0] }}
          <br>{{ $lang('result/caption')[1] }}
        </div>
        <div
          v-if="equipmentState.autoFindPotentialMinimum"
          class="mt-6 flex justify-center items-center"
        >
          <cy-icon-text icon="bx-bx-star" class="mr-3">
            {{ $lang('result/current potential is') }}
          </cy-icon-text>
          <span class="text-purple">
            {{ currentEquipment.originalPotential }}
          </span>
        </div>
        <div
          v-if="equipmentState.autoFindPotentialMinimum
            && resultEquipment.originalPotential === 99
            && resultEquipment.realSuccessRate < 100"
          class="mt-2 flex justify-center"
        >
          <cy-icon-text
            icon="ic-outline-info"
            size="small"
            text-color="water-blue"
            icon-color="water-blue-light"
          >
            {{ $lang('tips/can not auto find minimum of original potential') }}
          </cy-icon-text>
        </div>
        <div class="mt-6 mb-4 flex justify-center">
          <div class="border-1 border-purple rounded-lg pt-3 pb-5 pl-4 pr-6 bg-white">
            <EnchantResult :equipment="resultEquipment" />
          </div>
        </div>
        <div class="mt-6">
          <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
            {{ $lang('export result/title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4">
          {{ $lang('export result/caption') }}
        </div>
        <div class="mt-4 flex justify-center">
          <cy-title-input
            v-if="!exportState.hasExport"
            v-model:value="exportState.name"
            class="max-w-sm"
          />
        </div>
        <div class="my-2 flex justify-center">
          <cy-button
            v-if="!exportState.hasExport"
            type="border"
            icon="ic-outline-save"
            main-color="blue-green"
            @click="exportResult"
          >
            {{ $rootLang('global/export') }}
          </cy-button>
          <cy-button
            v-else
            type="border"
            icon="ic-round-open-in-new"
            main-color="blue-green"
            @click="$router.replace('/enchant')"
          >
            {{ $lang('export result/redirect to enchant-simulator') }}
          </cy-button>
        </div>
      </div>
    </cy-transition>
    <div class="flex items-center justify-center border-t border-purple mt-12 pt-4 relative">
      <cy-button
        v-if="stepCounter !== 3"
        type="border"
        icon="mdi-leaf"
        :disabled="nextStepDisabled"
        main-color="orange"
        @click="nextStep"
      >
        {{ $lang('next step') }}
      </cy-button>
      <span :class="{ 'absolute': stepCounter !== 3, 'right-0': stepCounter !== 3 }">
        <cy-button-border
          icon="bx-bx-reset"
          main-color="gray"
          @click="reset"
        >
          {{ $rootLang('global/reset') }}
        </cy-button-border>
      </span>
    </div>
    <div
      v-if="equipmentState.autoFindPotentialMinimum && stepCounter === stepContents.selectNegativeStat"
      class="my-2 flex justify-center"
    >
      <cy-icon-text
        icon="ic-outline-info"
        size="small"
        text-color="water-blue"
        icon-color="water-blue-light"
      >
        {{ $lang('tips/performance of auto find minimum of original potential') }}
      </cy-icon-text>
    </div>
    <div
      v-if="stepCounter === stepContents.equipment"
      ref="top"
      class="text-light-3 text-sm text-center px-8 py-8"
    >
      <div>{{ $lang('top caption')[0] }}</div>
      <div class="mt-2">
        {{ $lang('top caption')[1] }}
      </div>
    </div>
    <EnchantSelectItem
      :visible="windows.selectItem"
      :is-weapon="equipmentIsWeapon"
      :for-positive="stepCounter === stepContents.selectPositiveStat"
      :default-negative="stepCounter === stepContents.selectNegativeStat"
      @select-item="selectItem"
      @close="toggle('windows/selectItem', false)"
    />
  </section>
</template>
<script>
import { mapState } from 'vuex';
import vue_EnchantSelectItem from '../EnchantSimulator/enchant-select-item';
import vue_EnchantResult from '../EnchantSimulator/enchant-result';

import init from './init.js';
import init2 from '../EnchantSimulator/init.js';
import ToggleService from '@/setup/ToggleService';

import EnchantDoll from '@/lib/Enchant/Enchant/doll';
import { EnchantBuild, EnchantEquipment, EnchantStat } from '@/lib/Enchant/Enchant';

export default {
  name: 'EnchantDoll',
  RegisterLang: {
    root: 'Enchant Doll',
    extra: {
      'simulator': 'Enchant Simulator',
    },
  },
  components: {
    EnchantSelectItem: vue_EnchantSelectItem,
    EnchantResult: vue_EnchantResult,
  },
  setup() {
    const { windows, contents, toggle } = ToggleService({
      windows: ['selectItem'],
      contents: ['setConfig'],
    });
    return { windows, contents, toggle };
  },
  data() {
    return {
      doll: new EnchantDoll(),
      stepCounter: 0,
      selectItemMode: '',

      autoNegativeStatsData: null,
      resultEquipment: null,

      consts: {
        autoFindPotentialMinimumLimit: 99,
      },

      equipmentState: {
        autoFindPotentialMinimum: false,
      },

      exportState: {
        hasExport: false,
        name: this.$lang('export result/build default name'),
      },

      selectPositiveStatState: {
        autoFill: true,
      },

      selectNegativeStatState: {
        auto: false,
        manually: [],
      },

      stepContents: {
        equipment: 0,
        selectPositiveStat: 1,
        selectNegativeStat: 2,
        result: 3,
      },

      dollConfigOptions: {
        baseType: ['physical', 'magic', 'none'],
        autoFindNegaitveStatsType: ['success-rate', 'material'],
      },

      equipmentTypeOptions: [{
        id: 0,
        text: this.$lang.extra('simulator', 'equipment types/main-weapon'),
        type: EnchantEquipment.TYPE_MAIN_WEAPON,
        isOriginalElement: false,
      }, {
        id: 1,
        text: this.$lang.extra('simulator', 'equipment types/body-armor'),
        type: EnchantEquipment.TYPE_BODY_ARMOR,
        isOriginalElement: false,
      }, {
        id: 2,
        text: this.$lang.extra('simulator', 'equipment types/main-weapon|original-element'),
        type: EnchantEquipment.TYPE_MAIN_WEAPON,
        isOriginalElement: true,
      }],
    };
  },
  beforeCreate() {
    init();
    init2(); // load lang data
  },
  created() {
    this.$watch(() => this.selectNegativeStatState.auto, newv => {
      this.updateAutoFindNegativeStats(newv);
    });
    this.$watch(() => this.doll.config.baseType, () => {
      this.updateAutoFindNegativeStats(this.selectNegativeStatState.auto);
    });

    this.$store.dispatch('enchant/init');
  },
  mounted() {
    this.$nextTick(() => this.$refs['first-step'].scrollIntoView({ behavior: 'smooth' }));
  },
  computed: {
    ...mapState('enchant', ['config']),
    equipmentIsWeapon() {
      return this.currentEquipment.fieldType === EnchantEquipment.TYPE_MAIN_WEAPON;
    },
    nextStepDisabled() {
      if (this.stepCounter === this.stepContents.selectNegativeStat) {
        return this.negativeStats.length === 0;
      }
      if (this.stepCounter === this.stepContents.selectPositiveStat) {
        return this.doll.positiveStats.length === 0;
      }
      return false;
    },
    autoNegativeStats() {
      return this.autoNegativeStatsData ? this.autoNegativeStatsData.stats : [];
    },
    negativeStats() {
      if (this.selectNegativeStatState.auto) {
        return this.autoNegativeStats;
      }
      return this.selectNegativeStatState.manually;
    },

    currentEquipment() {
      return this.doll.build.equipment;
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
        this.doll.positiveStats.forEach(stat => {
          if (stat.value > stat.limit[1]) {
            stat.value = stat.limit[1];
          }
        });
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
    updateAutoFindNegativeStats(value) {
      if (value === true) {
        const manuallyStats = this.selectNegativeStatState.manually;
        if (this.equipmentState.autoFindPotentialMinimum) {
          this.autoFindNegaitveStats(manuallyStats, true);
          return;
        }
        this.autoFindNegaitveStats(manuallyStats);
      } else {
        this.autoNegativeStatsData = null;
      }
    },
    autoFindNegaitveStats(manuallyStats, originalPotentialUnknow = false) {
      this.autoNegativeStatsData = null;
      this.$notify.loading.show();
      this.$nextTick(() => {
        setTimeout(() => {
          try {
            if (originalPotentialUnknow) {
              this.autoNegativeStatsData = this.doll.autoFindNegaitveStats(manuallyStats, 99);
              // if (this.autoNegativeStatsData.realSuccessRate >= 100) {
              //   this.autoFindPotentialMinimumEquipment();
              //   this.autoNegativeStatsData = this.doll.autoFindNegaitveStats(manuallyStats);
              // }
            } else {
              this.autoNegativeStatsData = this.doll.autoFindNegaitveStats(manuallyStats);
            }
          } catch (e) {
            console.warn('[enchant-doll] some error when auto find negative stats');
            console.log(e);
            this.$notify(this.$lang('tips/unknow error when calc'));
          } finally {
            this.$nextTick(() => this.$notify.loading.hide());
          }
        }, 50);
      });
    },
    maskClick() {
      this.$notify(this.$lang('tips/cannot directly modify the settings of the previous step'));
    },
    autoFindPotentialMinimumEquipment() {
      if (this.autoNegativeStatsData && this.autoNegativeStatsData.equipment) {
        const data = this.autoNegativeStatsData;
        if (data.realSuccessRate < 100) {
          this.currentEquipment.originalPotential = this.consts.autoFindPotentialMinimumLimit;
          return data.equipment;
        }
      }
      let left = 1,
        right = this.consts.autoFindPotentialMinimumLimit,
        mid = Math.floor((left + right) / 2);
      let cur = this.doll.calc(this.negativeStats, mid);
      while (right - left > 1) {
        if (cur.realSuccessRate <= 100) {
          left = mid;
        } else {
          right = mid;
        }
        mid = Math.floor((left + right) / 2);
        cur = this.doll.calc(this.negativeStats, mid);
      }
      if (cur.realSuccessRate < 100) {
        cur = this.doll.calc(this.negativeStats, right);
      }
      this.currentEquipment.originalPotential = cur.originalPotential;
      return cur;
    },
    exportResult() {
      const build = new EnchantBuild(this.exportState.name, this.resultEquipment.copy(this.$store.state.datas.Enchant.categorys));
      this.$store.dispatch('enchant/exportDollBuild', build);
      this.exportState.hasExport = true;
      this.$notify(this.$lang('tips/export successfully'));
    },
    reset() {
      const confirmCallback = () => {
        this.doll = new EnchantDoll();
        this.stepCounter = 0;
        this.selectNegativeStatState.manually = [];
        this.exportState.hasExport = false;
        this.selectNegativeStatState.auto = false;
      };
      this.$confirm({
        message: this.$lang('tips/reset confirm'),
        confirm: confirmCallback,
      })
    },
    removePositiveStat(stat) {
      if (this.stepCounter !== this.stepContents.selectPositiveStat && this.doll.positiveStats.length === 1) {
        this.$notify(this.$lang('tips/at least one positive stat'));
        return;
      }
      this.doll.removePositiveStat(stat);
    },
    removeNegativeStat(stat) {
      const manually = this.selectNegativeStatState.manually;
      const index = manually.indexOf(stat);
      manually.splice(index, 1);
    },
    backToStep(id) {
      this.stepCounter = id;
      this.exportState.hasExport = false;
      this.resultEquipment = null;
      if (this.stepCounter < this.stepContents.selectNegativeStat) {
        this.selectNegativeStatState.auto = false;
      }
      if (id < this.stepContents.selectNegativeStat) {
        this.selectNegativeStatState.manually = [];
      }
    },
    nextStep() {
      if (this.stepCounter === this.stepContents.selectPositiveStat) {
        const physicals = ['atk', 'physical_pierce'];
        const magic = ['matk', 'magic_pierce'];
        let current = 'none';
        if (this.doll.positiveStats.find(stat => physicals.includes(stat.baseName))) {
          current = 'physical';
        }
        if (this.doll.positiveStats.find(stat => magic.includes(stat.baseName))) {
          current = current === 'physical' ? 'none' : 'magic';
        }
        this.doll.config.baseType = current;
      }
      if (this.stepCounter === this.stepContents.selectNegativeStat) {
        this.$notify.loading.show();
        this.$nextTick(() => {
          setTimeout(async () => {
            try {
              if (this.equipmentState.autoFindPotentialMinimum) {
                this.resultEquipment = this.autoFindPotentialMinimumEquipment();
              } else {
                this.resultEquipment = this.doll.calc(this.negativeStats);
              }
              await this.$nextTick();
              ++this.stepCounter;
            } catch(e) {
              console.warn('[enchant-doll] some error when auto find potential minimum');
              console.log(e);
              this.$notify(this.$lang('tips/unknow error when calc'));
            } finally {
              this.$notify.loading.hide();
            }
          }, 50);
        });
        return;
      }
      ++this.stepCounter;
    },
    stepAfterEnter(el) {
      el.scrollIntoView({ behavior: 'smooth' });
    },
    setStatValue(stat, v) {
      stat.value = v;
    },
    openSelectItem(mode) {
      this.selectItemMode = mode;
      this.toggle('windows/selectItem', true);
    },
    selectItem(item) {
      const mode = this.selectItemMode;
      if (mode === 'positiveStats') {
        if (this.doll.hasPositiveStat(item.origin, item.type)) {
          this.$notify(this.$lang('tips/stat repeated'));
          return;
        }
        const value = this.selectPositiveStatState.autoFill ? item.origin.getLimit(item.type)[1] : 1;
        if (!this.doll.appendPositiveStat(item.origin, item.type, value)) {
          this.$notify(this.$lang('tips/number of stats has reached the upper limit'));
        }
      } else {
        const nstats = this.negativeStats;
        if (this.doll.hasPositiveStat(item.origin, item.type)) {
          this.$notify(this.$lang('tips/stat repeated'));
          return;
        }
        if (nstats.find(stat => stat.itemBase === item.origin && stat.type === item.type)) {
          this.$notify(this.$lang('tips/stat repeated'));
          return;
        }
        if (nstats.length >= this.doll.numNegativeStats) {
          this.$notify(this.$lang('tips/number of stats has reached the upper limit'));
          return;
        }
        this.selectNegativeStatState.manually
          .push(new EnchantStat(item.origin, item.type, item.origin.getLimit(item.type)[0]));
      }
    },
  },
}
</script>
<style lang="postcss" scoped>
.step-content {
  padding: 2rem 1rem;
  border-top: 1px solid var(--primary-purple);
  min-height: 70vh;
  position: relative;

  & > .disabled-mask {
    @apply absolute w-full h-full z-5 cursor-not-allowed top-0 left-0;

    background-color: rgba(var(--rgb-white), 0.6);
  }
}
</style>
