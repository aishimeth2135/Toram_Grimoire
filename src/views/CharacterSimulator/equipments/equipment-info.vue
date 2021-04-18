<template>
  <div class="w-full">
    <div class="flex items-center pb-1 pl-1">
      <cy-icon-text class="mr-2 text-purple"
        :iconify-name="equipmentData.categoryIcon"
        :icon-color="equipment.isCustom ? 'green' : 'light-2'">
        <span>{{ equipment.name }}</span>
        <span class="ml-1 text-water-blue" v-if="equipment.hasRefining && equipment.refining > 0">+{{ equipment.refining | equipmentRefining }}</span>
      </cy-icon-text>
      <span class="flex-shrink-0 text-light-3 text-sm mr-2"
        :style="{ 'color': `var(--primary-${equipment.isCustom ? 'green' : 'light-3'})` }"
        >{{ equipmentData.categoryText }}</span>
      <cy-button type="icon" class="ml-auto"
        :iconify-name="mode == 0 ? 'ic-round-edit' : 'ic-round-view-list'"
        @click="mode = mode == 0 ? 1 : 0" />
    </div>
    <cy-transition type="fade" mode="out-in">
      <div class="px-2" v-if="mode == 0" key="base">
        <div v-if="['weapon', 'armor'].includes(equipment.is)"
          class="flex items-center my-2 rounded-2xl border-1 border-solid border-light py-1 px-3">
          <template v-if="equipment.is == 'weapon'">
            <cy-icon-text iconify-name="mdi-sword">ATK</cy-icon-text>
            <span class="ml-2 text-purple">
              {{ equipment.atk }}<span v-if="equipment.hasRefining && equipment.refining > 0"
                class="ml-1 text-water-blue">+{{ equipment.refiningAdditionAmount }}</span>
            </span>
            <span class="ml-auto">{{ equipment.stability }}%</span>
          </template>
          <template v-else>
            <cy-icon-text iconify-name="mdi-shield">DEF</cy-icon-text>
            <span class="ml-2 text-purple">{{ equipment.def }}</span>
          </template>
        </div>
        <div class="mt-1 pl-1" :class="{ 'opacity-50': statsDisable }">
          <show-stat v-for="stat in equipment.stats" :stat="stat"
            :key="stat.statId"
            :negative-value="stat.statValue() < 0" />
        </div>
        <div v-if="equipment.hasCrystal && equipment.crystals.length > 0"
          class="border-t border-solid border-light mt-2 pt-1"
          :class="{ 'opacity-50': statsDisable }">
          <cy-icon-text v-for="c in equipment.crystals"
            class="mr-3 my-1"
            :key="c.id" :image-path="getCrystalImagePath(c)">
            {{ c.name }}
          </cy-icon-text>
        </div>
      </div>
      <div v-else key="edit" class="px-1 pt-2">
        <cy-flex-layout v-if="equipment.customTypeList != null"
          class="mb-2">
          <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle"
            class="mr-2" text-color="purple" text-size="small">
            {{ $lang('equipment type') }}
          </cy-icon-text>
          <cy-button type="border" iconify-name="heroicons-solid:switch-vertical"
            @click="switchCustomType">
            {{ $lang('field type text/' + equipment.type.description) }}
          </cy-button>
        </cy-flex-layout>
        <cy-input-counter v-if="equipment.is == 'weapon'" class="mb-3"
          :value="equipment.atk" :range="baseValueRange"
          @set-value="setAtk(equipment, $event)">
          <template v-slot:title>
            <cy-icon-text iconify-name="mdi-sword">ATK</cy-icon-text>
          </template>
        </cy-input-counter>
        <cy-input-counter v-else-if="equipment.is == 'armor'" class="mb-3"
          :value="equipment.def" :range="baseValueRange"
          @set-value="setDef(equipment, $event)">
          <template v-slot:title>
            <cy-icon-text iconify-name="mdi-shield">DEF</cy-icon-text>
          </template>
        </cy-input-counter>
        <cy-input-counter v-if="equipment.hasRefining" class="mb-3"
          :value="equipment.refining" :range="[0, 15]"
          @set-value="setRefining(equipment, $event)">
          <template v-slot:title>
            <cy-icon-text iconify-name="mdi-cube-send">{{ $lang('refining') }}</cy-icon-text>
          </template>
        </cy-input-counter>
        <div class="crystals" v-if="equipment.hasCrystal">
          <cy-button v-for="c in equipment.crystals"
            :key="c.id" :image-path="getCrystalImagePath(c)" type="line"
            @click="editCrystal">
            {{ c.name }}
          </cy-button>
          <cy-button v-if="equipment.crystals.length < 2"
            iconify-name="bx-bx-circle" type="line"
            @click="editCrystal">
            {{ $lang('crystal empty') }}
          </cy-button>
        </div>
        <div class="mt-3 pt-2 border-t border-solid border-light">
          <cy-button iconify-name="ic-round-edit" type="border"
            @click="openCustomEquipmentEditor(equipment)">
            {{ $lang('custom equipment editor/window title') }}
          </cy-button>
        </div>
      </div>
    </cy-transition>
  </div>
</template>

<script>
import vue_showStat from "./show-stat.vue";

export default {
  RegisterLang: 'Character Simulator',
  props: {
    'equipment': {},
    'statsDisable': {
      type: Boolean,
      default: false
    }
  },
  inject: ['getShowEquipmentData', 'openCustomEquipmentEditor', 'openSelectCrystals'],
  data(){
    return {
      mode: 0, // 0: normal, 1: edit
      currentCustomTypeIndex: 0
    };
  },
  filters: {
    equipmentRefining(v){
      return v;
    }
  },
  computed: {
    equipmentData() {
      return this.getShowEquipmentData(this.equipment);
    },
    baseValueRange() {
      const eq = this.equipment;
      if (!eq.isCustom) {
        if (eq.is == 'weapon')
          return [eq.baseAtk, Math.ceil(eq.baseAtk * 1.1) + 10];
        else if (eq.is == 'armor')
          return [eq.baseDef, Math.ceil(eq.baseDef * 1.1) + 10];
      }
      return [0, 999];
    }
  },
  methods: {
    getCrystalImagePath(c) {
      const type = c.origin.enhancer ? 'enhance' :
        ['weapon', 'body', 'additional', 'special', 'normal'][c.origin.category];
      return '/imgs/crystals/' + type + '.png';
    },
    setAtk(eq, v) {
      eq.atk = v;
    },
    setDef(eq, v) {
      eq.def = v;
    },
    setRefining(eq, v) {
      eq.refining = v;
    },
    switchCustomType(){
      const eq = this.equipment;
      const len = eq.customTypeList.length;

      ++this.currentCustomTypeIndex;
      if ( this.currentCustomTypeIndex == len )
        this.currentCustomTypeIndex = 0;
      eq.setCustomType(eq.customTypeList[this.currentCustomTypeIndex]);
    },
    removeCrystal(index){
      this.equipment.crystals.splice(index, 1);
    },
    editCrystal(){
      this.openSelectCrystals(this.equipment);
    }
  },
  components: {
    'show-stat': vue_showStat
  }
}
</script>