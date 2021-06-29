<template>
  <span v-if="storageAvailable" class="app--settings">
    <cy-button type="icon" icon="ic-baseline-settings" @click="toggleWindowVisible" />
    <cy-window class="main--window"
      width="wide"
      v-model:visible="windowVisible">
      <template #title>
        <div class="flex items-center">
          <cy-icon-text icon="ic-baseline-settings">
            {{ $lang('title') }}
          </cy-icon-text>
          <span class="ml-auto text-purple">
            v{{ $store.state.main.version }}
          </span>
        </div>
      </template>
      <div v-if="serviceWorker.hasUpdate"
        class="p-4 flex items-center justify-center">
        <cy-icon-text icon="mdi-creation" text-color="purple">
          {{ $lang('update/new version detected') }}
        </cy-icon-text>
        <cy-button type="border" icon="mdi-coffee-outline"
          @click="swUpdate" class="ml-4">
          {{ $lang('update/force update') }}
        </cy-button>
      </div>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="ic-round-text-fields" text-color="purple">
            {{ $lang('switch font/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">{{ $lang('switch font/caption') }}</div>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3">
          {{ $lang('switch font/tips 1') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button type="check"
            :selected="currentFont === 1" @click="switchFont(1)">
            {{ $lang('switch font/default font') }}
          </cy-button>
          <cy-button type="check"
            :selected="currentFont === 0" @click="switchFont(0)">
            {{ $lang('switch font/base font') }}
          </cy-button>
          <cy-button type="check"
            :selected="currentFont === 2" @click="switchFont(2)">
            {{ $lang('switch font/base font') + '-2' }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="mdi-weather-night" text-color="purple">
            {{ $lang('night mode/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">{{ $lang('night mode/caption') }}</div>
        <div class="mt-4 mb-2">
          <cy-button type="check"
            :selected="nightMode === '1'"
            @click="nightMode = nightMode !== '1' ? '1' : '0'">
             {{ $lang('night mode/title') }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="bx-bx-ruler" text-color="purple">
            {{ $lang('set rem/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">{{ $lang('set rem/caption') }}</div>
        <div class="flex items-center flex-wrap">
          <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" class="mr-2">
            {{ $lang('set rem/tips 1') }}
          </cy-icon-text>
        </div>
        <div class="mt-4 mb-2">
          <cy-input-counter v-model:value="remValue" :range="[120, 200]">
            <template #title>
              <cy-icon-text icon="bx-bx-ruler">
                {{ $lang('set rem/rem title') }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="ion-language" text-color="purple">
            {{ $lang('language/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ $lang('language/caption') }}
        </div>
        <div class="flex items-center flex-wrap">
          <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" class="mr-2">
            {{ $lang('language/tips 1') }}
          </cy-icon-text>
          <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3">
            {{ $lang('language/tips 2') }}
          </cy-icon-text>
        </div>
        <div class="buttons">
          <cy-button v-for="(item, i) in languageState.list"
            type="check"
            :selected="languageState.currentIndex === i"
            :key="item" @click="setLanguage(0, i)">
            {{ $lang('language/button texts/lang ' + item) }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="ion-language" text-color="purple">
            {{ $lang('second language/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ $lang('second language/caption') }}
        </div>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3">
          {{ $lang('second language/tips 1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3">
          {{ $lang('second language/tips 2') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button v-for="(item, i) in secondLanguageState.list"
            type="check"
            :selected="secondLanguageState.currentIndex == i"
            :key="item" @click="setLanguage(1, i)">
            {{ $lang('language/button texts/lang ' + item) }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="carbon-cloud-data-ops" text-color="purple">
            {{ $lang('clear caches of spreadsheets/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ $lang('clear caches of spreadsheets/caption') }}
        </div>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3">
          {{ $lang('clear caches of spreadsheets/tips 1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3">
          {{ $lang('clear caches of spreadsheets/tips 2') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3">
          {{ $lang('clear caches of spreadsheets/tips 3') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button icon="ic-round-delete" type="border" @click="clearSpreadsheetsCaches">
            {{ $lang('clear caches of spreadsheets/button texts/clear caches of spreadsheets') }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="ic-round-save">
            {{ $lang('storage backup/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ $lang('storage backup/caption') }}
        </div>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3">
          {{ $lang('storage backup/tips 1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3">
          {{ $lang('storage backup/tips 2') }}
        </cy-icon-text>
        <cy-default-tips icon="mdi-ghost" v-if="$route.path != '/'">
          {{ $lang('storage backup/Must be operated on the homepage') }}
        </cy-default-tips>
        <div class="buttons" v-else>
          <cy-button icon="ic-round-save" type="border" @click="saveLocalStorage">
            {{ $lang('storage backup/button texts/save') }}
          </cy-button>
          <cy-button icon="bx-bx-loader-circle" type="border" @click="loadLocalStorage">
            {{ $lang('storage backup/button texts/load') }}
          </cy-button>
        </div>
      </fieldset>
    </cy-window>
  </span>
</template>

<script>
import CY from "@utils/Cyteria";
import { APP_STORAGE_KEYS } from "@consts";
import { mapState } from "vuex";

export default {
  RegisterLang: 'Settings',
  data() {
    const list1 = ['auto', '0', '1', '2', '3'],
      list2 = ['0', '1', '2', '3'];
    return {
      windowVisible: false,
      currentFont: localStorage[APP_STORAGE_KEYS.FONT_FAMILY] !== undefined ?
        parseInt(localStorage[APP_STORAGE_KEYS.FONT_FAMILY], 10) : 1,
      setRem: {
        value: localStorage[APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE] ?
          parseInt(localStorage[APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE], 10) : 160
      },
      setNightMode: {
        value: localStorage[APP_STORAGE_KEYS.NIGHT_MODE] || '0'
      },
      languageState: {
        list: list1,
        currentIndex: list1.indexOf(localStorage[APP_STORAGE_KEYS.LANGUAGE])
      },
      secondLanguageState: {
        list: list2,
        currentIndex: list2.indexOf(localStorage[APP_STORAGE_KEYS.SECOND_LANGUAGE])
      },
      update: {
        newVersionDetected: false,
        sw: null
      }
    };
  },
  computed: {
    ...mapState('main', ['serviceWorker']),
    storageAvailable() {
      return CY.storageAvailable('localStorage');
    },
    nightMode: {
      get() {
        return this.setNightMode.value;
      },
      set(v) {
        this.setNightMode.value = v;
        localStorage[APP_STORAGE_KEYS.NIGHT_MODE] = v;
        document.documentElement.classList[v === '0' ? 'remove': 'add']('theme--night-mode');
      }
    },
    remValue: {
      get() {
        return this.setRem.value;
      },
      set(v) {
        localStorage.setItem(APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE, v.toString());
        this.setRem.value = v;
        document.documentElement.style.fontSize = (this.setRem.value / 10).toString() + 'px';
      }
    }
  },
  mounted() {
    const rel = document.documentElement;
    rel.classList.add('font-' + this.currentFont.toString());
    rel.style.fontSize = (this.setRem.value / 10).toString() + 'px';
    rel.classList[this.nightMode === '0' ? 'remove': 'add']('theme--night-mode');
  },
  methods: {
    swUpdate() {
      this.serviceWorker.instance.waiting.postMessage({ type: 'SKIP_WAITING' });
    },
    clearSpreadsheetsCaches() {
      caches.delete('google-spreadsheets-csv-files')
        .then(p => p && this.$notify(this.$lang('clear caches of spreadsheets/Clear caches of spreadsheet successfully')));
    },
    saveLocalStorage() {
      const data = {};
      const storage = window.localStorage;
      Array(localStorage.length).fill().map((_, i) => i).forEach(idx => {
        const key = storage.key(idx);
        const item = storage.getItem(key);
        if (key.slice(0, 7) != 'iconify')
          data[key] = item;
      });

      CY.file.save({
        data: JSON.stringify(data),
        fileType: 'text/txt',
        fileName: 'cy-grimoire-storage.txt'
      });

      this.$notify(this.$lang('storage backup/Save successfully'));
    },
    loadLocalStorage() {
      const storage = window.localStorage;

      CY.file.load({
        succeed: data => {
          data = JSON.parse(data);
          Object.keys(data).forEach(k => storage.setItem(k, data[k]));
          this.$notify(this.$lang('storage backup/Load successfully'));
        },
        error: () => {
          this.$notify(this.$lang('storage backup/Load failed'));
        },
        checkFileType: type => {
          if (type != 'txt') {
            this.$notify(this.$lang('storage backup/Wrong type of file'));
            return false;
          }
          return true;
        }
      });
    },
    setLanguage(target, index) {
      const state = target === 0 ? this.languageState : this.secondLanguageState;
      const key = target === 0 ? APP_STORAGE_KEYS.LANGUAGE : APP_STORAGE_KEYS.SECOND_LANGUAGE;
      state.currentIndex = index;
      localStorage[key] = state.list[index];
    },
    switchFont(id) {
      const origin = localStorage.getItem(APP_STORAGE_KEYS.FONT_FAMILY);
      origin != '0' && document.documentElement.classList.remove('font-' + origin);
      localStorage.setItem(APP_STORAGE_KEYS.FONT_FAMILY, id.toString());
      id != 0 && document.documentElement.classList.add('font-' + id);
      this.currentFont = id;
    },
    toggleWindowVisible() {
      this.windowVisible = !this.windowVisible;
    }
  }
}
</script>

<style lang="postcss" scoped>
.column {
  @apply py-2 px-5 mb-3 border-1 border-solid border-light;

  & > .caption {
    @apply mb-2;
  }
  & > .buttons {
    @apply p-1 mt-1;
  }
  & > legend {
    @apply px-2;
  }
}
</style>