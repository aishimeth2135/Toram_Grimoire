import Vue from "vue";

import CY from "@Utils/Cyteria";

const store = {
  namespaced: true,
  state: {
    langData: {},
    langOrder: ['en', 'zh_tw', 'ja', 'zh_cn'],
    primaryLangId: 0,
    secondaryLangId: 0
  },
  getters: {
    primaryLang(state) {
      return state.primaryLangId;
    },
    secondaryLang(state) {
      return state.secondaryLangId;
    },
    get: state => (id, values) => {
      let data = (() => {
        id = id.split('/');
        let p = 0, cur = state.langData;
        while (p !== id.length) {
          cur = cur[id[p]];
          ++p;
          if (cur === void 0)
            return void 0;
        }
        return cur;
      })();

      if (data === void 0) {
        console.warn(`[Unknow Language ID] ${id}`);
        console.log(new Error().stack);
        return '???';
      }

      if (Array.isArray(values))
        data = data.replace(/\$(\d+)/g, (v, i) => values[i] !== void 0 && values[i] !== null ? values[i] : '?');

      return data || '???';
    }
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
    }
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
        'zh-cn': 3
      };
      commit('setPrimaryLang', list[lang] || 0);
    }
  }
};

function setLangData(target, obj) {
  Object.keys(obj).forEach(k => {
    const p = target[k];
    const q = obj[k];
    if (typeof q === 'object' && !Array.isArray(q)) {
      p === void 0 && Vue.set(target, k, {});
      setLangData(target[k], q);
    } else if (typeof p !== 'string' && !Array.isArray(p)) {
      Vue.set(target, k, q);
    }
  });
}

export default store;