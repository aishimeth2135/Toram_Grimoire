<template>
  <cy-modal
    :visible="visible"
    vertical-position="top"
    @close="$emit('close')"
  >
    <template #title>
      <cy-icon-text icon="bx-bx-search-alt">
        {{ $lang('window title: search') }}
      </cy-icon-text>
    </template>
    <template #default>
      <cy-title-input
        v-model:value="searchText"
        icon="ic-outline-category"
        class="sticky top-0 bg-white z-1 pt-1 pb-2"
        :placeholder="$lang('search equipment placeholder')"
      />
      <div v-if="searchResult.length !== 0" class="search-result">
        <equipment-item
          v-for="item in searchResult"
          :key="item.iid"
          :equipment="item.origin"
          @click="selectEquipment(item)"
        >
          <template #extra>
            <span class="text-sm text-light-2 ml-4">
              {{ item.origin.obtainText }}
            </span>
            <cy-icon-text icon="ic-round-add" class="ml-auto" />
          </template>
        </equipment-item>
        <div
          v-if="searchResult.length >= searchResultMaximum"
          class="text-sm text-red py-3 px-2"
        >
          {{ $lang('search equipment result: limit reached') }}
        </div>
      </div>
      <cy-default-tips v-else icon="potum" icon-src="custom">
        {{ $lang.extra('parent', 'Warn/no result found') }}
      </cy-default-tips>
      <cy-bottom-content v-if="selected.length != 0" class="selected">
        <template #normal-content>
          <cy-transition type="fade">
            <div v-if="selectedDetailVisible" class="selected-detail">
              <equipment-item
                v-for="item in selected"
                :key="item.iid"
                :equipment="item.origin"
                @click="removeSelected(item)"
              >
                <template #extra>
                  <span class="text-sm text-light-2 ml-4">
                    {{ item.origin.obtainText }}
                  </span>
                  <cy-icon-text icon="ic-round-close" class="ml-auto" />
                </template>
              </equipment-item>
            </div>
          </cy-transition>
          <div
            class="cursor-pointer mb-2 pt-2 flex items-center"
            @click="selectedDetailVisible = !selectedDetailVisible"
          >
            <span class="inline-flex items-center justify-center h-7 w-7 border-1 border-solid border-light-3 mr-3 rounded-full">
              <span>{{ selected.length }}</span>
            </span>
            <span>{{ $lang('search equipment result: selected title') }}</span>
            <cy-icon-text
              class="ml-auto flex-shrink-0 leading-none"
              :icon="'ic-round-keyboard-arrow-' + (selectedDetailVisible ? 'down' : 'up')"
            />
          </div>
          <div class="flex items-center">
            <div class="ml-auto">
              <cy-button-border icon="ic-round-done" @click.stop="submitSelected">
                {{ $rootLang('global/confirm') }}
              </cy-button-border>
              <cy-button-border icon="ic-round-close" class="ml-2" @click.stop="clearSelected">
                {{ $rootLang('global/clear') }}
              </cy-button-border>
            </div>
          </div>
        </template>
      </cy-bottom-content>
    </template>
  </cy-modal>
</template>

<script>
import vue_equipmentItem from '@/components/common/equipment-item.vue';

export default {
  RegisterLang: {
    root: 'Character Simulator/append equipments',
    extra: {
      parent: 'Character Simulator',
    },
  },
  components: {
    'equipment-item': vue_equipmentItem,
  },
  inject: ['convertEquipmentData', 'appendEquipments'],
  props: ['visible'],
  emits: ['close'],
  data() {
    return {
      searchText: '',
      selected: [],
      selectedDetailVisible: false,
      searchResultMaximum: 30,
    };
  },
  computed: {
    searchResult() {
      const text = this.searchText;
      let res = this.$store.state.datas.Items.equipments;
      res = res.filter(item => (item.name.includes(text) && item.category !== -1)
        || (item.category === -1 && item.name === text));
      res.sort((a, b) => b.id - a.id);

      return res.slice(0, this.searchResultMaximum).map((item, i) => {
        const o = this.convertEquipmentData(item);

        const obtain = this.$rootLang('common/Equipment/obtain/' +
          (item.obtains.length > 0 ? item.obtains[0].type : 'unknow'));

        return {
          origin: o,
          obtainText: obtain,
          iid: i,
        };
      });
    },
  },
  methods: {
    submitSelected() {
      this.appendEquipments(this.selected.map(p => p.origin.copy()));
      this.$notify(this.$lang('append equipments successfully', [this.selected.length]), 'ic-round-done');
      this.selected = [];
      this.$emit('close');
    },
    clearSelected() {
      const store = this.selected;
      this.selected = [];
      this.$notify(this.$lang('selected equipments cleared'), 'ic-round-done', null, {
        buttons: [{
          text: this.$rootLang('global/recovery'),
          click: () => {
            this.selected = store;
          },
          removeMessageAfterClick: true,
        }],
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
        iid: this.selected.length,
      };
      this.selected.push(item);
    },
  },
};
</script>

<style lang="postcss" scoped>
.selected-detail {
  max-height: min(20rem, 50vh);
  overflow-y: auto;
}
</style>
