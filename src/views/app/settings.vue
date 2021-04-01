<template>
  <span class="app--settings">
    <cy-button type="icon-only" iconify-name="ic-baseline-settings" @click="toggleWindowVisible" />
    <cy-window class="width-wide main--window" @close-window="toggleWindowVisible"
      :visible="windowVisible">
      <template #title>
        <cy-icon-text iconify-name="ic-baseline-settings">
          {{ langText('title') }}
        </cy-icon-text>
      </template>
      <fieldset class="column">
        <legend>
          <cy-icon-text iconify-name="ic-round-text-fields" text-color="purple">
            {{ langText('switch font/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">{{ langText('switch font/caption') }}</div>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('switch font/warn 1') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button iconify-name="ic-round-text-fields" type="border"
            :selected="currentFont == 1" @click="switchFont(1)">
            {{ langText('switch font/default font') }}
          </cy-button>
          <cy-button iconify-name="ic-round-text-fields" type="border"
            :selected="currentFont == 0" @click="switchFont(0)">
            {{ langText('switch font/base font') }}
          </cy-button>
          <cy-button iconify-name="ic-round-text-fields" type="border"
            :selected="currentFont == 2" @click="switchFont(2)">
            {{ langText('switch font/base font') + '-2' }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text iconify-name="ion-language" text-color="purple">
            {{ langText('language/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ langText('language/caption') }}
        </div>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('language/warn 1') }}
        </cy-icon-text>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('language/warn 2') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button v-for="(item, i) in languageState.list"
            iconify-name="ion-language" type="border"
            :selected="languageState.currentIndex == i"
            :key="item" @click="setLanguage('language', i)">
            {{ langText('language/button texts/lang ' + item) }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text iconify-name="ion-language" text-color="purple">
            {{ langText('second language/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ langText('second language/caption') }}
        </div>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('second language/warn 1') }}
        </cy-icon-text>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('second language/warn 2') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button v-for="(item, i) in secondLanguageState.list"
            iconify-name="ion-language" type="border"
            :selected="secondLanguageState.currentIndex == i"
            :key="item" @click="setLanguage('second-language', i)">
            {{ langText('language/button texts/lang ' + item) }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text iconify-name="carbon-cloud-data-ops" text-color="purple">
            {{ langText('clear caches of spreadsheets/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ langText('clear caches of spreadsheets/caption') }}
        </div>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('clear caches of spreadsheets/warn 1') }}
        </cy-icon-text>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('clear caches of spreadsheets/warn 2') }}
        </cy-icon-text>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('clear caches of spreadsheets/warn 3') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button iconify-name="ic-round-delete" type="border" @click="clearSpreadsheetsCaches">
            {{ langText('clear caches of spreadsheets/button texts/clear caches of spreadsheets') }}
          </cy-button>
        </div>
      </fieldset>
      <fieldset class="column" v-if="storageAvailable">
        <legend>
          <cy-icon-text iconify-name="ic-round-save">
            {{ langText('storage backup/title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ langText('storage backup/caption') }}
        </div>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('storage backup/warn 1') }}
        </cy-icon-text>
        <cy-icon-text iconify-name="bx-bx-error-circle" text-size="small" text-color="light-3">
          {{ langText('storage backup/warn 2') }}
        </cy-icon-text>
        <cy-default-tips iconify-name="mdi-ghost" v-if="$route.path != '/'">
          {{ langText('storage backup/Must be operated on the homepage') }}
        </cy-default-tips>
        <div class="buttons" v-else>
          <cy-button iconify-name="ic-round-save" type="border" @click="saveLocalStorage">
            {{ langText('storage backup/button texts/save') }}
          </cy-button>
          <cy-button iconify-name="bx-bx-loader-circle" type="border" @click="loadLocalStorage">
            {{ langText('storage backup/button texts/load') }}
          </cy-button>
        </div>
      </fieldset>
    </cy-window>
  </span>
</template>

<script>
import CY from "@lib/main/module/cyteria.js";
import GetLang from "@global-modules/LanguageSystem.js";

import ShowMessage from "@global-modules/ShowMessage.js";

export default {
  data() {
    const list1 = ['auto', '0', '1', '2', '3'],
      list2 = ['0', '1', '2', '3'];
    return {
      windowVisible: false,
      currentFont: localStorage['app--font-family'] !== '1' ? 0 : 1,
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
        .then(p => p && ShowMessage(this.langText('clear caches of spreadsheets/Clear caches of spreadsheet successfully')));
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

      ShowMessage(this.langText('storage backup/Save successfully'));
    },
    loadLocalStorage() {
      const storage = window.localStorage;

      CY.file.load({
        succee: data => {
          data = JSON.parse(data);
          Object.keys(data).forEach(k => storage.setItem(k, data[k]));
          ShowMessage(this.langText('storage backup/Load successfully'));
        },
        error: () => {
          ShowMessage(this.langText('storage backup/Load failed'));
        },
        checkFileType: type => {
          if (type != 'txt') {
            ShowMessage(this.langText('storage backup/Wrong type of file'));
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
      origin !== '0' && document.body.classList.remove('font-' + origin);
      localStorage.setItem('app--font-family', id.toString());
      id !== 0 && document.body.classList.add('font-' + id);
      this.currentFont = id;
    },
    toggleWindowVisible() {
      this.windowVisible = !this.windowVisible;
    },
    langText(v, vs) {
      return GetLang('Settings/' + v, vs);
    }
  }
}
</script>

<style lang="less" scoped>
  @deep-operator: ~'>>>';

  .app--settings {
    padding: 1rem 0;

    > .main--window {
      @{deep-operator} .column {
        border: 1px solid var(--primary-light);
        margin-bottom: 0.7rem;
        padding: 0.5rem 1rem;

        > .caption {
          margin-bottom: 0.4rem;
        }

        > .buttons {
          padding: 0.2rem;
          margin-top: 0.2rem;
        }

        > legend {
          padding: 0 0.6rem;
        }
      }
    }
  }
</style>