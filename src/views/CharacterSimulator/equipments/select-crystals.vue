<template>
  <cy-window :visible="visible" @close-window="closeWindow">
    <template #title>
      <cy-icon-text iconify-name="bx-bx-cube-alt">
        {{ langText('select crystals/window title') }}
      </cy-icon-text>
    </template>
    <cy-title-input iconify-name="ic-outline-category" class="search-input">
      <input type="text" v-model="searchText"
        :placeholder="langText('select crystals/search placeholder')" />
    </cy-title-input>
    <div class="crystals">
      <template v-if="crystalCategorys.length != 0">
        <template v-for="(category, i) in crystalCategorys">
          <cy-hr v-if="i != 0" :key="category.id + '-hr'" />
          <cy-button :key="category.id + '-btn'"
            iconify-name="bx-bx-cube-alt" type="drop-down"
            :menu-default-visible="true">
            {{ langText('select crystals/category title')[category.id] }}
            <template v-slot:menu>
              <template v-for="cs in category.crystalStates">
                <cy-list-item v-if="!cs.disable" :key="cs.origin.id"
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
        {{ langText('Warn/no result found') }}
      </cy-default-tips>
    </div>
    <cy-bottom-content>
      <template #normal-content>
        <cy-transition type="slide-up">
          <div v-if="detailVisible" class="detail">
            <cy-icon-text iconify-name="bx-bx-cube-alt"
              text-color="purple" text-size="small">
              {{ langText('select crystals/selected crystals') }}
            </cy-icon-text>
            <div class="equipment-crystals">
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
                  <div class="stats">
                    <show-stat v-for="stat in c.stats" :stat="stat"
                      :key="`${stat.baseName()}-${stat.type.description}`" />
                  </div>
                </template>
              </cy-list-item>
            </div>
          </div>
        </cy-transition>
        <cy-flex-layout @click.native="toggleDetailVisible" class="bottom-content-top">
          <cy-icon-text :iconify-name="'ic-round-keyboard-arrow-' + (detailVisible ? 'down' : 'up')" />
          <template #right-content>
            <cy-button type="border" iconify-name="ic-round-done"
              @click.stop="closeWindow">
              {{ globalLangText('global/close') }}
            </cy-button>
          </template>
        </cy-flex-layout>
      </template>
    </cy-bottom-content>
  </cy-window>
</template>
<script>
import Grimoire from "@Grimoire";
import { MainWeapon, BodyArmor, AdditionalGear, SpecialGear } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";
import vue_showStat from "./show-stat.vue";

export default {
  props: ['visible', 'equipment'],
  inject: ['langText', 'globalLangText'],
  data() {
    const crystals = Grimoire.ItemSystem.items.crystals;
    const crystalCategorys = new Array(5).fill().map((p, i) => {
      return {
        id: i,
        crystals: crystals.filter(a => a.category == i)
      }
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
        this.equipment.appendCrystal(c, c.id, c.name, c.stats.slice());
    }
  },
  components: {
    'show-stat': vue_showStat
  }
}
</script>
<style lang="less" scoped>
@deep: ~'>>>';

.search-input {
  margin-bottom: 1rem;
}
.bottom-content-top {
  cursor: pointer;
}

.detail {
  padding-top: 0.3rem;
}

.equipment-crystals {
  @{deep} .stats {
    padding-left: 0.5rem;
    padding-top: 0.2rem;
  }
}
</style>