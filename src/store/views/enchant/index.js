import { EnchantBuild } from '@/lib/Enchant/Enchant';

import CY from '@/shared/utils/Cyteria';

const SAVE_PRETEXT = 'app--enchant-simulator--vbeta--';

const storeState = {
  /** @type {Array<EnchantBuild>} */
  builds: [],
  currentBuildIndex: -1,
  hasInit: false,
  config: {
    characterLevel: 230,
    smithLevel: 0,
  },
};
const mutations = {
  setConfig(state, sets) {
    Object.entries(sets).forEach(([key, value]) => {
      state.config[key] = value;
    });
  },

  /** @param {EnchantBuild} build */
  appendBuild(state, build) {
    state.builds.push(build);
    ++state.currentBuildIndex;
  },

  /** @param {EnchantBuild} build */
  removeBuild(state, build) {
    const idx = state.builds.indexOf(build);
    state.builds.splice(idx, 1);
    if (state.currentBuildIndex > 0) {
      --state.currentBuildIndex;
    }
  },

  /** @param {EnchantBuild} build */
  copyBuild(state, build) {
    const newBuild = build.copy();
    newBuild.name += '*';
    ++state.currentBuildIndex;
    state.builds.splice(state.currentBuildIndex, 0, newBuild);
  },
  setCurrentBuild(state, { index = 0 } = {}) {
    state.currentBuildIndex = index;
  },
  initFinished(state) {
    state.hasInit = true;
  },
  save(state, { target = 'auto' } = {}) {
    if (!CY.storageAvailable('localStorage')) {
      return;
    }
    const builds = state.builds.map(build => build.save());
    const data = {
      builds,
      index: state.currentBuildIndex,
      config: state.config,
    };
    window.localStorage.setItem(SAVE_PRETEXT + target, JSON.stringify(data));
  },
  load(state, { target = 'auto' } = {}) {
    if (!CY.storageAvailable('localStorage')) {
      return;
    }
    const origin = {
      builds: state.build,
      index: state.currentBuildIndex,
      config: state.config,
    };
    try {
      const odata = window.localStorage.getItem(SAVE_PRETEXT + target);
      if (!odata) {
        console.warn('enchant-simulator data not found: ' + target);
        return;
      }
      const data = JSON.parse(odata);
      state.builds = data.builds.map(buildData => EnchantBuild.load(buildData));
      state.currentBuildIndex = data.index;
      state.config = data.config;
    } catch (e) {
      console.warn('Load enchant-simulator data fail: ' + target);
      console.log(e);
      state.builds = origin.builds;
      state.currentBuildIndex = origin.index;
      state.config = origin.config;
    }
  },
};

const actions = {
  init({ state, commit }) {
    if (state.hasInit) {
      return;
    }
    commit('load');
    commit('initFinished');
  },
  exportDollBuild({ commit }, build) {
    commit('appendBuild', build);
    commit('save');
  },
};

import stat from './stat';
import step from './step';

const modules = {
  step,
  stat,
};

export default {
  namespaced: true,
  state: storeState,
  mutations,
  actions,
  modules,
};
