import { defineStore } from 'pinia';
import { computed, ref, shallowReactive } from 'vue';
import type { Ref } from 'vue';

import CY from '@/shared/utils/Cyteria';

import { EnchantBuild } from '@/lib/Enchant/Enchant';
import type { EnchantBuildSaveData } from '@/lib/Enchant/Enchant/build';

interface EnchantStoreConfig {
  characterLevel: number;
  smithLevel: number;
}

interface EnchantStoreSaveData {
  builds: EnchantBuildSaveData[];
  index: number;
  config: EnchantStoreConfig;
}

export const enchantConfig: EnchantStoreConfig = shallowReactive({
  characterLevel: 230,
  smithLevel: 0,
});

const SAVE_PRETEXT = 'app--enchant-simulator--vbeta--';

export const useEnchantStore = defineStore('view-enchant', () => {
  const enchantBuilds: Ref<EnchantBuild[]> = ref([]);
  const currentBuildIndex = ref(-1);
  const hasInit = ref(false);
  const config = enchantConfig;

  const currentBuild = computed<EnchantBuild | null>(() => enchantBuilds.value[currentBuildIndex.value] ?? null);

  const resetConfig = (configToSet: EnchantStoreConfig) => {
    config.characterLevel = configToSet.characterLevel;
    config.smithLevel = configToSet.smithLevel;
  };

  const appendBuild = (build: EnchantBuild) => {
    enchantBuilds.value.push(build);
    currentBuildIndex.value += 1;
  };

  const removeBuild = (build: EnchantBuild) => {
    const idx = enchantBuilds.value.indexOf(build);
    if (idx !== -1) {
      enchantBuilds.value.splice(idx, 1);
      if (currentBuildIndex.value !== 0) {
        currentBuildIndex.value -= 1;
      }
    }
  };

  const copyBuild = (build: EnchantBuild) => {
    const newBuild = build.copy();
    newBuild.name += '*';
    currentBuildIndex.value += 1;
    enchantBuilds.value.splice(currentBuildIndex.value, 0, newBuild);
  };

  const setCurrentBuild = (idx: number) => {
    currentBuildIndex.value = idx;
  };

  const save = (target = 'auto') => {
    if (!CY.storageAvailable('localStorage')) {
      return;
    }
    const builds = enchantBuilds.value.map(build => build.save());
    const data: EnchantStoreSaveData = {
      builds,
      index: currentBuildIndex.value,
      config: config,
    };
    window.localStorage.setItem(SAVE_PRETEXT + target, JSON.stringify(data));
  };

  const load = (target = 'auto') => {
    if (!CY.storageAvailable('localStorage')) {
      return;
    }
    const origin = {
      builds: enchantBuilds.value,
      index: currentBuildIndex.value,
      config: config,
    };
    try {
      const odata = window.localStorage.getItem(SAVE_PRETEXT + target);
      if (!odata) {
        console.warn('[enchant-simulator] data not found: ' + target);
        return;
      }
      const data = JSON.parse(odata) as EnchantStoreSaveData;
      enchantBuilds.value = data.builds.map(buildData => EnchantBuild.load(buildData));
      currentBuildIndex.value = data.index;

      resetConfig(data.config);
    } catch (e) {
      console.warn('[enchant-simulator] load data fail: ' + target);
      console.log(e);
      enchantBuilds.value = origin.builds;
      currentBuildIndex.value = origin.index;
      resetConfig(origin.config);
    }
  };

  const init = () => {
    if (hasInit.value) {
      return;
    }
    load();
    hasInit.value = true;
  };

  const exportDollBuild = (build: EnchantBuild) => {
    appendBuild(build);
    save();
  };

  return {
    enchantBuilds,
    currentBuild,
    config,

    appendBuild,
    removeBuild,
    copyBuild,
    setCurrentBuild,
    save,
    load,
    init,
    exportDollBuild,
  };
});
