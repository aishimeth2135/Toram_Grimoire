import CY from '@/shared/utils/Cyteria';

const LOCALE_LIST = ['en', 'zh-TW', 'ja', 'zh-CN'];
const LOCALE_NAMESPACE_LIST = [
  'app',
  'common',
  'global',
  'skill-query',
];

const store = {
  namespaced: true,
  state: {
    langData: {},
    langOrder: ['en', 'zh_tw', 'ja', 'zh_cn'],
    primaryLangId: 0,
    secondaryLangId: 0,
    i18n: null,
    i18nMessageLoaded: false,
  },
  getters: {
    primaryLang(state) {
      return state.primaryLangId;
    },
    secondaryLang(state) {
      return state.secondaryLangId;
    },
    primaryLocale(state) {
      return LOCALE_LIST[state.primaryLangId];
    },
    secondaryLocale(state) {
      return LOCALE_LIST[state.secondaryLangId];
    },
    get: state => (id, values) => {
      let data = (() => {
        id = id.split('/');
        let p = 0, cur = state.langData;
        while (p !== id.length) {
          cur = cur[id[p]];
          p += 1;
          if (cur === undefined)
            return undefined;
        }
        return cur;
      })();

      if (data === undefined) {
        console.warn(`[Unknow Language ID] ${id.join('/')}`);
        console.log(new Error().stack);
        return '???';
      }

      if (Array.isArray(values))
        data = data.replace(/\$(\d+)/g, (v, i) => values[i] !== undefined && values[i] !== null ? values[i] : '?');

      return data || '???';
    },
  },
  mutations: {
    injectData(state, data) {
      setLangData(state, data);
      Object.keys(data).forEach(k => {
        if (typeof data[k] === 'function')
          data[k] = data[k]();
      });

      const check = v => typeof v === 'object' && v !== null;

      const langOrder = state.langOrder,
        pri = state.primaryLangId,
        sec = state.secondaryLangId,
        pData = data[langOrder[pri]];

      check(pData) && setLangData(state.langData, pData);
      if (pri !== sec) {
        const sData = data[langOrder[sec]];
        check(sData) && setLangData(state.langData, sData);
      }

      langOrder.forEach((name, i) => {
        if (i === pri || i === sec) return;
        const t = data[name];
        check(t) && setLangData(state.langData, t);
      });
    },
    setPrimaryLang(state, id) {
      state.primaryLangId = id;
    },
    setSecondaryLang(state, id) {
      state.secondaryLangId = id;
    },
    resetData(state) {
      state.langData = {};
    },
    setI18nInstance(state, i18n) {
      state.i18n = i18n;
    },
    markI18nMessageLoaded(state) {
      state.i18nMessageLoaded = true;
    },
  },
  actions: {
    init({ dispatch, commit, getters }, initData) {
      if (CY.storageAvailable('localStorage')) {
        // default
        if (!localStorage['app--language'])
          localStorage['app--language'] = 'auto';
        if (!localStorage['app--second-language'])
          localStorage['app--second-language'] = '0';

        const curLangSet = localStorage['app--language'];
        curLangSet === 'auto' ?
          dispatch('autoSetLang') :
          commit('setPrimaryLang', parseInt(curLangSet, 10));

        commit('setSecondaryLang', parseInt(localStorage['app--second-language'], 10));
      } else {
        dispatch('autoSetLang');
      }
      commit('resetData');
      commit('injectData', initData);
      document.body.classList.add('lang-' + getters.primaryLang);
    },
    autoSetLang({ commit }) {
      const lang = (window.navigator.language || window.navigator.userLanguage).toLowerCase();
      const list = {
        'zh-tw': 1,
        'zh-hk': 1,
        'ja': 2,
        'zh-cn': 3,
      };
      commit('setPrimaryLang', list[lang] || 0);
    },
    initLocale({ dispatch, commit }) {
      if (CY.storageAvailable('localStorage')) {
        // default
        if (!localStorage['app--language'])
          localStorage['app--language'] = 'auto';
        if (!localStorage['app--second-language'])
          localStorage['app--second-language'] = '0';

        const curLangSet = localStorage['app--language'];
        curLangSet === 'auto' ?
          dispatch('autoSetLang') :
          commit('setPrimaryLang', parseInt(curLangSet, 10));

        commit('setSecondaryLang', parseInt(localStorage['app--second-language'], 10));
      } else {
        dispatch('autoSetLang');
      }
    },
    async updateLocalMessages({ state, getters, commit, dispatch }) {
      const primaryLocale = getters.primaryLocale;
      const fallbackLocale = getters.secondaryLocale;
      const loadData = async (locale) => {
        const data = {};
        const promises = LOCALE_NAMESPACE_LIST.map(async (filePath) => {
          const module = await import(
            /* webpackInclude: /\.yaml$/ */
            /* webpackChunkName: "i18n-messages-[request]" */
            `@/locales/${locale}/${filePath}.yaml`
          );
          data[filePath] = module.default;
        });
        await Promise.all(promises);
        return data;
      };
      const messages = await loadData(primaryLocale);
      const fallbackMessages = await loadData(fallbackLocale);
      state.i18n.setLocaleMessage(primaryLocale, messages);
      state.i18n.setLocaleMessage(fallbackLocale, fallbackMessages);

      commit('markI18nMessageLoaded');
      dispatch('main/updateTitle', null, { root: true });
    },
  },
};

function setLangData(target, obj) {
  Object.keys(obj).forEach(k => {
    const p = target[k];
    const q = obj[k];
    if (typeof q === 'object' && !Array.isArray(q)) {
      if (p === undefined) {
        target[k] = {};
      }
      setLangData(target[k], q);
    } else if (typeof p !== 'string' && !Array.isArray(p)) {
      target[k] = q;
    }
  });
}

export default store;
