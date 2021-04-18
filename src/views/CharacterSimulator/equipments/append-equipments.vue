<template>
  <cy-window :visible="visible" @close-window="$emit('close')"
    vertical-position="top">
    <template v-slot:title>
      <cy-icon-text iconify-name="bx-bx-search-alt">
        {{ $lang('window title: search') }}
      </cy-icon-text>
    </template>
    <template v-slot:default>
      <cy-title-input iconify-name="ic-outline-category"
        class="sticky top-0 bg-white z-1 pt-1 pb-2"
        :value.sync="searchText"
        :placeholder="$lang('search equipment placeholder')" />
      <div class="search-result" v-if="searchResult.length != 0">
        <cy-list-item v-for="item in searchResult" :key="item.iid"
          @click="selectEquipment(item)">
          <cy-icon-text :iconify-name="item.categoryIcon">{{ item.origin.name }}</cy-icon-text>
          <span class="equipment-item-obtain">{{ item.obtainText }}</span>
          <template v-slot:right-content>
            <cy-icon-text iconify-name="ic-round-add" />
          </template>
        </cy-list-item>
        <div v-if="searchResult.length >= searchResultMaximum"
          class="text-sm text-red py-3 px-2">
          {{ $lang('search equipment result: limit reached') }}
        </div>
      </div>
      <cy-default-tips v-else icon-id="potum">
        {{ $lang.extra('parent', 'Warn/no result found') }}
      </cy-default-tips>
      <cy-bottom-content class="selected" v-if="selected.length != 0">
        <template #normal-content>
          <cy-transition type="fade">
            <div v-if="selectedDetailVisible" class="selected-detail">
              <div>
                <cy-list-item v-for="item in selected" :key="item.iid"
                  @click="removeSelected(item)">
                  <cy-icon-text :iconify-name="item.categoryIcon">{{ item.origin.name }}</cy-icon-text>
                  <span class="equipment-item-obtain">{{ item.obtainText }}</span>
                  <template v-slot:right-content>
                    <cy-icon-text iconify-name="ic-round-close" />
                  </template>
                </cy-list-item>
              </div>
            </div>
          </cy-transition>
          <div class="cursor-pointer mb-2 pt-2 flex items-center"
            @click="selectedDetailVisible = !selectedDetailVisible">
            <span class="inline-flex items-center justify-center h-7 w-7 border-1 border-solid border-light-3 mr-3 rounded-full">
              <span>{{ selected.length }}</span>
            </span>
            <span>{{ $lang('search equipment result: selected title') }}</span>
            <cy-icon-text class="ml-auto flex-shrink-0"
              :iconify-name="'ic-round-keyboard-arrow-' + (selectedDetailVisible ? 'down' : 'up')" />
          </div>
          <div class="flex items-center">
            <div class="ml-auto">
              <cy-button iconify-name="ic-round-done" type="border"
                @click.stop="submitSelected">
                {{ $globalLang('global/confirm') }}
              </cy-button>
              <cy-button iconify-name="ic-round-close" type="border"
                class="ml-2"
                @click.stop="clearSelected">
                {{ $globalLang('global/clear') }}
              </cy-button>
            </div>
          </div>
        </template>
      </cy-bottom-content>
    </template>
  </cy-window>
</template>
<script>
import MessageNotify from "@Services/Notify";

export default {
  RegisterLang: {
    root: 'Character Simulator/append equipments',
    extra: {
      parent: 'Character Simulator'
    }
  },
  props: ['visible'],
  inject: ['convertEquipmentData', 'getShowEquipmentData', 'appendEquipments'],
  data() {
    return {
      searchText: '',
      selected: [],
      selectedDetailVisible: false,
      searchResultMaximum: 30
    };
  },
  computed: {
    searchResult() {
      const text = this.searchText;
      let res = this.$store.state.datas.items.equipments;
      if (text !== '') {
        res = res.filter(item => item.name.includes(text));
      }
      res.sort((a, b) => b.id - a.id);

      return res.slice(0, this.searchResultMaximum).map((item, i) => {
        const o = this.convertEquipmentData(item);

        const obtain = this.$lang('search equipment result: obtain/' +
          (item.obtains.length > 0 ? item.obtains[0].type : 'unknow'));

        return {
          ...this.getShowEquipmentData(o),
          obtainText: obtain,
          iid: i
        };
      });
    }
  },
  methods: {
    submitSelected() {
      this.appendEquipments(this.selected.map(p => p.origin.copy()));
      MessageNotify(this.$lang('append equipments successfully', [this.selected.length]), 'ic-round-done');
      this.selected = [];
      this.$emit('close');
    },
    clearSelected() {
      const store = this.selected;
      this.selected = [];
      MessageNotify(this.$lang('selected equipments cleared'), 'ic-round-done', null, {
        buttons: [{
          text: this.$globalLang('global/recovery'),
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
    }
  }
}
</script>
<style lang="postcss" scoped>
.equipment-item-obtain {
  @apply text-sm text-light-2 ml-4;
}
.selected-detail {
  max-height: min(20rem, 50vh);
  overflow-y: auto;
}
</style>