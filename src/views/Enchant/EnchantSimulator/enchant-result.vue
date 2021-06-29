<template>
  <div v-if="enchantResult.length !== 0">
    <div class="flex items-start">
      <cy-button type="icon" :icon="contents.resultStats ? 'ant-design:star-filled' : 'ant-design:star-outlined'"
        class="flex-shrink-0"
        icon-color="orange"
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
          <cy-icon-text icon="mdi-creation" size="small"
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
        <cy-icon-text icon="mdi-creation" size="small"
          icon-color="water-blue" text-color="water-blue"
          class="ml-2 my-1">
          {{ item.remainingPotential }}
        </cy-icon-text>
      </div>
    </div>
  </div>
  <div v-else class="flex justify-center w-full">
    <cy-default-tips icon="mdi-ghost">
      {{ $lang('tips/invalid enchant result') }}
    </cy-default-tips>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { EnchantEquipment, EnchantStep } from '@/lib/Enchant/Enchant';

import ToggleService from "@/setup/ToggleService";

import ENCHANT_STATE from "@/lib/Enchant/Enchant/state";
import CY from "@utils/Cyteria";

export default {
  props: {
    equipment: {
      type: EnchantEquipment,
      required: true
    }
  },
  RegisterLang: "Enchant Simulator",
  setup() {
    const { contents, toggle } = ToggleService({
      contents: [{ name: 'resultStats', default: true }]
    });
    return { contents, toggle };
  },
  computed: {
    ...mapState('enchant', ['config']),
    enchantResult() {
      const validSteps = this.equipment.validSteps;

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
      const eq = this.equipment;
      return eq.stats(eq.lastStep.index)
        .sort((a, b) => {
          const av = a.stat.base.order + (a.value < 0 ? 99999 : 0);
          const bv = b.stat.base.order + (b.value < 0 ? 99999 : 0);
          return av - bv;
        })
        .map(stat => ({
          text: stat.showAmount(),
          stat,
          negative: stat.value < 0
        }));
    },
    enchantResultMaterials() {
      const titleList = this.$lang('material point type list');
      return this.equipment.allMaterialPointCost.map((p, i) => ({
        title: titleList[i],
        value: p
      }));
    },
    successRate() {
      const rate = this.equipment.successRate;
      return rate === -1 ?
        this.$lang('success rate: unlimited') :
        Math.floor(rate) + '%';
    },
  },
  methods: {
    copyEnchantResultText() {
      const resultStatsText = this.enchantResultStats.map(item => item.text).join('｜');
      const materialsText = this.enchantResultMaterials.map(item => `${item.title} ${item.value}`).join('｜');
      const stepsText = this.enchantResult
        .map((p, i) => `${i+1}. ${p.text}`)
        .join('\n');
      const basePotential = this.equipment.basePotential === ENCHANT_STATE.EquipmentBasePotentialMinimum ?
        '' :
        `${this.$lang('equipment base potential')}｜${this.equipment.basePotential}\n`;
      CY.copyToClipboard(
        `✩ ${this.$lang('equipment types/' + this.equipment.fieldType.description)}\n` +
        `${this.$lang('equipment original potential')}｜${this.equipment.originalPotential}\n` +
        `${this.$lang('smith level')}｜${this.config.smithLevel}\n` +
        basePotential +
        `✩ ${this.$lang('result/stats')}\n` +
        `${resultStatsText}\n` +
        `✩ ${this.$lang('result/materials')}\n` +
        `${materialsText}\n\n` +
        `${stepsText}\n\n` +
        `✩ ${this.$lang('success rate')}｜${this.successRate}\n` +
        '｜cy-grimoire.netlify.app｜'
      );
      this.$notify(this.$lang('tips/copy result text successfully'));
    }
  }
}
</script>
<style lang="postcss" scoped>
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