<template>
  <div class="enchant-step px-2 pt-1 flex flex-col h-full bg-white"
    :class="{ [mainBorderColor]: true, 'opacity-50': step.hidden }">
    <div class="border-b pl-2 flex items-center py-0.5"
      :class="[mainBorderColor]">
      <cy-icon-text icon="bx-bxs-book-content" text-size="small"
        :text-color="mainTextColor" :icon-color="mainTextColor">
        {{ stepTitle }}
      </cy-icon-text>
      <div class="ml-auto inline-flex items-center mr-1">
        <cy-options inline>
          <template #title="{ unfold }">
            <cy-button type="icon" icon="gg-menu-left-alt" class="p-0"
              :selected="unfold" />
          </template>
          <template #options>
            <cy-list-item>
              <cy-button type="inline" class="w-full"
                icon="mdi-table-row-plus-before"
                @click="insertStepBefore">
                {{ $lang('step/insert step before') }}
              </cy-button>
            </cy-list-item>
            <cy-list-item v-if="step.index !== 0">
              <cy-button type="inline" class="w-full"
                icon="eva-arrow-ios-upward-fill"
                @click="swapStep(-1)">
                {{ $lang('step/up swap') }}
              </cy-button>
            </cy-list-item>
            <cy-list-item v-if="!step.isLastStep">
              <cy-button type="inline" class="w-full"
                icon="eva-arrow-ios-downward-outline"
                @click="swapStep(1)">
                {{ $lang('step/down swap') }}
              </cy-button>
            </cy-list-item>
          </template>
        </cy-options>
        <cy-button type="icon"
          :icon="step.hidden ? 'mdi-checkbox-blank-off-outline' : 'mdi-checkbox-blank-outline'"
          class="p-0"
          :icon-color="step.hidden ? 'red' : 'red-light'"
          @click="toggleStepHidden(step)" />
        <cy-button type="icon" icon="jam-close-circle"
          class="p-0"
          @click="removeStep"
          icon-color="gray" />
      </div>
    </div>
    <div class="p-1">
      <template v-if="step.stats.length !== 0">
        <step-stat v-for="stat in step.stats"
          :stat="stat" class="step-stat"
          :key="stat.statId" />
      </template>
      <cy-default-tips v-else icon="fluent-leaf-two-16-filled">
        {{ $lang('tips/step is empty') }}
      </cy-default-tips>
    </div>
    <div class="border-t border-purple mt-auto pt-0.5">
      <cy-transition type="fade">
        <div v-if="typeEach"
          class="border-b border-light-2 py-0.5">
          <cy-input-counter :value="step.step" inline
            main-color="blue-green"
            @update:value="setStepValue(step, $event)">
            <template #title>
              <cy-icon-text icon="ic-outline-near-me"
                icon-color="blue-green">
                {{ $lang('step type - each: title') }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </cy-transition>
      <div class="flex items-center py-0.5">
        <cy-button type="icon"
          icon="ic-round-add-circle-outline"
          @click="openSelectItem('step', step, true)"
          icon-color="water-blue">
          <template #caption>
            <cy-icon-text icon="ic-round-add-circle-outline"
              icon-color="water-blue">
              {{ $lang('step/select one stat item') }}
            </cy-icon-text>
          </template>
        </cy-button>
        <cy-button type="icon"
          icon="ic-round-add-circle-outline"
          @click="openSelectItem('step', step)"
          icon-color="red">
          <template #caption>
            <cy-icon-text icon="ic-round-add-circle-outline"
              icon-color="red">
              {{ $lang('step/select multiple stat items') }}
            </cy-icon-text>
          </template>
        </cy-button>
        <cy-button type="icon"
          :icon="typeIcon"
          @click="toggleStepType(step)"
          :icon-color="typeEach ? 'blue-green' : 'blue-green-light'"
          icon-color-hover="blue-green">
          <template #caption>
            <cy-icon-text icon="ic-outline-near-me"
              icon-color="blue-green">
              {{ $lang('step/type: each') }}
            </cy-icon-text>
          </template>
        </cy-button>
        <cy-button v-if="step.belongEquipment.stats(step.index - 1).length >= 6"
          type="icon"
          icon="ant-design:star-outlined"
          @click="step.autoFill()"
          icon-color="orange">
          <template #caption>
            <cy-icon-text icon="ant-design:star-outlined"
              icon-color="orange">
              {{ $lang('step/auto fill positive stat') }}
            </cy-icon-text>
          </template>
        </cy-button>
        <cy-icon-text icon="mdi-creation" class="ml-auto mr-2"
          text-color="purple">
          {{ step.remainingPotential }}
        </cy-icon-text>
      </div>
    </div>
  </div>
</template>
<script>
import vue_stepStat from "./step-stat";
import { EnchantStep } from '@/lib/Enchant/Enchant';

export default {
  RegisterLang: "Enchant Simulator",
  props: {
    step: {
      type: EnchantStep,
      required: true
    }
  },
  inject: ['openSelectItem'],
  computed: {
    typeIcon() {
      return this.step.type === EnchantStep.TYPE_NORMAL ? 'ic-outline-near-me-disabled' : 'ic-outline-near-me';
    },
    typeEach() {
      return this.step.type === EnchantStep.TYPE_EACH;
    },
    mainTextColor() {
      let textColor = 'purple';
      if (this.step.isLastStep) {
        textColor = 'water-blue';
      }
      if (this.step.afterLastStep) {
        textColor = 'gray';
      }
      return textColor;
    },
    mainBorderColor() {
      let borderColor = 'border-purple';
      if (this.step.isLastStep) {
        borderColor = 'border-water-blue';
      }
      if (this.step.afterLastStep) {
        borderColor = 'border-gray';
      }
      return borderColor;
    },
    stepTitle() {
      if (this.step.isLastStep) {
        return this.$lang('last step');
      }
      if (this.step.afterLastStep) {
        return this.$lang('invalid step');
      }
      return this.$lang('enchant step') + ' ' + (this.step.index + 1).toString();
    }
  },
  methods: {
    toggleStepType(step) {
      step.type = step.type === EnchantStep.TYPE_NORMAL ? EnchantStep.TYPE_EACH : EnchantStep.TYPE_NORMAL;
    },
    toggleStepHidden(step) {
      step.hidden = !step.hidden;
    },
    setStepValue(step, v) {
      step.step = v;
    },
    swapStep(offset) {
      this.step.belongEquipment.swapStep(this.step.index, this.step.index + offset);
    },
    insertStepBefore() {
      this.step.belongEquipment.insertStepBefore(this.step);
    },
    removeStep() {
      this.step.remove();
    }
  },
  components: {
    'step-stat': vue_stepStat
  }
}
</script>
<style lang="less" scoped>
.step-stat + .step-stat {
  border-top: 1px solid var(--primary-light);
}
.enchant-step {
  min-height: 12rem;
  border-width: 1px;
}
</style>