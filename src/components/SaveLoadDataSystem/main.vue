<template>
  <div v-if="localStorageAvailable">
    <cy-button-line
      icon="mdi:content-save-outline"
      @click="openSelectDataWindow('save')"
    >
      {{ langText('save') }}
    </cy-button-line>
    <cy-button-line
      icon="mdi:download"
      @click="openSelectDataWindow('load')"
    >
      {{ langText('load') }}
    </cy-button-line>
    <cy-button-line
      icon="ic:round-insert-drive-file"
      @click="handleFile('save')"
    >
      {{ langText('save to csv') }}
    </cy-button-line>
    <cy-button-line
      icon="mdi:file-download-outline"
      @click="handleFile('load')"
    >
      {{ langText('load from csv') }}
    </cy-button-line>
    <cy-window v-model:visible="selectDataWindowVisible">
      <template #title>
        <cy-icon-text icon="mdi:content-save-outline">
          {{ langText('Save Load: title') }}
        </cy-icon-text>
      </template>
      <template
        v-for="(state, idx) in buttonsStates"
        :key="state.title"
      >
        <div class="column" @click="selectData(idx)">
          <cy-icon-text icon="bx:bxs-book-bookmark">
            {{ state.title }}
          </cy-icon-text>
          <div class="detail">
            <div v-if="!noData(idx)" class="pl-2">
              <div v-for="name in state.names" :key="name.iid">
                <cy-icon-text icon="ic:round-label-important">
                  {{ name.text }}
                </cy-icon-text>
              </div>
            </div>
            <div v-else class="no-data">
              {{ langText('no data') }}
            </div>
          </div>
        </div>
        <cy-transition type="fade">
          <div v-if="idx === currentButtonIndex" class="mt-1 mb-4">
            <cy-icon-text icon="bx:bx-info-circle" align-v="start" size="small" text-color="red">
              {{ langText(currentMode === 'save' ? 'Warn/Confirm to overwrite existing data' : 'Warn/Confirm to load data') }}
            </cy-icon-text>
          </div>
        </cy-transition>
      </template>
    </cy-window>
  </div>
</template>
<script>
import CY from '@utils/Cyteria'
import GetLang from '@services/Language';

import init from './init.js';

function Lang(s, vs) {
  return GetLang('Save Load System/' + s, vs);
}

const DoNothing = function() {
  // do nothing
};

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    saveData: {
      type: Function,
      required: true,
    },
    loadData: {
      type: Function, // callback(String data)
      required: true,
    },
    fileName: {
      type: Function,
      default: () => 'state',
    },
    saveNameList: {
      type: Function,
      default: () => [],
    },
    actionFinished: {
      type: Function,
      default: DoNothing,
    },
    beforeLoadConfirm: {
      type: Function,
      default: DoNothing,
    },
    error: {
      type: Function, // callback(Error)
      default: DoNothing,
    },
    saveSize: {
      type: Number,
      default: 5,
      validator: v => Number.isInteger(v),
    },
  },
  data() {
    return {
      buttonsStates: Array(this.saveSize).fill().map((p, i) => {
        return {
          title: Lang('file') + ' ' + i,
          names: '',
          data: null,
        };
      }),
      selectDataWindowVisible: false,
      currentButtonIndex: -1,
      currentMode: '',
    };
  },
  computed: {
    localStorageAvailable() {
      return CY.storageAvailable('localStorage');
    },
  },
  beforeCreate() {
    init();
  },
  created() {
    this.updateButtonsStates();
  },
  methods: {
    updateButtonsStates() {
      this.buttonsStates.forEach((state, idx) => {
        state.names = (this.getLocalStorageData(idx, 'name') || '').split(',,').map((p, i) => {
          return {
            text: p,
            iid: i,
          };
        });
        state.data = this.getLocalStorageData(idx, 'data') || null;
        state.iid = idx;
      });
    },
    closeSelectDataWindow() {
      this.selectDataWindowVisible = false;
    },
    handleFile(mode) {
      if (mode == 'save') {
        const str = this.saveData();
        if (!str) {
          this.$notify(Lang('Warn/File is empty'));
          return;
        }
        try {
          CY.csv.saveFile(str, this.fileName());
          this.actionFinished();
        } catch (e) {
          this.error(e);
        }
      } else if (mode == 'load') {
        CY.csv.loadFile({
          loadFileSucceeded: res => {
            try {
              this.loadData(res);
              this.actionFinished();
            } catch (e) {
              this.$notify(Lang('Warn/An error occurred while loading data'));
              this.error(e);
            }
          },
          wrongFileType() {
            this.$notify(Lang('Warn/Wrong file type: csv'));
          },
        });
      }
    },
    noData(index) {
      return this.buttonsStates[index].data == null;
    },
    openSelectDataWindow(mode) {
      this.selectDataWindowVisible = true;
      this.currentMode = mode;

      this.currentButtonIndex = -1;
    },
    selectData(index) {
      if (this.currentMode == 'save') {
        if (this.noData(index) || this.currentButtonIndex == index) {
          this.saving(index);
          this.currentButtonIndex = -1;
          this.closeSelectDataWindow();
          return;
        }
      } else if (this.currentMode == 'load') {
        if (!this.noData(index) && (this.beforeLoadConfirm() || this.currentButtonIndex == index)) {
          this.loading(index);
          this.currentButtonIndex = -1;
          this.closeSelectDataWindow();
          return;
        }
      }

      if (this.currentButtonIndex != index)
        this.currentButtonIndex = index;
    },
    saving(index) {
      try {
        const str = this.saveData();
        const name = this.saveNameList().join(',,');

        this.saveLocalStorageData(index, 'name', name);
        this.saveLocalStorageData(index, 'data', str);

        this.$notify(Lang('Warn/Saving success'));
        this.actionFinished();
        this.updateButtonsStates();
      } catch (e) {
        this.error(e);
      }
    },
    loading(index) {
      const d = this.getLocalStorageData(index, 'data');
      try {
        this.loadData(d);
        this.$notify(Lang('Warn/Loading success'));
        this.actionFinished();
      } catch (e) {
        this.$notify(Lang('Warn/An error occurred while loading data'));
        this.error(e);
      }
    },
    localStorageKey(index, type) {
      return 'Save-Load-Data-System--' + index + '--' + this.name + '--' + type;
    },
    saveLocalStorageData(index, type, data) {
      return window.localStorage.setItem(this.localStorageKey(index, type), data);
    },
    getLocalStorageData(index, type) {
      return window.localStorage.getItem(this.localStorageKey(index, type));
    },
    langText(v, vs) {
      return Lang(v, vs);
    },
  },
};
</script>
<style lang="less" scoped>
.column {
  margin-bottom: 0.5rem;
  border-left: 3px solid var(--primary-light-2);
  transition: 0.3s;
  cursor: pointer;
  padding: 0.4rem 0.8rem;

  &:hover {
    border-left-color: var(--primary-light-4);
  }

  > .detail > .no-data {
    text-align: center;
    padding: 0.6rem;
    color: var(--primary-light-2);
  }
}
</style>
