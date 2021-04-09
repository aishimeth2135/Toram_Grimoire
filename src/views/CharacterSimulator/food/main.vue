<template>
  <div v-if="currentFoodBuild">
    <div class="top">
      <cy-options>
        <template #title>
          <cy-list-item>
            <cy-icon-text iconify-name="bx-bxs-face">
              {{ currentFoodBuild.name }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <template #options>
          <cy-list-item v-for="(build, i) in foodBuildStates" :key="build.iid"
            :selected="i == currentFoodBuildIndex"
            @click="$store.commit('character/setCurrentFoodBuild', { index: i })">
            <cy-icon-text iconify-name="mdi-food-apple">
              {{ build.origin.name }}
            </cy-icon-text>
          </cy-list-item>
          <cy-list-item @click="createFoodBuild">
            <cy-icon-text iconify-name="ic-round-add-circle-outline">
              {{ localLangText('append food build') }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
      <div class="buttons">
        <cy-button iconify-name="mdi-content-copy" type="border"
          @click="copyCurrentFoodBuild">
          {{ globalLangText('global/copy') }}
        </cy-button>
        <cy-button iconify-name="ic-baseline-delete-outline" type="border"
          @click="removeCurrentFoodBuild">
          {{ globalLangText('global/remove') }}
        </cy-button>
      </div>
    </div>
    <div class="content-title">
      <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle-outline"
        text-size="small" text-color="purple">
        {{ localLangText('food build name') }}
      </cy-icon-text>
    </div>
    <div class="content">
      <cy-title-input iconify-name="mdi-clipboard-text-outline">
        <input type="text" v-model="currentFoodBuild.name">
      </cy-title-input>
    </div>
    <div class="content-title">
      <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle-outline"
        text-size="small" text-color="purple">
        {{ localLangText('food list') }}
      </cy-icon-text>
    </div>
    <div class="foods content">
      <div class="content-tips">
        <cy-icon-text iconify-name="ic-outline-info" text-color="light-3" text-size="small" class="mr-normal">
          {{ localLangText('tips: select food') }}
        </cy-icon-text>
        <cy-icon-text iconify-name="ic-outline-info" text-color="light-3" text-size="small">
          {{ localLangText('tips: auto select food') }}
        </cy-icon-text>
      </div>
      <cy-list-item v-for="(food, i) in currentFoodBuild.foods"
        :selected="foodSelected(i)" class="item"
        :key="food.base.baseName + '-' + (food.negative ? 'n' : 'p')">
        <cy-input-counter :range="[0, 10]" :value="food.level" :inline="true" type="line"
          class="counter" @set-value="setFoodLevel(food, $event, i)">
          <template #title>
            <cy-icon-text :iconify-name="foodSelected(i) ? 'mdi-food-apple' : 'bx-bx-radio-circle'"
              :text-color="food.negative ? 'orange' : 'purple'"
              @click.native="selectFood(i)">
              {{ food.stat().show() }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
        <!-- <span class="caption">{{ food.stat().show() }}</span> -->
      </cy-list-item>
    </div>
  </div>
  <div v-else>
    <cy-default-tips iconify-name="mdi-ghost">
      {{ localLangText('Current food-build is not exist') }}
    </cy-default-tips>
    <div style="text-align: center;">
      <cy-button iconify-name="ic-round-add" type="border"
        @click="createFoodBuild">
        {{ langText('append food build') }}
      </cy-button>
    </div>
  </div>
</template>
<script>
import Vuex from "vuex";

import MessageNotify from "@Service/Notify";

export default {
  inject: ['langText', 'globalLangText'],
  created() {
    if (this.foodBuilds.length == 0)
      this.createFoodBuild();
  },
  computed: {
    ...Vuex.mapState('character', ['foodBuilds', 'currentFoodBuildIndex']),
    ...Vuex.mapGetters('character', ['currentFoodBuild']),
    foodBuildStates() {
      return this.foodBuilds.map((p, i) => ({
        iid: i,
        origin: p
      }));
    }
  },
  methods: {
    copyCurrentFoodBuild() {
      this.$store.commit('character/createFoodBuild', {
        foodBuild: this.currentFoodBuild.copy()
      });
      MessageNotify(this.localLangText('Copy food build successfully'));
    },
    removeCurrentFoodBuild() {
      if (this.foodBuilds.length <= 1) {
        MessageNotify(this.localLangText('Must have at least one food build'));
        return;
      }
      const from = this.currentFoodBuild;
      this.$store.commit('character/removeFoodBuild', {
        index: this.currentFoodBuildIndex
      });
      MessageNotify(this.localLangText('Remove food build successfully'),
        'ic-round-delete', null, {
          buttons: [{
            text: this.globalLangText('global/recovery'),
            click: () => {
              this.$store.commit('character/createFoodBuild', { foodBuild: from });
              MessageNotify(this.localLangText('Recovery food build successfully'));
            },
            removeMessageAfterClick: true
          }]
        });
    },
    createFoodBuild() {
      this.$store.commit('character/createFoodBuild', {
        name: this.localLangText('food build') + ' ' + (this.foodBuilds.length + 1)
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
          MessageNotify(this.localLangText('Number of selected food has reached the maximum'));
      }
    },
    localLangText(v, vs) {
      return this.langText('Food Builds Control/' + v, vs);
    }
  }
};
</script>
<style lang="less" scoped>
.top {
  margin-bottom: 1rem;

  > .buttons {
    padding-top: 0.3rem;
  }
}

.item {
  padding: 0.4rem 0.8rem;
}
.counter {
  width: 25rem;
}

.content-title {
  margin-top: 1rem;
  margin-bottom: 0.6rem;
  padding-left: 0.3rem;
}

.content-tips {
  margin-bottom: 0.6rem;
}

.content {
  padding-left: 1rem;
}
</style>