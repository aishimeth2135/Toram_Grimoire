<template>
  <cy-window :visible="visible" @close-window="$emit('close')">
    <template v-slot:title>
      <cy-icon-text iconify-name="bx-bx-search-alt">
        {{ langText('append equipments/window title: search') }}
      </cy-icon-text>
    </template>
    <template v-slot:default>
      <cy-title-input iconify-name="ic-outline-category" class="search-input">
        <input type="text" ref="searchText" :placeholder="langText('append equipments/search equipment placeholder')"
          @keyup.enter="updateSearchResult" />
        <cy-button iconify-name="bx-bx-search-alt-2" type="icon-only"
          @click="updateSearchResult" class="inline" />
      </cy-title-input>
      <div class="search-result">
        <div class="equipment-item" v-for="item in searchResult" :key="item.iid"
          @click="selectEquipment(item)">
          <cy-icon-text :iconify-name="item.categoryIcon">{{ item.origin.name }}</cy-icon-text>
          <span class="obtain">{{ item.obtainText }}</span>
          <cy-icon-text iconify-name="ic-round-add" class="right-btn" />
        </div>
      </div>
      <div class="selected" v-if="selected.length != 0">
        <div class="top" @click="selectedDetailVisible = !selectedDetailVisible">
          <span class="number-container">
            <span>{{ selected.length }}</span>
          </span>
          <span>{{ langText('append equipments/search equipment result: selected title') }}</span>
          <cy-button v-show="!selectedDetailVisible"
            iconify-name="ic-round-done" type="icon-only"
            style="margin-left: auto"
            @click.stop="submitSelected" />
        </div>
        <cy-transition type="slide-up">
          <div class="detail" v-if="selectedDetailVisible">
            <div>
              <div class="equipment-item" v-for="item in selected" :key="item.iid"
                @click="removeSelected(item)">
                <cy-icon-text :iconify-name="item.categoryIcon">{{ item.origin.name }}</cy-icon-text>
                <span class="obtain">{{ item.obtainText }}</span>
                <cy-icon-text iconify-name="ic-round-close" class="right-btn" />
              </div>
            </div>
            <div class="buttons">
              <cy-button iconify-name="ic-round-done" type="border"
                class="inline"
                @click="submitSelected">
                {{ globalLangText('global/confirm') }}
              </cy-button>
              <cy-button iconify-name="ic-round-close" type="border"
                class="inline after-button"
                @click="clearSelected">
                {{ globalLangText('global/clear') }}
              </cy-button>
            </div>
          </div>
        </cy-transition>
      </div>
    </template>
  </cy-window>
</template>
<script>
import Grimoire from "@Grimoire";
import ShowMessage from "@global-modules/ShowMessage.js";

export default {
  props: ['visible'],
  inject: ['langText', 'globalLangText', 'convertEquipmentData', 'getShowEquipmentData'],
  data() {
    return {
      searchResult: [],
      selected: [],
      selectedDetailVisible: false
    };
  },
  methods: {
    submitSelected() {
      this.$emit('append-equipments', this.selected.map(p => p.origin));
      ShowMessage(this.langText('Warn/append equipments: successfully', [this.selected.length]), 'ic-round-done');
      this.selected = [];
      this.$emit('close');
    },
    clearSelected() {
      const store = this.selected;
      this.selected = [];
      ShowMessage(this.langText('Warn/append equipments: clear'), 'ic-round-done', null, {
        buttons: [{
          text: this.globalLangText('global/recovery'),
          click: () => {
            this.selected = store;
          },
          removeMessageAfterClick: true
        }]
      });
    },
    removeSelected(item) {
      const idx = item.iid;
      this.selected.splice(idx, 1);
      this.selected.slice(idx).forEach(p => p.iid = p.iid - 1);
    },
    selectEquipment(item) {
      item = {
        origin: item.origin,
        categoryIcon: item.categoryIcon,
        obtainText: item.obtainText,
        iid: this.selected.length
      };
      this.selected.push(item);
    },
    updateSearchResult() {
      const text = this.$refs.searchText.value;

      if (text == '') {
        ShowMessage(this.langText('Warn/append equipments: search text is empty'));
        return;
      }

      const t = [],
        limit = 21;
      Grimoire.ItemSystem.items.equipments.find(item => {
        if (item.name.includes(text))
          t.push(item);
        return t.length > limit - 1;
      });

      this.searchResult = t.map((item, i) => {
        const o = this.convertEquipmentData(item);

        const obtain = this.langText('append equipments/search equipment result: obtain/' +
          (item.obtains.length > 0 ? item.obtains[0].type : 'unknow'));

        return {
          ...this.getShowEquipmentData(o),
          obtainText: obtain,
          iid: i
        };
      });
    }
  }
}
</script>
<style lang="less" scoped>
.search-input {
  position: sticky;
  top: 0;
  background-color: var(--white);
  z-index: 1;
  padding-top: 0.3rem;
  padding-bottom: 0.5rem;
}

.equipment-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid var(--primary-light);
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: rgba(var(--rgb-primary-light), 0.4);
  }

  > .obtain {
    color: var(--primary-light-2);
    font-size: 0.9rem;
    margin-left: 1rem;
  }

  > .right-btn {
    margin-left: auto;
  }
}

.selected {
  position: sticky;
  bottom: 0;
  padding: 0.4rem 0;
  background-color: var(--white);

  > .top {
    border-top: 1px solid var(--primary-light-3);
    display: flex;
    align-items: center;
    padding: 0.4rem 0.4rem;
    cursor: pointer;

    > .number-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 1.8rem;
      width: 1.8rem;
      border: 0.1rem solid var(--primary-light-3);
      margin-right: 0.6rem;
      border-radius: 50%;
    }
  }
}

.detail {
  padding-bottom: 0.4rem;
  > .buttons {
    margin-top: 0.6rem;
    text-align: right;
  }
}
</style>