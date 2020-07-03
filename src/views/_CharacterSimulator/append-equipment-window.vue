<template>
  <cy-window :visible="visible" @close-window="closeWindow" class="frozen-top width-wide">
    <template v-slot:title>{{ langText('append equipment/window title: ' + action) }}</template>
    <template v-slot:default>
      <transition name="fade" mode="out-in">
        <div v-if="action == 'select-mode'" key="select-mode">
          <cy-button iconify-name="mdi:sword" type="description" @click="setAction('search')">
            {{ langText('append equipment/action: search') }}
            <template v-slot:description>
              {{ langText('append equipment/action: search description') }}
            </template>
          </cy-button>
          <cy-button iconify-name="ic-outline-category" type="description" @click="setAction('custom')">
            {{ langText('append equipment/action: custom') }}
            <template v-slot:description>
              {{ langText('append equipment/action: custom description') }}
            </template>
          </cy-button>
        </div>
        <div v-else-if="action == 'search'" key="search" class="append-equipment--search">
          <cy-title-input iconify-name="ic-outline-category">
            <input type="text" ref="searchText" :placeholder="langText('append equipment/search equipment placeholder')" @keyup.enter="updateSearchResult" />
            <cy-button iconify-name="bx-bx-search-alt-2" @click="updateSearchResult" class="no-border single-line">
              {{ $parent.getLangText('global/search') }}
            </cy-button>
          </cy-title-input>
          <transition-group v-if="searchResult.length != 0" name="flip-list" class="search-result" tag="div" mode="out-in">
            <cy-button v-for="(data, i) in searchResult" type="description" :iconify-name="data.categoryIcon" :key="data.origin.id" @click="selectSearchResult(data, i)">
              {{ data.origin.name }}
              <template v-slot:description>
                <span style="font-size: 0.9rem;">{{ data.obtainText }}</span>
              </template>
            </cy-button>
          </transition-group>
          <div class="search-result" v-else>
            {{ langText('Warn/append equipment: no result found') }}
          </div>
          <div class="search-result-selected bottom-menu">
            <div class="title">
              <cy-button type="line" class="no-border" iconify-name="mdi-checkbox-multiple-blank-circle" @click="searchResultSelectedVisible = !searchResultSelectedVisible">
                {{ langText('append equipment/search equipment result: selected title', [searchResultSelected.length]) }}
                <template v-slot:content-right>
                  <cy-icon-text :iconify-name="searchResultSelectedVisible ? 'ic-round-keyboard-arrow-up' : 'ic-round-keyboard-arrow-down'" />
                </template>
              </cy-button>
            </div>
            <transition name="fade">
              <transition-group v-show="searchResultSelectedVisible" name="flip-list" class="content" tag="div">
                <cy-button v-for="(data, i) in searchResultSelected" type="line" class="inline" :iconify-name="data.categoryIcon" @click="searchResultSelectedCancel(i)" :key="data.origin.id">
                  {{ data.origin.name }}
                  <template v-slot:content-right>
                    <cy-icon-text iconify-name="ic-round-close" />
                  </template>
                </cy-button>
              </transition-group>
            </transition>
            <div class="tail-buttons" v-show="searchResultSelected.length > 0">
              <cy-button class="no-border" iconify-name="ic-round-done" @click="handleSelectedEquipments('append')">
                {{ $parent.getLangText('global/confirm') }}
              </cy-button>
              <cy-button class="no-border" iconify-name="ic-round-clear" @click="handleSelectedEquipments('clear')">
                {{ $parent.getLangText('global/clear') }}
              </cy-button>
            </div>
          </div>
        </div>
        <div v-else-if="action == 'custom'" key="custom">
        </div>
      </transition>
    </template>
  </cy-window>
</template>
<script>
import Grimoire from "@Grimoire";
import ShowMessage from "@global-modules/ShowMessage.js";

export default {
  props: ['visible'],
  data() {
    return {
      action: 'select-mode',
      searchResult: [],
      searchResultSelected: [],
      searchResultSelectedVisible: false
    };
  },
  methods: {
    handleSelectedEquipments(action) {
      const state = this.appendEquipmentWindowState;

      if (action == 'append') {
        this.$parent.equipments.push(...this.searchResultSelected.map(p => p.origin));
        ShowMessage(this.langText('Warn/append equipments successfully', [this.searchResultSelected.length]));
        this.searchResultSelected = [];
        this.closeWindow();
      } else if (action == 'clear') {
        this.searchResultSelected = [];
        ShowMessage(this.langText('Warn/clear equipments completed'));
        this.updateSearchResult();
      }
    },
    setAction(action) {
      this.action = action;
    },
    closeWindow() {
      this.action == 'select-mode' ? this.$emit('close-append-equipment-window') : this.action = 'select-mode';
    },
    updateSearchResult() {
      const text = this.$refs.searchText.value;

      if (text == '')
        return;

      const t = [],
        limit = 21;
      Grimoire.ItemSystem.items.equipments.find(item => {
        if (item.name.includes(text))
          t.push(item);
        return t.length > limit - 1;
      });

      this.searchResult = t
        .filter(item => !this.$parent.equipments.find(eq => eq.id == item.id))
        .filter(item => !this.searchResultSelected.find(data => data.origin.id == item.id))
        .map(item => {
          const o = this.$parent.itemEquipmentConvert(item);

          const obtain = this.langText('append equipment/search equipment result: obtain/' +
            (item.obtains.length > 0 ? item.obtains[0].type : 'unknow'));

          return {
            ...this.$parent.getShowEquipmentData(o),
            obtainText: obtain
          };
        });
    },
    searchResultSelectedCancel(index) {
      this.searchResultSelected.splice(index, 1);
      this.updateSearchResult();
    },
    selectSearchResult(data, index) {
      this.searchResult.splice(index, 1);
      this.searchResultSelected.push(data);
    },
    langText() {
      return this.$parent.langText(...arguments);
    }
  }
};
</script>
<style lang="less" scoped>
@deep-operator: ~'>>>';

.append-equipment--search {
  position: relative;

  > .search-result {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    align-items: flex-start;
    padding: 1rem 0;
  }

  > .search-result-selected {
    > .title {
      position: sticky;
      top: 0;
      background-color: var(--white);
      z-index: 1;
    }
  }
}
</style>