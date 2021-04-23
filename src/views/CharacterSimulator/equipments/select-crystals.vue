<template>
  <cy-window :visible="visible" @close-window="closeWindow">
    <template #title>
      <cy-icon-text iconify-name="bx-bx-cube-alt">
        {{ $lang('select crystals/window title') }}
      </cy-icon-text>
    </template>
    <cy-title-input iconify-name="ic-outline-category" class="mb-4"
      v-model:value="searchText"
      :placeholder="$lang('select crystals/search placeholder')" />
    <div>
      <template v-if="crystalCategorys.length != 0">
        <template v-for="(category, i) in crystalCategorys"
          :key="category.id">
          <cy-hr v-if="i != 0" />
          <cy-button type="drop-down"
            iconify-name="bx-bx-cube-alt"
            :menu-default-visible="true">
            {{ $lang('select crystals/category title')[category.id] }}
            <template v-slot:menu>
              <template v-for="cs in category.crystalStates">
                <cy-list-item v-if="!cs.disable"
                  :key="cs.origin.id"
                  :selected="cs.selected"
                  @click="selectCrystal(cs.origin)">
                  <cy-icon-text :image-path="cs.imagePath">
                    {{ cs.origin.name }}
                  </cy-icon-text>
                </cy-list-item>
                <cy-list-item v-else :key="cs.origin.id">
                  <cy-icon-text :image-path="cs.imagePath" text-color="gray">
                    {{ cs.origin.name }}
                  </cy-icon-text>
                </cy-list-item>
              </template>
            </template>
          </cy-button>
        </template>
      </template>
      <cy-default-tips v-else icon-id="potum">
        {{ $lang('Warn/no result found') }}
      </cy-default-tips>
    </div>
    <cy-bottom-content>
      <template #normal-content>
        <cy-transition type="slide-up">
          <div v-if="detailVisible" class="pt-1">
            <cy-icon-text iconify-name="bx-bx-cube-alt"
              text-color="purple" text-size="small">
              {{ $lang('select crystals/selected crystals') }}
            </cy-icon-text>
            <div>
              <cy-list-item v-for="c in equipment.crystals"
                :key="c.id"
                @click="selectCrystal(convertToOriginal(c))">
                <cy-icon-text iconify-name="bx-bx-cube-alt">
                  {{ c.name }}
                </cy-icon-text>
                <template #right-content>
                  <cy-icon-text iconify-name="ic-round-close" />
                </template>
                <template #extra>
                  <div class="pl-2 pt-1 w-full">
                    <show-stat v-for="stat in c.stats" :stat="stat"
                      :key="stat.statId" />
                  </div>
                </template>
              </cy-list-item>
            </div>
          </div>
        </cy-transition>
        <div @click="toggleDetailVisible"
          class="flex items-center cursor-pointer">
          <cy-icon-text :iconify-name="'ic-round-keyboard-arrow-' + (detailVisible ? 'down' : 'up')" />
          <div class="ml-auto leading-none">
            <cy-button type="border" iconify-name="ic-round-done"
              @click.stop="closeWindow">
              {{ $globalLang('global/close') }}
            </cy-button>
          </div>
        </div>
      </template>
    </cy-bottom-content>
  </cy-window>
</template>
<script>
import vue_showStat from "./show-stat.vue";

import { MainWeapon, BodyArmor, AdditionalGear, SpecialGear } from "@lib/Character/CharacterEquipment";

export default {
  RegisterLang: 'Character Simulator',
  emits: ['close'],
  props: ['visible', 'equipment'],
  data() {
    const crystals = this.$store.state.datas.items.crystals;
    const crystalCategorys = new Array(5).fill().map((p, i) => {
      return {
        id: i,
        crystals: crystals.filter(a => a.category == i)
      };
    });

    return {
      originalCrystalCategorys: crystalCategorys,
      searchText: '',
      detailVisible: false
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
            disable: !this.checkEnchaner(cat, c),
            selected: this.findEquipmentCrystal(c) ? true : false
          }))
        };
      });
    }
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
        const p = cat.crystals.find(p => p.id == eqCrystal.id);
        if (p) {
          res = p;
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
    }
  },
  components: {
    'show-stat': vue_showStat
  }
}
</script>