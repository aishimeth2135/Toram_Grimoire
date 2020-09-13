<template>
  <div v-if="currentFoodBuild">
    <cy-list-item v-for="(food, i) in currentFoodBuild.foods"
      :selected="foodSelected(i)"
      :key="food.base.baseName + '-' + (food.negative ? 'n' : 'p')">
      <cy-input-counter :range="[0, 10]" :value="food.level" :inline="true" type="line"
        class="counter" @set-value="setFoodLevel(food, $event)">
        <template #title>
          <cy-icon-text :iconify-name="foodSelected(i) ? 'mdi-food-apple' : 'bx-bx-circle'"
            :text-color="food.negative ? 'orange' : 'purple'"
            @click.native="selectFood(i)">
            {{ food.stat().show() }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
      <!-- <span class="caption">{{ food.stat().show() }}</span> -->
    </cy-list-item>
  </div>
  <cy-default-tips v-else iconify-name="mdi-ghost">
    {{ localLangText('Current food-build is not exist') }}
  </cy-default-tips>
</template>
<script>
import Vuex from "vuex";
import store from "@store/main";

import ShowMessage from "@global-modules/ShowMessage.js";

export default {
  store,
  inject: ['langText'],
  created() {
    if (this.foodBuilds.length == 0)
      this.$store.commit('character/createFoodBuild', { name: this.localLangText('food build') + ' 1' });
  },
  computed: {
    ...Vuex.mapState('character', ['foodBuilds']),
    ...Vuex.mapGetters('character', ['currentFoodBuild'])
  },
  methods: {
    setFoodLevel(food, v) {
      food.level = v;
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
          ShowMessage(this.localLangText('Number of selected food has reached the maximum'));
      }
    },
    localLangText(v, vs) {
      return this.langText('Food Builds Control/' + v, vs);
    }
  }
};
</script>
<style lang="less" scoped>
.caption {
  margin-left: 0.7rem;
}
.counter {
  width: 25rem;
}
</style>