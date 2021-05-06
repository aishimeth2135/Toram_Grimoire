<template>
  <span class="app--settings">
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
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="ic-round-text-fields" text-color="purple">
            {{ $lang('switch font/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">{{ $lang('switch font/caption') }}</div>
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('switch font/warn 1') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button icon="ic-round-text-fields" type="border"
            :selected="currentFont == 1" @click="switchFont(1)">
            {{ $lang('switch font/default font') }}
          </cy-button>
          <cy-button icon="ic-round-text-fields" type="border"
            :selected="currentFont == 0" @click="switchFont(0)">
            {{ $lang('switch font/base font') }}
          </cy-button>
          <cy-button icon="ic-round-text-fields" type="border"
            :selected="currentFont == 2" @click="switchFont(2)">
            {{ $lang('switch font/base font') + '-2' }}
          </cy-button>
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
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('language/warn 1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('language/warn 2') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button v-for="(item, i) in languageState.list"
            icon="ion-language" type="border"
            :selected="languageState.currentIndex == i"
            :key="item" @click="setLanguage('language', i)">
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
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('second language/warn 1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('second language/warn 2') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button v-for="(item, i) in secondLanguageState.list"
            icon="ion-language" type="border"
            :selected="secondLanguageState.currentIndex == i"
            :key="item" @click="setLanguage('second-language', i)">
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
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('clear caches of spreadsheets/warn 1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('clear caches of spreadsheets/warn 2') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('clear caches of spreadsheets/warn 3') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button icon="ic-round-delete" type="border" @click="clearSpreadsheetsCaches">
            {{ $lang('clear caches of spreadsheets/button texts/clear caches of spreadsheets') }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column" v-if="storageAvailable">
        <legend>
          <cy-icon-text icon="ic-round-save">
            {{ $lang('storage backup/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ $lang('storage backup/caption') }}
        </div>
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('storage backup/warn 1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ $lang('storage backup/warn 2') }}
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

export default {
  RegisterLang: 'Settings',
  data() {
    const list1 = ['auto', '0', '1', '2', '3'],
      list2 = ['0', '1', '2', '3'];
    return {
      windowVisible: false,
      currentFont: parseInt(localStorage['app--font-family'], 10),
      languageState: {
        list: list1,
        currentIndex: list1.indexOf(localStorage['app--language'])
      },
      secondLanguageState: {
        list: list2,
        currentIndex: list2.indexOf(localStorage['app--second-language'])
      }
    };
  },
  computed: {
    storageAvailable() {
      return CY.storageAvailable('localStorage');
    }
  },
  methods: {
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
        fileName: 'Cy-Grimoire_storage.txt'
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
      const state = target == 'language' ? this.languageState : this.secondLanguageState;
      state.currentIndex = index;
      localStorage['app--' + target] = state.list[index];
    },
    switchFont(id) {
      const origin = localStorage.getItem('app--font-family');
      origin != '0' && document.documentElement.classList.remove('font-' + origin);
      localStorage.setItem('app--font-family', id.toString());
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