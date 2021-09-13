<template>
  <cy-window :visible="visible" @close="closeWindow">
    <template #title>
      <cy-icon-text icon="bx-bx-cube-alt">
        {{ $lang('select crystals/window title') }}
      </cy-icon-text>
    </template>
    <cy-title-input
      v-model:value="searchText"
      icon="ic-outline-category"
      class="mb-4"
      :placeholder="$lang('select crystals/search placeholder')"
    />
    <div>
      <template v-if="crystalCategorys.length != 0">
        <template
          v-for="(category, i) in crystalCategorys"
          :key="category.id"
        >
          <cy-hr v-if="i != 0" />
          <cy-button-drop-down
            icon="bx-bx-cube-alt"
            :menu-default-visible="true"
          >
            {{ $lang('select crystals/category title')[category.id] }}
            <template #menu>
              <template v-for="cs in category.crystalStates" :key="cs.origin.id">
                <cy-list-item
                  v-if="!cs.disabled"
                  :selected="cs.selected"
                  @click="selectCrystal(cs.origin)"
                >
                  <cy-icon-text :icon="cs.imagePath" icon-src="image">
                    {{ cs.origin.name }}
                  </cy-icon-text>
                </cy-list-item>
                <cy-list-item v-else>
                  <cy-icon-text :icon="cs.imagePath" text-color="gray" icon-src="image">
                    {{ cs.origin.name }}
                  </cy-icon-text>
                </cy-list-item>
              </template>
            </template>
          </cy-button-drop-down>
        </template>
      </template>
      <cy-default-tips v-else icon="potum" icon-src="custom">
        {{ $lang('Warn/no result found') }}
      </cy-default-tips>
    </div>
    <cy-bottom-content>
      <template #normal-content>
        <div v-if="detailVisible" class="pt-1 animate-slide-up">
          <cy-icon-text
            icon="bx-bx-cube-alt"
            text-color="purple"
            size="small"
          >
            {{ $lang('select crystals/selected crystals') }}
          </cy-icon-text>
          <div>
            <cy-list-item
              v-for="c in equipment.crystals"
              :key="c.id"
              @click="selectCrystal(convertToOriginal(c))"
            >
              <div class="flex items-center w-full">
                <cy-icon-text icon="bx-bx-cube-alt">
                  {{ c.name }}
                </cy-icon-text>
                <cy-icon-text icon="ic-round-close" class="ml-auto" />
              </div>
              <div class="pl-2 pt-1 w-full">
                <show-stat
                  v-for="stat in c.stats"
                  :key="stat.statId"
                  :stat="stat"
                />
              </div>
            </cy-list-item>
          </div>
        </div>
        <div
          class="flex items-center cursor-pointer"
          @click="toggleDetailVisible"
        >
          <cy-icon-text :icon="'ic-round-keyboard-arrow-' + (detailVisible ? 'down' : 'up')" />
          <div class="ml-auto leading-none">
            <cy-button-border icon="ic-round-done" @click.stop="closeWindow">
              {{ $rootLang('global/close') }}
            </cy-button-border>
          </div>
        </div>
      </template>
    </cy-bottom-content>
  </cy-window>
</template>
<script>
import { MainWeapon, BodyArmor, AdditionalGear, SpecialGear } from '@/lib/Character/CharacterEquipment';

import vue_showStat from './show-stat.vue';


export default {
  RegisterLang: 'Character Simulator',
  components: {
    'show-stat': vue_showStat,
  },
  props: ['visible', 'equipment'],
  emits: ['close'],
  data() {
    const crystals = this.$store.state.datas.Items.crystals;
    const crystalCategorys = new Array(5).fill().map((p, i) => {
      return {
        id: i,
        crystals: crystals.filter(a => a.category == i),
      };
    });

    return {
      originalCrystalCategorys: crystalCategorys,
      searchText: '',
      detailVisible: false,
    };
  },
  computed: {
    crystalCategorys() {
      if (!this.equipment)
        return [];
      const eq = this.equipment;
      const category = [MainWeapon, BodyArmor, AdditionalGear, SpecialGear]
        .findIndex(p => eq instanceof p);

      const res = this.originalCrystalCategorys
        .filter(c => c.id == category || c.id == 4);

      return res.map(cat => {
        const cs = this.searchText == '' ? cat.crystals :
          cat.crystals.filter(c => c.name.toLowerCase().includes(this.searchText.toLowerCase()));
        return {
          id: cat.id,
          crystalStates: cs.map(c => ({
            origin: c,
            imagePath: this.getCrystalImagePath(c),
            disabled: !this.checkEnchaner(cat, c),
            selected: this.findEquipmentCrystal(c) ? true : false,
          })),
        };
      });
    },
  },
  methods: {
    checkEnchaner(category, crystal) {
      const find = name => category.crystals.find(c => c.name == name);
      const check1 = !this.equipment.crystals.find(c => {
        let cur = c.origin;
        while (cur.enhancer) {
          cur = find(cur.enhancer);
          if (!cur)
            break;
          if (cur.name == crystal.name)
            return true;
        }
      });
      const findByEnhancer = name => category.crystals.find(c => c.enhancer == name);
      const check2 = !this.equipment.crystals.map(c => c.origin).find(c => {
        let cur = c;
        while (true) { // eslint-disable-line
          cur = findByEnhancer(cur.name);
          if (!cur)
            break;
          if (cur.name == crystal.name)
            return true;
        }
      });

      return check1 && check2;
    },
    getCrystalImagePath(c) {
      const type = c.enhancer ? 'enhance' :
        ['weapon', 'body', 'additional', 'special', 'normal'][c.category];
      return '/imgs/crystals/' + type + '.png';
    },
    toggleDetailVisible() {
      this.detailVisible = !this.detailVisible;
    },
    closeWindow() {
      this.$emit('close');
      this.searchResult = this.crystalCategorys;
    },
    convertToOriginal(eqCrystal) {
      let res;
      this.crystalCategorys.find(cat => {
        const crystal = cat.crystalStates.find(p => p.origin.id == eqCrystal.id);
        if (crystal) {
          res = crystal.origin;
          return true;
        }
      });
      return res;
    },
    findEquipmentCrystal(c) {
      return this.equipment.crystals.find(p => p.id == c.id);
    },
    selectCrystal(c) {
      const find = this.findEquipmentCrystal(c);
      find ?
        this.equipment.removeCrystal(find) :
        this.equipment.appendCrystal(c);
    },
  },
};
</script>
