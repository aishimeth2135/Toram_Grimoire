
import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';
import type { Ref } from 'vue';

import { Character, CharacterSaveData } from '@/lib/Character/Character';
import { CharacterEquipment, EquipmentSaveData } from '@/lib/Character/CharacterEquipment';
import { FoodsSaveData } from '@/lib/Character/Food';

import { useCharacterSkillStore } from './skill';
import { useCharacterFoodStore } from './food';

interface CharacterState {
  origin: Character;
  iid: number;
}

interface CharacterStoreSaveSummary {
  characters: string[];
  equipments: {
    numbers: number;
  };
  skillBuilds: string[];
  characterIndex: number;
  skillBuildIndex: number;
  foodBuildIndex: number;
}

export const useCharacterStore = defineStore('view-character', () => {
  const currentCharacterIndex = ref(-1);
  const characterSimulatorHasInit = ref(false);
  const characters: Ref<CharacterState[]> = ref([]);
  const equipments: Ref<CharacterEquipment[]> = ref([]);
  const autoSaveDisabled = ref(false);

  const skill = useCharacterSkillStore();
  const food = useCharacterFoodStore();

  const currentCharacter = computed(() => characters.value[currentCharacterIndex.value] ?? null);

  const characterSimulatorInitFinished = () => {
    characterSimulatorHasInit.value = true;
  };

  const closeAutoSave = () => {
    autoSaveDisabled.value = false;
  };

  type ResetOptions = { skillBuildsReplaced?: boolean };
  const reset = ({ skillBuildsReplaced = true }: ResetOptions = {}) => {
    if (skillBuildsReplaced) {
      skill.resetSkillBuilds();
    }
    characters.value = [];
    equipments.value = [];
    food.resetFoodBuilds();
  };

  const setCurrentCharacter = (idx: number) => {
    currentCharacterIndex.value = idx;
  };

  const createCharacter = (chara: Character) => {
    characters.value.push({
      iid: characters.value.length,
      origin: chara,
    });
    currentCharacterIndex.value = characters.value.length - 1;
  };

  const removeCharacter = (idx: number) => {
    characters.value.splice(idx, 1);
    characters.value.forEach((state, i) => {
      state.iid = i;
    });
    if (currentCharacterIndex.value >= characters.value.length) {
      currentCharacterIndex.value = characters.value.length - 1;
    }
  };

  const appendEquipments = (eqs: CharacterEquipment[]) => {
    equipments.value.push(...eqs);
  };

  const removeEquipment = (idx: number) => {
    equipments.value.splice(idx, 1);
  };

  const deleteAllSavedData = () => {
    const prefix = 'app--character-simulator--data-';
    const storage = window.localStorage;

    let find = true, cnt = 0;
    const list = ['', '--characters', '--equipments', '--skillBuilds', '--foodBuilds'];
    while (find) {
      const cur_prefix = prefix + cnt;
      const finds = list.filter(p => {
        const item = cur_prefix + p;
        if (storage.getItem(item) !== null) {
          // backup[item] = storage.getItem(item);
          storage.removeItem(item);
          return true;
        }
        return false;
      });
      find = finds.length > 0;
      cnt += 1;
    }
  };

  const loadCharacterSimulator = ({ index, resetOptions = {} }: { index: number; resetOptions?: ResetOptions }) => {
    const prefix = 'app--character-simulator--data-' + index;
    if (!window.localStorage.getItem(prefix)) {
      throw new Error(`Index: ${index} of Character-Simulator Data is not exist.`);
    }
    try {
      reset(resetOptions);

      const summary = JSON.parse(window.localStorage.getItem(prefix)!) as CharacterStoreSaveSummary;
      const characterDatas = JSON.parse(window.localStorage.getItem(prefix + '--characters')!) as CharacterSaveData[];
      const equipmentDatas = JSON.parse(window.localStorage.getItem(prefix + '--equipments')!) as EquipmentSaveData[];
      const skillBuildsCsv = window.localStorage.getItem(prefix + '--skillBuilds')!;

      const foodBuildsDataString = window.localStorage.getItem(prefix + '--foodBuilds');
      const foodBuilds = foodBuildsDataString ? JSON.parse(foodBuildsDataString) as FoodsSaveData[] : [];

      const allValidEquipments = equipmentDatas.map(data => {
        const load = CharacterEquipment.loadEquipment(data);
        if (!load.error) {
          return load.equipment;
        }
        return null;
      }).filter(item => item) as CharacterEquipment[];

      characterDatas.forEach(charaRow => {
        const chara = new Character();
        const load = chara.load(charaRow, allValidEquipments);
        if (!load.error) {
          createCharacter(chara);
        }
      });

      appendEquipments(allValidEquipments);

      const resetSkillBuilds = resetOptions.skillBuildsReplaced === undefined ?? true;
      skill.loadSkillBuildsCsv({ csvString: skillBuildsCsv, reset: resetSkillBuilds });

      foodBuilds.forEach(data => {
        const foods = food.foodsBase!.createFoods();
        const load = foods.load(data);
        if (!load.error)
          food.createFoodBuild({ foodBuild: foods });
      });

      // 讀檔過程會改寫index，因此最後設定index
      setCurrentCharacter(summary.characterIndex);
      skill.setCurrentSkillBuild(summary.skillBuildIndex);
      food.setCurrentFoodBuild(summary.foodBuildIndex ?? -1);
    } catch (error) {
      reset();
      createCharacter(new Character());
      closeAutoSave();
      console.warn('Error when load Character-Simulator data.');
      throw error;
    }
  };

  const saveCharacterSimulator = (index: number = -1) => {
    const charactersData = characters.value.map(item => item.origin.save(equipments.value));
    const equipmentsData = equipments.value.map(item => item.save());
    const skillBuildsCsv = skill.saveSkillBuildsCsv();
    const foodBuildsData = food.foodBuilds.map(item => item.save());

    let prefix = 'app--character-simulator--data-';
    if (index === -1) {
      let cnt = 0;
      while (window.localStorage.getItem(prefix + cnt)) {
        cnt += 1;
      }
      prefix = prefix + cnt;
    }
    else {
      prefix = prefix + index;
    }

    const summary: CharacterStoreSaveSummary = {
      characters: characters.value.map(item => item.origin.name),
      equipments: {
        numbers: equipments.value.length,
      },
      skillBuilds: skill.skillBuilds.map(p => p.name),
      characterIndex: currentCharacterIndex.value,
      skillBuildIndex: skill.currentSkillBuildIndex,
      foodBuildIndex: food.currentFoodBuildIndex,
    };

    try {
      window.localStorage.setItem(prefix, JSON.stringify(summary));
      window.localStorage.setItem(prefix + '--characters', JSON.stringify(charactersData));
      window.localStorage.setItem(prefix + '--equipments', JSON.stringify(equipmentsData));
      window.localStorage.setItem(prefix + '--skillBuilds', skillBuildsCsv);
      window.localStorage.setItem(prefix + '--foodBuilds', JSON.stringify(foodBuildsData));
    } catch (err) {
      console.warn('[Character Simulator] Unknown error when save datas');
      console.warn(err);
      window.localStorage.removeItem(prefix + '--characters');
      window.localStorage.removeItem(prefix + '--equipments');
      window.localStorage.removeItem(prefix + '--skillBuilds');
      window.localStorage.removeItem(prefix + '--foodBuilds');
    }
  };

  return {
    characters,
    equipments,
    currentCharacter,
    characterSimulatorHasInit: readonly(characterSimulatorHasInit),

    autoSaveDisabled: readonly(autoSaveDisabled),
    characterSimulatorInitFinished,
    reset,
    setCurrentCharacter,
    createCharacter,
    removeCharacter,
    appendEquipments,
    removeEquipment,

    deleteAllSavedData,
    loadCharacterSimulator,
    saveCharacterSimulator,
  };
});
