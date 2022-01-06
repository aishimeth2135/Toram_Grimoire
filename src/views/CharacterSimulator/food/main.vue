<template>
  <div v-if="currentFoodBuild">
    <div class="pb-4">
      <cy-options>
        <template #title>
          <cy-list-item>
            <cy-icon-text icon="bx-bxs-face">
              {{ currentFoodBuild.name }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <template #options>
          <cy-list-item
            v-for="(build, idx) in foodBuildStates"
            :key="build.iid"
            :selected="idx === currentFoodBuildIndex"
            @click="foodStore.setCurrentFoodBuild(idx)"
          >
            <cy-icon-text icon="mdi-food-apple">
              {{ build.origin.name }}
            </cy-icon-text>
          </cy-list-item>
          <cy-list-item @click="createFoodBuild">
            <cy-icon-text icon="ic-round-add-circle-outline">
              {{ $lang('append food build') }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
      <div class="pt-1">
        <cy-button
          icon="mdi-content-copy"
          type="border"
          @click="copyCurrentFoodBuild"
        >
          {{ $rootLang('global/copy') }}
        </cy-button>
        <cy-button
          icon="ic-baseline-delete-outline"
          type="border"
          @click="removeCurrentFoodBuild"
        >
          {{ $rootLang('global/remove') }}
        </cy-button>
      </div>
    </div>
    <div class="mt-4 mb-2 pl-1">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ $lang('food build name') }}
      </cy-icon-text>
    </div>
    <div class="pl-4">
      <cy-title-input
        v-model:value="currentFoodBuild.name"
        icon="mdi-clipboard-text-outline"
      />
    </div>
    <div class="mt-4 mb-2 pl-1">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ $lang('food list') }}
      </cy-icon-text>
    </div>
    <div class="foods pl-4">
      <div class="mb-2">
        <cy-icon-text
          icon="ic-outline-info"
          text-color="light-3"
          size="small"
          class="mr-2"
        >
          {{ $lang('tips: select food') }}
        </cy-icon-text>
        <cy-icon-text icon="ic-outline-info" text-color="light-3" size="small">
          {{ $lang('tips: auto select food') }}
        </cy-icon-text>
      </div>
      <cy-list-item
        v-for="(food, i) in currentFoodBuild.foods"
        :key="food.foodBase.base.baseName + '-' + (food.foodBase.negative ? 'n' : 'p')"
        :selected="foodSelected(i)"
        class="py-1.5 px-3"
      >
        <cy-input-counter
          style="width: 25rem;"
          type="line"
          :range="ranges.foodLevel"
          :inline="true"
          :value="food.level"
          @update:value="setFoodLevel(food, $event, i)"
        >
          <template #title>
            <cy-icon-text
              :icon="foodSelected(i) ? 'mdi-food-apple' : 'bx-bx-radio-circle'"
              :text-color="food.negative ? 'orange' : 'purple'"
              @click="selectFood(i)"
            >
              {{ food.stat().show() }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
        <!-- <span class="caption">{{ food.stat().show() }}</span> -->
      </cy-list-item>
    </div>
  </div>
  <div v-else>
    <cy-default-tips icon="mdi-ghost">
      {{ $lang('Current food-build is not exist') }}
    </cy-default-tips>
    <div style="text-align: center;">
      <cy-button
        icon="ic-round-add"
        type="border"
        @click="createFoodBuild"
      >
        {{ $lang('append food build') }}
      </cy-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { useCharacterFoodStore } from '@/stores/views/character/food';

export default {
  name: 'CharacterSimulatorFood',
  RegisterLang: {
    root: 'Character Simulator/Food Builds Control',
  },
  setup() {
    const foodStore = useCharacterFoodStore();
    return { foodStore };
  },
  data() {
    return {
      ranges: {
        foodLevel: [0, 10],
      },
    };
  },
  created() {
    if (this.foodBuilds.length === 0)
      this.createFoodBuild();
  },
  computed: {
    ...mapState(useCharacterFoodStore, ['foodBuilds', 'currentFoodBuildIndex', 'currentFoodBuild']),

    foodBuildStates() {
      return this.foodBuilds.map((p, i) => ({
        iid: i,
        origin: p,
      }));
    },
  },
  methods: {
    copyCurrentFoodBuild() {
      this.foodStore.createFoodBuild({
        foodBuild: this.currentFoodBuild.copy(),
      });
      this.$notify(this.$lang('Copy food build successfully'));
    },
    removeCurrentFoodBuild() {
      if (this.foodBuilds.length <= 1) {
        this.$notify(this.$lang('Must have at least one food build'));
        return;
      }
      const from = this.currentFoodBuild;
      this.foodStore.removeFoodBuild(this.currentFoodBuildIndex);
      this.$notify(this.$lang('Remove food build successfully'),
        'ic-round-delete', null, {
          buttons: [{
            text: this.$rootLang('global/recovery'),
            click: () => {
              this.foodStore.createFoodBuild({ foodBuild: from });
              this.$notify(this.$lang('Recovery food build successfully'));
            },
            removeMessageAfterClick: true,
          }],
        });
    },
    createFoodBuild() {
      this.foodStore.createFoodBuild({
        name: this.$lang('food build') + ' ' + (this.foodBuilds.length + 1),
      });
    },
    setFoodLevel(food, v, idx) {
      const oldv = food.level;
      food.level = v;
      if (oldv == 0 && this.currentFoodBuild.checkSelectedFoodsMaximum() && !this.foodSelected(idx))
        this.currentFoodBuild.appendSelectedFood(idx);
    },
    foodSelected(idx) {
      return this.currentFoodBuild.foodSelected(idx);
    },
    selectFood(idx) {
      if (this.foodSelected(idx)) {
        this.currentFoodBuild.removeSelectedFood(idx);
      } else {
        if (this.currentFoodBuild.checkSelectedFoodsMaximum())
          this.currentFoodBuild.appendSelectedFood(idx);
        else
          this.$notify(this.$lang('Number of selected food has reached the maximum'));
      }
    },
  },
};
</script>
